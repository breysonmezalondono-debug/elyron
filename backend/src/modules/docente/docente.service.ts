import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { Entrega } from './entities/entrega.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,
    @InjectRepository(Entrega)
    private readonly entregaRepo: Repository<Entrega>,
  ) {}

  async findActividades(groupId?: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    const [data, total] = await this.actividadRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async createActividad(dto: {
    title: string;
    description?: string;
    type: string;
    competency?: string;
    groupId: string;
    dueDate?: string;
  }): Promise<Actividad> {
    const actividad = this.actividadRepo.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.actividadRepo.save(actividad);
  }

  async findEntregas(status?: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [data, total] = await this.entregaRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async calificarEntrega(
    id: string,
    dto: { grade?: number; feedback?: string },
  ): Promise<Entrega> {
    await this.entregaRepo.update(id, {
      grade: dto.grade,
      feedback: dto.feedback,
      status: 'Calificado',
    });
    return this.entregaRepo.findOne({ where: { id } });
  }
}
