import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
  IsArray,
  IsUUID,
} from 'class-validator';
export class CreateFichaDto {
  @IsString()
  code: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsDateString()
  startDate: string;
  @IsDateString()
  endDate: string;
  @IsOptional()
  @IsIn(['tecnico', 'tecnologo'])
  tipoPrograma?: string;
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  instructorIds?: string[];
  @IsOptional()
  @IsString()
  companyId?: string;
}
export class UpdateFichaDto {
  @IsOptional()
  @IsString()
  code?: string;
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsDateString()
  startDate?: string;
  @IsOptional()
  @IsDateString()
  endDate?: string;
  @IsOptional()
  @IsIn(['tecnico', 'tecnologo'])
  tipoPrograma?: string;
  @IsOptional()
  @IsIn(['active', 'inactive', 'finished', 'egresado'])
  status?: string;
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  instructorIds?: string[];
  @IsOptional()
  @IsString()
  companyId?: string;
}
