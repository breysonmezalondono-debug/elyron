import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Case } from './case.entity';

@Entity('casos_historial')
export class CaseHistory extends BaseEntity {
  @ManyToOne(() => Case, (item) => item.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ length: 36 })
  caseId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column({ nullable: true, length: 36 })
  actorId: string;

  @Column({ length: 60 })
  action: string;

  @Column({ nullable: true, length: 30 })
  fromStatus: string;

  @Column({ nullable: true, length: 30 })
  toStatus: string;

  @Column({ nullable: true, length: 255 })
  reason: string;

  @Column({ nullable: true, length: 36 })
  institutionId: string;

  @Column({ nullable: true, length: 36 })
  scopeId: string;
}
