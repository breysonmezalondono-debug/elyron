import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Ficha } from '../../fichas/ficha.entity';
import { InstitutionContext } from '../../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../../contexto/entities/institution-scope.entity';

@Entity('programas')
export class Programa extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  institutionId: string;

  @ManyToOne(() => InstitutionContext, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'institutionContextId' })
  institutionContext: InstitutionContext;

  @Column({ nullable: true, length: 36 })
  institutionContextId: string;

  @ManyToOne(() => InstitutionScope, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scopeId' })
  scope: InstitutionScope;

  @Column({ nullable: true, length: 36 })
  scopeId: string;

  @Column({ nullable: true })
  groupLabel: string;

  @Column({ default: 0 })
  instructorCount: number;

  @Column({ default: 0 })
  apprenticeCount: number;

  @Column({ type: 'int', nullable: true })
  duracionMeses: number;

  @OneToMany(() => Ficha, (ficha) => ficha.programa, { nullable: true })
  fichas: Ficha[];
}
