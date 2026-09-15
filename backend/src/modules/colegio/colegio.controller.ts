import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ColegioService } from './colegio.service';
import { CreateGrupoDto, UpdateGrupoDto } from './dto/grupo.dto';
import {
  CreateRemisionColegioDto,
  UpdateRemisionColegioDto,
} from './dto/remision-colegio.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InstitutionAccessGuard } from '../../common/guards/institution-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Institucion } from '../../common/decorators/institucion.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { COLEGIO_ROLES } from '../../common/constants/roles';

const GESTION_GRUPOS = [
  COLEGIO_ROLES.ADMINISTRADOR,
  COLEGIO_ROLES.RECTOR,
  COLEGIO_ROLES.COORDINADOR,
  COLEGIO_ROLES.COORDINADOR_CONVIVENCIA,
];

const GESTION_REMISIONES = [
  COLEGIO_ROLES.ADMINISTRADOR,
  COLEGIO_ROLES.RECTOR,
  COLEGIO_ROLES.COORDINADOR,
  COLEGIO_ROLES.COORDINADOR_CONVIVENCIA,
  COLEGIO_ROLES.ORIENTADOR,
];

const TODOS_COLEGIO = [
  COLEGIO_ROLES.ESTUDIANTE,
  COLEGIO_ROLES.DOCENTE,
  COLEGIO_ROLES.RECTOR,
  COLEGIO_ROLES.COORDINADOR,
  COLEGIO_ROLES.COORDINADOR_CONVIVENCIA,
  COLEGIO_ROLES.ORIENTADOR,
  COLEGIO_ROLES.ADMINISTRADOR,
];

@Controller('colegio')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard)
@Institucion('colegio')
export class ColegioController {
  constructor(private readonly colegioService: ColegioService) {}

  @Post('grupos')
  @Roles(...GESTION_GRUPOS)
  createGrupo(@Body() dto: CreateGrupoDto) {
    return this.colegioService.createGrupo(dto);
  }

  @Get('grupos')
  @Roles(...TODOS_COLEGIO)
  findAllGrupos(@Query() pagination: PaginationDto, @CurrentUser() user: User) {
    return this.colegioService.findAllGrupos(pagination, user);
  }

  @Get('mi-grupo')
  @Roles(...TODOS_COLEGIO)
  miGrupo(@CurrentUser() user: User) {
    return this.colegioService.miGrupo(user);
  }

  @Get('grupos/:id/estudiantes')
  @Roles(...TODOS_COLEGIO)
  estudiantesDeGrupo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.colegioService.estudiantesDeGrupo(user, id);
  }

  @Get('grupos/:id')
  @Roles(...TODOS_COLEGIO)
  findOneGrupo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.colegioService.findOneGrupo(id, user);
  }

  @Patch('grupos/:id')
  @Roles(...GESTION_GRUPOS)
  updateGrupo(
    @Param('id') id: string,
    @Body() dto: UpdateGrupoDto,
    @CurrentUser() user: User,
  ) {
    return this.colegioService.updateGrupo(id, dto, user);
  }

  @Delete('grupos/:id')
  @Roles(...GESTION_GRUPOS)
  removeGrupo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.colegioService.removeGrupo(id, user);
  }

  @Post('remisiones')
  @Roles(...GESTION_REMISIONES)
  crearRemision(
    @Body() dto: CreateRemisionColegioDto,
    @CurrentUser() user: User,
  ) {
    return this.colegioService.crearRemision(dto, user);
  }

  @Get('remisiones')
  @Roles(...GESTION_REMISIONES)
  listarRemisiones(
    @CurrentUser() user: User,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ) {
    return this.colegioService.listarRemisiones(user, { tipo, estado });
  }

  @Get('remisiones/mis-postulados')
  @Roles(...GESTION_REMISIONES)
  misPostulados(@CurrentUser() user: User) {
    return this.colegioService.misPostulados(user);
  }

  @Get('remisiones/mias')
  @Roles(COLEGIO_ROLES.ESTUDIANTE)
  misRemisiones(@CurrentUser() user: User) {
    return this.colegioService.misRemisiones(user);
  }

  @Patch('remisiones/:id')
  @Roles(...GESTION_REMISIONES)
  actualizarRemision(
    @Param('id') id: string,
    @Body() dto: UpdateRemisionColegioDto,
    @CurrentUser() user: User,
  ) {
    return this.colegioService.actualizarRemision(id, dto, user);
  }
}
