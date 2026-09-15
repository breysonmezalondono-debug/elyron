import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InstitutionAccessGuard } from '../../common/guards/institution-access.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Institucion } from '../../common/decorators/institucion.decorator';
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard)
@Institucion(['sena', 'colegio'])
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async send(@Body() dto: SendMessageDto, @Request() req) {
    return this.chatService.sendMessage(dto, req.user);
  }

  @Get('contacts')
  contactos(
    @Request()
    req,
  ) {
    return this.chatService.contactosPosibles(req.user);
  }

  @Get('conversation/:userId')
  async getConversation(
    @Param('userId')
    userId: string,
    @Query()
    pagination: PaginationDto,
    @Request()
    req,
  ) {
    const puede = await this.chatService.canChat(req.user, userId);
    if (!puede) {
      throw new ForbiddenException('No tienes permitido abrir ese chat');
    }
    return this.chatService.getConversation(
      req.user.id,
      userId,
      pagination.page || 1,
      pagination.limit || 100,
    );
  }

  @Get('unread')
  getUnreadCounts(
    @Request()
    req,
  ) {
    return this.chatService.getUnreadCounts(req.user.id);
  }

  @Put('read/:senderId')
  markAsRead(
    @Param('senderId')
    senderId: string,
    @Request()
    req,
  ) {
    return this.chatService.markAsRead(senderId, req.user.id);
  }
}
