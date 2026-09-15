import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('log_auditoria')
export class AuditLog extends BaseEntity {
  @Column()
  actor: string;

  @Column()
  action: string;

  @Column()
  target: string;

  @Column()
  time: string;

  @Column()
  category: string;

  @Column({ nullable: true, length: 36 })
  institutionId: string;

  @Column({ nullable: true, length: 36 })
  scopeId: string;

  @Column({ nullable: true, length: 36 })
  responsibilityId: string;

  @Column({ nullable: true, length: 120 })
  permission: string;

  @Column({ nullable: true, length: 20 })
  result: string;

  @Column({ nullable: true, length: 255 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  beforeValue: string;

  @Column({ type: 'text', nullable: true })
  afterValue: string;

  @Column({ nullable: true, length: 80 })
  ip: string;
}
