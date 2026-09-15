import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const INSTITUCION_CATALOGO_TIPOS = ['colegio', 'universidad', 'sena'] as const;

export class CreateInstitucionCatalogoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(200)
  nombre: string;

  @IsIn(INSTITUCION_CATALOGO_TIPOS, {
    message: 'El tipo debe ser colegio, universidad o sena.',
  })
  tipo: string;

  /** Para tipo=sena: { regional: string, centros: string[], municipios: string[] } */
  @IsOptional()
  detalles?: Record<string, unknown>;
}

export class UpdateInstitucionCatalogoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsIn(INSTITUCION_CATALOGO_TIPOS)
  tipo?: string;

  @IsOptional()
  detalles?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}