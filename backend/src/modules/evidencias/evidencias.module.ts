import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evidencia } from './evidencia.entity';
import { Resultado } from '../resultados/resultado.entity';
import { EvidenciasService } from './evidencias.service';
import { EvidenciasController } from './evidencias.controller';
import { User } from '../users/user.entity';
import { ContextoModule } from '../contexto/contexto.module';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Evidencia, Resultado, User, InstitutionContext]),
    ContextoModule,
  ],
  controllers: [EvidenciasController],
  providers: [EvidenciasService],
  exports: [EvidenciasService],
})
export class EvidenciasModule {}
