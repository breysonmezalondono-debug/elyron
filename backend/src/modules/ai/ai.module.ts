import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ElirPlansService } from './elir-plans.service';
import { ElirFilesService } from './elir-files.service';
import { ElirService } from './elir.service';
import { ElirController } from './elir.controller';
import { StorageModule } from '../../common/storage/storage.module';
import { ElirPlan } from './entities/elir-plan.entity';
import { ElirUsage } from './entities/elir-usage.entity';
import { ElirDocument } from './entities/elir-document.entity';
import { ElirConversation } from './entities/elir-conversation.entity';
import { ElirMessage } from './entities/elir-message.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElirPlan,
      ElirUsage,
      ElirDocument,
      ElirConversation,
      ElirMessage,
    ]),
    StorageModule,
  ],
  controllers: [AiController, ElirController],
  providers: [AiService, ElirPlansService, ElirFilesService, ElirService],
  exports: [AiService, ElirPlansService, ElirService],
})
export class AiModule {}
