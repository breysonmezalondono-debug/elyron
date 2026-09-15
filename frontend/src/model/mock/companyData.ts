import type { InstitutionType } from '../institution';

export type AgreementStatus = 'activo' | 'por_renovar' | 'vencido';

export interface Company {
  id: string;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  institutions: InstitutionType[];
}

export interface AdminCompany extends Company {
  agreementStatus: AgreementStatus;
  agreementDate: string;
  contactName: string;
  contactPhone: string;
  activeOffers: number;
  totalApplications: number;
}

export const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> = {
  activo: 'Activo',
  por_renovar: 'Por renovar',
  vencido: 'Vencido',
};

export const AGREEMENT_STATUS_BADGE: Record<AgreementStatus, string> = {
  activo: 'bg-mint-50 text-mint-700 ring-mint-200',
  por_renovar: 'bg-amber-50 text-amber-700 ring-amber-200',
  vencido: 'bg-red-50 text-red-500 ring-red-200',
};

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'emp-1',
    name: 'TechSolutions Colombia',
    nit: '900123456-1',
    address: 'Calle 100 #15-20',
    phone: '3001234567',
    email: 'contacto@techsolutions.com',
    isActive: true,
    institutions: ['sena', 'universidad'],
  },
  {
    id: 'emp-2',
    name: 'InnovaSoft Global',
    nit: '800987654-3',
    address: 'Carrera 43A #1-50',
    phone: '3119876543',
    email: 'gestion@innovasoft.co',
    isActive: true,
    institutions: ['sena'],
  },
  {
    id: 'emp-3',
    name: 'Kairos Digital',
    nit: '901555222-8',
    address: 'Cra 7 #71-21',
    phone: '3152223344',
    email: 'talento@kairosdigital.co',
    isActive: true,
    institutions: ['universidad'],
  },
];

export const ADMIN_COMPANIES: AdminCompany[] = [
  {
    ...INITIAL_COMPANIES[0],
    agreementStatus: 'activo',
    agreementDate: '2025-03-15',
    contactName: 'Roberto Méndez',
    contactPhone: '3001234567',
    activeOffers: 4,
    totalApplications: 23,
  },
  {
    ...INITIAL_COMPANIES[1],
    agreementStatus: 'por_renovar',
    agreementDate: '2024-06-01',
    contactName: 'Diana restrepo',
    contactPhone: '3119876543',
    activeOffers: 2,
    totalApplications: 15,
  },
  {
    ...INITIAL_COMPANIES[2],
    agreementStatus: 'activo',
    agreementDate: '2025-11-20',
    contactName: 'Andrés Felipe Luna',
    contactPhone: '3152223344',
    activeOffers: 3,
    totalApplications: 31,
  },
  {
    id: 'emp-4',
    name: 'Construcciones Delta',
    nit: '800123456-7',
    address: 'Av. Cara Sur #45-12',
    phone: '3201112233',
    email: 'rh@construccionesdelta.co',
    isActive: true,
    institutions: ['sena'],
    agreementStatus: 'vencido',
    agreementDate: '2023-09-10',
    contactName: 'Miguel Ángel Rojas',
    contactPhone: '3201112233',
    activeOffers: 0,
    totalApplications: 8,
  },
  {
    id: 'emp-5',
    name: 'Finanzas Globales S.A.S',
    nit: '900876543-2',
    address: 'Cra 11 #93-45',
    phone: '3187654321',
    email: 'talento@finglobales.co',
    isActive: true,
    institutions: ['universidad'],
    agreementStatus: 'activo',
    agreementDate: '2025-08-01',
    contactName: 'Patricia Vélez',
    contactPhone: '3187654321',
    activeOffers: 5,
    totalApplications: 42,
  },
];
