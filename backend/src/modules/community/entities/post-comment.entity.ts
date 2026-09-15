import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { CommunityPost } from './community-post.entity';

@Entity('comentarios_publicacion')
export class PostComment extends BaseEntity {
  @Column()
  author: string;

  @Column('text')
  content: string;

  @ManyToOne(() => CommunityPost, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: CommunityPost;

  @Column()
  postId: string;
}
