import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Ficha } from '../../fichas/ficha.entity';

@Entity('ficha_anuncios')
export class FichaAnuncio extends BaseEntity {
  @Column({ length: 200 })
  titulo: string;
  @Column('text')
  contenido: string;
  @Column({ length: 20, default: 'media' })
  prioridad: string;
  @Column({ length: 30, default: 'anuncio' })
  categoria: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'autorId' })
  autor: User;
  @Column()
  autorId: string;
  @ManyToOne(() => Ficha, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
  @Column({ nullable: true })
  fichaId: string;
}
