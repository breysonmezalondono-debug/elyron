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
import { FichasService } from './fichas.service';
import { CreateFichaDto, UpdateFichaDto } from './dto/ficha.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InstitutionAccessGuard } from '../../common/guards/institution-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Institucion } from '../../common/decorators/institucion.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('fichas')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard)
@Institucion('sena')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Post()
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR)
  create(
    @Body()
    dto: CreateFichaDto,
  ) {
    return this.fichasService.create(dto);
  }

  @Get()
  findAll(
    @Query()
    pagination: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return this.fichasService.findAll(pagination, user);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
    @CurrentUser() user: User,
  ) {
    return this.fichasService.findOne(id, user);
  }

  @Put(':id')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR)
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateFichaDto,
    @CurrentUser() user: User,
  ) {
    return this.fichasService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR)
  remove(
    @Param('id')
    id: string,
    @CurrentUser() user: User,
  ) {
    return this.fichasService.remove(id, user);
  }
}
