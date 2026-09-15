import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
export const AI_CONTENT_TYPES = [
  'resumen',
  'explicacion',
  'cuestionario',
  'guia',
  'examen',
  'plan_clase',
  'recomendacion',
] as const;
export class AiPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
  @IsOptional()
  @IsString()
  context?: string;
}
export class AiGenerateDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
  @IsString()
  @IsNotEmpty()
  @IsIn(AI_CONTENT_TYPES)
  type: string;
}
