import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @MaxLength(150)
  titulo: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  url?: string;
}

export class CreateCasoDocumentoDto extends CreateDocumentoDto {
  @IsUUID()
  caseId: string;
}
