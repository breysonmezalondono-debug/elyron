import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { CreateCallDto, UpdateCallDto } from './dto/call.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepo: Repository<Call>,
  ) {}
  async create(dto: CreateCallDto, createdById: string): Promise<Call> {
    const call = this.callRepo.create({ ...dto, createdById });
    return this.callRepo.save(call);
  }
  async findAll(pagination: PaginationDto): Promise<{
    data: Call[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.callRepo.findAndCount({
      relations: { createdBy: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findOne(id: string): Promise<Call> {
    const call = await this.callRepo.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!call) throw new NotFoundException('Convocatoria no encontrada');
    return call;
  }
  async update(id: string, dto: UpdateCallDto): Promise<Call> {
    await this.findOne(id);
    await this.callRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.callRepo.delete(id);
  }
}
