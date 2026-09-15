import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobListing } from './entities/job-listing.entity';
import {
  CreateJobListingDto,
  UpdateJobListingDto,
} from './dto/job-listing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
@Injectable()
export class JobBoardService {
  constructor(
    @InjectRepository(JobListing)
    private readonly jobRepo: Repository<JobListing>,
  ) {}
  async create(
    dto: CreateJobListingDto,
    postedById: string,
  ): Promise<JobListing> {
    const job = this.jobRepo.create({ ...dto, postedById });
    return this.jobRepo.save(job);
  }
  async findAll(pagination: PaginationDto): Promise<{
    data: JobListing[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.jobRepo.findAndCount({
      where: { status: 'active' },
      relations: { postedBy: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findOne(id: string): Promise<JobListing> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: { postedBy: true },
    });
    if (!job) throw new NotFoundException('Oferta no encontrada');
    return job;
  }
  async update(id: string, dto: UpdateJobListingDto): Promise<JobListing> {
    await this.findOne(id);
    await this.jobRepo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.jobRepo.delete(id);
  }
}
