import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatController } from './chat.controller';
import { SenaModule } from '../sena/sena.module';
import { ColegioModule } from '../colegio/colegio.module';
@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage]), SenaModule, ColegioModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
