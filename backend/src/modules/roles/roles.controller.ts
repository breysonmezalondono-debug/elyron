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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SENA_ROLES.ADMINISTRADOR)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Post()
  create(
    @Body()
    dto: CreateRoleDto,
  ) {
    return this.rolesService.create(dto);
  }
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.rolesService.findOne(id);
  }
  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.rolesService.remove(id);
  }
}
