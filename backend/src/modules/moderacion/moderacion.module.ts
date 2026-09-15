import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteModeracion } from './entities/reporte.entity';
import { ModeracionService } from './moderacion.service';
import { ModeracionController } from './moderacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReporteModeracion])],
  controllers: [ModeracionController],
  providers: [ModeracionService],
  exports: [ModeracionService],
})
export class ModeracionModule {}
