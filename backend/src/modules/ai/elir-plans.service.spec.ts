import {
  ElirPlansService,
  ElirLimitError,
  ELIR_PLANS,
} from './elir-plans.service';

function makeService(
  planOverrides: Record<string, unknown> = {},
  usageOverrides: Record<string, unknown> = {},
) {
  const planRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn((v) => Promise.resolve(v)),
    ...planOverrides,
  };
  const usageRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((v) => v),
    save: jest.fn((v) => Promise.resolve(v)),
    ...usageOverrides,
  };
  const svc = new ElirPlansService(planRepo as never, usageRepo as never);
  return { svc, planRepo, usageRepo };
}

describe('ElirPlansService · planes por rol', () => {
  it('un aprendiz usa el plan free; un administrador premium', async () => {
    const { svc } = makeService();
    const free = await svc.planDeUsuario('aprendiz');
    expect(free.id).toBe('free');
    const premium = await svc.planDeUsuario('administrador');
    expect(premium.id).toBe('premium');
  });

  it('roles desconocidos caen a free (no asume privilegios)', async () => {
    const { svc } = makeService();
    const p = await svc.planDeUsuario('rol_inexistente');
    expect(p.id).toBe('free');
  });

  it('los límites coinciden con la configuración de planes', async () => {
    expect(ELIR_PLANS.free.limits.messagesPerDay).toBe(15);
    expect(ELIR_PLANS.pro.limits.messagesPerDay).toBe(80);
    expect(ELIR_PLANS.premium.limits.messagesPerDay).toBe(200);
  });
});

describe('ElirPlansService · límites de mensajes (FREE)', () => {
  it('permite 15 mensajes y rechaza el 16 con LIMIT_REACHED', async () => {
    const row = {
      userId: 'u1',
      date: '2099-01-01',
      planId: 'free',
      messages: 0,
      files: 0,
      images: 0,
      advancedTasks: 0,
    };
    const { svc, usageRepo } = makeService();
    usageRepo.findOne.mockResolvedValue(row);
    usageRepo.save.mockImplementation((r) => Promise.resolve(r));
    for (let i = 0; i < 15; i++) {
      await expect(
        svc.registrarUso('u1', 'aprendiz', 'message'),
      ).resolves.toBeUndefined();
    }
    expect(row.messages).toBe(15);
    await expect(
      svc.registrarUso('u1', 'aprendiz', 'message'),
    ).rejects.toBeInstanceOf(ElirLimitError);
    await expect(
      svc.registrarUso('u1', 'aprendiz', 'message'),
    ).rejects.toMatchObject({
      code: 'LIMIT_REACHED',
    });
  });
});

describe('ElirPlansService · límites de archivos e imágenes', () => {
  it('el plan free no permite imágenes (IMAGE_LIMIT_REACHED / feature off)', async () => {
    const row = {
      userId: 'u1',
      date: '2099-01-01',
      planId: 'free',
      messages: 0,
      files: 0,
      images: 0,
      advancedTasks: 0,
    };
    const { svc, usageRepo } = makeService();
    usageRepo.findOne.mockResolvedValue(row);
    await expect(
      svc.registrarUso('u1', 'aprendiz', 'image'),
    ).rejects.toMatchObject({
      code: 'IMAGE_LIMIT_REACHED',
    });
  });

  it('exigirCapacidad lanza UPGRADE_REQUIRED cuando la feature no está en el plan', async () => {
    const { svc } = makeService();
    await expect(
      svc.exigirCapacidad(
        'u1',
        'aprendiz',
        'documentAnalysis',
        'Análisis avanzado',
      ),
    ).rejects.toMatchObject({ code: 'UPGRADE_REQUIRED' });
    // Pro sí la tiene
    await expect(
      svc.exigirCapacidad(
        'u1',
        'instructor',
        'documentAnalysis',
        'Análisis avanzado',
      ),
    ).resolves.toBeUndefined();
  });
});
