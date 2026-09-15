import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Actividad } from './actividad.entity';

@Entity('entregas_docente')
export class Entrega extends BaseEntity {
  @Column()
  student: string;

  @Column({ nullable: true })
  activityTitle: string;

  @Column({ nullable: true })
  activityType: string;

  @Column({ nullable: true })
  groupCode: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ default: 1 })
  version: number;

  @Column({ default: false })
  late: boolean;

  @Column({ default: 'Pendiente' })
  status: string;

  @Column({ nullable: true })
  grade: number;

  @Column('text', { nullable: true })
  feedback: string;

  @ManyToOne(() => Actividad, { nullable: true })
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;

  @Column({ nullable: true })
  actividadId: string;
}
