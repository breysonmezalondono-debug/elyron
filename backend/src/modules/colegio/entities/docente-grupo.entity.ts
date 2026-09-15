import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Grupo } from './grupo.entity';
import { User } from '../../users/user.entity';

@Entity('docentes_grupos')
export class DocenteGrupo extends BaseEntity {
  @Column()
  grupoId: string;

  @ManyToOne(() => Grupo, (g) => g.docentes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;

  @Column()
  docenteId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'docenteId' })
  docente: User;

  @Column({ type: 'varchar', length: 120, nullable: true })
  asignatura: string;

  @Column({ default: true })
  activo: boolean;
}
