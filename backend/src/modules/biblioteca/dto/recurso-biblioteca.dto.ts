import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRecursoBibliotecaDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  autor?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
