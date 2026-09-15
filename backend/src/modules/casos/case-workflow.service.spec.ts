import { BadRequestException } from '@nestjs/common';
import { CaseWorkflowService } from './case-workflow.service';

describe('CaseWorkflowService', () => {
  const service = new CaseWorkflowService();

  it('allows the default create-to-assignment transition', () => {
    expect(() =>
      service.validateTransition('CREADO', 'ASIGNADO'),
    ).not.toThrow();
  });

  it('denies closing a case directly from creation', () => {
    expect(() => service.validateTransition('CREADO', 'CERRADO')).toThrow(
      BadRequestException,
    );
  });

  it('maps sensitive transitions to atomic permissions', () => {
    expect(service.permissionFor('RESUELTO')).toBe('cases.resolve');
    expect(service.permissionFor('CERRADO')).toBe('cases.close');
    expect(service.permissionFor('REABIERTO')).toBe('cases.reopen');
    expect(service.permissionFor('CANCELADO')).toBe('cases.cancel');
  });

  it('supports a category-specific workflow', () => {
    const workflow = {
      CREADO: ['ASIGNADO'],
      ASIGNADO: ['EN_GESTION'],
      EN_GESTION: ['RESUELTO'],
      RESUELTO: ['CERRADO'],
    };
    expect(() =>
      service.validateTransition('CREADO', 'PENDIENTE_ASIGNACION', workflow),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validateTransition('CREADO', 'ASIGNADO', workflow),
    ).not.toThrow();
  });
});
