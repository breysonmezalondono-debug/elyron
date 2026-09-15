import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { CommunityPost } from './community-post.entity';

@Entity('reportes_publicacion')
export class PostReport extends BaseEntity {
  @Column()
  reason: string;

  @Column()
  reportedBy: string;

  @Column({ nullable: true })
  reportedByRole: string;

  @Column({ default: 'pendiente' })
  status: string;

  @ManyToOne(() => CommunityPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: CommunityPost;

  @Column()
  postId: string;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  contentExcerpt: string;
}
