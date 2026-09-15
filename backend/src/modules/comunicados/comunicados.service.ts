import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comunicado } from './entities/comunicado.entity';
import { CreateComunicadoDto, UpdateComunicadoDto } from './dto/comunicado.dto';

@Injectable()
export class ComunicadosService {
  constructor(
    @InjectRepository(Comunicado)
    private readonly repo: Repository<Comunicado>,
  ) {}

  async listar(fichaId?: string): Promise<Comunicado[]> {
    const where: Record<string, unknown> = {};
    if (fichaId) where.fichaId = fichaId;
    return this.repo.find({
      where,
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
  }

  crear(
    dto: CreateComunicadoDto,
    autorId: string,
    fichaId?: string,
  ): Promise<Comunicado> {
    const comunicado = this.repo.create({
      titulo: dto.titulo,
      contenido: dto.contenido,
      prioridad: dto.prioridad ?? 'media',
      destinatario: dto.destinatario ?? 'ficha',
      autorId,
      fichaId: fichaId ?? null,
    });
    return this.repo.save(comunicado);
  }

  async actualizar(
    id: string,
    dto: UpdateComunicadoDto,
    autorId: string,
  ): Promise<Comunicado> {
    const comunicado = await this.repo.findOne({ where: { id } });
    if (!comunicado) throw new NotFoundException('Comunicado no encontrado');
    if (comunicado.autorId !== autorId) {
      throw new NotFoundException('Comunicado no encontrado');
    }
    await this.repo.update(id, dto);
    return this.repo.findOneOrFail({
      where: { id },
      relations: { autor: true },
    });
  }

  async eliminar(id: string, autorId: string): Promise<void> {
    const comunicado = await this.repo.findOne({ where: { id } });
    if (!comunicado || comunicado.autorId !== autorId) {
      throw new NotFoundException('Comunicado no encontrado');
    }
    await this.repo.delete(id);
  }
}
