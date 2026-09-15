import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionContext } from './entities/institution-context.entity';
import { InstitutionScope } from './entities/institution-scope.entity';
import { Responsibility } from './entities/responsibility.entity';
import { ResponsibilityService } from './responsibility.service';
import { AuthorizationContextService } from './authorization-context.service';
import { ContextSeedService } from './context-seed.service';
import { InstitucionCatalogo } from './entities/institucion-catalogo.entity';
import { AdminInstitucionesService } from './admin-instituciones.service';
import { AdminInstitucionesController } from './admin-instituciones.controller';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
import { Programa } from '../programas/entities/programa.entity';
import { FichaInstructor } from '../sena/entities/ficha-instructor.entity';
import { ResponsibilityAssignment } from './entities/responsibility-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstitutionContext,
      InstitutionScope,
      Responsibility,
      InstitucionCatalogo,
      Ficha,
      Grupo,
      Programa,
      FichaInstructor,
      ResponsibilityAssignment,
    ]),
  ],
  controllers: [AdminInstitucionesController],
  providers: [
    ResponsibilityService,
    AuthorizationContextService,
    ContextSeedService,
    AdminInstitucionesService,
  ],
  exports: [ResponsibilityService, AuthorizationContextService],
})
export class ContextoModule {}
