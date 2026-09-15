import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto, UpdateSolicitudDto } from './dto/solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly repo: Repository<Solicitud>,
  ) {}

  misSolicitudes(aprendizId: string): Promise<Solicitud[]> {
    return this.repo.find({
      where: { aprendizId },
      order: { createdAt: 'DESC' },
    });
  }

  async crear(dto: CreateSolicitudDto, aprendizId: string): Promise<Solicitud> {
    const solicitud = this.repo.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      tipo: dto.tipo ?? 'general',
      estado: 'abierta',
      aprendizId,
    });
    return this.repo.save(solicitud);
  }

  async actualizar(
    id: string,
    dto: UpdateSolicitudDto,
    aprendizId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.repo.findOne({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.aprendizId !== aprendizId) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    await this.repo.update(id, dto);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async eliminar(id: string, aprendizId: string): Promise<void> {
    const solicitud = await this.repo.findOne({ where: { id } });
    if (!solicitud || solicitud.aprendizId !== aprendizId) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    await this.repo.delete(id);
  }
}
