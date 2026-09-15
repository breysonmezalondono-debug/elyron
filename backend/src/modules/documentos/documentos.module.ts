import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoPersonal } from './entities/documento-personal.entity';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { User } from '../users/user.entity';
import { CasosModule } from '../casos/casos.module';
import { ContextoModule } from '../contexto/contexto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentoPersonal, User]),
    CasosModule,
    ContextoModule,
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
