import { createContext } from 'react';
import type { Institution, Membership, TerminologyMap } from '../model/institution';

export interface InstitutionContextValue {
  institution: Institution;
  institutions: Institution[];
  memberships: Membership[];
  terminology: TerminologyMap;
  selectInstitution: (id: string) => void;
}

const InstitutionContext = createContext<InstitutionContextValue | null>(null);

export default InstitutionContext;
