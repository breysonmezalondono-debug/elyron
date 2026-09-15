import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ElirPlan as ElirPlanEntity,
  ElirPlanId,
  ElirPlanFeatures,
  ElirPlanLimits,
} from './entities/elir-plan.entity';
import { ElirUsage as ElirUsageEntity } from './entities/elir-usage.entity';

/* ============================================================
   PLANES DE ELIR · Elyron (backend)
   Autoridad de planes, capacidades y límites del asistente.

   Los planes se leen de la base de datos (tabla elir_planes) para
   que un administrador pueda cambiar precios y límites sin tocar
   código. El uso diario se persiste (elir_uso). Si la BD no está
   disponible, se cae a un respaldo en memoria que conserva el
   comportamiento anterior sin romper la conversación.

   El backend SIEMPRE es quien valida y rechaza los límites
   (LIMIT_REACHED / UPGRADE_REQUIRED / FILE_LIMIT_REACHED / ...).
   ============================================================ */

export type { ElirPlanId, ElirPlanFeatures, ElirPlanLimits };

export interface ElirLimits extends ElirPlanLimits {
  /** Reservado para futuros límites sin romper compatibilidad. */
  __extensible?: never;
}

export interface ElirPlan {
  id: ElirPlanId;
  name: string;
  priceCOP: number;
  tagline: string;
  features: ElirPlanFeatures;
  limits: ElirLimits;
}

export const ELIR_PLANS: Record<ElirPlanId, ElirPlan> = {
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

export const ELIR_PLANS_ORDER: ElirPlanId[] = ['free', 'pro', 'premium'];

export interface ElirUsage {
  userId: string;
  date: string;
  messages: number;
  files: number;
  images: number;
  advancedTasks: number;
}

export interface UsoElirDto {
  plan: ElirPlanId;
  mensajes: number;
  archivos: number;
  imagenes: number;
  tareasAvanzadas: number;
  limites: ElirLimits;
}

export type ElirErrorCode =
  | 'LIMIT_REACHED'
  | 'UPGRADE_REQUIRED'
  | 'FILE_LIMIT_REACHED'
  | 'IMAGE_LIMIT_REACHED'
  | 'FEATURE_NOT_AVAILABLE';

export class ElirLimitError extends Error {
  code: ElirErrorCode;
  constructor(code: ElirErrorCode, message: string) {
    super(message);
    this.name = 'ElirLimitError';
    this.code = code;
  }
}

const hoy = (): string => new Date().toISOString().slice(0, 10);

const toEntityFeatures = (f: ElirPlanFeatures): ElirPlanFeatures => ({ ...f });
const toEntityLimits = (l: ElirLimits): ElirLimits => ({ ...l });

@Injectable()
export class ElirPlansService implements OnModuleInit {
  private readonly logger = new Logger(ElirPlansService.name);

  /** Respaldo en memoria (usado solo si la BD no responde). */
  private readonly memoryUsage = new Map<string, ElirUsage>();
  private memoryAvailable = true;

  private static readonly PLAN_POR_ROL: Record<string, ElirPlanId> = {
    aprendiz: 'free',
    estudiante: 'free',
    universitario: 'free',
    instructor: 'pro',
    docente: 'pro',
    coordinador: 'pro',
    orientador: 'pro',
    rector: 'premium',
    administrador: 'premium',
  };

  constructor(
    @InjectRepository(ElirPlanEntity)
    private readonly planRepo: Repository<ElirPlanEntity>,
    @InjectRepository(ElirUsageEntity)
    private readonly usageRepo: Repository<ElirUsageEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedPlans().catch((e) => {
      this.memoryAvailable = false;
      this.logger.warn(
        `BD no disponible al iniciar; planes en memoria. ${e instanceof Error ? e.message : e}`,
      );
    });
  }

  private async seedPlans(): Promise<void> {
    const existing = await this.planRepo.find();
    const existingIds = new Set(existing.map((p) => p.id));
    const seeds: ElirPlanEntity[] = [];
    for (const [i, id] of ELIR_PLANS_ORDER.entries()) {
      const p = ELIR_PLANS[id];
      if (!existingIds.has(id)) {
        const entity = new ElirPlanEntity();
        entity.id = p.id;
        entity.name = p.name;
        entity.priceCOP = p.priceCOP;
        entity.tagline = p.tagline;
        entity.features = toEntityFeatures(p.features);
        entity.limits = toEntityLimits(p.limits);
        entity.sortOrder = i;
        entity.active = true;
        seeds.push(entity);
      }
    }
    if (seeds.length) {
      await this.planRepo.save(seeds);
      this.logger.log(
        `Planes Elir sembrados: ${seeds.map((s) => s.id).join(', ')}`,
      );
    }
  }

  async planes(): Promise<ElirPlan[]> {
    try {
      const rows = await this.planRepo.find({
        where: { active: true },
        order: { sortOrder: 'ASC' },
      });
      if (rows.length) return rows.map(this.toPlan);
    } catch {
      /* fallback */
    }
    return ELIR_PLANS_ORDER.map((id) => ELIR_PLANS[id]);
  }

  private toPlan(row: ElirPlanEntity): ElirPlan {
    return {
      id: row.id,
      name: row.name,
      priceCOP: row.priceCOP,
      tagline: row.tagline,
      features: row.features ?? ELIR_PLANS[row.id]?.features,
      limits: row.limits ?? ELIR_PLANS[row.id]?.limits,
    };
  }

  private planIdDeRol(rol: string): ElirPlanId {
    return ElirPlansService.PLAN_POR_ROL[rol.toLowerCase()] ?? 'free';
  }

  /** Devuelve el plan de un usuario. Lee de BD (configurable); cae a estático. */
  async planDeUsuario(rol: string | undefined): Promise<ElirPlan> {
    const id = this.planIdDeRol(rol ?? '');
    try {
      const row = await this.planRepo.findOne({ where: { id, active: true } });
      if (row) return this.toPlan(row);
    } catch {
      /* fallback */
    }
    return ELIR_PLANS[id] ?? ELIR_PLANS.free;
  }

  private memoryObtenerUso(userId: string): ElirUsage {
    const date = hoy();
    const clave = `${userId}:${date}`;
    let uso = this.memoryUsage.get(clave);
    if (!uso) {
      uso = {
        userId,
        date,
        messages: 0,
        files: 0,
        images: 0,
        advancedTasks: 0,
      };
      this.memoryUsage.set(clave, uso);
    }
    return uso;
  }

  private async dbObtenerUso(userId: string): Promise<ElirUsageEntity> {
    const date = hoy();
    let row = await this.usageRepo.findOne({ where: { userId, date } });
    if (!row) {
      row = this.usageRepo.create({ userId, date, planId: 'free' });
      row = await this.usageRepo.save(row);
    }
    return row;
  }

  /** Estado de uso del usuario autenticado (plan + consumo + límites). */
  async estadoDeUso(userId: string, rol?: string): Promise<UsoElirDto> {
    const plan = await this.planDeUsuario(rol);
    try {
      const uso = await this.dbObtenerUso(userId);
      this.memoryAvailable = true;
      return {
        plan: uso.planId,
        mensajes: uso.messages,
        archivos: uso.files,
        imagenes: uso.images,
        tareasAvanzadas: uso.advancedTasks,
        limites: plan.limits,
      };
    } catch {
      this.memoryAvailable = false;
      const uso = this.memoryObtenerUso(userId);
      return {
        plan: plan.id,
        mensajes: uso.messages,
        archivos: uso.files,
        imagenes: uso.images,
        tareasAvanzadas: uso.advancedTasks,
        limites: plan.limits,
      };
    }
  }

  /** Valida si se puede realizar una acción y registra el consumo (BD). */
  async registrarUso(
    userId: string,
    rol: string | undefined,
    tipo: 'message' | 'file' | 'image' | 'advanced',
    extra?: { inputTokens?: number; outputTokens?: number },
  ): Promise<void> {
    const plan = await this.planDeUsuario(rol);
    const l = plan.limits;
    try {
      const uso = await this.dbObtenerUso(userId);
      this.assertLimite(plan.id, uso, tipo, l);
      uso.planId = plan.id;
      if (tipo === 'message') uso.messages += 1;
      if (tipo === 'file') uso.files += 1;
      if (tipo === 'image') uso.images += 1;
      if (tipo === 'advanced') uso.advancedTasks += 1;
      if (extra?.inputTokens)
        uso.inputTokens = Number(uso.inputTokens ?? 0) + extra.inputTokens;
      if (extra?.outputTokens)
        uso.outputTokens = Number(uso.outputTokens ?? 0) + extra.outputTokens;
      if (tipo === 'file') uso.documentProcessing += 1;
      await this.usageRepo.save(uso);
      this.memoryAvailable = true;
    } catch (e) {
      if (e instanceof ElirLimitError) throw e;
      this.memoryAvailable = false;
      const uso = this.memoryObtenerUso(userId);
      this.assertLimite(plan.id, uso, tipo, l);
      if (tipo === 'message') uso.messages += 1;
      if (tipo === 'file') uso.files += 1;
      if (tipo === 'image') uso.images += 1;
      if (tipo === 'advanced') uso.advancedTasks += 1;
    }
  }

  private assertLimite(
    planId: ElirPlanId,
    uso: {
      messages: number;
      files: number;
      images: number;
      advancedTasks: number;
    },
    tipo: 'message' | 'file' | 'image' | 'advanced',
    l: ElirLimits,
  ): void {
    switch (tipo) {
      case 'message':
        if (uso.messages + 1 > l.messagesPerDay) {
          throw new ElirLimitError(
            'LIMIT_REACHED',
            'Has alcanzado el límite de mensajes de tu plan.',
          );
        }
        break;
      case 'file':
        if (uso.files + 1 > l.filesPerDay) {
          throw new ElirLimitError(
            'FILE_LIMIT_REACHED',
            'Has alcanzado el límite de archivos de tu plan.',
          );
        }
        break;
      case 'image':
        if (l.imagesPerDay <= 0) {
          throw new ElirLimitError(
            'IMAGE_LIMIT_REACHED',
            'El análisis de imágenes no está disponible en tu plan.',
          );
        }
        if (uso.images + 1 > l.imagesPerDay) {
          throw new ElirLimitError(
            'IMAGE_LIMIT_REACHED',
            'Has alcanzado el límite de imágenes de tu plan.',
          );
        }
        break;
      case 'advanced':
        if (uso.advancedTasks + 1 > l.advancedTasksPerDay) {
          throw new ElirLimitError(
            'LIMIT_REACHED',
            'Has alcanzado el límite de tareas avanzadas de tu plan.',
          );
        }
        break;
    }
    void planId;
  }

  /** Comprueba si una capacidad está disponible; si no, lanza UPGRADE_REQUIRED. */
  async exigirCapacidad(
    userId: string,
    rol: string | undefined,
    capacidad: keyof ElirPlanFeatures,
    nombre: string,
  ): Promise<void> {
    const plan = await this.planDeUsuario(rol);
    if (!plan.features[capacidad]) {
      throw new ElirLimitError(
        'UPGRADE_REQUIRED',
        `"${nombre}" está disponible en un plan superior.`,
      );
    }
  }
}
