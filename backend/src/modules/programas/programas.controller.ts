import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProgramasController {
  constructor(private readonly programasService: ProgramasService) {}

  @Get('programas')
  findAll(@Query() pagination: PaginationDto) {
    return this.programasService.findAll(pagination);
  }

  @Get('programas/:id')
  findOne(@Param('id') id: string) {
    return this.programasService.findOne(id);
  }

  @Get('instituciones')
  getInstituciones() {
    return this.programasService.getInstituciones();
  }
}
