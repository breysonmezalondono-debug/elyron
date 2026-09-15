import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/role.entity';
import {
  COLEGIO_PANEL_ROLES,
  SENA_PANEL_ROLES,
  UNIVERSIDAD_PANEL_ROLES,
} from '../../common/constants/instituciones';
import { RegisterDto, RegisterRoleKey } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { AppUrlResolver } from '../../common/app-url.resolver';
import { ROLES_APRENDIENTE } from '../../common/constants/cuentas';
import * as bcrypt from 'bcrypt';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Mapeo servidor→perfil: el cliente jamás elige un rol "real" sino una de
 * las tres puertas de aprendiente. La institución y el rol se resuelven
 * aquí, en el servidor.
 */
const REGISTER_PROFILE: Record<
  RegisterRoleKey,
  { roleName: string; institucion: string; institutionId: string }
> = {
  aprendiz: {
    roleName: 'aprendiz',
    institucion: 'sena',
    institutionId: 'inst-sena',
  },
  estudiante: {
    roleName: 'estudiante',
    institucion: 'colegio',
    institutionId: 'inst-colegio',
  },
  universitario: {
    roleName: 'universitario',
    institucion: 'universidad',
    institutionId: 'inst-aurora',
  },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly appUrl: AppUrlResolver,
  ) {}
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.isActive) throw new UnauthorizedException('Cuenta desactivada');
    const { password: _password, ...result } = user as any;
    void _password;
    return result;
  }
  async login(user: any) {
    const roleName = user.role?.name;
    // El frontend usa 'admin' como clave de rol (ROLE_HOME['admin'] = '/admin').
    const roleKeyFrontend =
      roleName === 'administrador' ? 'admin' : (roleName ?? null);
    const payload = {
      sub: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: roleKeyFrontend,
      roles: roleKeyFrontend ? [roleKeyFrontend] : [],
      memberships: [
        {
          institutionId:
            user.institucion === 'colegio'
              ? 'inst-colegio'
              : user.institucion === 'universidad'
                ? 'inst-aurora'
                : 'inst-sena',
          roleKey: roleKeyFrontend,
        },
      ],
      institucion: user.institucion ?? 'sena',
      tokenVersion: user.tokenVersion ?? 0,
      permisos:
        user.role?.permissions?.map((p: { name: string }) => p.name) ?? [],
      ficha_id: user.fichaId ?? null,
      es_vocero: Boolean(user.esVocero),
      es_vocero_suplente: Boolean(user.esVoceroSuplente),
      grupo_id: user.grupoId ?? null,
      es_personero: Boolean(user.esPersonero),
      es_personero_suplente: Boolean(user.esPersoneroSuplente),
    };
    const refreshSecret = this.configService.get(
      'JWT_REFRESH_SECRET',
      this.configService.get('JWT_SECRET'),
    );
    return {
      user: {
        ...user,
        role: user.role?.name,
        fichaId: user.fichaId ?? null,
        esVocero: Boolean(user.esVocero),
        esVoceroSuplente: Boolean(user.esVoceroSuplente),
        grupoId: user.grupoId ?? null,
        esPersonero: Boolean(user.esPersonero),
        esPersoneroSuplente: Boolean(user.esPersoneroSuplente),
      },
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    };
  }
  async loginForInstitucion(user: any, institucion: string) {
    const usuarioInstitucion = user.institucion ?? 'sena';
    if (usuarioInstitucion !== institucion) {
      throw new ForbiddenException(
        'Puerta de ingreso incorrecta para este usuario',
      );
    }
    const rol = user.role?.name;
    if (!ROLES_APRENDIENTE.includes(rol)) {
      throw new ForbiddenException(
        'Los cargos institucionales ingresan por el acceso institucional.',
      );
    }
    return this.login(user);
  }
  async loginForPersonal(user: any, institucion: string) {
    const usuarioInstitucion = user.institucion ?? 'sena';
    if (usuarioInstitucion !== institucion) {
      throw new ForbiddenException(
        'Puerta de ingreso incorrecta para este usuario',
      );
    }
    const rol = user.role?.name;
    if (ROLES_APRENDIENTE.includes(rol)) {
      throw new ForbiddenException(
        'Los estudiantes ingresan por el inicio de sesión normal.',
      );
    }
    return this.login(user);
  }
  async loginForPanel(user: any, institucion: string) {
    const usuarioInstitucion = user.institucion ?? 'sena';
    if (usuarioInstitucion !== institucion) {
      throw new ForbiddenException(
        'Puerta de ingreso incorrecta para este usuario',
      );
    }
    const panels: Record<string, string[]> = {
      sena: SENA_PANEL_ROLES,
      colegio: COLEGIO_PANEL_ROLES,
      universidad: UNIVERSIDAD_PANEL_ROLES,
    };
    const rol = user.role?.name;
    if (!panels[institucion]?.includes(rol)) {
      throw new ForbiddenException(
        'Este usuario no tiene acceso al panel de administración',
      );
    }
    return this.login(user);
  }
  private signSession(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    institucion: string;
    roleName: string;
    institutionId: string;
    isEmailVerified?: boolean;
    tokenVersion?: number;
  }) {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const payload = {
      sub: user.id,
      email: user.email,
      name,
      role: user.roleName,
      roles: [user.roleName],
      memberships: [
        { institutionId: user.institutionId, roleKey: user.roleName },
      ],
      institucion: user.institucion,
      tokenVersion: user.tokenVersion ?? 0,
      isEmailVerified: Boolean(user.isEmailVerified),
    };
    const refreshSecret = this.configService.get(
      'JWT_REFRESH_SECRET',
      this.configService.get('JWT_SECRET'),
    );
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        'El email ya está registrado. Inicia sesión o contacta a tu administrador.',
      );
    }

    const profile = REGISTER_PROFILE[dto.roleKey];
    const role = await this.roleRepo.findOne({
      where: { name: profile.roleName },
    });
    if (!role) {
      throw new BadRequestException(
        'El tipo de cuenta no está disponible en este momento',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const rawVerificationToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256')
      .update(rawVerificationToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

    const user = await this.usersService.createLearner({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      roleId: role.id,
      institucion: profile.institucion,
      emailVerificationToken: tokenHash,
      emailVerificationExpiresAt: expiresAt,
    });

    const session = this.signSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      institucion: profile.institucion,
      roleName: profile.roleName,
      institutionId: profile.institutionId,
      isEmailVerified: false,
    });

    const isProd = this.configService.get('NODE_ENV') === 'production';
    const verificationUrl = this.appUrl.verificationUrl(
      dto.email,
      rawVerificationToken,
    );
    const nombre = `${dto.firstName} ${dto.lastName}`.trim();

    void this.mailService
      .enviarVerificacion({ to: dto.email, nombre, link: verificationUrl })
      .catch(() => undefined);

    if (!isProd) {
      console.log(
        `[Elyron] Enlace de verificación (solo dev): ${verificationUrl}`,
      );
    }

    return {
      message:
        'Cuenta creada. Revisa tu correo para verificar tu identidad y activar el resto de funcionalidades.',
      requiresEmailVerification: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: profile.roleName,
        institucion: profile.institucion,
        isEmailVerified: false,
      },
      ...session,
    };
  }

  async verifyEmail(email: string, token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user =
      await this.usersService.findByEmailVerificationToken(tokenHash);
    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException('Enlace de verificación inválido');
    }
    if (
      user.emailVerificationExpiresAt &&
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'El enlace de verificación expiró. Solicita uno nuevo.',
      );
    }
    if (user.isEmailVerified) {
      return {
        message: 'Tu correo ya estaba verificado',
        isEmailVerified: true,
      };
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiresAt = null;
    await this.usersService.save(user);
    return {
      message: 'Correo verificado correctamente',
      isEmailVerified: true,
      user: { email: user.email },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get(
        'JWT_REFRESH_SECRET',
        this.configService.get('JWT_SECRET'),
      );
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
      const user = await this.usersService.findOne(payload.sub);
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
