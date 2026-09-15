import { IsString, IsOptional, IsIn, IsBoolean, IsUUID } from 'class-validator';

export class CreateRemisionColegioDto {
  @IsUUID()
  estudianteId: string;

  @IsOptional()
  @IsUUID()
  responsableId?: string;

  @IsOptional()
  @IsUUID()
  grupoId?: string;

  @IsOptional()
  @IsIn(['orientacion', 'psicologia', 'convivencia'])
  tipo?: string;

  @IsOptional()
  @IsIn(['postulado', 'aprobado', 'rechazado'])
  estado?: string;

  @IsOptional()
  @IsBoolean()
  chatActivo?: boolean;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class UpdateRemisionColegioDto {
  @IsOptional()
  @IsIn(['orientacion', 'psicologia', 'convivencia'])
  tipo?: string;

  @IsOptional()
  @IsIn(['postulado', 'aprobado', 'rechazado'])
  estado?: string;

  @IsOptional()
  @IsBoolean()
  chatActivo?: boolean;

  @IsOptional()
  @IsString()
  motivo?: string;
}
