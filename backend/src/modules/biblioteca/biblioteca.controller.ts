import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BibliotecaService } from './biblioteca.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('biblioteca')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BibliotecaController {
  constructor(private readonly service: BibliotecaService) {}

  @Get('catalogo')
  @Roles(
    SENA_ROLES.APRENDIZ,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.BIENESTAR,
    SENA_ROLES.ADMINISTRADOR,
  )
  catalogo(@Query('tipo') tipo?: string) {
    return this.service.catalogo(tipo);
  }

  @Get('mis-prestamos')
  @Roles(SENA_ROLES.APRENDIZ)
  misPrestamos(@CurrentUser() user: User) {
    return this.service.misPrestamos(user.id);
  }

  @Post(':id/reservar')
  @Roles(SENA_ROLES.APRENDIZ)
  async reservar(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      return await this.service.reservar(id, user.id);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Put(':id/devolver')
  @Roles(SENA_ROLES.APRENDIZ)
  devolver(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.devolver(id, user.id);
  }
}
