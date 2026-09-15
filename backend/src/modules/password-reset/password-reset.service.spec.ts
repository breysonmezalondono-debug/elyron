import { PasswordResetService } from './password-reset.service';
import { PasswordResetToken } from './password-reset-token.entity';

/* ============================================================
   Pruebas del flujo de recuperación de contraseña · Elyron
   ============================================================ */

function construirServicio(overrides: Record<string, any> = {}) {
  const tokenRepo = {
    save: jest.fn(),
    create: jest.fn((x) => x),
    update: jest.fn(),
    findOne: jest.fn(),
    ...(overrides.tokenRepo ?? {}),
  };
  const usersService = {
    findByEmail: jest.fn(),
    actualizarPasswordYVersiones: jest.fn(),
    ...(overrides.usersService ?? {}),
  };
  const mailService = {
    enviarRestablecimiento: jest
      .fn()
      .mockResolvedValue({ ok: true, mode: 'preview' }),
    ...(overrides.mailService ?? {}),
  };
  const configService = {
    get: jest.fn((k, d) => d),
    ...(overrides.configService ?? {}),
  };
  const dataSource = {
    transaction: jest.fn(),
    ...(overrides.dataSource ?? {}),
  };
  const appUrl = {
    getFrontendBase: jest.fn(() => 'http://192.168.1.50:3000'),
    resetPasswordUrl: jest.fn(
      (token) => `http://192.168.1.50:3000/reset-password?token=${token}`,
    ),
    verificationUrl: jest.fn(),
    ...(overrides.appUrl ?? {}),
  };

  const service = new PasswordResetService(
    tokenRepo as any,
    dataSource as any,
    usersService as any,
    mailService as any,
    configService as any,
    appUrl as any,
  );
  return {
    service,
    tokenRepo,
    usersService,
    mailService,
    configService,
    dataSource,
    appUrl,
  };
}

const USUARIO = {
  id: 'user-1',
  email: 'usuario@ejemplo.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  tokenVersion: 0,
};

describe('solicitarRecuperacion', () => {
  it('responde genérico cuando el correo existe y guarda el HASH (no el token plano)', async () => {
    const { service, tokenRepo, usersService, mailService } =
      construirServicio();
    usersService.findByEmail.mockResolvedValue(USUARIO);

    const res = await service.solicitarRecuperacion('Usuario@Ejemplo.com');

    // El mensaje no revela la cuenta.
    expect(res.message).toBe(
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.',
    );
    // Se generó un token y se guardó su hash.
    expect(tokenRepo.save).toHaveBeenCalledTimes(1);
    const guardado = tokenRepo.save.mock.calls[0][0];
    expect(guardado.userId).toBe('user-1');
    expect(guardado.tokenHash).toMatch(/^[0-9a-f]{64}$/); // SHA-256
    // El token plano NUNCA se guarda.
    expect(tokenRepo.save.mock.calls[0][0].rawToken).toBeUndefined();
    // Se envió correo a la dirección normalizada.
    expect(mailService.enviarRestablecimiento).toHaveBeenCalledTimes(1);
    const correo = mailService.enviarRestablecimiento.mock.calls[0][0];
    expect(correo.to).toBe('usuario@ejemplo.com');
    expect(correo.link).toContain('token=');
    // El enlace lleva el token (para construir el correo), pero la BD solo
    // guarda el HASH: el enlace NO debe contener el hash.
    expect(correo.link).not.toContain(guardado.tokenHash);
  });

  it('responde el MISMO mensaje genérico cuando el correo NO existe (anti enumeración)', async () => {
    const { service, usersService, mailService } = construirServicio();
    usersService.findByEmail.mockResolvedValue(null);

    const res = await service.solicitarRecuperacion('noexiste@ejemplo.com');

    expect(res.message).toBe(
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.',
    );
    expect(mailService.enviarRestablecimiento).not.toHaveBeenCalled();
  });

  it('invalida (revoca) los tokens anteriores del usuario (rotación)', async () => {
    const { service, tokenRepo, usersService } = construirServicio();
    usersService.findByEmail.mockResolvedValue(USUARIO);
    tokenRepo.update.mockResolvedValue({ affected: 1 });

    await service.solicitarRecuperacion('usuario@ejemplo.com');

    expect(tokenRepo.update).toHaveBeenCalledWith(
      {
        userId: 'user-1',
        usedAt: expect.anything(),
        revokedAt: expect.anything(),
      },
      { revokedAt: expect.any(Date) },
    );
  });

  it('no supera el límite de solicitudes por correo', async () => {
    const { service, usersService, mailService } = construirServicio();
    usersService.findByEmail.mockResolvedValue(USUARIO);
    // Normaliza el email igual en cada llamada.
    for (let i = 0; i < 6; i++) {
      await service.solicitarRecuperacion('usuario@ejemplo.com');
    }
    // 3 permitidas (genera token) + el resto bloqueadas sin token nuevo.
    expect(mailService.enviarRestablecimiento.mock.calls.length).toBe(3);
  });
});

describe('validarToken', () => {
  const hacerToken = (extra: Record<string, any>) =>
    ({
      id: 'tok-1',
      userId: 'user-1',
      user: USUARIO,
      ...extra,
    }) as PasswordResetToken;

  it('valida un token activo', async () => {
    const { service, tokenRepo } = construirServicio();
    tokenRepo.findOne.mockResolvedValue(
      hacerToken({
        tokenHash: 'a'.repeat(64),
        expiresAt: new Date(Date.now() + 600000),
        usedAt: null,
        revokedAt: null,
      }),
    );
    const res = await service.validarToken('token');
    expect(res.valido).toBe(true);
  });

  it('rechaza un token inexistente', async () => {
    const { service, tokenRepo } = construirServicio();
    tokenRepo.findOne.mockResolvedValue(null);
    const res = await service.validarToken('token');
    expect(res.valido).toBe(false);
  });

  it('rechaza un token expirado', async () => {
    const { service, tokenRepo } = construirServicio();
    tokenRepo.findOne.mockResolvedValue(
      hacerToken({
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        revokedAt: null,
      }),
    );
    await expect(service.validarToken('token')).rejects.toThrow('expirado');
  });

  it('rechaza un token ya utilizado', async () => {
    const { service, tokenRepo } = construirServicio();
    tokenRepo.findOne.mockResolvedValue(
      hacerToken({
        expiresAt: new Date(Date.now() + 600000),
        usedAt: new Date(),
        revokedAt: null,
      }),
    );
    await expect(service.validarToken('token')).rejects.toThrow(
      'ya no es válido',
    );
  });
});

describe('restablecerPassword', () => {
  it('actualiza la contraseña (hasheada), marca el token usado e incrementa versión', async () => {
    const tokenEnBD = {
      id: 'tok-1',
      userId: 'user-1',
      tokenHash: 'a'.repeat(64),
      expiresAt: new Date(Date.now() + 600000),
      usedAt: null,
      revokedAt: null,
      user: USUARIO,
    };
    const repoFake = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(tokenEnBD),
      })),
      update: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn(() => repoFake),
      update: jest.fn(),
    };
    const { service } = construirServicio({
      dataSource: { transaction: jest.fn(async (cb) => cb(manager)) },
    });

    const res = await service.restablecerPassword('token', 'NuevaClave123!');

    expect(res.message).toContain('actualizada');
    // manager.update sobre 'usuarios' actualiza password + versión.
    expect(manager.update).toHaveBeenCalledWith(
      'usuarios',
      { id: 'user-1' },
      expect.objectContaining({
        password: expect.any(String),
        tokenVersion: expect.any(Function),
        refreshToken: null,
      }),
    );
    // El hash de contraseña NO es la contraseña en texto plano.
    const args = manager.update.mock.calls[0][2];
    expect(args.password).not.toBe('NuevaClave123!');
    // El token queda marcado como usado y revocado.
    expect(repoFake.update).toHaveBeenCalledWith(
      { userId: 'user-1' },
      expect.objectContaining({
        usedAt: expect.any(Date),
        revokedAt: expect.any(Date),
      }),
    );
  });

  it('rechaza un token ya usado (single-use)', async () => {
    const repoFake = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // usedAt no es null → no devuelve
      })),
    };
    const manager = {
      getRepository: jest.fn(() => repoFake),
      update: jest.fn(),
    };
    const { service } = construirServicio({
      dataSource: { transaction: jest.fn(async (cb) => cb(manager)) },
    });

    await expect(
      service.restablecerPassword('token', 'NuevaClave123!'),
    ).rejects.toThrow('ya no es válido');
  });

  it('rechaza un token expirado', async () => {
    const repoFake = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          userId: 'user-1',
          expiresAt: new Date(Date.now() - 1000),
          usedAt: null,
          revokedAt: null,
          user: USUARIO,
        }),
      })),
    };
    const manager = {
      getRepository: jest.fn(() => repoFake),
      update: jest.fn(),
    };
    const { service } = construirServicio({
      dataSource: { transaction: jest.fn(async (cb) => cb(manager)) },
    });

    await expect(
      service.restablecerPassword('token', 'NuevaClave123!'),
    ).rejects.toThrow('expirado');
  });
});
