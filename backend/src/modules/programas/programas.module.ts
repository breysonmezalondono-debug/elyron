import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './entities/programa.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
import { InstitucionCatalogo } from '../contexto/entities/institucion-catalogo.entity';
import { ProgramasService } from './programas.service';
import { ProgramasController } from './programas.controller';
import { CatalogoAcademicoController } from './catalogo-academico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Programa, Ficha, Grupo, InstitucionCatalogo])],
  controllers: [ProgramasController, CatalogoAcademicoController],
  providers: [ProgramasService],
  exports: [ProgramasService],
})
export class ProgramasModule {}
