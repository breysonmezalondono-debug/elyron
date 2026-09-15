import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponsibilityService } from './responsibility.service';
import { InstitutionContext } from './entities/institution-context.entity';
import { InstitutionScope } from './entities/institution-scope.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
import { Programa } from '../programas/entities/programa.entity';
import { FichaInstructor } from '../sena/entities/ficha-instructor.entity';
import { ResponsibilityAssignment } from './entities/responsibility-assignment.entity';

@Injectable()
export class ContextSeedService implements OnModuleInit {
  constructor(
    private readonly responsibilityService: ResponsibilityService,
    @InjectRepository(InstitutionContext)
    private readonly institutionRepo: Repository<InstitutionContext>,
    @InjectRepository(InstitutionScope)
    private readonly scopeRepo: Repository<InstitutionScope>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Programa)
    private readonly programaRepo: Repository<Programa>,
    @InjectRepository(FichaInstructor)
    private readonly fichaInstructorRepo: Repository<FichaInstructor>,
    @InjectRepository(ResponsibilityAssignment)
    private readonly assignmentRepo: Repository<ResponsibilityAssignment>,
  ) {}

  async onModuleInit(): Promise<void> {
    const contextos = [
      { code: 'sena', name: 'SENA', type: 'sena' },
      { code: 'colegio', name: 'Colegio', type: 'colegio' },
      { code: 'universidad', name: 'Universidad', type: 'universidad' },
    ];
    const instituciones = new Map<string, InstitutionContext>();

    for (const data of contextos) {
      let institution = await this.institutionRepo.findOne({
        where: { code: data.code },
      });
      if (!institution) {
        institution = await this.institutionRepo.save(
          this.institutionRepo.create({ ...data, status: 'active' }),
        );
      }
      instituciones.set(data.code, institution);
    }

    const scopes = new Map<string, InstitutionScope>();
    for (const [code, institution] of instituciones) {
      let scope = await this.scopeRepo.findOne({
        where: {
          institutionId: institution.id,
          type: 'institution',
          name: institution.name,
        },
      });
      if (!scope) {
        scope = await this.scopeRepo.save(
          this.scopeRepo.create({
            type: 'institution',
            name: institution.name,
            institutionId: institution.id,
          }),
        );
      }
      scopes.set(code, scope);
    }

    const sena = instituciones.get('sena');
    const colegio = instituciones.get('colegio');
    const senaScope = scopes.get('sena');
    const colegioScope = scopes.get('colegio');

    if (sena && senaScope) {
      const programas = await this.programaRepo.find();
      const programScopes = new Map<string, InstitutionScope>();
      for (const programa of programas.filter(
        (item) => item.institutionId === 'inst-sena',
      )) {
        let programScope = await this.scopeRepo.findOne({
          where: {
            institutionId: sena.id,
            type: 'program',
            programaId: programa.id,
          },
        });
        if (!programScope) {
          programScope = await this.scopeRepo.save(
            this.scopeRepo.create({
              type: 'program',
              name: programa.name,
              institutionId: sena.id,
              programaId: programa.id,
              parentId: senaScope.id,
            }),
          );
        }
        programScopes.set(programa.id, programScope);
        programa.institutionContextId = sena.id;
        programa.scopeId = programScope.id;
        await this.programaRepo.save(programa);
      }

      const fichas = await this.fichaRepo.find();
      for (const ficha of fichas) {
        const programScope = ficha.programaId
          ? programScopes.get(ficha.programaId)
          : undefined;
        let fichaScope = await this.scopeRepo.findOne({
          where: {
            institutionId: sena.id,
            type: 'ficha',
            fichaId: ficha.id,
          },
        });
        if (!fichaScope) {
          fichaScope = await this.scopeRepo.save(
            this.scopeRepo.create({
              type: 'ficha',
              name: `${ficha.code} · ${ficha.name}`,
              institutionId: sena.id,
              fichaId: ficha.id,
              programaId: ficha.programaId ?? null,
              parentId: programScope?.id ?? senaScope.id,
            }),
          );
        }
        ficha.institutionContextId = sena.id;
        ficha.scopeId = fichaScope.id;
        await this.fichaRepo.save(ficha);
      }
    }

    if (colegio && colegioScope) {
      const grupos = await this.grupoRepo.find();
      for (const grupo of grupos) {
        let groupScope = await this.scopeRepo.findOne({
          where: {
            institutionId: colegio.id,
            type: 'group',
            grupoId: grupo.id,
          },
        });
        if (!groupScope) {
          groupScope = await this.scopeRepo.save(
            this.scopeRepo.create({
              type: 'group',
              name: `${grupo.code} · ${grupo.nombre}`,
              institutionId: colegio.id,
              grupoId: grupo.id,
              parentId: colegioScope.id,
            }),
          );
        }
        grupo.institutionContextId = colegio.id;
        grupo.scopeId = groupScope.id;
        await this.grupoRepo.save(grupo);
      }
    }

    const responsabilidades = [
      ['SENA_SUPPORT', 'Responsable de Apoyos de Sostenimiento', 'sena'],
      ['SENA_WELLBEING', 'Responsable de Bienestar', 'sena'],
      ['SENA_ORIENTATION', 'Responsable de Orientacion', 'sena'],
      ['SENA_PERMANENCE', 'Responsable de Permanencia', 'sena'],
      ['SENA_ACADEMIC', 'Responsable Academico', 'sena'],
      ['SENA_PROGRAM', 'Responsable de Programa', 'sena'],
      ['SENA_GROUP', 'Responsable de Ficha/Grupo', 'sena'],
      ['SENA_INSTRUCTOR', 'Instructor responsable', 'sena'],
      ['SENA_LEADER', 'Lider responsable de comunicacion', 'sena'],
      ['SCHOOL_ACADEMIC', 'Responsable Academico', 'colegio'],
      ['SCHOOL_ORIENTATION', 'Responsable de Orientacion', 'colegio'],
      ['SCHOOL_CONVIVENCIA', 'Responsable de Convivencia', 'colegio'],
      ['SCHOOL_COURSE', 'Responsable de Curso', 'colegio'],
      ['UNIVERSITY_PROGRAM', 'Director de Programa', 'universidad'],
      ['UNIVERSITY_ACADEMIC', 'Coordinador Academico', 'universidad'],
      ['UNIVERSITY_SUBJECT', 'Responsable de Asignatura', 'universidad'],
      ['UNIVERSITY_WELLBEING', 'Responsable de Bienestar', 'universidad'],
      ['UNIVERSITY_ORIENTATION', 'Responsable de Orientacion', 'universidad'],
      ['UNIVERSITY_PERMANENCE', 'Responsable de Permanencia', 'universidad'],
    ] as const;

    for (const [code, name, domain] of responsabilidades) {
      await this.responsibilityService.createResponsibility({
        code,
        name,
        domain,
      });
    }

    if (sena) {
      const instructorResponsibility =
        await this.responsibilityService.createResponsibility({
          code: 'SENA_INSTRUCTOR',
          name: 'Instructor responsable',
          domain: 'sena',
        });
      const links = await this.fichaInstructorRepo.find({
        relations: { ficha: true },
      });
      for (const link of links) {
        if (!link.ficha?.scopeId) continue;
        const existing = await this.responsibilityService.resolve({
          responsibilityCode: 'SENA_INSTRUCTOR',
          institutionId: sena.id,
          scopeIds: [link.ficha.scopeId],
        });
        if (!existing) {
          const legacy = await this.assignmentRepo.findOne({
            where: {
              userId: link.instructorId,
              responsibilityId: instructorResponsibility.id,
              institutionId: sena.id,
              scopeId: senaScope?.id,
              status: 'active',
            },
          });
          if (legacy) {
            legacy.scopeId = link.ficha.scopeId;
            await this.assignmentRepo.save(legacy);
            continue;
          }
          await this.responsibilityService.assign({
            userId: link.instructorId,
            responsibilityId: instructorResponsibility.id,
            institutionId: sena.id,
            scopeId: link.ficha.scopeId,
            startsAt: link.ficha.startDate ?? new Date(),
            endsAt: link.ficha.endDate ?? undefined,
          });
        }
      }
    }
  }
}
