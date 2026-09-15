import { IsString, IsOptional, IsNumber } from 'class-validator';
export class CreateCompetenciaDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  weight?: number;
  @IsString()
  fichaId: string;
}
export class UpdateCompetenciaDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  weight?: number;
}
