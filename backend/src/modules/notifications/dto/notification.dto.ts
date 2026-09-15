import { IsString, IsOptional, IsBoolean } from 'class-validator';
export class CreateNotificationDto {
  @IsString()
  title: string;
  @IsString()
  message: string;
  @IsOptional()
  @IsString()
  type?: string;
  @IsString()
  userId: string;
  @IsOptional()
  @IsString()
  link?: string;
}
export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
