import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('reportes_moderacion')
export class ReporteModeracion extends BaseEntity {
  @Column()
  contentExcerpt: string;

  @Column()
  reportedBy: string;

  @Column({ nullable: true })
  reportedByRole: string;

  @Column()
  reason: string;

  @Column({ default: 'pendiente' })
  status: string;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  postId: string;
}
