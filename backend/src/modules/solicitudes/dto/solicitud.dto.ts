import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  tipo?: string;
}

export class UpdateSolicitudDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  estado?: 'abierta' | 'en_proceso' | 'resuelta';
}
