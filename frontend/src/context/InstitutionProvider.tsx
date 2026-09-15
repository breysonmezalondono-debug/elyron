import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Institution, Membership } from '../model/institution';
import { terminologyFor } from '../model/institution';
import { CURRENT_MEMBERSHIPS, INSTITUTIONS, getInstitution } from '../model/mock/orgData';
import { useAuth } from './useAuth';
import InstitutionContext from './InstitutionContext';

const STORAGE_KEY = 'elyron.activeInstitution';

interface InstitutionProviderProps {
  children: ReactNode;
}

export const InstitutionProvider = ({ children }: InstitutionProviderProps) => {
  const { user, activeInstitutionId } = useAuth();

  const memberships = useMemo<Membership[]>(() => {
    if (user?.memberships && user.memberships.length > 0) return user.memberships;
    return CURRENT_MEMBERSHIPS;
  }, [user]);

  const institutions = useMemo<Institution[]>(
    () =>
      memberships
        .map((membership) => getInstitution(membership.institutionId))
        .filter((institution): institution is Institution => Boolean(institution)),
    [memberships],
  );

  const [manualId, setManualId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && INSTITUTIONS.some((institution) => institution.id === stored)) {
      return stored;
    }
    return INSTITUTIONS[0].id;
  });

  const value = useMemo(() => {
    const effectiveId =
      activeInstitutionId ?? manualId;
    const institution =
      getInstitution(effectiveId) ?? institutions[0] ?? INSTITUTIONS[0];
    return {
      institution,
      institutions: institutions.length > 0 ? institutions : INSTITUTIONS,
      memberships,
      terminology: terminologyFor(institution.type),
      selectInstitution: (id: string) => {
        setManualId(id);
        localStorage.setItem(STORAGE_KEY, id);
      },
    };
  }, [activeInstitutionId, institutions, memberships, manualId]);

  return <InstitutionContext.Provider value={value}>{children}</InstitutionContext.Provider>;
};
