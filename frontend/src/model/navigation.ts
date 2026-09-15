import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleUserRound,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  Flag,
  FolderOpen,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Library,
  Megaphone,
  MessagesSquare,
  Mic,
  PartyPopper,
  ScrollText,
  Send,
  Share2,
  Users,
  UsersRound,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TerminologyMap } from './institution';
import { pluralize } from './institution';

/**
 * Prefijo base del portal docente según el rol:
 * instructor (SENA) → /instructor · docente (Profesor) → /profesor.
 * Permite que los paneles de profesor funcionen en ambos portales sin
 * duplicar rutas ni romper enlaces internos.
 */
export const teacherBasePath = (roleKey?: string | null): string =>
  roleKey === 'instructor' ? '/instructor' : '/profesor';

export interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

export interface NavFlags {
  es_vocero?: boolean;
  es_vocero_suplente?: boolean;
}

export const buildNavForRole = (
  roleKey: string | null | undefined,
  terms: TerminologyMap,
  flags?: NavFlags | null,
): NavGroupDef[] => {
  switch (roleKey) {
    case 'instructor':
      return [
        {
          title: 'Enseñanza',
          items: [
            { to: '/instructor', label: 'Inicio', icon: LayoutDashboard },
            { to: '/instructor/grupos', label: `Mis ${pluralize(terms.group.toLowerCase())}`, icon: Users },
            { to: '/instructor/actividades', label: 'Actividades y tareas', icon: ClipboardList },
            { to: '/instructor/calificaciones', label: 'Evidencias por calificar', icon: ClipboardCheck, badge: 8 },
            { to: '/instructor/asistencia', label: 'Asistencia', icon: UserCheck },
            { to: '/calendario', label: 'Calendario de clases', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/comunidad', label: 'Comunidad', icon: MessagesSquare, badge: 5 },
            { to: '/empresas', label: 'Empresas', icon: Building2 },
            { to: '/ofertas', label: 'Bolsa de empleo', icon: BriefcaseBusiness },
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
      ];
    case 'coordinador':
      return [
        {
          title: 'Coordinación',
          items: [
            { to: '/coordinador', label: 'Inicio', icon: LayoutDashboard },
            { to: '/coordinador/reportes', label: 'Reportes por programa', icon: FileBarChart },
            { to: '/coordinador/grupos', label: 'Grupos e instructores', icon: Users },
            { to: '/coordinador/comunicados', label: 'Comunicados de programa', icon: Megaphone },
            { to: '/calendario', label: 'Calendario consolidado', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/comunidad', label: 'Comunidad', icon: MessagesSquare },
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
      ];
    case 'admin':
      return [
        {
          title: 'Administración',
          items: [
            { to: '/admin', label: 'Inicio', icon: LayoutDashboard },
            { to: '/admin/usuarios', label: 'Usuarios y roles', icon: Users },
            { to: '/admin/instituciones', label: 'Instituciones', icon: Building2 },
            { to: '/admin/fichas', label: 'Fichas y estudiantes', icon: UsersRound },
            { to: '/admin/programas', label: 'Programas y grupos', icon: GraduationCap },
            { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
            { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
            { to: '/admin/moderacion', label: 'Moderación de comunidad', icon: Flag, badge: 4 },
            { to: '/admin/empresas', label: 'Empresas', icon: BriefcaseBusiness },
          ],
        },
      ];
    case 'docente':
      return [
        {
          title: 'Profesor',
          items: [
            { to: '/profesor', label: 'Inicio', icon: LayoutDashboard },
            { to: '/profesor/grupos', label: `Mis ${pluralize(terms.group.toLowerCase())}`, icon: Users },
            { to: '/profesor/actividades', label: 'Actividades y tareas', icon: ClipboardList },
            { to: '/profesor/calificaciones', label: 'Por calificar', icon: ClipboardCheck, badge: 4 },
            { to: '/profesor/asistencia', label: 'Asistencia', icon: UserCheck },
            { to: '/calendario', label: 'Calendario', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/comunidad', label: 'Comunidad', icon: MessagesSquare },
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
      ];
    case 'rector':
    case 'orientador':
    case 'coordinador_convivencia':
      return [
        {
          title: 'Colegio',
          items: [
            { to: '/colegio', label: 'Inicio', icon: LayoutDashboard },
            { to: '/calendario', label: 'Calendario', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/comunidad', label: 'Comunidad', icon: MessagesSquare },
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
      ];
    case 'estudiante':
      return [
        {
          title: 'Colegio',
          items: [
            { to: '/colegio', label: 'Inicio', icon: LayoutDashboard },
            { to: '/evidencias', label: 'Mis evidencias', icon: FolderOpen },
            { to: '/calendario', label: 'Calendario', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/comunidad', label: 'Comunidad', icon: MessagesSquare },
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
      ];
    case 'aprendiz':
    default:
      return [
        {
          title: 'Inicio',
          items: [
            { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
          ],
        },
        {
          title: 'Formación',
          items: [
            { to: '/evidencias', label: 'Evidencias', icon: FolderOpen, badge: 2 },
            { to: '/calendario', label: 'Calendario', icon: CalendarDays },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { to: '/ficha', label: 'Mi ficha', icon: UsersRound },
            ...(flags?.es_vocero
              ? [{ to: '/vocera', label: 'Líder', icon: Mic }]
              : []),
            ...(flags?.es_vocero_suplente
              ? [{ to: '/colider', label: 'Colíder', icon: Share2 }]
              : []),
            { to: '/comunicados', label: 'Comunicados', icon: Megaphone, badge: 3 },
            { to: '/solicitudes', label: 'Solicitudes', icon: Send },
          ],
        },
        {
          title: 'Servicios',
          items: [
            { to: '/apoyo', label: 'Apoyo de sostenimiento', icon: HandCoins },
            { to: '/biblioteca', label: 'Biblioteca', icon: Library },
            { to: '/documentos', label: 'Documentos', icon: FileText },
          ],
        },
        {
          title: 'Oportunidades',
          items: [
            { to: '/empresas', label: 'Empresas', icon: Building2 },
            { to: '/ofertas', label: 'Bolsa de empleo', icon: BriefcaseBusiness, badge: 2 },
          ],
        },
        {
          title: 'Eventos',
          items: [
            { to: '/eventos', label: 'Eventos', icon: PartyPopper },
          ],
        },
        {
          title: 'Cuenta',
          items: [
            { to: '/perfil', label: 'Mi perfil', icon: CircleUserRound },
            { to: '/notificaciones', label: 'Notificaciones', icon: Bell, badge: 4 },
          ],
        },
      ];
  }
};
