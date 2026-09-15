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
import { JobBoardService } from './job-board.service';
import {
  CreateJobListingDto,
  UpdateJobListingDto,
} from './dto/job-listing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SENA_ROLES } from '../../common/constants/roles';
@Controller('job-board')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobBoardController {
  constructor(private readonly jobBoardService: JobBoardService) {}
  @Roles(
    SENA_ROLES.ADMINISTRADOR,
    SENA_ROLES.COORDINADOR,
    SENA_ROLES.INSTRUCTOR,
    SENA_ROLES.BIENESTAR,
  )
  @Post()
  create(
    @Body()
    dto: CreateJobListingDto,
    @Request()
    req,
  ) {
    return this.jobBoardService.create(dto, req.user.id);
  }
  @Get()
  findAll(
    @Query()
    pagination: PaginationDto,
  ) {
    return this.jobBoardService.findAll(pagination);
  }
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.jobBoardService.findOne(id);
  }
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
    dto: UpdateJobListingDto,
  ) {
    return this.jobBoardService.update(id, dto);
  }
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
    return this.jobBoardService.remove(id);
  }
}
