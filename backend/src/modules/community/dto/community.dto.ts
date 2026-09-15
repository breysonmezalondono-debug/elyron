import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export const COMMUNITY_CATEGORIES = [
  'duda',
  'recurso',
  'convocatoria',
  'general',
] as const;

export class CreateCommunityPostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  @IsIn(COMMUNITY_CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  groupCode?: string;
}

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CreateCommentDto {
  @IsString()
  author: string;

  @IsString()
  content: string;
}

export class CreateReportDto {
  @IsString()
  @IsIn(['spam', 'contenido_inapropiado', 'acoso', 'otro'])
  reason: string;
}

export class CreateCommunityAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  issuer: string;

  @IsOptional()
  audience?: Record<string, unknown>;

  @IsOptional()
  pinned?: boolean;
}
