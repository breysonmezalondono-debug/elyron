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
import { CallsService } from './calls.service';
import { CreateCallDto, UpdateCallDto } from './dto/call.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  @Post()
  create(
    @Body()
    dto: CreateCallDto,
    @Request()
    req,
  ) {
    return this.callsService.create(dto, req.user.id);
  }
  @Get()
  findAll(
    @Query()
    pagination: PaginationDto,
  ) {
    return this.callsService.findAll(pagination);
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.callsService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateCallDto,
  ) {
    return this.callsService.update(id, dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.callsService.remove(id);
  }
}
