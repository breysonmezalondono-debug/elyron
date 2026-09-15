import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Conversación de Elir; pertenece exclusivamente a un usuario. */
@Entity('elir_conversaciones')
@Index(['ownerId', 'updatedAt'])
export class ElirConversation extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  @Index()
  ownerId: string;

  @Column({ type: 'varchar', length: 200, default: 'Nueva conversación' })
  title: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  program: string | null;

  @Column({ type: 'varchar', length: 30, default: 'responder' })
  mode: string;
}
