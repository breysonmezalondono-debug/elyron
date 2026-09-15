import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAnuncioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsString()
  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: 'alta' | 'media' | 'baja';

  @IsString()
  @IsOptional()
  @IsIn(['anuncio', 'actividad', 'convocatoria', 'acta'])
  categoria?: 'anuncio' | 'actividad' | 'convocatoria' | 'acta';
}
