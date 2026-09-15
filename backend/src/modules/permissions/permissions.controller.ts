import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SENA_ROLES.ADMINISTRADOR)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Post()
  create(
    @Body()
    dto: CreatePermissionDto,
  ) {
    return this.permissionsService.create(dto);
  }
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.permissionsService.findOne(id);
  }
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.permissionsService.remove(id);
  }
}
