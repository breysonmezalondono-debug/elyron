import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModeracionService } from './moderacion.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('moderacion')
@UseGuards(JwtAuthGuard)
export class ModeracionController {
  constructor(private readonly moderacionService: ModeracionService) {}

  @Get('reportes')
  findAll(@Query() pagination: PaginationDto) {
    return this.moderacionService.findAll(pagination);
  }

  @Put('reportes/:id')
  updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.moderacionService.updateStatus(id, dto.status);
  }
}
