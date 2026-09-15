import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from '../calendar/entities/calendar-event.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepo: Repository<CalendarEvent>,
  ) {}

  async findAll(pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const [data, total] = await this.eventRepo.findAndCount({
      relations: { createdBy: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'ASC' },
    });
    return { data, total, page, limit };
  }
}
