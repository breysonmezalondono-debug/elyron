import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';

/**
 * Token de recuperación de contraseña.
 *
 * SEGURIDAD: se guarda SOLO el HASH (SHA-256) del token original, nunca el
 * token en texto plano. El token original solo existe temporalmente en el
 * enlace enviado por correo. Es de un solo uso y expira.
 */
@Entity('password_reset_tokens')
@Index(['userId'])
@Index(['tokenHash'], { unique: true })
@Index(['expiresAt'])
export class PasswordResetToken extends BaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Hash SHA-256 del token original (nunca el token plano). */
  @Column({ type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  /** Momento en que se usó el token (null mientras siga activo). */
  @Column({ type: 'datetime', nullable: true })
  usedAt: Date | null;

  /** Momento en que se revocó manualmente (rotación / nuevo enlace). */
  @Column({ type: 'datetime', nullable: true })
  revokedAt: Date | null;
}
