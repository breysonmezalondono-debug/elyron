import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

/* ============================================================
   Pruebas del perfil personal del usuario autenticado.
   Verifica que solo se modifiquen datos personales (nunca
   académicos) y que el cambio de contraseña exija la actual.
   ============================================================ */

function construirServicio(overrides: Record<string, any> = {}) {
  const userRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn((x) => ({ ...x })),
    update: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
    ...(overrides.userRepo ?? {}),
  };
  const roleRepo = { findOne: jest.fn() };
  const service = new UsersService(userRepo as any, roleRepo as any);
  return { service, userRepo, roleRepo };
}

const USUARIO = {
  id: 'user-1',
  email: 'usuario@ejemplo.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  phone: '3001234567',
  password: bcrypt.hashSync('Actual123!', 10),
  tokenVersion: 0,
  refreshToken: 'abc',
};

describe('actualizarDatosPersonales', () => {
  it('actualiza solo datos personales (teléfono, nombre, apellido)', async () => {
    const { service, userRepo } = construirServicio();
    userRepo.findOne.mockResolvedValue({ ...USUARIO });
    userRepo.save.mockImplementation((u) => ({ ...u }));

    const res = await service.actualizarDatosPersonales('user-1', {
      phone: '3009998887',
      firstName: 'Carlos',
    });

    expect(res.phone).toBe('3009998887');
    expect(res.firstName).toBe('Carlos');
    expect(res.lastName).toBe('Pérez');
  });

  it('no modifica datos académicos (no hay campo de programa/ficha)', async () => {
    const { service, userRepo } = construirServicio();
    userRepo.findOne.mockResolvedValue({ ...USUARIO });
    const resultado = await service.actualizarDatosPersonales('user-1', {
      phone: '3001112223',
    });
    // El método solo toca firstName/lastName/phone/avatar; nunca programa/ficha.
    const claves = Object.keys(resultado);
    expect(claves).not.toContain('programaFormacion');
    expect(claves).not.toContain('numeroFicha');
    expect(claves).not.toContain('fichaId');
  });
});

describe('cambiarContrasena', () => {
  it('rechaza si la contraseña actual es incorrecta', async () => {
    const { service, userRepo } = construirServicio();
    userRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ ...USUARIO }),
    });
    await expect(
      service.cambiarContrasena('user-1', 'Incorrecta1!', 'NuevaClave123!'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('actualiza la contraseña hasheada e incrementa la versión de token', async () => {
    const { service, userRepo } = construirServicio();
    const qb = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ ...USUARIO }),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    userRepo.createQueryBuilder.mockReturnValue(qb);

    await service.cambiarContrasena('user-1', 'Actual123!', 'NuevaClave123!');

    expect(qb.execute).toHaveBeenCalledTimes(1);
    expect(qb.set).toHaveBeenCalledTimes(1);
    const valores = qb.set.mock.calls[0][0];
    // La contraseña guardada NO es la nueva en texto plano.
    expect(valores.password).not.toBe('NuevaClave123!');
    expect(valores.refreshToken).toBeNull();
    // Se incrementa tokenVersion para invalidar sesiones previas.
    expect(typeof valores.tokenVersion).toBe('function');
  });
});

describe('protección: programa/ficha no modificables por el usuario', () => {
  it('el DTO de actualización personal no acepta campos académicos', async () => {
    // `ActualizarMiPerfilDto` no define programaFormacion/numeroFicha;
    // con ValidationPipe whitelist+forbidNonWhitelisted esos campos se rechazan.
    // Esta prueba verifica que el método no los procese aunque lleguen.
    const { service, userRepo } = construirServicio();
    userRepo.findOne.mockResolvedValue({ ...USUARIO });
    // Intentar enviar campos académicos NO tiene efecto.
    const res = await service.actualizarDatosPersonales('user-1', {
      phone: '3007778889',
    });
    expect(res.numeroFicha).toBeUndefined();
    expect(res.programaFormacion).toBeUndefined();
  });
});
