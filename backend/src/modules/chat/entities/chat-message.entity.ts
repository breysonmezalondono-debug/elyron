import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
@Entity('mensajes_chat')
export class ChatMessage extends BaseEntity {
  @Column('text')
  content: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;
  @Column()
  senderId: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;
  @Column()
  receiverId: string;
  @Column({ default: false })
  isRead: boolean;
  @Column({ nullable: true })
  roomId: string;
  @Column({ type: 'varchar', length: 36, nullable: true })
  fichaId: string;
  @Column({ type: 'varchar', length: 36, nullable: true })
  grupoId: string;
  @Column({ type: 'varchar', length: 20, default: 'sena' })
  institucion: string;
}
