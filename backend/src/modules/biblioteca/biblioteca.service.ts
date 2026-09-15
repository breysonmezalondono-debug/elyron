import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursoBiblioteca } from './entities/recurso-biblioteca.entity';

@Injectable()
export class BibliotecaService {
  constructor(
    @InjectRepository(RecursoBiblioteca)
    private readonly repo: Repository<RecursoBiblioteca>,
  ) {}

  catalogo(tipo?: string): Promise<RecursoBiblioteca[]> {
    const where: Record<string, unknown> = {};
    if (tipo) where.tipo = tipo;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  misPrestamos(usuarioId: string): Promise<RecursoBiblioteca[]> {
    return this.repo.find({
      where: { prestadoAId: usuarioId },
      order: { fechaDevolucion: 'ASC' },
    });
  }

  async reservar(id: string, usuarioId: string): Promise<RecursoBiblioteca> {
    const recurso = await this.repo.findOne({ where: { id } });
    if (!recurso) throw new NotFoundException('Recurso no encontrado');
    if (recurso.estado !== 'disponible') {
      throw new Error('El recurso no está disponible');
    }
    const devolucion = new Date();
    devolucion.setDate(devolucion.getDate() + 14);
    recurso.estado = 'prestado';
    recurso.prestadoAId = usuarioId;
    recurso.fechaDevolucion = devolucion;
    return this.repo.save(recurso);
  }

  async devolver(id: string, usuarioId: string): Promise<RecursoBiblioteca> {
    const recurso = await this.repo.findOne({ where: { id } });
    if (!recurso) throw new NotFoundException('Recurso no encontrado');
    if (recurso.prestadoAId !== usuarioId) {
      throw new NotFoundException('Préstamo no encontrado');
    }
    recurso.estado = 'disponible';
    recurso.prestadoAId = null;
    recurso.fechaDevolucion = null;
    return this.repo.save(recurso);
  }
}
