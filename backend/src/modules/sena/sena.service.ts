import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Remision } from './entities/remision.entity';
import { PerfilSena } from '../perfiles/entities/perfil-sena.entity';
import { Ficha } from '../fichas/ficha.entity';
import { SenaAccessService } from './sena-access.service';
import { CreateRemisionDto, UpdateRemisionDto } from './dto/remision.dto';
import { SENA_ROLES } from '../../common/constants/roles';

@Injectable()
export class SenaService {
  constructor(
    @InjectRepository(Remision)
    private readonly remisionRepo: Repository<Remision>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PerfilSena)
    private readonly perfilSenaRepo: Repository<PerfilSena>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    private readonly senaAccess: SenaAccessService,
  ) {}

  private get role(): typeof SENA_ROLES {
    return SENA_ROLES;
  }

  canGestionarBienestar(user: User): boolean {
    const role = this.senaAccess.getUserRoleName(user);
    return (
      role === SENA_ROLES.ADMINISTRADOR ||
      role === SENA_ROLES.COORDINADOR ||
      role === SENA_ROLES.BIENESTAR
    );
  }

  private assertGestionBienestar(user: User): void {
    if (!this.canGestionarBienestar(user)) {
      throw new ForbiddenException(
        'Solo dirección y bienestar gestionan remisiones',
      );
    }
  }

  async crearRemision(
    dto: CreateRemisionDto,
    currentUser: User,
  ): Promise<Remision> {
    this.assertGestionBienestar(currentUser);

    const aprendiz = await this.userRepo.findOne({
      where: { id: dto.aprendizId },
      relations: { role: true },
    });
    if (!aprendiz || aprendiz.role?.name !== SENA_ROLES.APRENDIZ) {
      throw new NotFoundException('El aprendiz indicado no existe');
    }

    const fichaId = dto.fichaId ?? aprendiz.fichaId;
    if (fichaId) {
      const puede = await this.senaAccess.canAccessFicha(currentUser, fichaId);
      if (!puede) {
        throw new ForbiddenException('No tienes acceso a esa ficha');
      }
    }

    const duplicada = await this.remisionRepo.findOne({
      where: { aprendizId: aprendiz.id, tipo: dto.tipo || 'sostenimiento' },
    });
    if (duplicada) {
      throw new ConflictException(
        'El aprendiz ya tiene una remisión de ese tipo',
      );
    }

    const responsableId =
      this.senaAccess.getUserRoleName(currentUser) === SENA_ROLES.BIENESTAR
        ? currentUser.id
        : (dto.responsableId ?? currentUser.id);

    const remision = this.remisionRepo.create({
      aprendizId: aprendiz.id,
      responsableId,
      fichaId: fichaId ?? null,
      tipo: dto.tipo || 'sostenimiento',
      estado: dto.estado || 'postulado',
      chatActivo: dto.chatActivo ?? false,
      motivo: dto.motivo ?? null,
    });
    return this.remisionRepo.save(remision);
  }

  async listarRemisiones(
    currentUser: User,
    filters: { tipo?: string; estado?: string },
  ): Promise<Remision[]> {
    this.assertGestionBienestar(currentUser);
    const role = this.senaAccess.getUserRoleName(currentUser);
    const where: Record<string, unknown> = {};
    if (role === SENA_ROLES.BIENESTAR) {
      where.responsableId = currentUser.id;
    }
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.estado) where.estado = filters.estado;
    return this.remisionRepo.find({
      where,
      relations: { aprendiz: { role: true, ficha: true }, ficha: true },
      order: { createdAt: 'DESC' },
    });
  }

  async actualizarRemision(
    id: string,
    dto: UpdateRemisionDto,
    currentUser: User,
  ): Promise<Remision> {
    this.assertGestionBienestar(currentUser);
    const remision = await this.remisionRepo.findOne({ where: { id } });
    if (!remision) throw new NotFoundException('Remisión no encontrada');
    const role = this.senaAccess.getUserRoleName(currentUser);
    if (
      role === SENA_ROLES.BIENESTAR &&
      remision.responsableId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puedes gestionar tus remisiones');
    }
    await this.remisionRepo.update(id, dto);
    return this.remisionRepo.findOne({
      where: { id },
      relations: { aprendiz: { role: true, ficha: true }, ficha: true },
    });
  }

  async aprendicesDeFicha(currentUser: User, fichaId: string): Promise<User[]> {
    const puede = await this.senaAccess.canAccessFicha(currentUser, fichaId);
    if (!puede) {
      throw new ForbiddenException('No tienes acceso a esa ficha');
    }

    const ficha = await this.fichaRepo.findOne({ where: { id: fichaId } });
    const fichaCode = ficha?.code ?? null;

    let porPerfilIds: string[] = [];
    if (fichaCode) {
      const perfiles = await this.perfilSenaRepo.find({
        where: { numeroFicha: fichaCode },
        select: { usuarioId: true },
      });
      porPerfilIds = perfiles.map((p) => p.usuarioId);
    }

    const ids = Array.from(new Set(porPerfilIds));
    const users = await this.userRepo.find({
      where: ids.length
        ? [
            { institucion: 'sena', fichaId },
            { institucion: 'sena', id: In(ids) },
          ]
        : { institucion: 'sena', fichaId },
      relations: { role: true },
    });

    return users.filter(
      (u) => this.senaAccess.getUserRoleName(u) === SENA_ROLES.APRENDIZ,
    );
  }

  async misPostulados(currentUser: User): Promise<Remision[]> {
    const role = this.senaAccess.getUserRoleName(currentUser);
    const where: Record<string, unknown> = {};
    if (role === SENA_ROLES.BIENESTAR) {
      where.responsableId = currentUser.id;
    }
    return this.remisionRepo.find({
      where,
      relations: { aprendiz: { role: true, ficha: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async miApoyo(currentUser: User): Promise<Remision[]> {
    return this.remisionRepo.find({
      where: { aprendizId: currentUser.id, tipo: 'sostenimiento' },
      order: { createdAt: 'DESC' },
    });
  }
}
