import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilesService } from './perfiles.service';
import { PerfilesController } from './perfiles.controller';
import { PerfilColegio } from './entities/perfil-colegio.entity';
import { PerfilSena } from './entities/perfil-sena.entity';
import { PerfilUniversidad } from './entities/perfil-universidad.entity';
import { AuditLog } from '../auditoria/entities/audit-log.entity';
import { Programa } from '../programas/entities/programa.entity';
import { Ficha } from '../fichas/ficha.entity';
import { User } from '../users/user.entity';
import { TrayectoriaEstimatorService } from './trayectoria-estimator.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerfilColegio,
      PerfilSena,
      PerfilUniversidad,
      AuditLog,
      Programa,
      Ficha,
      User,
    ]),
  ],
  controllers: [PerfilesController],
  providers: [PerfilesService, TrayectoriaEstimatorService],
})
export class PerfilesModule {}
