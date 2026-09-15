import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resultado } from './resultado.entity';
import { CreateResultadoDto, UpdateResultadoDto } from './dto/resultado.dto';
@Injectable()
export class ResultadosService {
  constructor(
    @InjectRepository(Resultado)
    private readonly resultadoRepo: Repository<Resultado>,
  ) {}
  async create(dto: CreateResultadoDto): Promise<Resultado> {
    const resultado = this.resultadoRepo.create(dto);
    return this.resultadoRepo.save(resultado);
  }
  async findByCompetencia(competenciaId: string): Promise<Resultado[]> {
    return this.resultadoRepo.find({
      where: { competenciaId },
      relations: { evidencias: true },
    });
  }
  async findOne(id: string): Promise<Resultado> {
    const resultado = await this.resultadoRepo.findOne({
      where: { id },
      relations: { evidencias: true, competencia: true },
    });
    if (!resultado) throw new NotFoundException('Resultado no encontrado');
    return resultado;
  }
  async update(id: string, dto: UpdateResultadoDto): Promise<Resultado> {
    await this.findOne(id);
    await this.resultadoRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.resultadoRepo.delete(id);
  }
}
