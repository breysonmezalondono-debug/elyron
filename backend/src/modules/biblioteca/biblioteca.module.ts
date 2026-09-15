import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoBiblioteca } from './entities/recurso-biblioteca.entity';
import { BibliotecaService } from './biblioteca.service';
import { BibliotecaController } from './biblioteca.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RecursoBiblioteca])],
  controllers: [BibliotecaController],
  providers: [BibliotecaService],
  exports: [BibliotecaService],
})
export class BibliotecaModule {}
