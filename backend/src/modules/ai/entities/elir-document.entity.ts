import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

export type ElirDocumentKind = 'file' | 'image';

/**
 * Documento o imagen subido al asistente Elir.
 * - Pertenece a un usuario (ownerId) y ninguna operación puede leerlo sin
 *   verificar que el solicitante es el dueño (ownership en backend).
 * - El texto extraído (extractedText) se usa como contexto real de la
 *   respuesta; la cita mostrada corresponde a este documento (provenance).
 */
@Entity('elir_documentos')
@Index(['ownerId', 'createdAt'])
export class ElirDocument extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  @Index()
  ownerId: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 120 })
  storageName: string;

  @Column({ type: 'varchar', length: 20 })
  storagePath: string;

  @Column({ type: 'varchar', length: 120 })
  mime: string;

  @Column({ type: 'varchar', length: 20 })
  ext: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({ type: 'varchar', length: 64 })
  sha256: string;

  @Column({ type: 'longtext', nullable: true })
  extractedText: string | null;

  @Column({ type: 'varchar', length: 30, default: 'file' })
  kind: ElirDocumentKind;

  @Column({ type: 'varchar', length: 120, nullable: true })
  program: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ready' })
  status: string; // processing | ready | error

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date | null;
}
