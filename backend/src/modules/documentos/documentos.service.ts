import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoPersonal } from './entities/documento-personal.entity';
import { CreateDocumentoDto } from './dto/documento.dto';
import { CreateCasoDocumentoDto } from './dto/documento.dto';
import { User } from '../users/user.entity';
import { CaseService } from '../casos/casos.service';
import { AuthorizationContextService } from '../contexto/authorization-context.service';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentoPersonal)
    private readonly repo: Repository<DocumentoPersonal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly caseService: CaseService,
    private readonly authorizationContext: AuthorizationContextService,
  ) {}

  misDocumentos(aprendizId: string): Promise<DocumentoPersonal[]> {
    return this.repo.find({
      where: { aprendizId },
      order: { createdAt: 'DESC' },
    });
  }

  crear(
    dto: CreateDocumentoDto,
    aprendizId: string,
  ): Promise<DocumentoPersonal> {
    const documento = this.repo.create({
      titulo: dto.titulo,
      tipo: dto.tipo ?? 'academico',
      descripcion: dto.descripcion ?? null,
      url: dto.url ?? null,
      aprendizId,
    });
    return this.repo.save(documento);
  }

  async eliminar(id: string, aprendizId: string): Promise<void> {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento || documento.aprendizId !== aprendizId) {
      throw new NotFoundException('Documento no encontrado');
    }
    await this.repo.delete(id);
  }

  async adjuntarACaso(
    dto: CreateCasoDocumentoDto,
    userId: string,
  ): Promise<DocumentoPersonal> {
    const actor = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: { permissions: true } },
    });
    if (
      !actor ||
      !this.authorizationContext.can(actor, 'cases.attach_document')
    ) {
      throw new ForbiddenException(
        'No tienes permiso para adjuntar documentos al caso',
      );
    }
    const item = await this.caseService.findOne(dto.caseId, userId);
    const document = this.repo.create({
      titulo: dto.titulo,
      tipo: dto.tipo ?? 'caso',
      descripcion: dto.descripcion ?? null,
      url: dto.url ?? null,
      aprendizId: userId,
      caseId: item.id,
    });
    return this.repo.save(document);
  }
}
