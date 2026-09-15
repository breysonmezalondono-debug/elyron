import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Company } from '../companies/company.entity';
import { Competencia } from '../competencias/competencia.entity';
import { FichaInstructor } from '../sena/entities/ficha-instructor.entity';
import { Programa } from '../programas/entities/programa.entity';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../contexto/entities/institution-scope.entity';

@Entity('fichas')
export class Ficha extends BaseEntity {
  @Column()
  code: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ type: 'varchar', length: 20, nullable: true })
  tipoPrograma: string;
  @Column({ default: 'active' })
  status: string;
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;
  @Column({ nullable: true })
  companyId: string;
  @Column({ nullable: true })
  programaId: string;

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

  @ManyToOne(() => Programa, (prog) => prog.fichas, { nullable: true })
  @JoinColumn({ name: 'programaId' })
  programa: Programa;

  @OneToMany(() => Competencia, (competencia) => competencia.ficha)
  competencias: Competencia[];
  @OneToMany(() => FichaInstructor, (fi) => fi.ficha)
  instructores: FichaInstructor[];
}
