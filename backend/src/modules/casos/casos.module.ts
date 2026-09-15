import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { CaseCategory } from './entities/case-category.entity';
import { CaseMessage } from './entities/case-message.entity';
import { CaseHistory } from './entities/case-history.entity';
import { CaseService } from './casos.service';
import { CasesController } from './casos.controller';
import { User } from '../users/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContextoModule } from '../contexto/contexto.module';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';
import { InstitutionScope } from '../contexto/entities/institution-scope.entity';
import { AuditLog } from '../auditoria/entities/audit-log.entity';
import { CaseSeedService } from './case-seed.service';
import { CaseWorkflowService } from './case-workflow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      CaseCategory,
      CaseMessage,
      CaseHistory,
      User,
      InstitutionContext,
      InstitutionScope,
      AuditLog,
    ]),
    NotificationsModule,
    ContextoModule,
  ],
  controllers: [CasesController],
  providers: [CaseService, CaseSeedService, CaseWorkflowService],
  exports: [CaseService],
})
export class CasosModule {}
