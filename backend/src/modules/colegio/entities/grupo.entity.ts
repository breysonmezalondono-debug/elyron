import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { DocenteGrupo } from './docente-grupo.entity';
import { InstitutionContext } from '../../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../../contexto/entities/institution-scope.entity';

@Entity('grupos')
export class Grupo extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  nombre: string;

  @Column({ type: 'int' })
  grado: number;

  @Column({ type: 'varchar', length: 30, default: 'basica_secundaria' })
  nivel: string;

  @Column({ type: 'varchar', length: 20, default: 'manana' })
  jornada: string;

  @Column({ type: 'int', default: 2026 })
  anioLectivo: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  colegio: string;

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

  @OneToMany(() => DocenteGrupo, (dg) => dg.grupo)
  docentes: DocenteGrupo[];

  @OneToMany(() => User, (u) => u.grupo)
  estudiantes: User[];
}
