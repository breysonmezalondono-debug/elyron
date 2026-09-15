import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompetenciasService } from './competencias.service';
import {
  CreateCompetenciaDto,
  UpdateCompetenciaDto,
} from './dto/competencia.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
@Controller('competencias')
@UseGuards(JwtAuthGuard)
export class CompetenciasController {
  constructor(private readonly competenciasService: CompetenciasService) {}
  @Post()
  create(
    @Body()
    dto: CreateCompetenciaDto,
  ) {
    return this.competenciasService.create(dto);
  }
  @Get('ficha/:fichaId')
  findByFicha(
    @Param('fichaId')
    fichaId: string,
  ) {
    return this.competenciasService.findByFicha(fichaId);
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.competenciasService.findOne(id);
  }
  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateCompetenciaDto,
  ) {
    return this.competenciasService.update(id, dto);
  }
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.competenciasService.remove(id);
  }
}
