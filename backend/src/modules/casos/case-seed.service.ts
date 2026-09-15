import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseCategory } from './entities/case-category.entity';
import { InstitutionContext } from '../contexto/entities/institution-context.entity';

@Injectable()
export class CaseSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(CaseCategory)
    private readonly categoryRepo: Repository<CaseCategory>,
    @InjectRepository(InstitutionContext)
    private readonly institutionRepo: Repository<InstitutionContext>,
  ) {}

  async onModuleInit(): Promise<void> {
    const definitions = [
      ['SENA_SUPPORT', 'Apoyo de sostenimiento', 'SENA_SUPPORT'],
      ['SENA_ORIENTATION', 'Orientación', 'SENA_ORIENTATION'],
      ['SENA_PERMANENCE', 'Permanencia', 'SENA_PERMANENCE'],
      ['SCHOOL_ORIENTATION', 'Orientación escolar', 'SCHOOL_ORIENTATION'],
      ['SCHOOL_CONVIVENCIA', 'Convivencia', 'SCHOOL_CONVIVENCIA'],
      [
        'UNIVERSITY_PERMANENCE',
        'Permanencia universitaria',
        'UNIVERSITY_PERMANENCE',
      ],
      [
        'UNIVERSITY_ORIENTATION',
        'Orientación universitaria',
        'UNIVERSITY_ORIENTATION',
      ],
    ] as const;

    const contexts = await this.institutionRepo.find();
    for (const context of contexts) {
      const domainDefinitions = definitions.filter((item) => {
        if (context.code === 'sena') return item[0].startsWith('SENA_');
        if (context.code === 'colegio') return item[0].startsWith('SCHOOL_');
        if (context.code === 'universidad')
          return item[0].startsWith('UNIVERSITY_');
        return false;
      });
      for (const [code, name, responsibilityCode] of domainDefinitions) {
        const existing = await this.categoryRepo.findOne({
          where: { code, institutionId: context.id },
        });
        if (!existing) {
          await this.categoryRepo.save(
            this.categoryRepo.create({
              code,
              name,
              institutionId: context.id,
              responsibilityCode,
              status: 'active',
              allowedTransitions: {
                CREADO: ['PENDIENTE_ASIGNACION', 'ASIGNADO', 'CANCELADO'],
                PENDIENTE_ASIGNACION: ['ASIGNADO', 'CANCELADO'],
                ASIGNADO: ['EN_REVISION', 'EN_GESTION', 'CANCELADO'],
                EN_REVISION: ['EN_GESTION', 'PENDIENTE_USUARIO', 'CANCELADO'],
                EN_GESTION: ['PENDIENTE_USUARIO', 'RESUELTO', 'CANCELADO'],
                PENDIENTE_USUARIO: ['EN_GESTION', 'CANCELADO'],
                RESUELTO: ['CERRADO', 'REABIERTO'],
                CERRADO: ['REABIERTO'],
                REABIERTO: ['EN_GESTION', 'CANCELADO'],
              },
            }),
          );
        }
      }
    }
  }
}
