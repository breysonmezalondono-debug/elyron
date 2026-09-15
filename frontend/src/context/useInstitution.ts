import { useContext } from 'react';
import InstitutionContext from './InstitutionContext';
import type { InstitutionContextValue } from './InstitutionContext';

export const useInstitution = (): InstitutionContextValue => {
  const ctx = useContext(InstitutionContext);
  if (!ctx) throw new Error('useInstitution debe usarse dentro de <InstitutionProvider>');
  return ctx;
};
