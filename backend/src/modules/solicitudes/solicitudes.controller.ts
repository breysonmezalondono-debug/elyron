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
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto, UpdateSolicitudDto } from './dto/solicitud.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitudesController {
  constructor(private readonly service: SolicitudesService) {}

  @Get('mis-solicitudes')
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.COORDINADOR, SENA_ROLES.ADMINISTRADOR)
  misSolicitudes(@CurrentUser() user: User) {
    return this.service.misSolicitudes(user.id);
  }

  @Post()
  @Roles(SENA_ROLES.APRENDIZ)
  crear(@Body() dto: CreateSolicitudDto, @CurrentUser() user: User) {
    return this.service.crear(dto, user.id);
  }

  @Put(':id')
  @Roles(SENA_ROLES.APRENDIZ)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateSolicitudDto,
    @CurrentUser() user: User,
  ) {
    return this.service.actualizar(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(SENA_ROLES.APRENDIZ)
  eliminar(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.eliminar(id, user.id);
  }
}
