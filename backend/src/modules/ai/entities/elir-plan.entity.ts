import { Column, Entity, Index } from 'typeorm';

export type ElirPlanId = 'free' | 'pro' | 'premium';

export interface ElirPlanFeatures {
  chat: boolean;
  fileUpload: boolean;
  imageAnalysis: boolean;
  documentAnalysis: boolean;
  excelAnalysis: boolean;
  advancedTutor: boolean;
  quizGeneration: boolean;
  flashcards: boolean;
  advancedRag: boolean;
  voice: boolean;
}

export interface ElirPlanLimits {
  messagesPerDay: number;
  filesPerDay: number;
  imagesPerDay: number;
  advancedTasksPerDay: number;
  maxFileSizeMB: number;
  maxContextMessages: number;
}

/** Plan de Elir, configurable desde la base de datos (admin) sin tocar código. */
@Entity('elir_planes')
export class ElirPlan {
  @Column({ type: 'varchar', length: 30, primary: true })
  id: ElirPlanId;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'int' })
  priceCOP: number;

  @Column({ type: 'varchar', length: 160, default: '' })
  tagline: string;

  @Column({ type: 'json' })
  features: ElirPlanFeatures;

  @Column({ type: 'json' })
  limits: ElirPlanLimits;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  active: boolean;
}
