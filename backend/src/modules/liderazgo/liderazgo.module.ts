import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaAnuncio } from './entities/ficha-anuncio.entity';
import { Inquietud } from './entities/ficha-inquietud.entity';
import { LiderazgoService } from './liderazgo.service';
import { LiderazgoController } from './liderazgo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FichaAnuncio, Inquietud])],
  controllers: [LiderazgoController],
  providers: [LiderazgoService],
  exports: [LiderazgoService],
})
export class LiderazgoModule {}
