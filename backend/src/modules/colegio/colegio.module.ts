import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColegioController } from './colegio.controller';
import { ColegioService } from './colegio.service';
import { ColegioAccessService } from './colegio-access.service';
import { Grupo } from './entities/grupo.entity';
import { DocenteGrupo } from './entities/docente-grupo.entity';
import { RemisionColegio } from './entities/remision-colegio.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, DocenteGrupo, RemisionColegio, User]),
  ],
  controllers: [ColegioController],
  providers: [ColegioService, ColegioAccessService],
  exports: [ColegioAccessService, ColegioService],
})
export class ColegioModule {}
