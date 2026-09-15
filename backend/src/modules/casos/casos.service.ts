import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseCategory } from './entities/case-category.entity';
import { CaseMessage } from './entities/case-message.entity';
import { CaseHistory } from './entities/case-history.entity';
import { User } from '../users/user.entity';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../contexto/entities/institution-scope.entity';
import { ResponsibilityService } from '../contexto/responsibility.service';
import { AuthorizationContextService } from '../contexto/authorization-context.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLog } from '../auditoria/entities/audit-log.entity';
import { CaseWorkflowService } from './case-workflow.service';
import {
  CreateCaseDto,
  CreateCaseMessageDto,
  TransitionCaseDto,
} from './dto/case.dto';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    @InjectRepository(CaseCategory)
    private readonly categoryRepo: Repository<CaseCategory>,
    @InjectRepository(CaseMessage)
    private readonly messageRepo: Repository<CaseMessage>,
    @InjectRepository(CaseHistory)
    private readonly historyRepo: Repository<CaseHistory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(InstitutionContext)
    private readonly institutionRepo: Repository<InstitutionContext>,
    @InjectRepository(InstitutionScope)
    private readonly scopeRepo: Repository<InstitutionScope>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly responsibilityService: ResponsibilityService,
    private readonly authorizationContext: AuthorizationContextService,
    private readonly notifications: NotificationsService,
    private readonly workflow: CaseWorkflowService,
  ) {}

  private async nextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.caseRepo.count();
    return `ELY-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private async history(
    item: Case,
    actorId: string,
    action: string,
    fromStatus?: string,
    toStatus?: string,
    reason?: string,
  ) {
    await this.historyRepo.save(
      this.historyRepo.create({
        caseId: item.id,
        actorId,
        action,
        fromStatus,
        toStatus,
        reason,
        institutionId: item.institutionId,
        scopeId: item.scopeId,
      }),
    );
    await this.auditRepo.save(
      this.auditRepo.create({
        actor: actorId,
        action: `CASE_${action}`,
        target: item.caseNumber,
        time: new Date().toISOString(),
        category: 'casos',
        institutionId: item.institutionId,
        scopeId: item.scopeId,
        responsibilityId: item.responsibilityId,
        result: 'ALLOW',
        reason,
        beforeValue: fromStatus,
        afterValue: toStatus,
      }),
    );
  }

  private async saveVersioned(
    item: Case,
    changes: Record<string, unknown>,
    actorId: string,
  ): Promise<Case> {
    const result = await this.caseRepo
      .createQueryBuilder()
      .update(Case)
      .set({ ...changes, version: () => '`version` + 1' } as any)
      .where('id = :id AND version = :version', {
        id: item.id,
        version: item.version,
      })
      .execute();
    if (result.affected !== 1) {
      await this.denial(
        actorId,
        'CASE_CONCURRENT_UPDATE',
        item.caseNumber,
        'CONCURRENCY_CONFLICT',
        item.institutionId,
        item.scopeId,
      );
      throw new ConflictException(
        'El caso cambió mientras lo estabas gestionando. Actualiza la información.',
      );
    }
    return this.caseRepo.findOne({ where: { id: item.id } });
  }

  private async denial(
    actorId: string | undefined,
    action: string,
    target: string,
    reason: string,
    institutionId?: string,
    scopeId?: string,
  ): Promise<void> {
    await this.auditRepo.save(
      this.auditRepo.create({
        actor: actorId ?? 'anonymous',
        action,
        target,
        time: new Date().toISOString(),
        category: 'security',
        institutionId,
        scopeId,
        result: 'DENY',
        reason,
      }),
    );
  }

  private async puedeOperar(item: Case, actor: User): Promise<boolean> {
    const institution = await this.institutionRepo.findOne({
      where: { id: item.institutionId },
    });
    if (!institution || institution.code !== actor.institucion) return false;
    if (actor.role?.name === 'administrador') return true;
    if (actor.id === item.requesterId || actor.id === item.assignedUserId) {
      return true;
    }
    if (
      ['coordinador', 'director_programa', 'decano', 'rector'].includes(
        actor.role?.name ?? '',
      )
    ) {
      return this.responsibilityService.hasAnyUserScope({
        userId: actor.id,
        institutionId: item.institutionId,
        scopeId: item.scopeId,
      });
    }
    return false;
  }

  async create(dto: CreateCaseDto, requesterId: string): Promise<Case> {
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: {
        role: { permissions: true },
        ficha: { scope: true },
        grupo: { scope: true },
      },
    });
    if (!requester) throw new NotFoundException('Solicitante no encontrado');
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, status: 'active' },
      relations: { institution: true },
    });
    if (!category)
      throw new NotFoundException('Categoría de caso no encontrada');
    if (category.institution.code !== requester.institucion) {
      await this.denial(
        requesterId,
        'CASE_CREATE',
        dto.categoryId,
        'INSTITUTION_MISMATCH',
      );
      throw new ForbiddenException(
        'La categoría no pertenece a tu institución',
      );
    }

    const derivedScopeId =
      requester.ficha?.scopeId ?? requester.grupo?.scopeId ?? null;
    const scopeId = dto.scopeId ?? derivedScopeId;
    if (
      derivedScopeId &&
      dto.scopeId &&
      dto.scopeId !== derivedScopeId &&
      requester.role?.name !== 'administrador'
    ) {
      await this.denial(
        requesterId,
        'CASE_CREATE',
        dto.categoryId,
        'SCOPE_MISMATCH',
        category.institutionId,
        derivedScopeId ?? dto.scopeId,
      );
      throw new ForbiddenException(
        'El caso está fuera del alcance del solicitante',
      );
    }
    if (!scopeId) {
      await this.denial(
        requesterId,
        'CASE_CREATE',
        dto.categoryId,
        'NO_SCOPE',
        category.institutionId,
      );
      throw new BadRequestException(
        'El caso necesita un contexto académico (ficha o grupo).',
      );
    }
    const scope = await this.scopeRepo.findOne({ where: { id: scopeId } });
    if (!scope || scope.institutionId !== category.institutionId) {
      await this.denial(
        requesterId,
        'CASE_CREATE',
        dto.categoryId,
        'SCOPE_MISMATCH',
        category.institutionId,
        scopeId,
      );
      throw new ForbiddenException(
        'El alcance no pertenece a la institución de la categoría',
      );
    }
    if (
      !this.authorizationContext.can(requester, 'cases.create', {
        institution: requester.institucion,
      })
    ) {
      await this.denial(
        requesterId,
        'CASE_CREATE',
        dto.categoryId,
        'NO_PERMISSION',
        category.institutionId,
        scopeId,
      );
      throw new ForbiddenException('No tienes permiso para crear casos');
    }

    const responsible = await this.responsibilityService.resolve({
      responsibilityCode: category.responsibilityCode,
      institutionId: category.institutionId,
      scopeIds: [scopeId],
    });

    const item = await this.caseRepo.save(
      this.caseRepo.create({
        caseNumber: await this.nextNumber(),
        institutionId: category.institutionId,
        scopeId,
        requesterId,
        assignedUserId: responsible?.userId ?? null,
        responsibilityId: responsible?.responsibilityId ?? null,
        categoryId: category.id,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'NORMAL',
        status: responsible ? 'ASIGNADO' : 'PENDIENTE_ASIGNACION',
      }),
    );
    await this.history(
      item,
      requesterId,
      'CREATE',
      undefined,
      item.status,
      responsible ? undefined : 'NO_ACTIVE_RESPONSIBLE',
    );

    if (responsible) {
      await this.history(
        item,
        requesterId,
        'ASSIGN',
        'CREADO',
        'ASIGNADO',
        `Responsable ${responsible.userId}`,
      );
      await this.notifications.createForUser(
        responsible.userId,
        `Caso ${item.caseNumber} asignado`,
        item.title,
        'case',
        `/casos/${item.id}`,
      );
    }
    return this.findOne(item.id, requesterId);
  }

  async findOne(id: string, actorId: string): Promise<Case> {
    const item = await this.caseRepo.findOne({
      where: { id },
      relations: {
        category: true,
        requester: true,
        assignedUser: true,
        messages: true,
        history: true,
      },
    });
    if (!item) throw new NotFoundException('Caso no encontrado');
    const actor = await this.userRepo.findOne({
      where: { id: actorId },
      relations: { role: { permissions: true } },
    });
    if (!actor || !this.authorizationContext.can(actor, 'cases.read')) {
      await this.denial(actorId, 'CASE_READ', id, 'NO_PERMISSION');
      throw new ForbiddenException('No tienes permiso para consultar casos');
    }
    if (!actor || !(await this.puedeOperar(item, actor))) {
      await this.denial(
        actorId,
        'CASE_READ',
        item.caseNumber,
        'SCOPE_MISMATCH',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException('No tienes alcance sobre este caso');
    }
    if (actorId === item.requesterId) {
      item.messages = (item.messages ?? []).filter(
        (message) => message.type !== 'INTERNAL',
      );
    }
    return item;
  }

  async transition(
    id: string,
    dto: TransitionCaseDto,
    actorId: string,
  ): Promise<Case> {
    const item = await this.caseRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!item) throw new NotFoundException('Caso no encontrado');
    const actor = await this.userRepo.findOne({
      where: { id: actorId },
      relations: { role: { permissions: true } },
    });
    const permission = this.workflow.permissionFor(dto.status);
    if (!actor || !this.authorizationContext.can(actor, permission)) {
      await this.denial(
        actorId,
        'CASE_STATUS_CHANGE',
        item.caseNumber,
        'NO_PERMISSION',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'No tienes permiso para cambiar el estado del caso',
      );
    }
    if (!actor || !(await this.puedeOperar(item, actor))) {
      throw new ForbiddenException('No tienes alcance sobre este caso');
    }
    try {
      this.workflow.validateTransition(
        item.status,
        dto.status,
        item.category?.allowedTransitions,
      );
    } catch (error) {
      await this.denial(
        actorId,
        'CASE_STATUS_CHANGE',
        item.caseNumber,
        'INVALID_TRANSITION',
        item.institutionId,
        item.scopeId,
      );
      throw error;
    }
    const previous = item.status;
    const changes: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'RESUELTO') changes.resolvedAt = new Date();
    if (dto.status === 'CERRADO') {
      changes.closedAt = new Date();
      changes.closedById = actorId;
    }
    if (dto.status === 'REABIERTO') {
      changes.reopenedAt = new Date();
      changes.reopenedById = actorId;
    }
    const saved = await this.saveVersioned(item, changes, actorId);
    await this.history(
      saved,
      actorId,
      'STATUS_UPDATE',
      previous,
      dto.status,
      dto.reason,
    );
    await this.notifications.createForUser(
      item.requesterId,
      `Caso ${item.caseNumber} actualizado`,
      `Estado: ${dto.status}`,
      'case',
      `/casos/${item.id}`,
    );
    return this.findOne(saved.id, actorId);
  }

  async addMessage(
    id: string,
    dto: CreateCaseMessageDto,
    actorId: string,
  ): Promise<CaseMessage> {
    const item = await this.findOne(id, actorId);
    const actor = await this.userRepo.findOne({
      where: { id: actorId },
      relations: { role: { permissions: true } },
    });
    const messagePermission =
      dto.type === 'INTERNAL'
        ? 'cases.add_internal_message'
        : 'cases.add_message';
    if (!actor || !this.authorizationContext.can(actor, messagePermission)) {
      await this.denial(
        actorId,
        'CASE_MESSAGE_CREATE',
        item.caseNumber,
        'NO_PERMISSION',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'No tienes permiso para agregar este mensaje',
      );
    }
    if (dto.type === 'INTERNAL' && actorId === item.requesterId) {
      await this.denial(
        actorId,
        'CASE_MESSAGE_CREATE',
        item.caseNumber,
        'INTERNAL_MESSAGE_FORBIDDEN',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'El solicitante no puede crear mensajes internos',
      );
    }
    const message = await this.messageRepo.save(
      this.messageRepo.create({
        caseId: item.id,
        authorId: actorId,
        content: dto.content,
        type: dto.type ?? 'PUBLIC',
      }),
    );
    await this.history(
      item,
      actorId,
      'MESSAGE_CREATE',
      item.status,
      item.status,
    );
    return message;
  }

  async reassign(
    id: string,
    assignedUserId: string,
    reason: string | undefined,
    actorId: string,
  ): Promise<Case> {
    const item = await this.caseRepo.findOne({
      where: { id },
      relations: { responsibility: true },
    });
    if (!item) throw new NotFoundException('Caso no encontrado');
    const actor = await this.userRepo.findOne({
      where: { id: actorId },
      relations: { role: { permissions: true } },
    });
    if (!actor || !this.authorizationContext.can(actor, 'cases.reassign')) {
      await this.denial(
        actorId,
        'CASE_REASSIGN',
        id,
        'NO_PERMISSION',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException('No tienes permiso para reasignar casos');
    }
    if (!actor || !(await this.puedeOperar(item, actor))) {
      await this.denial(
        actorId,
        'CASE_REASSIGN',
        item.caseNumber,
        'SCOPE_MISMATCH',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException('No tienes alcance sobre este caso');
    }
    const target = await this.userRepo.findOne({
      where: { id: assignedUserId },
      relations: { role: true },
    });
    if (
      !target ||
      !target.isActive ||
      target.institucion !== actor.institucion
    ) {
      await this.denial(
        actorId,
        'CASE_REASSIGN',
        item.caseNumber,
        'INSTITUTION_MISMATCH',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'El nuevo responsable no pertenece al contexto',
      );
    }
    if (!item.responsibility?.code || !item.institutionId || !item.scopeId) {
      await this.denial(
        actorId,
        'CASE_REASSIGN',
        item.caseNumber,
        'RESPONSIBILITY_MISMATCH',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'El caso no tiene responsabilidad y alcance suficientes para reasignarse',
      );
    }
    const compatible = await this.responsibilityService.hasUserScope({
      userId: target.id,
      responsibilityCode: item.responsibility.code,
      institutionId: item.institutionId,
      scopeId: item.scopeId,
    });
    if (!compatible) {
      await this.denial(
        actorId,
        'CASE_REASSIGN',
        item.caseNumber,
        'RESPONSIBILITY_MISMATCH',
        item.institutionId,
        item.scopeId,
      );
      throw new ForbiddenException(
        'El nuevo responsable no tiene una asignación vigente para este alcance',
      );
    }
    const previous = item.assignedUserId;
    const saved = await this.saveVersioned(
      item,
      { assignedUserId: target.id },
      actorId,
    );
    await this.history(
      saved,
      actorId,
      'REASSIGN',
      previous ?? undefined,
      target.id,
      reason,
    );
    await this.notifications.createForUser(
      target.id,
      `Caso ${saved.caseNumber} asignado`,
      saved.title,
      'case',
      `/casos/${saved.id}`,
    );
    return this.findOne(saved.id, actorId);
  }
}
