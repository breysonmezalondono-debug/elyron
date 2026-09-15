import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from './entities/actividad.entity';
import { Entrega } from './entities/entrega.entity';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad, Entrega])],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService],
})
export class DocenteModule {}
