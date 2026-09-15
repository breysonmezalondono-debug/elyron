import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Ficha } from '../fichas/ficha.entity';
import { FichaInstructor } from './entities/ficha-instructor.entity';
import { Remision } from './entities/remision.entity';
import { PerfilSena } from '../perfiles/entities/perfil-sena.entity';
import { SenaService } from './sena.service';
import { SenaAccessService } from './sena-access.service';
import { SenaController } from './sena.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FichaInstructor, Remision, User, Ficha, PerfilSena]),
  ],
  controllers: [SenaController],
  providers: [SenaService, SenaAccessService],
  exports: [SenaAccessService, SenaService],
})
export class SenaModule {}
