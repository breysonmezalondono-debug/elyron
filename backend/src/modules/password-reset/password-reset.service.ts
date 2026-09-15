import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PasswordResetToken } from './password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AppUrlResolver } from '../../common/app-url.resolver';

/** Límite de solicitudes por correo en la ventana (anti spam / abuso). */
const MAX_POR_EMAIL = 3;
const VENTANA_MS = 15 * 60 * 1000;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  /** Rate limiting por correo (en memoria). */
  private readonly buckets = new Map<
    string,
    { count: number; resetAt: number }
  >();

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly appUrl: AppUrlResolver,
  ) {}

  private ttlMs(): number {
    const v = Number(
      this.configService.get('RESET_PASSWORD_TTL_MINUTES', '15'),
    );
    return (Number.isFinite(v) && v > 0 ? v : 15) * 60 * 1000;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /* ---------- Rate limiting por correo ---------- */
  private permitir(email: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(email);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(email, { count: 1, resetAt: now + VENTANA_MS });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= MAX_POR_EMAIL;
  }

  /**
   * Solicitud de recuperación. Responde SIEMPRE con el mismo mensaje
   * genérico para no revelar si el correo existe (anti enumeración).
   */
  async solicitarRecuperacion(rawEmail: string): Promise<{ message: string }> {
    const email = rawEmail.trim().toLowerCase();
    const generico =
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.';

    if (!this.permitir(email)) {
      this.logger.warn(`Rate limit de recuperación superado para ${email}`);
      // No revelar el exceso; se responde igual para no filtrar cuentas.
      return { message: generico };
    }

    const user = await this.usersService.findByEmail(email);

    if (user) {
      // Rotación: invalidar tokens anteriores del mismo usuario.
      await this.tokenRepo.update(
        { userId: user.id, usedAt: IsNull(), revokedAt: IsNull() },
        { revokedAt: new Date() },
      );

      const rawToken = randomBytes(32).toString('hex'); // 256 bits de entropía
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + this.ttlMs());

      await this.tokenRepo.save(
        this.tokenRepo.create({ userId: user.id, tokenHash, expiresAt }),
      );

      const link = this.buildLink(rawToken);
      const nombre = `${user.firstName} ${user.lastName}`.trim();

      void this.mailService
        .enviarRestablecimiento({
          to: user.email,
          nombre,
          link,
          expiraMinutos: this.ttlMs() / 60000,
        })
        .then((res) => this.logger.log(`Correo de recuperación: ${res.mode}`))
        .catch(() => undefined);

      this.logger.log(
        `Token de recuperación generado para ${email} (hash ${tokenHash.slice(0, 12)}…)`,
      );
    }

    // Pausa uniforme para reducir la diferencia de tiempo entre "existe/no existe".
    await new Promise((r) => setTimeout(r, 300));
    return { message: generico };
  }

  private buildLink(rawToken: string): string {
    return this.appUrl.resetPasswordUrl(rawToken);
  }

  /** Devuelve el estado del token sin revelar el usuario. */
  async validarToken(
    rawToken: string,
  ): Promise<{ valido: boolean; mensaje: string }> {
    const token = await this.obtenerTokenActivo(rawToken);
    if (!token) return { valido: false, mensaje: 'Este enlace no es válido.' };
    return { valido: true, mensaje: 'Token válido.' };
  }

  private async obtenerTokenActivo(
    rawToken: string,
  ): Promise<PasswordResetToken | null> {
    const tokenHash = this.hashToken(rawToken);
    const token = await this.tokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });
    if (!token) return null;
    if (token.usedAt)
      throw new BadRequestException('Este enlace ya no es válido.');
    if (token.revokedAt)
      throw new BadRequestException('Este enlace ya no es válido.');
    if (token.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Este enlace ha expirado.');
    }
    if (!token.user) throw new BadRequestException('Este enlace no es válido.');
    return token;
  }

  /**
   * Cambia la contraseña de forma atómica (transacción) y de un solo uso.
   * Dos solicitudes simultáneas con el mismo token no pueden ejecutarse dos veces.
   */
  async restablecerPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const tokenHash = this.hashToken(rawToken);
      const token = await manager
        .getRepository(PasswordResetToken)
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.user', 'user')
        .where('t.tokenHash = :tokenHash', { tokenHash })
        .andWhere('t.usedAt IS NULL')
        .andWhere('t.revokedAt IS NULL')
        .getOne();

      if (!token) {
        throw new BadRequestException('Este enlace ya no es válido.');
      }
      if (token.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException('Este enlace ha expirado.');
      }
      if (!token.user) {
        throw new BadRequestException('Este enlace no es válido.');
      }

      const userId = token.user.id;
      const passwordHash = await bcrypt.hash(newPassword, 12);

      await manager.update(
        'usuarios',
        { id: userId },
        {
          password: passwordHash,
          tokenVersion: () => 'COALESCE("tokenVersion", 0) + 1',
          refreshToken: null,
        },
      );

      // Marcar este token como usado e invalidar todos los demás del usuario.
      await manager
        .getRepository(PasswordResetToken)
        .update({ userId }, { usedAt: new Date(), revokedAt: new Date() });

      this.logger.log(
        `Contraseña restablecida para el usuario ${userId} (token hash ${tokenHash.slice(0, 12)}…)`,
      );
      return { message: 'Tu contraseña fue actualizada correctamente.' };
    });

    return resultado;
  }
}
