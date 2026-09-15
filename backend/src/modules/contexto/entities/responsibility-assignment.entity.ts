import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { InstitutionContext } from './institution-context.entity';
import { InstitutionScope } from './institution-scope.entity';
import { Responsibility } from './responsibility.entity';

@Entity('asignaciones_responsabilidad')
export class ResponsibilityAssignment extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 36 })
  userId: string;

  @ManyToOne(
    () => Responsibility,
    (responsibility) => responsibility.assignments,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'responsibilityId' })
  responsibility: Responsibility;

  @Column({ length: 36 })
  responsibilityId: string;

  @ManyToOne(
    () => InstitutionContext,
    (institution) => institution.responsibilityAssignments,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'institutionId' })
  institution: InstitutionContext;

  @Column({ length: 36 })
  institutionId: string;

  @ManyToOne(
    () => InstitutionScope,
    (scope) => scope.responsibilityAssignments,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'scopeId' })
  scope: InstitutionScope;

  @Column({ nullable: true, length: 36 })
  scopeId: string;

  @Column({ type: 'datetime' })
  startsAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endsAt: Date;

  @Column({ default: 'active', length: 20 })
  status: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @Column({ nullable: true, length: 36 })
  assignedById: string;

  @Column({ nullable: true, length: 255 })
  assignmentReason: string;
}
