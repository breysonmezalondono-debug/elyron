import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';
export class CreateJobListingDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  company?: string;
  @IsOptional()
  @IsString()
  location?: string;
  @IsOptional()
  @IsString()
  salary?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
export class UpdateJobListingDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  company?: string;
  @IsOptional()
  @IsString()
  location?: string;
  @IsOptional()
  @IsString()
  salary?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
}
