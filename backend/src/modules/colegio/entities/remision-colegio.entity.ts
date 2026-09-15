import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Grupo } from './grupo.entity';

@Entity('remisiones_colegio')
export class RemisionColegio extends BaseEntity {
  @Column()
  estudianteId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'estudianteId' })
  estudiante: User;

  @Column()
  responsableId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsableId' })
  responsable: User;

  @Column({ nullable: true })
  grupoId: string;

  @ManyToOne(() => Grupo, { nullable: true })
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 30, default: 'orientacion' })
  tipo: string;

  @Column({ type: 'varchar', length: 20, default: 'postulado' })
  estado: string;

  @Column({ default: false })
  chatActivo: boolean;

  @Column({ type: 'text', nullable: true })
  motivo: string;
}
