import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  code: string;

  @IsString()
  nombre: string;

  @IsInt()
  @Min(0)
  @Max(11)
  grado: number;

  @IsOptional()
  @IsIn(['preescolar', 'basica_primaria', 'basica_secundaria', 'media'])
  nivel?: string;

  @IsOptional()
  @IsIn(['manana', 'tarde', 'noche', 'completa'])
  jornada?: string;

  @IsOptional()
  @IsInt()
  anioLectivo?: number;

  @IsOptional()
  @IsString()
  colegio?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  docenteIds?: string[];
}

export class UpdateGrupoDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  grado?: number;

  @IsOptional()
  @IsIn(['preescolar', 'basica_primaria', 'basica_secundaria', 'media'])
  nivel?: string;

  @IsOptional()
  @IsIn(['manana', 'tarde', 'noche', 'completa'])
  jornada?: string;

  @IsOptional()
  @IsInt()
  anioLectivo?: number;

  @IsOptional()
  @IsString()
  colegio?: string;

  @IsOptional()
  @IsIn(['active', 'cerrado'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  docenteIds?: string[];
}
