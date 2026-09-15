import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
@Entity('likes_publicaciones')
@Unique(['postId', 'userId'])
export class PostLike extends BaseEntity {
  @Column()
  postId: string;
  @Column()
  userId: string;
}
