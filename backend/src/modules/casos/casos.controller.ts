import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Permisos } from '../../common/decorators/permisos.decorator';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { CaseService } from './casos.service';
import {
  CreateCaseDto,
  CreateCaseMessageDto,
  ReassignCaseDto,
  TransitionCaseDto,
} from './dto/case.dto';

@Controller('casos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class CasesController {
  constructor(private readonly caseService: CaseService) {}

  @Post()
  @Permisos('cases.create')
  create(@Body() dto: CreateCaseDto, @Request() req) {
    return this.caseService.create(dto, req.user.id);
  }

  @Get(':id')
  @Permisos('cases.read')
  findOne(@Param('id') id: string, @Request() req) {
    return this.caseService.findOne(id, req.user.id);
  }

  @Put(':id/status')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionCaseDto,
    @Request() req,
  ) {
    return this.caseService.transition(id, dto, req.user.id);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() dto: CreateCaseMessageDto,
    @Request() req,
  ) {
    return this.caseService.addMessage(id, dto, req.user.id);
  }

  @Post(':id/reassign')
  @Permisos('cases.reassign')
  reassign(
    @Param('id') id: string,
    @Body() dto: ReassignCaseDto,
    @Request() req,
  ) {
    return this.caseService.reassign(
      id,
      dto.assignedUserId,
      dto.reason,
      req.user.id,
    );
  }

  @Post(':id/resolve')
  @Permisos('cases.resolve')
  resolve(
    @Param('id') id: string,
    @Body() dto: { reason?: string },
    @Request() req,
  ) {
    return this.caseService.transition(
      id,
      { status: 'RESUELTO', reason: dto.reason },
      req.user.id,
    );
  }

  @Post(':id/close')
  @Permisos('cases.close')
  close(
    @Param('id') id: string,
    @Body() dto: { reason?: string },
    @Request() req,
  ) {
    return this.caseService.transition(
      id,
      { status: 'CERRADO', reason: dto.reason },
      req.user.id,
    );
  }

  @Post(':id/reopen')
  @Permisos('cases.reopen')
  reopen(
    @Param('id') id: string,
    @Body() dto: { reason?: string },
    @Request() req,
  ) {
    return this.caseService.transition(
      id,
      { status: 'REABIERTO', reason: dto.reason },
      req.user.id,
    );
  }
}
