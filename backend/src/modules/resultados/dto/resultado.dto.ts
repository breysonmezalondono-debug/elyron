import { IsString, IsOptional } from 'class-validator';
export class CreateResultadoDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  competenciaId: string;
}
export class UpdateResultadoDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
}
