import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

@Entity('recursos_biblioteca')
export class RecursoBiblioteca extends BaseEntity {
  @Column({ length: 200 })
  titulo: string;
  @Column({ length: 30, default: 'libro' })
  tipo: string;
  @Column({ length: 150, nullable: true })
  autor: string;
  @Column('text', { nullable: true })
  descripcion: string;
  @Column({ length: 30, default: 'disponible' })
  estado: string;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'prestadoAId' })
  prestadoA: User;
  @Column({ nullable: true })
  prestadoAId: string;
  @Column({ nullable: true })
  fechaDevolucion: Date;
}
