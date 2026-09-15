import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';
@Entity('notificaciones')
export class Notification extends BaseEntity {
  @Column()
  title: string;
  @Column('text')
  message: string;
  @Column({ default: 'info' })
  type: string;
  @Column({ default: false })
  isRead: boolean;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: string;
  @Column({ nullable: true })
  link: string;
}
