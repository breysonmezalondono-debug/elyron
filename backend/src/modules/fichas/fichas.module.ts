import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from './ficha.entity';
import { FichasService } from './fichas.service';
import { FichasController } from './fichas.controller';
import { FichasAutoCloseService } from './fichas-auto-close.service';
import { FichaInstructor } from '../sena/entities/ficha-instructor.entity';
import { SenaModule } from '../sena/sena.module';
@Module({
  imports: [TypeOrmModule.forFeature([Ficha, FichaInstructor]), SenaModule],
  controllers: [FichasController],
  providers: [FichasService, FichasAutoCloseService],
  exports: [FichasService],
})
export class FichasModule {}
