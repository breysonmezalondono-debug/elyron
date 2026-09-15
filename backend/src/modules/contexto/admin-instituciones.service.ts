import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InstitucionCatalogo,
  InstitucionCatalogoTipo,
} from './entities/institucion-catalogo.entity';
import {
  CreateInstitucionCatalogoDto,
  UpdateInstitucionCatalogoDto,
} from './dto/institucion-catalogo.dto';

@Injectable()
export class AdminInstitucionesService {
  constructor(
    @InjectRepository(InstitucionCatalogo)
    private readonly repo: Repository<InstitucionCatalogo>,
  ) {}

  async listar(): Promise<InstitucionCatalogo[]> {
    return this.repo.find({ order: { tipo: 'ASC', nombre: 'ASC' } });
  }

  async crear(dto: CreateInstitucionCatalogoDto): Promise<InstitucionCatalogo> {
    const nombre = dto.nombre.trim();
    const tipo = dto.tipo as InstitucionCatalogoTipo;
    const duplicado = await this.repo.findOne({
      where: { nombre, tipo },
    });
    if (duplicado) {
      throw new ConflictException(
        'Ya existe una institución con ese nombre y tipo.',
      );
    }
    const fila = this.repo.create({
      nombre,
      tipo,
      detalles: dto.detalles ?? null,
      status: 'active',
    });
    return this.repo.save(fila);
  }

  async actualizar(
    id: string,
    dto: UpdateInstitucionCatalogoDto,
  ): Promise<InstitucionCatalogo> {
    const actual = await this.repo.findOne({ where: { id } });
    if (!actual) throw new NotFoundException('Institución no encontrada');
    if (dto.nombre) actual.nombre = dto.nombre.trim();
    if (dto.tipo) actual.tipo = dto.tipo as InstitucionCatalogoTipo;
    if (dto.detalles !== undefined) actual.detalles = dto.detalles;
    if (dto.status) actual.status = dto.status;
    return this.repo.save(actual);
  }

  async eliminar(id: string): Promise<void> {
    const actual = await this.repo.findOne({ where: { id } });
    if (!actual) throw new NotFoundException('Institución no encontrada');
    await this.repo.delete(id);
  }
}
