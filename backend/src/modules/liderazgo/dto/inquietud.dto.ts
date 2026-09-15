import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInquietudDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  @IsIn(['academica', 'bienestar', 'instalaciones', 'general'])
  categoria?: 'academica' | 'bienestar' | 'instalaciones' | 'general';
}

export class UpdateInquietudEstadoDto {
  @IsString()
  @IsIn(['abierta', 'en_gestion', 'resuelta'])
  estado: 'abierta' | 'en_gestion' | 'resuelta';
}
