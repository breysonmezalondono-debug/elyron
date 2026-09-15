import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

@Entity('solicitudes')
export class Solicitud extends BaseEntity {
  @Column({ length: 150 })
  titulo: string;
  @Column('text', { nullable: true })
  descripcion: string;
  @Column({ length: 40, default: 'general' })
  tipo: string;
  @Column({ length: 20, default: 'abierta' })
  estado: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aprendizId' })
  aprendiz: User;
  @Column()
  aprendizId: string;
}
