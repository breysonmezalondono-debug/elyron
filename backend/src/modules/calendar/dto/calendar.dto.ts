import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
export class CreateCalendarEventDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  startDate: Date;
  @IsString()
  endDate: Date;
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;
  @IsOptional()
  @IsString()
  color?: string;
  @IsOptional()
  @IsString()
  type?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];
}
export class UpdateCalendarEventDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  startDate?: Date;
  @IsOptional()
  @IsString()
  endDate?: Date;
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;
  @IsOptional()
  @IsString()
  color?: string;
  @IsOptional()
  @IsString()
  type?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];
}
