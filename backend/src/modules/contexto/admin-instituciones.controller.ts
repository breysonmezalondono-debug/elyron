import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminInstitucionesService } from './admin-instituciones.service';
import {
  CreateInstitucionCatalogoDto,
  UpdateInstitucionCatalogoDto,
} from './dto/institucion-catalogo.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('admin/instituciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminInstitucionesController {
  constructor(
    private readonly adminInstituciones: AdminInstitucionesService,
  ) {}

  @Get()
  @Roles(SENA_ROLES.ADMINISTRADOR)
  listar() {
    return this.adminInstituciones.listar();
  }

  @Post()
  @Roles(SENA_ROLES.ADMINISTRADOR)
  crear(@Body() dto: CreateInstitucionCatalogoDto) {
    return this.adminInstituciones.crear(dto);
  }

  @Put(':id')
  @Roles(SENA_ROLES.ADMINISTRADOR)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateInstitucionCatalogoDto,
  ) {
    return this.adminInstituciones.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(SENA_ROLES.ADMINISTRADOR)
  eliminar(@Param('id') id: string) {
    return this.adminInstituciones.eliminar(id);
  }
}