import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const CASE_PRIORITIES = ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] as const;

export class CreateCaseDto {
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @IsString()
  @MaxLength(180)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsIn(CASE_PRIORITIES)
  priority?: string;
}

export class TransitionCaseDto {
  @IsIn([
    'PENDIENTE_ASIGNACION',
    'ASIGNADO',
    'EN_REVISION',
    'EN_GESTION',
    'PENDIENTE_USUARIO',
    'PENDIENTE_TERCERO',
    'RESUELTO',
    'CERRADO',
    'REABIERTO',
    'CANCELADO',
  ])
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateCaseMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['PUBLIC', 'INTERNAL'])
  type?: string;
}

export class ReassignCaseDto {
  @IsUUID()
  assignedUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
