import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';
import {
  CreateEvidenciaDto,
  UpdateEvidenciaDto,
  EvidenciasQueryDto,
  EntregarEvidenciaDto,
  CalificarEvidenciaDto,
} from './dto/evidencia.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Permisos } from '../../common/decorators/permisos.decorator';
import { PermisosGuard } from '../../common/guards/permisos.guard';

@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly evidenciasService: EvidenciasService) {}

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Post()
  @Permisos('evidencias.create')
  create(@Body() dto: CreateEvidenciaDto, @Request() req) {
    return this.evidenciasService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('evidencias.read')
  findAll(@Query() query: EvidenciasQueryDto, @Request() req) {
    return this.evidenciasService.findAll(
      query,
      {
        resultadoId: query.resultadoId,
        status: query.status,
      },
      req.user,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('evidencias.read')
  findOne(@Param('id') id: string, @Request() req) {
    return this.evidenciasService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Post(':id/entregar')
  @Permisos('evidencias.create')
  entregar(
    @Param('id') id: string,
    @Body() dto: EntregarEvidenciaDto,
    @Request() req,
  ) {
    return this.evidenciasService.entregar(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Put(':id/calificar')
  @Permisos('evidencias.update')
  calificar(
    @Param('id') id: string,
    @Body() dto: CalificarEvidenciaDto,
    @Request() req,
  ) {
    return this.evidenciasService.calificar(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Put(':id/devolver')
  @Permisos('evidencias.update')
  devolver(
    @Param('id') id: string,
    @Body() dto: { feedback: string },
    @Request() req,
  ) {
    return this.evidenciasService.devolver(id, dto.feedback, req.user.id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Put(':id')
  @Permisos('evidencias.update')
  update(@Param('id') id: string, @Body() dto: UpdateEvidenciaDto) {
    return this.evidenciasService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Delete(':id')
  @Permisos('evidencias.delete')
  remove(@Param('id') id: string) {
    return this.evidenciasService.remove(id);
  }
}
