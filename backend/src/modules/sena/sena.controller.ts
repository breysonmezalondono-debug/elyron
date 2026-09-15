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
import { SenaService } from './sena.service';
import { SenaAccessService } from './sena-access.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Institucion } from '../../common/decorators/institucion.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InstitutionAccessGuard } from '../../common/guards/institution-access.guard';
import { CreateRemisionDto, UpdateRemisionDto } from './dto/remision.dto';
import { SENA_ROLES } from '../../common/constants/roles';
import { ForbiddenException } from '@nestjs/common';
import { Ficha } from '../fichas/ficha.entity';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('sena')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard)
@Institucion('sena')
export class SenaController {
  constructor(
    private readonly senaService: SenaService,
    private readonly senaAccess: SenaAccessService,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Post('bienestar/remisiones')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR, SENA_ROLES.BIENESTAR)
  crearRemision(@Body() dto: CreateRemisionDto, @CurrentUser() user: User) {
    return this.senaService.crearRemision(dto, user);
  }

  @Get('bienestar/remisiones')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR, SENA_ROLES.BIENESTAR)
  listarRemisiones(
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @CurrentUser() user?: User,
  ) {
    return this.senaService.listarRemisiones(user, { tipo, estado });
  }

  @Put('bienestar/remisiones/:id')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR, SENA_ROLES.BIENESTAR)
  actualizarRemision(
    @Param('id') id: string,
    @Body() dto: UpdateRemisionDto,
    @CurrentUser() user: User,
  ) {
    return this.senaService.actualizarRemision(id, dto, user);
  }

  @Get('bienestar/aprendices')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR, SENA_ROLES.BIENESTAR)
  misPostulados(@CurrentUser() user: User) {
    return this.senaService.misPostulados(user);
  }

  @Get('ficha/:fichaId/aprendices')
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  aprendicesDeFicha(
    @Param('fichaId') fichaId: string,
    @CurrentUser() user: User,
  ) {
    return this.senaService.aprendicesDeFicha(user, fichaId);
  }

  @Get('ficha/:fichaId/instructores')
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  async instructoresDeFicha(
    @Param('fichaId') fichaId: string,
    @CurrentUser() user: User,
  ) {
    const puede = await this.senaAccess.canAccessFicha(user, fichaId);
    if (!puede) throw new ForbiddenException('No tienes acceso a esa ficha');
    return this.senaAccess.instructoresDeFicha(fichaId);
  }

  @Get('mi-ficha')
  async miFicha(@CurrentUser() user: User): Promise<Ficha | null> {
    if (!user.fichaId) return null;
    const ficha = await this.fichaRepo.findOne({
      where: { id: user.fichaId },
      relations: { company: true, instructores: { instructor: true } },
    });
    if (!ficha) return null;
    const aprendices = await this.userRepo.find({
      where: { institucion: 'sena', fichaId: ficha.id },
      relations: { role: true },
    });
    return {
      ...ficha,
      aprendices: aprendices.filter(
        (u) => this.senaAccess.getUserRoleName(u) === SENA_ROLES.APRENDIZ,
      ),
    } as Ficha;
  }

  @Get('mi-apoyo')
  @Roles(SENA_ROLES.APRENDIZ)
  miApoyo(@CurrentUser() user: User) {
    return this.senaService.miApoyo(user);
  }

  @Get('mi-representacion')
  @Roles(SENA_ROLES.APRENDIZ)
  miRepresentacion(@CurrentUser() user: User) {
    return {
      esVocero: user.esVocero ?? false,
      esVoceroSuplente: user.esVoceroSuplente ?? false,
      esPersonero: user.esPersonero ?? false,
      esPersoneroSuplente: user.esPersoneroSuplente ?? false,
    };
  }
}
