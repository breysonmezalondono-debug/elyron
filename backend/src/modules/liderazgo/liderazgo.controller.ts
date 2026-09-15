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
import { LiderazgoService } from './liderazgo.service';
import { CreateAnuncioDto } from './dto/anuncio.dto';
import {
  CreateInquietudDto,
  UpdateInquietudEstadoDto,
} from './dto/inquietud.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('liderazgo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SENA_ROLES.APRENDIZ)
export class LiderazgoController {
  constructor(private readonly service: LiderazgoService) {}

  @Get('anuncios')
  listarAnuncios(@CurrentUser() user: User) {
    return this.service.listarAnuncios(user);
  }

  @Post('anuncios')
  crearAnuncio(@Body() dto: CreateAnuncioDto, @CurrentUser() user: User) {
    return this.service.crearAnuncio(dto, user);
  }

  @Delete('anuncios/:id')
  eliminarAnuncio(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.eliminarAnuncio(id, user);
  }

  @Get('inquietudes')
  listarInquietudes(@CurrentUser() user: User) {
    return this.service.listarInquietudes(user);
  }

  @Post('inquietudes')
  crearInquietud(@Body() dto: CreateInquietudDto, @CurrentUser() user: User) {
    return this.service.crearInquietud(dto, user);
  }

  @Put('inquietudes/:id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: UpdateInquietudEstadoDto,
    @CurrentUser() user: User,
  ) {
    return this.service.actualizarEstadoInquietud(id, dto, user);
  }
}
