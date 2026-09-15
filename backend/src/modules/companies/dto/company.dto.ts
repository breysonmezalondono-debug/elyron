import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
export class CreateCompanyDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  nit?: string;
  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  website?: string;
}
export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  nit?: string;
  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  logo?: string;
  @IsOptional()
  @IsString()
  website?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
