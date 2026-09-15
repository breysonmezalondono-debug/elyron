import { useContext } from 'react';
import AuthContext from './AuthContext';
import type { AuthContextValue } from './AuthContext';

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
