import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Ficha } from '../../fichas/ficha.entity';
import { User } from '../../users/user.entity';

@Entity('ficha_instructores')
export class FichaInstructor extends BaseEntity {
  @ManyToOne(() => Ficha, (ficha) => ficha.instructores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
  @Column()
  fichaId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;
  @Column()
  instructorId: string;
  @Column({ default: true })
  activo: boolean;
}
