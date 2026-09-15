import { IsString, IsOptional, IsBoolean, IsUUID, IsIn } from 'class-validator';

export const TIPOS_REMISION = ['sostenimiento', 'orientacion', 'bienestar'];
export const ESTADOS_REMISION = ['postulado', 'aprobado', 'rechazado'];

export class CreateRemisionDto {
  @IsUUID()
  aprendizId: string;
  @IsOptional()
  @IsUUID()
  responsableId?: string;
  @IsOptional()
  @IsUUID()
  fichaId?: string;
  @IsOptional()
  @IsIn(TIPOS_REMISION)
  tipo?: string;
  @IsOptional()
  @IsIn(ESTADOS_REMISION)
  estado?: string;
  @IsOptional()
  @IsBoolean()
  chatActivo?: boolean;
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class UpdateRemisionDto {
  @IsOptional()
  @IsIn(ESTADOS_REMISION)
  estado?: string;
  @IsOptional()
  @IsBoolean()
  chatActivo?: boolean;
  @IsOptional()
  @IsString()
  motivo?: string;
}
