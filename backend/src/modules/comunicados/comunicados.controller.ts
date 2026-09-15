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
} from '@nestjs/common';
import { ComunicadosService } from './comunicados.service';
import { CreateComunicadoDto, UpdateComunicadoDto } from './dto/comunicado.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('comunicados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComunicadosController {
  constructor(private readonly service: ComunicadosService) {}

  @Get()
  @Roles(
    SENA_ROLES.APRENDIZ,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.BIENESTAR,
    SENA_ROLES.ADMINISTRADOR,
  )
  listar(@Query('fichaId') fichaId?: string) {
    return this.service.listar(fichaId);
  }

  @Post()
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.INSTRUCTOR, SENA_ROLES.COORDINADOR)
  crear(@Body() dto: CreateComunicadoDto, @CurrentUser() user: User) {
    return this.service.crear(dto, user.id, user.fichaId ?? undefined);
  }

  @Put(':id')
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.INSTRUCTOR, SENA_ROLES.COORDINADOR)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateComunicadoDto,
    @CurrentUser() user: User,
  ) {
    return this.service.actualizar(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(SENA_ROLES.APRENDIZ, SENA_ROLES.INSTRUCTOR, SENA_ROLES.COORDINADOR)
  eliminar(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.eliminar(id, user.id);
  }
}
