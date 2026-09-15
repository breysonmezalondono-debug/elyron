import { ResponsibilityService } from './responsibility.service';

describe('ResponsibilityService', () => {
  it('resolves the most specific active assignment at the requested date', async () => {
    const responsibility = {
      id: 'resp-1',
      code: 'SENA_INSTRUCTOR',
      status: 'active',
    };
    const institution = { id: 'inst-1', code: 'sena' };
    const ficha = {
      id: 'scope-ficha',
      type: 'ficha',
      startsAt: new Date('2026-01-01'),
      endsAt: null,
      user: { id: 'user-ficha' },
      responsibility,
      scope: { type: 'ficha' },
    };
    const institutionAssignment = {
      id: 'assignment-inst',
      startsAt: new Date('2026-01-01'),
      endsAt: null,
      user: { id: 'user-inst' },
      responsibility,
      scope: { type: 'institution' },
    };
    const fichaAssignment = {
      id: 'assignment-ficha',
      startsAt: new Date('2026-01-01'),
      endsAt: null,
      user: { id: 'user-ficha' },
      responsibility,
      scope: { type: 'ficha' },
    };
    const responsibilityRepo = {
      findOne: jest.fn().mockResolvedValue(responsibility),
    };
    const assignmentRepo = {
      find: jest
        .fn()
        .mockResolvedValue([institutionAssignment, fichaAssignment]),
      findOne: jest.fn(),
    };
    const service = new ResponsibilityService(
      responsibilityRepo as any,
      assignmentRepo as any,
    );

    const resolved = await service.resolve({
      responsibilityCode: 'SENA_INSTRUCTOR',
      institutionId: institution.id,
      scopeIds: ['scope-ficha'],
      at: new Date('2026-02-01'),
    });

    expect(resolved?.id).toBe(fichaAssignment.id);
    void ficha;
  });

  it('does not resolve an assignment outside its validity dates', async () => {
    const responsibilityRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'resp-1', status: 'active' }),
    };
    const assignmentRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'expired',
          startsAt: new Date('2025-01-01'),
          endsAt: new Date('2025-12-31'),
          scope: { type: 'ficha' },
        },
      ]),
    };
    const service = new ResponsibilityService(
      responsibilityRepo as any,
      assignmentRepo as any,
    );

    const resolved = await service.resolve({
      responsibilityCode: 'SENA_INSTRUCTOR',
      institutionId: 'inst-1',
      scopeIds: ['scope-ficha'],
      at: new Date('2026-01-01'),
    });

    expect(resolved).toBeNull();
  });
});
