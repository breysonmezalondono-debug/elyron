import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resultado } from './resultado.entity';
import { ResultadosService } from './resultados.service';
import { ResultadosController } from './resultados.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Resultado])],
  controllers: [ResultadosController],
  providers: [ResultadosService],
  exports: [ResultadosService],
})
export class ResultadosModule {}
