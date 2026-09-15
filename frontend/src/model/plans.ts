/* ============================================================
   PLANES DE ELIR · Elyron
   Configuración central de planes, capacidades y límites.
   Esta es la ÚNICA fuente de verdad para precios, features y
   límites. Los componentes consumen estas capacidades; el backend
   las valida. Modificar aquí no toca ningún componente.
   ============================================================ */

export type PlanId = 'free' | 'pro' | 'premium';

export interface ElirLimits {
  messagesPerDay: number;
  filesPerDay: number;
  imagesPerDay: number;
  advancedTasksPerDay: number;
  maxFileSizeMB: number;
  maxContextMessages: number;
}

export interface ElirPlan {
  id: PlanId;
  name: string;
  priceCOP: number;
  tagline: string;
  /** Capacidades booleana: qué puede hacer este plan. */
  features: {
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
  };
  limits: ElirLimits;
}

export const ELIR_PLANS: Record<PlanId, ElirPlan> = {
  free: {
    id: 'free',
    name: 'Gratis',
    priceCOP: 0,
    tagline: 'Tu tutor académico esencial.',
    features: {
      chat: true,
      fileUpload: true,
      imageAnalysis: false,
      documentAnalysis: false,
      excelAnalysis: false,
      advancedTutor: false,
      quizGeneration: true,
      flashcards: false,
      advancedRag: true,
      voice: false,
    },
    limits: {
      messagesPerDay: 15,
      filesPerDay: 3,
      imagesPerDay: 0,
      advancedTasksPerDay: 2,
      maxFileSizeMB: 5,
      maxContextMessages: 8,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCOP: 19900,
    tagline: 'Para estudios más profundos.',
    features: {
      chat: true,
      fileUpload: true,
      imageAnalysis: true,
      documentAnalysis: true,
      excelAnalysis: true,
      advancedTutor: true,
      quizGeneration: true,
      flashcards: true,
      advancedRag: true,
      voice: false,
    },
    limits: {
      messagesPerDay: 80,
      filesPerDay: 15,
      imagesPerDay: 20,
      advancedTasksPerDay: 20,
      maxFileSizeMB: 25,
      maxContextMessages: 24,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceCOP: 39900,
    tagline: 'La experiencia completa de Elyron.',
    features: {
      chat: true,
      fileUpload: true,
      imageAnalysis: true,
      documentAnalysis: true,
      excelAnalysis: true,
      advancedTutor: true,
      quizGeneration: true,
      flashcards: true,
      advancedRag: true,
      voice: true,
    },
    limits: {
      messagesPerDay: 200,
      filesPerDay: 40,
      imagesPerDay: 60,
      advancedTasksPerDay: 60,
      maxFileSizeMB: 60,
      maxContextMessages: 60,
    },
  },
};

export const ELIR_PLANS_ORDER: PlanId[] = ['free', 'pro', 'premium'];

export const formatCOP = (n: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

/** Capacidades que activan el aviso de upgrade (no disponibles en free). */
export const PRO_ONLY_FEATURES: Array<{
  key: keyof ElirPlan['features'];
  label: string;
}> = [
  { key: 'documentAnalysis', label: 'Análisis avanzado de documentos' },
  { key: 'excelAnalysis', label: 'Análisis de Excel' },
  { key: 'advancedTutor', label: 'Tutor avanzado' },
  { key: 'imageAnalysis', label: 'Análisis de imágenes' },
  { key: 'flashcards', label: 'Flashcards' },
];

/** Códigos de error estructurados que el backend puede devolver. */
export const ELIR_LIMIT_ERRORS = {
  LIMIT_REACHED: 'LIMIT_REACHED',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
  FILE_LIMIT_REACHED: 'FILE_LIMIT_REACHED',
  IMAGE_LIMIT_REACHED: 'IMAGE_LIMIT_REACHED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
} as const;

export type ElirLimitErrorCode = (typeof ELIR_LIMIT_ERRORS)[keyof typeof ELIR_LIMIT_ERRORS];
