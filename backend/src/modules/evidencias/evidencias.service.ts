import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Evidencia } from './evidencia.entity';
import { Resultado } from '../resultados/resultado.entity';
import {
  CreateEvidenciaDto,
  UpdateEvidenciaDto,
  EntregarEvidenciaDto,
  CalificarEvidenciaDto,
} from './dto/evidencia.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { ResponsibilityService } from '../contexto/responsibility.service';
import { AuthorizationContextService } from '../contexto/authorization-context.service';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';

@Injectable()
export class EvidenciasService {
  constructor(
    @InjectRepository(Evidencia)
    private readonly evidenciaRepo: Repository<Evidencia>,
    @InjectRepository(Resultado)
    private readonly resultadoRepo: Repository<Resultado>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(InstitutionContext)
    private readonly institutionRepo: Repository<InstitutionContext>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly responsibilityService: ResponsibilityService,
    private readonly authorizationContextService: AuthorizationContextService,
  ) {}

  private notificarResultado(evidencia: Evidencia, aprobada: boolean) {
    const destinatario = evidencia.submittedBy;
    if (!destinatario || !destinatario.email) return;
    const front =
      this.configService
        .get<string>('FRONTEND_URL', 'http://localhost:5173')
        .split(',')[0]
        .trim()
        .replace(/\/$/, '') || 'http://localhost:5173';
    const nombre = `${destinatario.firstName} ${destinatario.lastName}`.trim();
    void this.mailService
      .enviarResultadoEvidencia({
        to: destinatario.email,
        nombre: nombre || 'estudiante',
        titulo: evidencia.title || 'tu evidencia',
        aprobada,
        feedback: evidencia.feedback,
        link: `${front}/evidencias`,
      })
      .catch(() => undefined);
  }

  private async puedeLeer(
    evidencia: Evidencia,
    actor?: User,
  ): Promise<boolean> {
    if (!actor) return true;
    if (!this.authorizationContextService.can(actor, 'evidencias.read')) {
      return false;
    }
    const role = actor.role?.name;
    if (role === 'administrador') return true;
    if (
      evidencia.submittedById === actor.id ||
      evidencia.responsibleUserId === actor.id
    ) {
      return true;
    }
    if (!evidencia.institutionContextId || !evidencia.scopeId) return false;
    if (role === 'instructor') {
      return this.responsibilityService.hasUserScope({
        userId: actor.id,
        responsibilityCode: 'SENA_INSTRUCTOR',
        institutionId: evidencia.institutionContextId,
        scopeId: evidencia.scopeId,
      });
    }
    if (['coordinador', 'director_programa', 'decano'].includes(role ?? '')) {
      const institution = await this.institutionRepo.findOne({
        where: { id: evidencia.institutionContextId },
      });
      return institution?.code === actor.institucion;
    }
    return false;
  }

  async create(dto: CreateEvidenciaDto, userId: string): Promise<Evidencia> {
    const resultado = await this.resultadoRepo.findOne({
      where: { id: dto.resultadoId },
      relations: { competencia: { ficha: { programa: true } } },
    });
    if (!resultado) throw new NotFoundException('Resultado no encontrado');

    const ficha = resultado.competencia?.ficha;
    if (!ficha) {
      throw new BadRequestException(
        'La evidencia no tiene una ficha académica contextualizada',
      );
    }
    const estudiante = await this.userRepo.findOne({
      where: { id: userId },
      relations: { ficha: true, grupo: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (estudiante.institucion !== 'sena' || estudiante.fichaId !== ficha.id) {
      throw new ForbiddenException(
        'No puedes crear una evidencia fuera de tu ficha académica',
      );
    }

    const institutionContextId = ficha.institutionContextId;
    const scopeId = ficha.scopeId;
    if (!institutionContextId || !scopeId) {
      throw new BadRequestException(
        'La ficha no tiene contexto institucional configurado',
      );
    }
    const responsible = await this.responsibilityService.requireResponsible({
      responsibilityCode: 'SENA_INSTRUCTOR',
      institutionId: institutionContextId,
      scopeIds: [scopeId],
    });

    const evidencia = this.evidenciaRepo.create({
      ...dto,
      submittedById: userId,
      institutionContextId,
      scopeId,
      fichaId: ficha.id,
      programaId: ficha.programaId,
      responsibleUserId: responsible.userId,
    });
    return this.evidenciaRepo.save(evidencia);
  }

  async findAll(
    pagination: PaginationDto,
    filters: { resultadoId?: string; status?: string } = {},
    actor?: User,
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const where: Record<string, unknown> = {};
    if (filters.resultadoId) where.resultadoId = filters.resultadoId;
    if (filters.status) where.status = filters.status;
    const [data] = await this.evidenciaRepo.findAndCount({
      where,
      relations: { resultado: true, submittedBy: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const autorizadas: Evidencia[] = [];
    for (const evidencia of data) {
      if (await this.puedeLeer(evidencia, actor)) autorizadas.push(evidencia);
    }
    return { data: autorizadas, total: autorizadas.length, page, limit };
  }

  async findOne(id: string, actor?: User): Promise<Evidencia> {
    const evidencia = await this.evidenciaRepo.findOne({
      where: { id },
      relations: { resultado: true, submittedBy: true },
    });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    if (!(await this.puedeLeer(evidencia, actor))) {
      throw new ForbiddenException('No tienes alcance sobre esta evidencia');
    }
    return evidencia;
  }

  async entregar(
    id: string,
    dto: EntregarEvidenciaDto,
    userId: string,
  ): Promise<Evidencia> {
    const evidencia = await this.findOne(id);
    if (evidencia.submittedById && evidencia.submittedById !== userId) {
      throw new BadRequestException('No puedes entregar una evidencia ajena');
    }
    await this.evidenciaRepo.update(id, {
      status: 'pending',
      submittedById: userId,
      feedback: undefined,
      reviewedAt: undefined,
    });
    return this.findOne(id);
  }

  private async validarResponsable(evidencia: Evidencia, reviewerId: string) {
    if (
      !evidencia.responsibleUserId ||
      evidencia.responsibleUserId === reviewerId
    ) {
      return;
    }
    const reviewer = await this.userRepo.findOne({
      where: { id: reviewerId },
      relations: { role: true },
    });
    if (
      !reviewer ||
      !this.authorizationContextService.can(reviewer, 'evidencias.update')
    ) {
      throw new ForbiddenException(
        'No tienes permiso para revisar evidencias.',
      );
    }
    const roleName = reviewer?.role?.name;
    const overrideRoles = [
      'administrador',
      'coordinador',
      'director_programa',
      'decano',
    ];
    if (!roleName || !overrideRoles.includes(roleName)) {
      throw new ForbiddenException(
        'Esta evidencia está asignada a otro responsable académico.',
      );
    }
  }

  async calificar(
    id: string,
    dto: CalificarEvidenciaDto,
    reviewerId: string,
  ): Promise<Evidencia> {
    const evidencia = await this.findOne(id);
    await this.validarResponsable(evidencia, reviewerId);
    if (evidencia.status !== 'pending') {
      throw new BadRequestException(
        'Solo se pueden calificar evidencias en estado pendiente',
      );
    }
    await this.evidenciaRepo.update(id, {
      status: 'approved',
      feedback: dto.feedback,
      reviewedAt: new Date(),
      reviewedById: reviewerId,
    });
    const guardada = await this.findOne(id);
    this.notificarResultado(guardada, true);
    return guardada;
  }

  async devolver(
    id: string,
    feedback: string,
    reviewerId: string,
  ): Promise<Evidencia> {
    const evidencia = await this.findOne(id);
    await this.validarResponsable(evidencia, reviewerId);
    if (evidencia.status !== 'pending') {
      throw new BadRequestException(
        'Solo se pueden devolver evidencias en estado pendiente',
      );
    }
    await this.evidenciaRepo.update(id, {
      status: 'rejected',
      feedback,
      reviewedAt: new Date(),
      reviewedById: reviewerId,
    });
    const guardada = await this.findOne(id);
    this.notificarResultado(guardada, false);
    return guardada;
  }

  async update(id: string, dto: UpdateEvidenciaDto): Promise<Evidencia> {
    const evidencia = await this.findOne(id);
    if (dto.status && dto.status !== evidencia.status) {
      if (evidencia.status !== 'pending' && dto.status === 'pending') {
        throw new BadRequestException(
          'Una evidencia revisada no puede volver a estado pendiente',
        );
      }
      dto.reviewedAt =
        dto.status === 'approved' || dto.status === 'rejected'
          ? new Date()
          : undefined;
    }
    await this.evidenciaRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.evidenciaRepo.delete(id);
  }
}
