import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const ELIR_MODES = [
  'responder',
  'explicar',
  'guiarme',
  'practicar',
  'examinarme',
] as const;
export type ElirMode = (typeof ELIR_MODES)[number];

export class ElirChatStreamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  message: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];

  @IsOptional()
  @IsIn(ELIR_MODES)
  mode?: ElirMode;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  program?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(6000)
  libraryContext?: string | null;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class ElirUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  program?: string | null;
}

export class ElirGenerarQuizDto {
  @IsString()
  @MaxLength(300)
  topic: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
}
