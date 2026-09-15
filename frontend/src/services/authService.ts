import { authClient, setToken } from '../api';
import { AUTH_ROUTES, USE_MOCK } from './config';
import { CURRENT_MEMBERSHIPS, DEMO_LOGINS, findMockAccount } from '../model/mock/orgData';
import type { Membership } from '../model/institution';

interface LoginInput {
  email: string;
  password: string;
  institutionId?: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  roleKey?: string;
  institutionId?: string;
}

const DEFAULT_INSTITUTION_ID = 'inst-sena';

const INSTITUTION_ID_TO_SLUG: Record<string, string> = {
  'inst-sena': 'sena',
  'inst-colegio': 'colegio',
  'inst-aurora': 'universidad',
};

const institutionSlug = (institutionId?: string): string =>
  (institutionId && INSTITUTION_ID_TO_SLUG[institutionId]) || 'sena';

const storeRealToken = (accessToken?: string): void => {
  setToken(accessToken);
};

export interface AuthSession {
  token: string;
  user?: {
    email: string;
    name?: string;
  };
}

const encodeSegment = (obj: unknown): string =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/, '');

const createMockToken = (email: string, name?: string, membershipsOverride?: Membership[]): string => {
  const account = findMockAccount(email);
  const memberships = account?.memberships ?? membershipsOverride ?? CURRENT_MEMBERSHIPS;
  const roles = Array.from(new Set(memberships.map((membership) => membership.roleKey)));
  const header = encodeSegment({ alg: 'none', typ: 'JWT' });
  const lowerEmail = email.toLowerCase();
  const payload = encodeSegment({
    sub: email,
    name: account?.name || name || email.split('@')[0],
    role: roles[0],
    roles,
    memberships,
    es_vocero: lowerEmail === 'vocero@elyron.com',
    es_vocero_suplente: lowerEmail === 'colider@elyron.com',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  });
  return `${header}.${payload}.mock`;
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * En modo mock, resuelve la membresía del correo según la institución
 * seleccionada en el Login, para que cada institución (SENA / Colegio /
 * Universidad) autentique con su rol correcto.
 */
const GENERIC_ROLE_BY_EMAIL: Record<string, string> = {
  'instructor@elyron.com': 'instructor',
  'profesor@elyron.com': 'instructor',
  'docente@elyron.com': 'docente',
  'orientador@elyron.com': 'orientador',
  'rector@elyron.com': 'rector',
  'coordinador@elyron.com': 'coordinador',
  'bienestar@elyron.com': 'coordinador',
  'admin@elyron.com': 'admin',
  'breyadmin26@gmail.com': 'admin',
};

const mockMembershipsFor = (email: string, institutionId: string): Membership[] => {
  const demo = (DEMO_LOGINS[institutionId] ?? []).find(
    (d) => d.email.toLowerCase() === email.toLowerCase(),
  );
  if (demo) return [{ institutionId, roleKey: demo.roleKey }];
  const genericRole = GENERIC_ROLE_BY_EMAIL[email.toLowerCase()];
  if (genericRole) return [{ institutionId, roleKey: genericRole }];
  const account = findMockAccount(email);
  return account?.memberships ?? CURRENT_MEMBERSHIPS;
};

export const authService = {
  async login({ email, password, institutionId }: LoginInput): Promise<AuthSession> {
    const membershipInstitutionId = institutionId || DEFAULT_INSTITUTION_ID;
    if (USE_MOCK) {
      await delay(600);
      const memberships = mockMembershipsFor(email, membershipInstitutionId);
      return { token: createMockToken(email, undefined, memberships), user: { email } };
    }
    const slug = institutionSlug(membershipInstitutionId);
    const res = await authClient.post<{
      user: { email: string; firstName?: string; lastName?: string; role?: string | { name?: string } };
      accessToken: string;
      refreshToken: string;
    }>(AUTH_ROUTES.login(slug), { email, password });
    storeRealToken(res.data.accessToken);
    const name = [res.data.user?.firstName, res.data.user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      token: res.data.accessToken,
      user: { email: res.data.user?.email ?? email, name: name || undefined },
    };
  },

  /**
   * Puerta de ingreso institucional (personal). No se enlaza en la UI
   * pública; solo accesible por URL directa.
   */
  async loginInstitucional({ email, password, institutionId }: LoginInput): Promise<AuthSession> {
    const membershipInstitutionId = institutionId || DEFAULT_INSTITUTION_ID;
    if (USE_MOCK) {
      await delay(600);
      const memberships = mockMembershipsFor(email, membershipInstitutionId);
      return { token: createMockToken(email, undefined, memberships), user: { email } };
    }
    const slug = institutionSlug(membershipInstitutionId);
    const res = await authClient.post<{
      user: { email: string; firstName?: string; lastName?: string; role?: string | { name?: string } };
      accessToken: string;
      refreshToken: string;
    }>(AUTH_ROUTES.loginInstitucional(slug), { email, password });
    storeRealToken(res.data.accessToken);
    const name = [res.data.user?.firstName, res.data.user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      token: res.data.accessToken,
      user: { email: res.data.user?.email ?? email, name: name || undefined },
    };
  },

  async register({ name, email, password, roleKey, institutionId }: RegisterInput): Promise<AuthSession> {
    if (USE_MOCK) {
      await delay(600);
      const memberships: Membership[] | undefined = roleKey
        ? [{ institutionId: institutionId ?? 'inst-sena', roleKey }]
        : undefined;
      return { token: createMockToken(email, name, memberships), user: { email, name } };
    }
    const [firstName, ...restLastName] = name.trim().split(/\s+/);
    const lastName = restLastName.join(' ') || firstName;
    const res = await authClient.post<{
      user: { email: string; firstName?: string; lastName?: string; role?: string | { name?: string } };
      accessToken: string;
      refreshToken: string;
    }>(AUTH_ROUTES.register, { email, password, firstName, lastName, roleKey });
    storeRealToken(res.data.accessToken);
    return {
      token: res.data.accessToken,
      user: { email: res.data.user?.email ?? email, name },
    };
  },
};
