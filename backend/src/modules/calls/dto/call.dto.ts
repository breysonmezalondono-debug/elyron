import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
} from 'class-validator';
export class CreateCallDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsDateString()
  startDate: Date;
  @IsDateString()
  endDate: Date;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}
export class UpdateCallDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsDateString()
  startDate?: Date;
  @IsOptional()
  @IsDateString()
  endDate?: Date;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}
