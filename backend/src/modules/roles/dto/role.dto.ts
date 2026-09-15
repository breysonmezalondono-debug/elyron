import { IsString, IsOptional, IsArray } from 'class-validator';
export class CreateRoleDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
