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
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, CrearCuentaDto } from './dto/user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permisos } from '../../common/decorators/permisos.decorator';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { SENA_ROLES, UNIVERSIDAD_ROLES } from '../../common/constants/roles';
@Controller('users')
@UseGuards(JwtAuthGuard, PermisosGuard)
@Roles(SENA_ROLES.ADMINISTRADOR, SENA_ROLES.COORDINADOR)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  @Permisos('users.create')
  create(
    @Body()
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  /** Crea una cuenta de personal desde el panel (admin o coordinador). */
  @Post('cuenta')
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    UNIVERSIDAD_ROLES.DIRECTOR_PROGRAMA,
    UNIVERSIDAD_ROLES.DECANO,
  )
  @Permisos('users.create')
  crearCuenta(
    @Body()
    dto: CrearCuentaDto,
    @Request()
    req,
  ) {
    return this.usersService.crearCuenta(dto, {
      id: req.user.id,
      role: req.user.role,
      institucion: req.user.institucion,
    });
  }
  @Get()
  @Permisos('users.read')
  findAll(
    @Query()
    pagination: PaginationDto,
  ) {
    return this.usersService.findAll(pagination);
  }
  @Get(':id')
  @Permisos('users.read')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(id);
  }
  @Put(':id')
  @Permisos('users.update')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
  @Delete(':id')
  @Permisos('users.delete')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.usersService.remove(id);
  }
}
