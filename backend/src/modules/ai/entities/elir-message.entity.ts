import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ElirConversation } from './elir-conversation.entity';

export interface ElirCitationSource {
  id: string;
  name: string;
  page?: number | null;
  score?: number;
  quote?: string;
  kind?: 'file' | 'image' | 'library';
}

/** Mensaje de una conversación de Elir con sus citas reales (provenance). */
@Entity('elir_mensajes')
@Index(['conversationId', 'createdAt'])
export class ElirMessage extends BaseEntity {
  @ManyToOne(() => ElirConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: ElirConversation;

  @Column({ type: 'varchar', length: 60 })
  conversationId: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'user' | 'assistant';

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  sources: ElirCitationSource[] | null;
}
