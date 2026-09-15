import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepo: Repository<CalendarEvent>,
  ) {}

  async create(
    dto: CreateCalendarEventDto,
    createdById: string,
  ): Promise<CalendarEvent> {
    const event = this.eventRepo.create({ ...dto, createdById });
    return this.eventRepo.save(event);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<CalendarEvent[]> {
    const query = this.eventRepo.createQueryBuilder('event');
    query.leftJoinAndSelect('event.createdBy', 'user');
    if (startDate && endDate) {
      query.where(
        'event.startDate >= :startDate AND event.endDate <= :endDate',
        { startDate, endDate },
      );
    }
    query.orderBy('event.startDate', 'ASC');
    if (limit) {
      query.take(limit);
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(
    id: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    await this.findOne(id);
    await this.eventRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.eventRepo.delete(id);
  }
}
