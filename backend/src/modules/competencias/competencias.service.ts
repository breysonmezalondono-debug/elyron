import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competencia } from './competencia.entity';
import {
  CreateCompetenciaDto,
  UpdateCompetenciaDto,
} from './dto/competencia.dto';
@Injectable()
export class CompetenciasService {
  constructor(
    @InjectRepository(Competencia)
    private readonly competenciaRepo: Repository<Competencia>,
  ) {}
  async create(dto: CreateCompetenciaDto): Promise<Competencia> {
    const competencia = this.competenciaRepo.create(dto);
    return this.competenciaRepo.save(competencia);
  }
  async findByFicha(fichaId: string): Promise<Competencia[]> {
    return this.competenciaRepo.find({
      where: { fichaId },
      relations: { resultados: true },
    });
  }
  async findOne(id: string): Promise<Competencia> {
    const competencia = await this.competenciaRepo.findOne({
      where: { id },
      relations: { resultados: true, ficha: true },
    });
    if (!competencia) throw new NotFoundException('Competencia no encontrada');
    return competencia;
  }
  async update(id: string, dto: UpdateCompetenciaDto): Promise<Competencia> {
    await this.findOne(id);
    await this.competenciaRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.competenciaRepo.delete(id);
  }
}
