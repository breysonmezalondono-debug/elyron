import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Grupo } from './entities/grupo.entity';
import { DocenteGrupo } from './entities/docente-grupo.entity';
import { RemisionColegio } from './entities/remision-colegio.entity';
import { CreateGrupoDto, UpdateGrupoDto } from './dto/grupo.dto';
import {
  CreateRemisionColegioDto,
  UpdateRemisionColegioDto,
} from './dto/remision-colegio.dto';
import { ColegioAccessService } from './colegio-access.service';
import { COLEGIO_ROLES } from '../../common/constants/roles';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ColegioService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(DocenteGrupo)
    private readonly dgRepo: Repository<DocenteGrupo>,
    @InjectRepository(RemisionColegio)
    private readonly remRepo: Repository<RemisionColegio>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly access: ColegioAccessService,
  ) {}

  private readonly relations = {
    docentes: { docente: true },
    estudiantes: true,
  };

  canGestionarOrientacion(user: User): boolean {
    const role = this.access.getUserRoleName(user);
    return (
      role === COLEGIO_ROLES.ADMINISTRADOR ||
      role === COLEGIO_ROLES.RECTOR ||
      role === COLEGIO_ROLES.COORDINADOR ||
      role === COLEGIO_ROLES.COORDINADOR_CONVIVENCIA ||
      role === COLEGIO_ROLES.ORIENTADOR
    );
  }

  private assertGestionOrientacion(user: User): void {
    if (!this.canGestionarOrientacion(user)) {
      throw new ForbiddenException(
        'Solo dirección y orientación gestionan remisiones',
      );
    }
  }

  async createGrupo(dto: CreateGrupoDto): Promise<Grupo> {
    const { docenteIds, ...data } = dto;
    const existente = await this.grupoRepo.findOne({
      where: { code: data.code },
    });
    if (existente) {
      throw new ConflictException('Ya existe un grupo con ese código');
    }
    const grupo = this.grupoRepo.create(data);
    const saved = await this.grupoRepo.save(grupo);
    if (docenteIds?.length) {
      await this.asignarDocentes(saved.id, docenteIds);
    }
    return this.findOneGrupo(saved.id);
  }

  async findAllGrupos(
    pagination: PaginationDto,
    currentUser: User,
  ): Promise<{ data: Grupo[]; total: number; page: number; limit: number }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const visible = await this.access.visibleGrupoIds(currentUser);
    const where: Record<string, unknown> = {};
    if (visible !== null) {
      where.id = In(visible);
    }
    const [data, total] = await this.grupoRepo.findAndCount({
      where,
      relations: this.relations,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOneGrupo(id: string, currentUser?: User): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    if (currentUser) {
      const puede = await this.access.canAccessGrupo(currentUser, id);
      if (!puede) throw new ForbiddenException('No tienes acceso a ese grupo');
    }
    return grupo;
  }

  async updateGrupo(
    id: string,
    dto: UpdateGrupoDto,
    currentUser: User,
  ): Promise<Grupo> {
    await this.findOneGrupo(id, currentUser);
    const { docenteIds, ...data } = dto;
    await this.grupoRepo.update(id, data);
    if (docenteIds) {
      await this.dgRepo.delete({ grupoId: id });
      if (docenteIds.length) {
        await this.asignarDocentes(id, docenteIds);
      }
    }
    return this.findOneGrupo(id);
  }

  async removeGrupo(id: string, currentUser: User): Promise<void> {
    await this.findOneGrupo(id, currentUser);
    await this.dgRepo.delete({ grupoId: id });
    await this.remRepo.delete({ grupoId: id });
    await this.grupoRepo.delete(id);
  }

  async estudiantesDeGrupo(
    currentUser: User,
    grupoId: string,
  ): Promise<User[]> {
    const puede = await this.access.canAccessGrupo(currentUser, grupoId);
    if (!puede) throw new ForbiddenException('No tienes acceso a ese grupo');
    const users = await this.userRepo.find({
      where: { institucion: 'colegio', grupoId },
      relations: { role: true },
    });
    return users.filter(
      (u) => this.access.getUserRoleName(u) === COLEGIO_ROLES.ESTUDIANTE,
    );
  }

  async miGrupo(currentUser: User): Promise<any> {
    if (!currentUser.grupoId) return null;
    const grupo = await this.grupoRepo.findOne({
      where: { id: currentUser.grupoId },
      relations: { docentes: { docente: true }, estudiantes: { role: true } },
    });
    if (!grupo) return null;
    const estudiantes = (grupo.estudiantes ?? []).filter(
      (u) => this.access.getUserRoleName(u) === COLEGIO_ROLES.ESTUDIANTE,
    );
    return { ...grupo, estudiantes };
  }

  private async asignarDocentes(
    grupoId: string,
    docenteIds: string[],
  ): Promise<void> {
    const rows = docenteIds.map((docenteId) =>
      this.dgRepo.create({ grupoId, docenteId }),
    );
    await this.dgRepo.save(rows);
  }

  async crearRemision(
    dto: CreateRemisionColegioDto,
    currentUser: User,
  ): Promise<RemisionColegio> {
    this.assertGestionOrientacion(currentUser);

    const estudiante = await this.userRepo.findOne({
      where: { id: dto.estudianteId },
      relations: { role: true },
    });
    if (
      !estudiante ||
      estudiante.role?.name !== COLEGIO_ROLES.ESTUDIANTE ||
      estudiante.institucion !== 'colegio'
    ) {
      throw new NotFoundException('El estudiante indicado no existe');
    }

    const grupoId = dto.grupoId ?? estudiante.grupoId;
    if (grupoId) {
      const puede = await this.access.canAccessGrupo(currentUser, grupoId);
      if (!puede) throw new ForbiddenException('No tienes acceso a ese grupo');
    }

    const duplicada = await this.remRepo.findOne({
      where: { estudianteId: estudiante.id, tipo: dto.tipo || 'orientacion' },
    });
    if (duplicada) {
      throw new ConflictException(
        'El estudiante ya tiene una remisión de ese tipo',
      );
    }

    const responsableId =
      this.access.getUserRoleName(currentUser) === COLEGIO_ROLES.ORIENTADOR
        ? currentUser.id
        : (dto.responsableId ?? currentUser.id);

    const remision = this.remRepo.create({
      estudianteId: estudiante.id,
      responsableId,
      grupoId: grupoId ?? null,
      tipo: dto.tipo || 'orientacion',
      estado: dto.estado || 'postulado',
      chatActivo: dto.chatActivo ?? false,
      motivo: dto.motivo ?? null,
    });
    return this.remRepo.save(remision);
  }

  async listarRemisiones(
    currentUser: User,
    filters: { tipo?: string; estado?: string },
  ): Promise<RemisionColegio[]> {
    this.assertGestionOrientacion(currentUser);
    const role = this.access.getUserRoleName(currentUser);
    const where: Record<string, unknown> = {};
    if (role === COLEGIO_ROLES.ORIENTADOR) {
      where.responsableId = currentUser.id;
    }
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.estado) where.estado = filters.estado;
    return this.remRepo.find({
      where,
      relations: {
        estudiante: { role: true, grupo: true },
        grupo: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async actualizarRemision(
    id: string,
    dto: UpdateRemisionColegioDto,
    currentUser: User,
  ): Promise<RemisionColegio> {
    this.assertGestionOrientacion(currentUser);
    const remision = await this.remRepo.findOne({ where: { id } });
    if (!remision) throw new NotFoundException('Remisión no encontrada');
    const role = this.access.getUserRoleName(currentUser);
    if (
      role === COLEGIO_ROLES.ORIENTADOR &&
      remision.responsableId !== currentUser.id
    ) {
      throw new ForbiddenException('Solo puedes gestionar tus remisiones');
    }
    await this.remRepo.update(id, dto);
    return this.remRepo.findOne({
      where: { id },
      relations: {
        estudiante: { role: true, grupo: true },
        grupo: true,
      },
    });
  }

  async misPostulados(currentUser: User): Promise<RemisionColegio[]> {
    const role = this.access.getUserRoleName(currentUser);
    const where: Record<string, unknown> = {};
    if (role === COLEGIO_ROLES.ORIENTADOR) {
      where.responsableId = currentUser.id;
    }
    return this.remRepo.find({
      where,
      relations: {
        estudiante: { role: true, grupo: true },
        grupo: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async misRemisiones(currentUser: User): Promise<RemisionColegio[]> {
    if (this.access.getUserRoleName(currentUser) !== COLEGIO_ROLES.ESTUDIANTE) {
      throw new ForbiddenException('Solo estudiantes consultan sus remisiones');
    }
    return this.remRepo.find({
      where: { estudianteId: currentUser.id },
      relations: {
        responsable: { role: true },
        grupo: true,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
