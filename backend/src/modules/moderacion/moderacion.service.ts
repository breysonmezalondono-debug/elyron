import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReporteModeracion } from './entities/reporte.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ModeracionService {
  constructor(
    @InjectRepository(ReporteModeracion)
    private readonly reporteRepo: Repository<ReporteModeracion>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.reporteRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async updateStatus(id: string, status: string): Promise<ReporteModeracion> {
    await this.reporteRepo.update(id, { status });
    return this.reporteRepo.findOne({ where: { id } });
  }
}
