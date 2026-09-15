import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Ficha } from '../../fichas/ficha.entity';

@Entity('remisiones')
export class Remision extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aprendizId' })
  aprendiz: User;
  @Column()
  aprendizId: string;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsableId' })
  responsable: User;
  @Column({ nullable: true })
  responsableId: string;
  @ManyToOne(() => Ficha, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
  @Column({ nullable: true })
  fichaId: string;
  @Column({ length: 30, default: 'sostenimiento' })
  tipo: string;
  @Column({ length: 20, default: 'postulado' })
  estado: string;
  @Column({ default: false })
  chatActivo: boolean;
  @Column({ type: 'text', nullable: true })
  motivo: string;
}
