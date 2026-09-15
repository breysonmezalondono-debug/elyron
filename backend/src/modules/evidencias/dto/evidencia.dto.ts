import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const EVIDENCIA_STATUS = ['pending', 'approved', 'rejected'] as const;

export class CreateEvidenciaDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  resultadoId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}

export class UpdateEvidenciaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(EVIDENCIA_STATUS)
  status?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  reviewedAt?: Date;
}

export class EntregarEvidenciaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsString()
  fileType?: string;
}

export class CalificarEvidenciaDto {
  @IsOptional()
  @IsNumber()
  nota?: number;

  @IsString()
  feedback: string;
}

export class EvidenciasQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  resultadoId?: string;

  @IsOptional()
  @IsIn(EVIDENCIA_STATUS)
  status?: string;
}
