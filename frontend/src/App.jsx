import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import { portalHomeForRole } from './model/permissions';

import { Login } from './views/Login/Login';
import { Register } from './views/Register/Register';
import { ForgotPasswordView } from './views/Password/ForgotPasswordView';
import { ResetPasswordView } from './views/Password/ResetPasswordView';
import { OAuthCallback } from './views/OAuth/OAuthCallback';
import { VerificarCorreo } from './views/VerificarCorreo/VerificarCorreo';
import { AccesoInstitucional } from './views/AccesoInstitucional/AccesoInstitucional';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGate } from './router/guards/RoleGate';
import { CampusLayout } from './layouts/CampusLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PortalAwareLayout } from './layouts/PortalAwareLayout';
import { ElirLoader } from './components/elyron/ElirLoader';

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((mod) => ({ default: mod[exportName] })));

/* Auth */
const SeleccionarRolView = lazyNamed(() => import('./views/SeleccionRol/SeleccionRolView'), 'SeleccionRolView');

/* Campus: aprendizaje */
const ElyronDashboard = lazyNamed(() => import('./components/ElyronDashboard'), 'ElyronDashboard');
const LeccionesGateway = lazyNamed(() => import('./components/LeccionesGateway'), 'LeccionesGateway');
const ElyronOnboardingTutor = lazyNamed(() => import('./components/elyron/ElyronOnboardingTutor'), 'ElyronOnboardingTutor');
const AcademicoView = lazyNamed(() => import('./views/Academico/AcademicoView'), 'AcademicoView');
const EvidenciasView = lazyNamed(() => import('./views/Evidencias/EvidenciasView'), 'EvidenciasView');

/* Campus Sena */
const FichaView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'FichaView');
const VoceraView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'VoceraView');
const ColiderView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'ColiderView');
const ComunicadosView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'ComunicadosView');
const SolicitudesView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'SolicitudesView');
const ApoyoView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'ApoyoView');
const BibliotecaView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'BibliotecaView');
const DocumentosView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'DocumentosView');
const MisNotificacionesView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'MisNotificacionesView');
const PerfilView = lazyNamed(() => import('./views/Sena/SenaPlaceholderView'), 'PerfilView');

/* Comunidad (compartidos) */
const ComunidadView = lazyNamed(() => import('./views/Comunidad/ComunidadView'), 'ComunidadView');
const EmpresasView = lazyNamed(() => import('./views/Empresas/EmpresasView'), 'EmpresasView');
const OfertasView = lazyNamed(() => import('./views/Ofertas/OfertasView'), 'OfertasView');
const CalendarioView = lazyNamed(() => import('./views/Calendario/CalendarioView'), 'CalendarioView');
const EventosView = lazyNamed(() => import('./views/Eventos/EventosView'), 'EventosView');

/* Staff: Profesor (docente) e Instructor */
const ProfesorDashboard = lazyNamed(() => import('./views/Profesor/ProfesorDashboard'), 'ProfesorDashboard');
const GruposDocenteView = lazyNamed(() => import('./views/Profesor/GruposDocenteView'), 'GruposDocenteView');
const ActividadesDocenteView = lazyNamed(() => import('./views/Profesor/ActividadesDocenteView'), 'ActividadesDocenteView');
const CalificacionesDocenteView = lazyNamed(() => import('./views/Profesor/CalificacionesDocenteView'), 'CalificacionesDocenteView');
const AsistenciaDocenteView = lazyNamed(() => import('./views/Profesor/AsistenciaDocenteView'), 'AsistenciaDocenteView');

/* Staff: Admin */
const UsuariosAdminView = lazyNamed(() => import('./views/Admin/UsuariosAdminView'), 'UsuariosAdminView');
const InstitucionesAdminView = lazyNamed(() => import('./views/Admin/InstitucionesAdminView'), 'InstitucionesAdminView');
const FichasAdminView = lazyNamed(() => import('./views/Admin/FichasAdminView'), 'FichasAdminView');
const ProgramasAdminView = lazyNamed(() => import('./views/Admin/ProgramasAdminView'), 'ProgramasAdminView');
const ReportesAdminView = lazyNamed(() => import('./views/Admin/ReportesAdminView'), 'ReportesAdminView');
const AuditoriaAdminView = lazyNamed(() => import('./views/Admin/AuditoriaAdminView'), 'AuditoriaAdminView');
const ModeracionAdminView = lazyNamed(() => import('./views/Admin/ModeracionAdminView'), 'ModeracionAdminView');
const EmpresasAdminView = lazyNamed(() => import('./views/Admin/EmpresasAdminView'), 'EmpresasAdminView');

/* Staff: Coordinador */
const CoordinadorDashboard = lazyNamed(() => import('./views/Coordinador/CoordinadorDashboard'), 'CoordinadorDashboard');
const ReportesCoordinadorView = lazyNamed(() => import('./views/Coordinador/ReportesCoordinadorView'), 'ReportesCoordinadorView');
const GruposCoordinadorView = lazyNamed(() => import('./views/Coordinador/GruposCoordinadorView'), 'GruposCoordinadorView');
const ComunicadosCoordinadorView = lazyNamed(() => import('./views/Coordinador/ComunicadosCoordinadorView'), 'ComunicadosCoordinadorView');

/* Staff: Colegio (rector / orientador / convivencia) */
const ColegioPortal = lazyNamed(() => import('./views/Colegio/ColegioPortal'), 'ColegioPortal');

/* Portales home */
const CampusPortalHome = lazyNamed(() => import('./pages/campus/CampusPortalHome'), 'CampusPortalHome');
const AdminPortalHome = lazyNamed(() => import('./pages/admin/AdminPortalHome'), 'AdminPortalHome');

/* Roles permitidos en las rutas compartidas (comunidad). */
const SHARED_ROLES = [
  'aprendiz', 'universitario', 'estudiante',
  'instructor', 'docente', 'coordinador',
  'orientador', 'coordinador_convivencia', 'rector',
];

function App() {
  const { isAuthenticated, activeRole } = useAuth();

  return (
    <Suspense fallback={<ElirLoader />}>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? activeRole
                    ? portalHomeForRole(activeRole)
                    : '/seleccionar-rol'
                  : '/login'
              }
              replace
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/reset-password" element={<ResetPasswordView />} />
        <Route path="/acceso-institucional" element={<AccesoInstitucional />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/verificar-correo" element={<VerificarCorreo />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/seleccionar-rol" element={<SeleccionarRolView />} />
        </Route>

        {/* ============ PORTAL CAMPUS (estudiantes: aprendiz/estudiante/universitario) ============ */}
        <Route element={<RoleGate roles={['aprendiz', 'estudiante', 'universitario']} />}>
          <Route element={<CampusLayout />}>
            <Route path="/campus" element={<CampusPortalHome />} />
            <Route path="/dashboard" element={<ElyronDashboard />} />
            <Route path="/lecciones" element={<LeccionesGateway />} />
            <Route path="/academico" element={<AcademicoView />} />
            <Route path="/evidencias" element={<EvidenciasView />} />
            <Route path="/ficha" element={<FichaView />} />
            <Route element={<RoleGate roles={['aprendiz']} atributos={['es_vocero']} />}>
              <Route path="/vocera" element={<VoceraView />} />
            </Route>
            <Route element={<RoleGate roles={['aprendiz']} atributos={['es_vocero_suplente']} />}>
              <Route path="/colider" element={<ColiderView />} />
            </Route>
            <Route path="/comunicados" element={<ComunicadosView />} />
            <Route path="/solicitudes" element={<SolicitudesView />} />
            <Route path="/apoyo" element={<ApoyoView />} />
            <Route path="/biblioteca" element={<BibliotecaView />} />
            <Route path="/documentos" element={<DocumentosView />} />
            <Route path="/perfil" element={<PerfilView />} />
            <Route path="/notificaciones" element={<MisNotificacionesView />} />
          </Route>
          <Route path="/bienvenida" element={<ElyronOnboardingTutor />} />
        </Route>

        {/* ============ PORTAL INSTRUCTOR (SENA) — independiente ============ */}
        <Route element={<RoleGate roles={['instructor']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/instructor" element={<ProfesorDashboard />} />
            <Route path="/instructor/grupos" element={<GruposDocenteView />} />
            <Route path="/instructor/actividades" element={<ActividadesDocenteView />} />
            <Route path="/instructor/calificaciones" element={<CalificacionesDocenteView />} />
            <Route path="/instructor/asistencia" element={<AsistenciaDocenteView />} />
          </Route>
        </Route>

        {/* ============ PORTAL PROFESOR (docente) — independiente ============ */}
        <Route element={<RoleGate roles={['docente']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/profesor" element={<ProfesorDashboard />} />
            <Route path="/profesor/grupos" element={<GruposDocenteView />} />
            <Route path="/profesor/actividades" element={<ActividadesDocenteView />} />
            <Route path="/profesor/calificaciones" element={<CalificacionesDocenteView />} />
            <Route path="/profesor/asistencia" element={<AsistenciaDocenteView />} />
          </Route>
        </Route>

        {/* ============ PORTAL COORDINADOR — independiente ============ */}
        <Route element={<RoleGate roles={['coordinador']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/coordinador" element={<CoordinadorDashboard />} />
            <Route path="/coordinador/reportes" element={<ReportesCoordinadorView />} />
            <Route path="/coordinador/grupos" element={<GruposCoordinadorView />} />
            <Route path="/coordinador/comunicados" element={<ComunicadosCoordinadorView />} />
          </Route>
        </Route>

        {/* ============ PORTAL ADMIN — independiente ============ */}
        <Route element={<RoleGate roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPortalHome />} />
            <Route path="/admin/usuarios" element={<UsuariosAdminView />} />
            <Route path="/admin/instituciones" element={<InstitucionesAdminView />} />
            <Route path="/admin/fichas" element={<FichasAdminView />} />
            <Route path="/admin/programas" element={<ProgramasAdminView />} />
            <Route path="/admin/reportes" element={<ReportesAdminView />} />
            <Route path="/admin/auditoria" element={<AuditoriaAdminView />} />
            <Route path="/admin/moderacion" element={<ModeracionAdminView />} />
            <Route path="/admin/empresas" element={<EmpresasAdminView />} />
          </Route>
        </Route>

        {/* ============ PORTAL COLEGIO (rector / orientador / convivencia) ============ */}
        <Route element={<RoleGate roles={['rector', 'orientador', 'coordinador_convivencia']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/colegio" element={<ColegioPortal />} />
          </Route>
        </Route>

        {/* ============ RUTAS COMPARTIDAS (Comunidad / empleo) ============ */}
        <Route element={<RoleGate roles={SHARED_ROLES} />}>
          <Route element={<PortalAwareLayout />}>
            <Route path="/comunidad" element={<ComunidadView />} />
            <Route path="/eventos" element={<EventosView />} />
            <Route path="/calendario" element={<CalendarioView />} />
            <Route path="/empresas" element={<EmpresasView />} />
            <Route path="/ofertas" element={<OfertasView />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
