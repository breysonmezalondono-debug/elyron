import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, CrearCuentaDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '../roles/role.entity';
import {
  INSTITUCION_POR_ROL,
  ROLES_CREABLES_POR_CARGO,
  CARGOS_QUE_CREAN_CUENTAS,
  ROLES_APRENDIENTE,
} from '../../common/constants/cuentas';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}
  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    const saved = await this.userRepo.save(user);
    delete (saved as any).password;
    return saved;
  }
  async findAll(pagination: PaginationDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.userRepo.findAndCount({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        institucion: true,
        fichaId: true,
        esVocero: true,
        esVoceroSuplente: true,
        grupoId: true,
        esPersonero: true,
        esPersoneroSuplente: true,
        createdAt: true,
      },
      relations: { role: true, company: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findForAuth(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: {
        role: { permissions: true },
        company: true,
        ficha: true,
        grupo: true,
      },
    });
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { role: true, company: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    delete (user as any).password;
    return user;
  }
  async createLearner(input: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    roleId: string;
    institucion: string;
    emailVerificationToken?: string;
    emailVerificationExpiresAt?: Date;
  }): Promise<User> {
    /* Normalizar email: minúsculas y sin espacios, para garantizar unicidad. */
    const email = input.email.trim().toLowerCase();
    const exists = await this.userRepo.findOne({
      where: { email },
    });
    if (exists) throw new ConflictException('El email ya está registrado');
    const user = this.userRepo.create({
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.passwordHash,
      roleId: input.roleId,
      institucion: input.institucion,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: input.emailVerificationToken ?? null,
      emailVerificationExpiresAt: input.emailVerificationExpiresAt ?? null,
    });
    const saved = await this.userRepo.save(user);
    delete (saved as any).password;
    return saved;
  }

  async findByEmailVerificationToken(tokenHash: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { emailVerificationToken: tokenHash },
    });
  }

  /** Busca un usuario por id incluyendo la contraseña (para actualizarla). */
  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .getOne();
  }

  /**
   * Cambia la contraseña de forma atómica e invalida todas las sesiones
   * (JWT) anteriores incrementando la versión de token y limpiando el
   * refresh token almacenado.
   */
  async actualizarPasswordYVersiones(
    id: string,
    passwordHash: string,
  ): Promise<void> {
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        password: passwordHash,
        tokenVersion: () => 'COALESCE("tokenVersion", 0) + 1',
        refreshToken: null,
      })
      .where('id = :id', { id })
      .execute();
  }

  async save(user: User): Promise<User> {
    const saved = await this.userRepo.save(user);
    delete (saved as any).password;
    return saved;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permisos')
      .addSelect('user.password')
      .getOne();
  }

  async findVerifiedEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: { role: true, ficha: true, grupo: true },
    });
  }

  async vincularProveedor(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<User> {
    await this.userRepo.update(userId, {
      authProvider: provider,
      authProviderId: providerId,
      isEmailVerified: true,
    });
    return this.findForAuth(userId);
  }
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const actual = await this.findOne(id);

    // Unicidad de representación de ficha: solo UN líder y UN colíder por ficha.
    if (
      actual.fichaId &&
      (dto.esVocero === true || dto.esVoceroSuplente === true)
    ) {
      const mismoCargo =
        dto.esVocero === true ? 'esVocero' : 'esVoceroSuplente';
      const ocupado = await this.userRepo.findOne({
        where: {
          fichaId: actual.fichaId,
          [mismoCargo]: true,
        },
      });
      if (ocupado && ocupado.id !== actual.id) {
        const cargo = dto.esVocero === true ? 'líder' : 'colíder';
        throw new ConflictException(
          `Solo es permitido un ${cargo} por ficha. No podrás crear otra cuenta de ${cargo} con este número de ficha.`,
        );
      }
    }

    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepo.delete(id);
  }

  /**
   * Crea una cuenta de personal desde el panel (admin o coordinador).
   * - El administrador puede crear cualquier rol.
   * - El coordinador (o director/decano) solo puede crear los roles de su
   *   propia institución definidos en ROLES_CREABLES_POR_CARGO.
   * - Nunca se puede crear administrador ni coordinador/rector desde aquí.
   */
  async crearCuenta(
    dto: CrearCuentaDto,
    creador: {
      id: string;
      role?: string | { name?: string };
      institucion?: string;
    },
  ): Promise<User> {
    const rolCreador =
      typeof creador.role === 'string' ? creador.role : creador.role?.name;
    if (
      !rolCreador ||
      !(CARGOS_QUE_CREAN_CUENTAS as readonly string[]).includes(rolCreador)
    ) {
      throw new ForbiddenException(
        'Tu rol no tiene permisos para crear cuentas de personal.',
      );
    }

    const institucionCreador = creador.institucion ?? 'sena';
    const role = await this.roleRepo.findOne({
      where: { name: dto.roleKey },
    });
    if (!role) {
      throw new BadRequestException('El rol seleccionado no es válido.');
    }
    if (
      ROLES_APRENDIENTE.includes(
        dto.roleKey as (typeof ROLES_APRENDIENTE)[number],
      )
    ) {
      throw new BadRequestException(
        'Las cuentas de estudiantes se crean con el registro público.',
      );
    }
    if (dto.roleKey === 'administrador') {
      throw new ForbiddenException(
        'Las cuentas de administrador solo las gestiona otro administrador.',
      );
    }

    let institucion = dto.institucion
      ? dto.institucion
      : (INSTITUCION_POR_ROL[dto.roleKey] ?? institucionCreador);

    if (rolCreador !== 'administrador') {
      const permitidos =
        ROLES_CREABLES_POR_CARGO[institucionCreador] ?? ([] as string[]);
      if (!permitidos.includes(dto.roleKey)) {
        throw new ForbiddenException(
          `Tu cargo solo puede crear: ${permitidos.join(', ')}.`,
        );
      }
      institucion = institucionCreador;
    }

    const exists = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException('El email ya está registrado.');
    }

    if (dto.numeroDocumento) {
      const docExists = await this.userRepo.findOne({
        where: { numeroDocumento: dto.numeroDocumento },
      });
      if (docExists) {
        throw new ConflictException(
          'Ese número de documento ya está registrado en Elyron.',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: passwordHash,
      roleId: role.id,
      institucion,
      isActive: true,
      isEmailVerified: false,
      phone: dto.phone ?? null,
      fichaId: dto.fichaId ?? null,
      grupoId: dto.grupoId ?? null,
      tipoDocumento: dto.tipoDocumento ?? null,
      numeroDocumento: dto.numeroDocumento ?? null,
      direccion: dto.direccion ?? null,
      titulosAcademicos: dto.titulosAcademicos ?? null,
      educacionComplementaria: dto.educacionComplementaria ?? null,
      experienciaLaboral: dto.experienciaLaboral ?? null,
    });
    const saved = await this.userRepo.save(user);
    delete (saved as Partial<User> & { password?: string }).password;
    return saved;
  }

  /**
   * Cambio de contraseña del propio usuario. Exige conocer la contraseña
   * actual. Al cambiar, se incrementa `tokenVersion` para invalidar las
   * sesiones JWT activas y se limpia el refresh token.
   */
  async cambiarContrasena(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw new BadRequestException('La contraseña actual es incorrecta.');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.actualizarPasswordYVersiones(userId, passwordHash);
  }

  /**
   * Actualiza SOLO datos personales del usuario autenticado.
   * Nunca modifica datos académicos (programa, ficha, centro, regional, etc.).
   */
  async actualizarDatosPersonales(
    userId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      avatar?: string | null;
    },
  ): Promise<User> {
    const user = await this.findOne(userId);
    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone || null;
    if (dto.avatar !== undefined) user.avatar = dto.avatar || null;
    const saved = await this.userRepo.save(user);
    delete (saved as any).password;
    return saved;
  }
}
