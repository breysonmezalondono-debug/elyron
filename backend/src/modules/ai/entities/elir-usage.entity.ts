import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { ElirPlanId } from './elir-plan.entity';

/** Uso diario por usuario y plan. La clave natural (userId + date) permite
 *  acumular sin duplicados y el backend es quien controla los límites. */
@Entity('elir_uso')
export class ElirUsage {
  @PrimaryColumn({ type: 'varchar', length: 60 })
  userId: string;

  @PrimaryColumn({ type: 'varchar', length: 10 })
  @Index()
  date: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 30, default: 'free' })
  planId: ElirPlanId;

  @Column({ type: 'int', default: 0 })
  messages: number;

  @Column({ type: 'int', default: 0 })
  files: number;

  @Column({ type: 'int', default: 0 })
  images: number;

  @Column({ type: 'int', default: 0 })
  advancedTasks: number;

  @Column({ type: 'bigint', nullable: true })
  inputTokens: number | null;

  @Column({ type: 'bigint', nullable: true })
  outputTokens: number | null;

  @Column({ type: 'int', default: 0 })
  documentProcessing: number;
}
