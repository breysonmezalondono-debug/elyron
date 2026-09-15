import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('anuncios_comunidad')
export class CommunityAnnouncement extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column()
  issuer: string;

  @Column({ type: 'simple-json', nullable: true })
  audience: Record<string, unknown>;

  @Column({ default: false })
  pinned: boolean;
}
