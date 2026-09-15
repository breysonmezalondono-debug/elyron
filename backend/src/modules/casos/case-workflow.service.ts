import { BadRequestException, Injectable } from '@nestjs/common';

export const CASE_TRANSITIONS: Record<string, string[]> = {
  CREADO: ['PENDIENTE_ASIGNACION', 'ASIGNADO', 'CANCELADO'],
  PENDIENTE_ASIGNACION: ['ASIGNADO', 'CANCELADO'],
  ASIGNADO: ['EN_REVISION', 'EN_GESTION', 'CANCELADO'],
  EN_REVISION: ['EN_GESTION', 'PENDIENTE_USUARIO', 'CANCELADO'],
  EN_GESTION: [
    'PENDIENTE_USUARIO',
    'PENDIENTE_TERCERO',
    'RESUELTO',
    'CANCELADO',
  ],
  PENDIENTE_USUARIO: ['EN_GESTION', 'CANCELADO'],
  PENDIENTE_TERCERO: ['EN_GESTION', 'CANCELADO'],
  RESUELTO: ['CERRADO', 'REABIERTO'],
  CERRADO: ['REABIERTO'],
  REABIERTO: ['EN_GESTION', 'CANCELADO'],
  CANCELADO: [],
};

@Injectable()
export class CaseWorkflowService {
  allowedTransitions(
    from: string,
    categoryWorkflow?: Record<string, string[]>,
  ): string[] {
    return categoryWorkflow?.[from] ?? CASE_TRANSITIONS[from] ?? [];
  }

  permissionFor(status: string): string {
    if (status === 'RESUELTO') return 'cases.resolve';
    if (status === 'CERRADO') return 'cases.close';
    if (status === 'REABIERTO') return 'cases.reopen';
    if (status === 'CANCELADO') return 'cases.cancel';
    return 'cases.change_status';
  }

  validateTransition(
    from: string,
    to: string,
    categoryWorkflow?: Record<string, string[]>,
  ): void {
    if (!this.allowedTransitions(from, categoryWorkflow).includes(to)) {
      throw new BadRequestException(`Transición no permitida: ${from} → ${to}`);
    }
  }
}
