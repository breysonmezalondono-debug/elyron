import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import decodeJwt, { isTokenExpired } from '../utils/jwt';
import { can as roleCan } from '../model/permissions';
import type { Capability, RoleSession } from '../model/permissions';
import { distinctRoleSessions } from '../model/permissions';
import { clearToken, getToken, setToken } from '../api';
import AuthContext from './AuthContext';
import type { RegisterOptions } from './AuthContext';
import type { LoginOptions } from './AuthContext';

const ACTIVE_ROLE_KEY = 'elyron.activeRole';

interface AuthProviderProps {
  children: ReactNode;
}

const resolveInitialToken = (): ReturnType<typeof decodeJwt> => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    clearToken();
    return null;
  }
  return decodeJwt(token);
};

const activateSingleRole = (decoded: ReturnType<typeof decodeJwt> | null): string | null => {
  const sessions = distinctRoleSessions(decoded?.memberships);
  const uniqueRoleKeys = new Set(sessions.map((session) => session.roleKey));
  if (uniqueRoleKeys.size !== 1) return null;
  const onlyRole = sessions[0].roleKey;
  localStorage.setItem(ACTIVE_ROLE_KEY, onlyRole);
  return onlyRole;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(resolveInitialToken);

  const [activeRole, setActiveRole] = useState<string | null>(() => {
    if (!user) {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
      return null;
    }
    return localStorage.getItem(ACTIVE_ROLE_KEY);
  });

  const availableRoles = useMemo<RoleSession[]>(
    () => distinctRoleSessions(user?.memberships),
    [user],
  );

  const validActiveRole = useMemo<string | null>(
    () =>
      activeRole && availableRoles.some((session) => session.roleKey === activeRole)
        ? activeRole
        : null,
    [activeRole, availableRoles],
  );

  const activeInstitutionId = useMemo<string | null>(() => {
    if (!validActiveRole) return null;
    const session = availableRoles.find((item) => item.roleKey === validActiveRole);
    return session?.institutionId ?? user?.memberships?.[0]?.institutionId ?? null;
  }, [availableRoles, validActiveRole, user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      availableRoles,
      activeRole: validActiveRole,
      activeInstitutionId,
      can: (capability: Capability) => roleCan(validActiveRole, capability),

      selectRole(roleKey: string) {
        localStorage.setItem(ACTIVE_ROLE_KEY, roleKey);
        setActiveRole(roleKey);
      },

      clearActiveRole() {
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setActiveRole(null);
      },

      async login(email: string, password: string, options?: LoginOptions) {
        const data = await authService.login({ email, password, ...options });
        if (!data?.token || isTokenExpired(data.token)) {
          throw new Error('El servidor devolvió un token inválido');
        }
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setActiveRole(null);
        setToken(data.token);
        const decoded = decodeJwt(data.token);
        setUser(decoded);
        setActiveRole(activateSingleRole(decoded));
      },

      async loginInstitucional(email: string, password: string, options?: LoginOptions) {
        const data = await authService.loginInstitucional({ email, password, ...options });
        if (!data?.token || isTokenExpired(data.token)) {
          throw new Error('El servidor devolvió un token inválido');
        }
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setActiveRole(null);
        setToken(data.token);
        const decoded = decodeJwt(data.token);
        setUser(decoded);
        setActiveRole(activateSingleRole(decoded));
      },

      async register(name: string, email: string, password: string, options?: RegisterOptions) {
        const data = await authService.register({ name, email, password, ...options });
        if (!data?.token || isTokenExpired(data.token)) {
          throw new Error('El servidor devolvió un token inválido');
        }
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setActiveRole(null);
        setToken(data.token);
        const decoded = decodeJwt(data.token);
        setUser(decoded);
        setActiveRole(activateSingleRole(decoded));
      },

      logout() {
        clearToken();
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setUser(null);
        setActiveRole(null);
      },
    }),
    [user, availableRoles, validActiveRole, activeInstitutionId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
