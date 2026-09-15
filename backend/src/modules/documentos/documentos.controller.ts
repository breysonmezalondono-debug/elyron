import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import {
  CreateCasoDocumentoDto,
  CreateDocumentoDto,
} from './dto/documento.dto';
import { Permisos } from '../../common/decorators/permisos.decorator';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';

@Controller('documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get('mis-documentos')
  @Roles(SENA_ROLES.APRENDIZ)
  misDocumentos(@CurrentUser() user: User) {
    return this.service.misDocumentos(user.id);
  }

  @Post()
  @Roles(SENA_ROLES.APRENDIZ)
  crear(@Body() dto: CreateDocumentoDto, @CurrentUser() user: User) {
    return this.service.crear(dto, user.id);
  }

  @Post('caso')
  @UseGuards(PermisosGuard)
  @Permisos('cases.attach_document')
  adjuntarACaso(
    @Body() dto: CreateCasoDocumentoDto,
    @CurrentUser() user: User,
  ) {
    return this.service.adjuntarACaso(dto, user.id);
  }

  @Delete(':id')
  @Roles(SENA_ROLES.APRENDIZ)
  eliminar(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.eliminar(id, user.id);
  }
}
