import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.eventosService.findAll(pagination);
  }
}
