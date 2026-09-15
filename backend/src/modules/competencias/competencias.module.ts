import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competencia } from './competencia.entity';
import { CompetenciasService } from './competencias.service';
import { CompetenciasController } from './competencias.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Competencia])],
  controllers: [CompetenciasController],
  providers: [CompetenciasService],
  exports: [CompetenciasService],
})
export class CompetenciasModule {}
