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
import { ResultadosService } from './resultados.service';
import { CreateResultadoDto, UpdateResultadoDto } from './dto/resultado.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
@Controller('resultados')
@UseGuards(JwtAuthGuard)
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}
  @Post()
  create(
    @Body()
    dto: CreateResultadoDto,
  ) {
    return this.resultadosService.create(dto);
  }
  @Get('competencia/:competenciaId')
  findByCompetencia(
    @Param('competenciaId')
    competenciaId: string,
  ) {
    return this.resultadosService.findByCompetencia(competenciaId);
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.resultadosService.findOne(id);
  }
  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateResultadoDto,
  ) {
    return this.resultadosService.update(id, dto);
  }
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.resultadosService.remove(id);
  }
}
