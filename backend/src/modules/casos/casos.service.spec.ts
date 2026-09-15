import { ForbiddenException } from '@nestjs/common';
import { CaseService } from './casos.service';
import { CaseWorkflowService } from './case-workflow.service';

const createService = (overrides: Record<string, unknown> = {}) => {
  const repos = {
    caseRepo: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((value) => ({ id: 'case-1', ...value })),
      save: jest.fn(async (value) => value),
      findOne: jest.fn(),
    },
    categoryRepo: { findOne: jest.fn() },
    messageRepo: { save: jest.fn() },
    historyRepo: { create: jest.fn((value) => value), save: jest.fn() },
    userRepo: { findOne: jest.fn() },
    institutionRepo: { findOne: jest.fn() },
    scopeRepo: {
      findOne: jest
        .fn()
        .mockResolvedValue({ institutionId: 'institution-sena' }),
    },
    auditRepo: { create: jest.fn((value) => value), save: jest.fn() },
    responsibilityService: { resolve: jest.fn().mockResolvedValue(null) },
    authorizationContext: { can: jest.fn().mockReturnValue(true) },
    notifications: { createForUser: jest.fn() },
    workflow: new CaseWorkflowService(),
  };
  return {
    service: new CaseService(
      repos.caseRepo as any,
      repos.categoryRepo as any,
      repos.messageRepo as any,
      repos.historyRepo as any,
      repos.userRepo as any,
      repos.institutionRepo as any,
      repos.scopeRepo as any,
      repos.auditRepo as any,
      repos.responsibilityService as any,
      repos.authorizationContext as any,
      repos.notifications as any,
      repos.workflow,
    ),
    repos: { ...repos, ...overrides },
  };
};

describe('CaseService contextual security', () => {
  it('derives the requester ficha scope and leaves case pending without a responsible', async () => {
    const { service, repos } = createService();
    repos.userRepo.findOne.mockResolvedValue({
      id: 'learner-a',
      institucion: 'sena',
      ficha: { scopeId: 'scope-ficha-a' },
      role: { permissions: [{ name: 'cases.create' }] },
    });
    repos.categoryRepo.findOne.mockResolvedValue({
      id: 'cat-1',
      institutionId: 'institution-sena',
      responsibilityCode: 'SENA_SUPPORT',
      institution: { code: 'sena' },
    });
    repos.institutionRepo.findOne.mockResolvedValue({ code: 'sena' });
    repos.caseRepo.findOne.mockResolvedValue({
      id: 'case-1',
      status: 'PENDIENTE_ASIGNACION',
      requesterId: 'learner-a',
      messages: [],
      history: [],
    });

    const result = await service.create(
      { categoryId: 'cat-1', title: 'Apoyo', description: 'Solicitud' },
      'learner-a',
    );

    expect(result.status).toBe('PENDIENTE_ASIGNACION');
    expect(repos.caseRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        scopeId: 'scope-ficha-a',
        assignedUserId: null,
      }),
    );
  });

  it('rejects a scope id different from the requester ficha', async () => {
    const { service, repos } = createService();
    repos.userRepo.findOne.mockResolvedValue({
      id: 'learner-a',
      institucion: 'sena',
      ficha: { scopeId: 'scope-ficha-a' },
      role: { permissions: [{ name: 'cases.create' }] },
    });
    repos.categoryRepo.findOne.mockResolvedValue({
      id: 'cat-1',
      institutionId: 'institution-sena',
      responsibilityCode: 'SENA_SUPPORT',
      institution: { code: 'sena' },
    });

    await expect(
      service.create(
        {
          categoryId: 'cat-1',
          scopeId: 'scope-ficha-b',
          title: 'Ataque de scope',
          description: 'No debe pasar',
        },
        'learner-a',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects an IDOR read by another learner', async () => {
    const { service, repos } = createService();
    repos.caseRepo.findOne.mockResolvedValue({
      id: 'case-a',
      requesterId: 'learner-a',
      assignedUserId: null,
      messages: [],
      history: [],
    });
    repos.userRepo.findOne.mockResolvedValue({
      id: 'learner-b',
      institucion: 'sena',
      role: { permissions: [{ name: 'cases.read' }] },
    });

    await expect(service.findOne('case-a', 'learner-b')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a category from another institution', async () => {
    const { service, repos } = createService();
    repos.userRepo.findOne.mockResolvedValue({
      id: 'sena-user',
      institucion: 'sena',
      ficha: { scopeId: 'scope-sena' },
      role: { permissions: [{ name: 'cases.create' }] },
    });
    repos.categoryRepo.findOne.mockResolvedValue({
      id: 'school-category',
      institutionId: 'institution-school',
      responsibilityCode: 'SCHOOL_ORIENTATION',
      institution: { code: 'colegio' },
    });

    await expect(
      service.create(
        {
          categoryId: 'school-category',
          title: 'Cruce',
          description: 'No debe pasar',
        },
        'sena-user',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects case creation when the actor lacks cases.create', async () => {
    const { service, repos } = createService();
    repos.authorizationContext.can.mockReturnValue(false);
    repos.userRepo.findOne.mockResolvedValue({
      id: 'learner',
      institucion: 'sena',
      ficha: { scopeId: 'scope-sena' },
      role: { permissions: [{ name: 'cases.read' }] },
    });
    repos.categoryRepo.findOne.mockResolvedValue({
      id: 'sena-category',
      institutionId: 'institution-sena',
      responsibilityCode: 'SENA_SUPPORT',
      institution: { code: 'sena' },
    });

    await expect(
      service.create(
        {
          categoryId: 'sena-category',
          title: 'Sin permiso',
          description: 'No debe pasar',
        },
        'learner',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a case read when the actor belongs to another institution', async () => {
    const { service, repos } = createService();
    repos.caseRepo.findOne.mockResolvedValue({
      id: 'case-sena',
      requesterId: 'colegio-user',
      assignedUserId: null,
      institutionId: 'institution-colegio',
      messages: [],
      history: [],
    });
    repos.userRepo.findOne.mockResolvedValue({
      id: 'sena-user',
      institucion: 'sena',
      role: { permissions: [{ name: 'cases.read' }] },
    });
    repos.institutionRepo.findOne.mockResolvedValue({ code: 'colegio' });

    await expect(service.findOne('case-sena', 'sena-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
