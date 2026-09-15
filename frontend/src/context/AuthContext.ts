import { createContext } from 'react';
import type { Membership } from '../model/institution';
import type { Capability, RoleSession } from '../model/permissions';

export interface AuthUser {
  sub?: string;
  name?: string;
  role?: string;
  roles?: string[];
  exp?: number;
  memberships?: Membership[];
  [key: string]: unknown;
}

export interface RegisterOptions {
  roleKey?: string;
  institutionId?: string;
}

export interface LoginOptions {
  institutionId?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  availableRoles: RoleSession[];
  activeRole: string | null;
  activeInstitutionId: string | null;
  selectRole: (roleKey: string) => void;
  clearActiveRole: () => void;
  can: (capability: Capability) => boolean;
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>;
  loginInstitucional: (email: string, password: string, options?: LoginOptions) => Promise<void>;
  register: (name: string, email: string, password: string, options?: RegisterOptions) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default AuthContext;
