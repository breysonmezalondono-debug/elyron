import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocenteService } from './docente.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('docente')
@UseGuards(JwtAuthGuard)
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get('actividades')
  findActividades(
    @Query('groupId') groupId?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.docenteService.findActividades(groupId, pagination);
  }

  @Post('actividades')
  createActividad(
    @Body()
    dto: {
      title: string;
      description?: string;
      type: string;
      competency?: string;
      groupId: string;
      dueDate?: string;
    },
  ) {
    return this.docenteService.createActividad(dto);
  }

  @Get('entregas')
  findEntregas(
    @Query('status') status?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.docenteService.findEntregas(status, pagination);
  }

  @Put('entregas/:id/calificar')
  calificarEntrega(
    @Param('id') id: string,
    @Body() dto: { grade?: number; feedback?: string },
  ) {
    return this.docenteService.calificarEntrega(id, dto);
  }
}
