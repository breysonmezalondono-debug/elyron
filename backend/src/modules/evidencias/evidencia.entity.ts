import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Resultado } from '../resultados/resultado.entity';
import { User } from '../users/user.entity';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../contexto/entities/institution-scope.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
import { Programa } from '../programas/entities/programa.entity';
@Entity('evidencias')
export class Evidencia extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column({ default: 'pending' })
  status: string;
  @Column({ type: 'simple-json', nullable: true })
  files: string[];
  @ManyToOne(() => Resultado, (resultado) => resultado.evidencias)
  @JoinColumn({ name: 'resultadoId' })
  resultado: Resultado;
  @Column()
  resultadoId: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;
  @Column({ nullable: true })
  submittedById: string;
  @Column({ nullable: true })
  reviewedAt: Date;
  @Column({ nullable: true, length: 36 })
  reviewedById: string;
  @Column({ nullable: true })
  feedback: string;

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

  @Column({ nullable: true, length: 36 })
  programaId: string;

  @ManyToOne(() => Programa, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'programaId' })
  programa: Programa;

  @Column({ nullable: true, length: 36 })
  fichaId: string;

  @ManyToOne(() => Ficha, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;

  @Column({ nullable: true, length: 36 })
  grupoId: string;

  @ManyToOne(() => Grupo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;

  @Column({ nullable: true, length: 36 })
  responsibleUserId: string;
}
