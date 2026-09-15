import { AuthorizationContextService } from './authorization-context.service';

describe('AuthorizationContextService', () => {
  const service = new AuthorizationContextService();

  it('denies when the user is missing', () => {
    expect(service.can(null, 'evidencias.read')).toBe(false);
  });

  it('allows an explicit permission inside the same institution', () => {
    expect(
      service.can(
        {
          institucion: 'sena',
          permisos: ['evidencias.read'],
        },
        'evidencias.read',
        { institution: 'sena' },
      ),
    ).toBe(true);
  });

  it('denies a missing permission', () => {
    expect(
      service.can(
        { institucion: 'sena', permisos: ['evidencias.read'] },
        'evidencias.update',
      ),
    ).toBe(false);
  });

  it('denies a cross-institution operation', () => {
    expect(
      service.can(
        { institucion: 'sena', permisos: ['users.read'] },
        'users.read',
        { institution: 'colegio' },
      ),
    ).toBe(false);
  });
});
