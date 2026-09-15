import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { InstitutionContext } from '../../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../../contexto/entities/institution-scope.entity';
import { Responsibility } from '../../contexto/entities/responsibility.entity';
import { CaseCategory } from './case-category.entity';
import { CaseMessage } from './case-message.entity';
import { CaseHistory } from './case-history.entity';

export const CASE_STATUSES = [
  'CREADO',
  'PENDIENTE_ASIGNACION',
  'ASIGNADO',
  'EN_REVISION',
  'EN_GESTION',
  'PENDIENTE_USUARIO',
  'PENDIENTE_TERCERO',
  'RESUELTO',
  'CERRADO',
  'REABIERTO',
  'CANCELADO',
] as const;

@Entity('casos')
export class Case extends BaseEntity {
  @VersionColumn()
  version: number;

  @Column({ unique: true, length: 30 })
  caseNumber: string;

  @ManyToOne(() => InstitutionContext, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institutionId' })
  institution: InstitutionContext;

  @Column({ length: 36 })
  institutionId: string;

  @ManyToOne(() => InstitutionScope, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scopeId' })
  scope: InstitutionScope;

  @Column({ nullable: true, length: 36 })
  scopeId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column({ length: 36 })
  requesterId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @Column({ nullable: true, length: 36 })
  assignedUserId: string;

  @ManyToOne(() => Responsibility, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsibilityId' })
  responsibility: Responsibility;

  @Column({ nullable: true, length: 36 })
  responsibilityId: string;

  @ManyToOne(() => CaseCategory, (category) => category.cases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: CaseCategory;

  @Column({ length: 36 })
  categoryId: string;

  @Column({ nullable: true, length: 36 })
  subcategoryId: string;

  @Column({ length: 180 })
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'NORMAL', length: 20 })
  priority: string;

  @Column({ default: 'CREADO', length: 30 })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  dueAt: Date;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  closedAt: Date;

  @Column({ nullable: true, length: 36 })
  closedById: string;

  @Column({ type: 'datetime', nullable: true })
  reopenedAt: Date;

  @Column({ nullable: true, length: 36 })
  reopenedById: string;

  @OneToMany(() => CaseMessage, (message) => message.case)
  messages: CaseMessage[];

  @OneToMany(() => CaseHistory, (history) => history.case)
  history: CaseHistory[];
}
