import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}
  async create(dto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create(dto);
    return this.companyRepo.save(company);
  }
  async findAll(pagination: PaginationDto): Promise<{
    data: Company[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.companyRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: { users: true, trainers: true },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }
  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id);
    await this.companyRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.companyRepo.delete(id);
  }
}
