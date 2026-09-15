import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

@Entity('publicaciones_comunidad')
export class CommunityPost extends BaseEntity {
  @Column('text')
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  authorRole: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  groupCode: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: true })
  isVisible: boolean;
}
