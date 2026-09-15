import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Responsibility } from './entities/responsibility.entity';
import { ResponsibilityAssignment } from './entities/responsibility-assignment.entity';

const PRIORIDAD_ALCANCE = [
  'case',
  'subject',
  'course',
  'group',
  'ficha',
  'program',
  'center',
  'campus',
  'institution',
];

@Injectable()
export class ResponsibilityService {
  constructor(
    @InjectRepository(Responsibility)
    private readonly responsibilityRepo: Repository<Responsibility>,
    @InjectRepository(ResponsibilityAssignment)
    private readonly assignmentRepo: Repository<ResponsibilityAssignment>,
  ) {}

  async createResponsibility(input: {
    code: string;
    name: string;
    domain: string;
    description?: string;
  }): Promise<Responsibility> {
    const existing = await this.responsibilityRepo.findOne({
      where: { code: input.code },
    });
    if (existing) return existing;
    return this.responsibilityRepo.save(
      this.responsibilityRepo.create({ ...input, status: 'active' }),
    );
  }

  async assign(input: {
    userId: string;
    responsibilityId: string;
    institutionId: string;
    scopeId?: string;
    startsAt?: Date;
    endsAt?: Date;
    assignedById?: string;
    assignmentReason?: string;
  }): Promise<ResponsibilityAssignment> {
    // Close the previous active assignment for the same responsibility/scope.
    await this.assignmentRepo.update(
      {
        responsibilityId: input.responsibilityId,
        institutionId: input.institutionId,
        scopeId: input.scopeId ?? null,
        status: 'active',
      },
      { status: 'ended', endsAt: input.startsAt ?? new Date() },
    );

    return this.assignmentRepo.save(
      this.assignmentRepo.create({
        ...input,
        scopeId: input.scopeId ?? null,
        startsAt: input.startsAt ?? new Date(),
        status: 'active',
      }),
    );
  }

  async resolve(input: {
    responsibilityCode: string;
    institutionId: string;
    scopeIds?: string[];
    at?: Date;
  }): Promise<ResponsibilityAssignment | null> {
    const at = input.at ?? new Date();
    const responsibility = await this.responsibilityRepo.findOne({
      where: { code: input.responsibilityCode, status: 'active' },
    });
    if (!responsibility) return null;

    const where: Record<string, unknown> = {
      responsibilityId: responsibility.id,
      institutionId: input.institutionId,
      status: 'active',
    };
    if (input.scopeIds?.length) where.scopeId = In(input.scopeIds);
    const assignments = await this.assignmentRepo.find({
      where,
      relations: { user: true, responsibility: true, scope: true },
    });

    return (
      assignments
        .filter(
          (assignment) =>
            assignment.startsAt <= at &&
            (!assignment.endsAt || assignment.endsAt >= at),
        )
        .sort((a, b) => {
          const aPriority = PRIORIDAD_ALCANCE.indexOf(
            a.scope?.type ?? 'institution',
          );
          const bPriority = PRIORIDAD_ALCANCE.indexOf(
            b.scope?.type ?? 'institution',
          );
          return aPriority - bPriority;
        })[0] ?? null
    );
  }

  async requireResponsible(input: {
    responsibilityCode: string;
    institutionId: string;
    scopeIds?: string[];
  }): Promise<ResponsibilityAssignment> {
    const resolved = await this.resolve(input);
    if (!resolved) {
      throw new ForbiddenException(
        'No existe un responsable activo para este proceso y contexto.',
      );
    }
    return resolved;
  }

  async hasUserScope(input: {
    userId: string;
    responsibilityCode: string;
    institutionId: string;
    scopeId: string;
    at?: Date;
  }): Promise<boolean> {
    const responsibility = await this.responsibilityRepo.findOne({
      where: { code: input.responsibilityCode, status: 'active' },
    });
    if (!responsibility) return false;
    const assignment = await this.assignmentRepo.findOne({
      where: {
        userId: input.userId,
        responsibilityId: responsibility.id,
        institutionId: input.institutionId,
        scopeId: input.scopeId,
        status: 'active',
      },
    });
    const at = input.at ?? new Date();
    return Boolean(
      assignment &&
      assignment.startsAt <= at &&
      (!assignment.endsAt || assignment.endsAt >= at),
    );
  }

  async hasAnyUserScope(input: {
    userId: string;
    institutionId: string;
    scopeId: string;
    at?: Date;
  }): Promise<boolean> {
    const assignment = await this.assignmentRepo.findOne({
      where: {
        userId: input.userId,
        institutionId: input.institutionId,
        scopeId: input.scopeId,
        status: 'active',
      },
    });
    const at = input.at ?? new Date();
    return Boolean(
      assignment &&
      assignment.startsAt <= at &&
      (!assignment.endsAt || assignment.endsAt >= at),
    );
  }
}
