import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateComunicadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
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
  @IsIn(['ficha', 'programa', 'centro', 'general'])
  destinatario?: 'ficha' | 'programa' | 'centro' | 'general';
}

export class UpdateComunicadoDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  titulo?: string;

  @IsString()
  @IsOptional()
  contenido?: string;

  @IsString()
  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: 'alta' | 'media' | 'baja';
}
