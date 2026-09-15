import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { InstitutionContext } from './institution-context.entity';
import { Ficha } from '../../fichas/ficha.entity';
import { Grupo } from '../../colegio/entities/grupo.entity';
import { Programa } from '../../programas/entities/programa.entity';
import { ResponsibilityAssignment } from './responsibility-assignment.entity';

export const SCOPE_TYPES = [
  'institution',
  'campus',
  'center',
  'program',
  'ficha',
  'group',
  'course',
  'subject',
] as const;

@Entity('contexto_alcances')
export class InstitutionScope extends BaseEntity {
  @Column({ length: 30 })
  type: string;

  @Column({ length: 180 })
  name: string;

  @ManyToOne(() => InstitutionContext, (institution) => institution.scopes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'institutionId' })
  institution: InstitutionContext;

  @Column({ length: 36 })
  institutionId: string;

  // A scope is linked to the real domain resource when applicable.
  @ManyToOne(() => Ficha, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;

  @Column({ nullable: true, length: 36 })
  fichaId: string;

  @ManyToOne(() => Grupo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;

  @Column({ nullable: true, length: 36 })
  grupoId: string;

  @ManyToOne(() => Programa, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'programaId' })
  programa: Programa;

  @Column({ nullable: true, length: 36 })
  programaId: string;

  @ManyToOne(() => InstitutionScope, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: InstitutionScope;

  @Column({ nullable: true, length: 36 })
  parentId: string;

  @OneToMany(() => ResponsibilityAssignment, (assignment) => assignment.scope)
  responsibilityAssignments: ResponsibilityAssignment[];
}
