import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import {
  CreatePerfilColegioDto,
  UpdatePerfilColegioDto,
  CreatePerfilSenaDto,
  UpdatePerfilSenaDto,
  CreatePerfilUniversidadDto,
  UpdatePerfilUniversidadDto,
} from './dto/perfiles.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('perfiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}
  @Get('mi-perfil')
  miPerfil(
    @Request()
    req,
  ) {
    return this.perfilesService.obtenerMiPerfil(req.user);
  }
  @Roles(SENA_ROLES.ESTUDIANTE, SENA_ROLES.ADMINISTRADOR)
  @Post('colegio')
  crearColegio(
    @Body()
    dto: CreatePerfilColegioDto,
    @Request()
    req,
  ) {
    return this.perfilesService.crearColegio(dto, req.user.id);
  }
  @Roles(SENA_ROLES.ESTUDIANTE, SENA_ROLES.ADMINISTRADOR)
  @Put('colegio')
  actualizarColegio(
    @Body()
    dto: UpdatePerfilColegioDto,
    @Request()
    req,
  ) {
    return this.perfilesService.actualizarColegio(dto, req.user.id);
  }
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.ADMINISTRADOR)
  @Post('sena')
  crearSena(
    @Body()
    dto: CreatePerfilSenaDto,
    @Request()
    req,
  ) {
    return this.perfilesService.crearSena(dto, req.user.id);
  }
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.ADMINISTRADOR)
  @Put('sena')
  actualizarSena(
    @Body()
    dto: UpdatePerfilSenaDto,
    @Request()
    req,
  ) {
    return this.perfilesService.actualizarSena(dto, req.user.id);
  }
  @Roles(SENA_ROLES.UNIVERSITARIO, SENA_ROLES.ADMINISTRADOR)
  @Post('universidad')
  crearUniversidad(
    @Body()
    dto: CreatePerfilUniversidadDto,
    @Request()
    req,
  ) {
    return this.perfilesService.crearUniversidad(dto, req.user.id);
  }
  @Roles(SENA_ROLES.UNIVERSITARIO, SENA_ROLES.ADMINISTRADOR)
  @Put('universidad')
  actualizarUniversidad(
    @Body()
    dto: UpdatePerfilUniversidadDto,
    @Request()
    req,
  ) {
    return this.perfilesService.actualizarUniversidad(dto, req.user.id);
  }
}
