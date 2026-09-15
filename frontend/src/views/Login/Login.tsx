import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { portalHomeForRole } from '../../model/permissions';
import { useTheme } from '../../theme/theme';
import { Elir } from '../../components/elyron/Elir';
import { DEMO_LOGINS, INSTITUTIONS } from '../../model/mock/orgData';
import { oauthService } from '../../services/oauthService';

const DEMO_INSTITUTIONS = INSTITUTIONS.filter((institution) => DEMO_LOGINS[institution.id]);

const INSTITUTION_TAB_LABEL: Record<string, string> = {
  'inst-sena': 'SENA',
  'inst-colegio': 'Colegio',
  'inst-aurora': 'Universidad',
};

/* ============================================================
   DIVULGACIÓN PROGRESIVA · Roles por institución
   El diccionario de roles se asocia a los correos mock existentes.
   Usa una contraseña genérica para el autocompletado.
   ============================================================ */
type InstitutionId = 'inst-sena' | 'inst-colegio' | 'inst-aurora';

interface RoleOption {
  key: string;
  label: string;
  email: string;
  password: string;
}

const DEMO_PASSWORD = 'Test123*';

const ROLE_OPTIONS: Record<InstitutionId, RoleOption[]> = {
  'inst-sena': [
    { key: 'aprendiz', label: 'Líder', email: 'vocero@elyron.com', password: DEMO_PASSWORD },
    { key: 'aprendiz', label: 'Colíder', email: 'colider@elyron.com', password: DEMO_PASSWORD },
  ],
  'inst-colegio': [
    { key: 'estudiante', label: 'Estudiante', email: 'estudiante@elyron.com', password: DEMO_PASSWORD },
    { key: 'estudiante', label: 'Personero', email: 'personero@elyron.com', password: DEMO_PASSWORD },
  ],
  'inst-aurora': [
    { key: 'universitario', label: 'Universitario', email: 'university@prueba.com', password: DEMO_PASSWORD },
  ],
};

const EASE = [0.22, 1, 0.36, 1] as const;

const ElyronLogo = () => (
  <div className="flex items-center gap-3.5">
    <div className="elyron-badge relative grid place-items-center">
      <span className="elyron-aura" aria-hidden="true" />
      <span className="elyron-comet" aria-hidden="true" />
      <span className="elyron-comet elyron-comet--b" aria-hidden="true" />
      <span className="elyron-spark-elir elyron-spark-elir--1" aria-hidden="true" />
      <span className="elyron-spark-elir elyron-spark-elir--2" aria-hidden="true" />
      <span className="elyron-spark-elir elyron-spark-elir--3" aria-hidden="true" />
      <Elir size={52} float={false} mood="happy" className="elyron-bob" />
    </div>
    <span className="elyron-wordmark display" aria-hidden>
      Elyron<span className="elyron-wordmark-dot">.</span>
    </span>
    <span className="sr-only">Elyron</span>
  </div>
);

const SocialButton = ({
  label,
  children,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Continuar con ${label}`}
    title={`Continuar con ${label}`}
    className="login-social-button flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-2.5 py-3 text-sm font-bold text-ink-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-mint-500 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-mint-400"
  >
    {loading ? (
      <span className="size-4 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
    ) : (
      children
    )}
    <span className="whitespace-nowrap">{loading ? 'Conectando…' : label}</span>
  </button>
);

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState<InstitutionId>('inst-sena');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [socialCargando, setSocialCargando] = useState<string | null>(null);
  const { login, isAuthenticated, activeRole } = useAuth();
  const { mode, resolved, setMode } = useTheme();
  const darkPanel = mode === 'dark';

  if (isAuthenticated) {
    return <Navigate to={activeRole ? portalHomeForRole(activeRole) : '/seleccionar-rol'} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password, { institutionId });
    } catch (err) {
      setError(
        (isAxiosError(err) && err.response?.data?.message) ||
          'No fue posible iniciar sesión. Verifica tus datos.',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectInstitution = (id: InstitutionId) => {
    if (id === institutionId) return;
    setInstitutionId(id);
    setSelectedRole(null);
  };

  const chooseRole = (role: RoleOption) => {
    setSelectedRole(role.email);
    setEmail(role.email);
    setPassword(role.password);
    setError('');
  };

  const iniciarSocial = async (provider: 'google' | 'github' | 'microsoft') => {
    if (socialCargando) return;
    setError('');
    setSocialCargando(provider);
    try {
      const url = await oauthService.iniciar(provider);
      window.location.assign(url);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ||
          'No se pudo iniciar sesión con el proveedor.',
      );
      setSocialCargando(null);
    }
  };

  return (
    <div className="login-page relative flex min-h-screen flex-col lg:flex-row">
      {/* Selector de modo — esquina superior derecha */}
      <div className="absolute right-4 top-4 z-20">
        <button
          type="button"
          onClick={() => setMode(darkPanel ? 'light' : 'dark')}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[color:var(--app-accent)] bg-white px-4 py-2 text-xs font-bold text-[color:var(--app-accent-deep)] transition-all duration-300 hover:bg-[color:var(--app-accent)] hover:text-[color:var(--app-accent-ink)] dark:border-[color:var(--app-accent-bright)] dark:bg-ink-900 dark:text-[color:var(--app-accent-bright)] dark:hover:bg-[color:var(--app-accent-bright)] dark:hover:text-[color:var(--app-accent-ink)]"
        >
          {darkPanel ? <Sun size={13} /> : <Moon size={13} />}
          {darkPanel ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
      {/* Panel de marca */}
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="login-brand-panel relative hidden w-[60%] flex-col justify-between overflow-hidden px-12 py-12 lg:flex"
        style={{
          backgroundImage: `url('/imagen/${resolved === 'dark' ? '2' : '1'}.png')`,
        }}
      >
        <div className="relative z-10">
          <ElyronLogo />
        </div>

        <div className="relative z-10 max-w-md">
          <span className="elyron-badge-pill inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-400/15 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-300 backdrop-blur-sm">
            <Sparkles size={12} className="elyron-spark" />
            Aprendizaje impulsado por IA
          </span>

          <h1 className="display mt-6 text-5xl font-bold leading-[1.02] text-ink-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] dark:text-white dark:drop-shadow-none">
            Aprende más.
            <span className="block italic text-sky-400 dark:text-sky-300">Llega más lejos.</span>
          </h1>

          <p className="mt-5 max-w-sm text-[15px] font-semibold leading-relaxed text-ink-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:text-slate-300 dark:drop-shadow-none">
            <span className="elyron-inline font-extrabold text-sky-400 dark:text-sky-300">Elyron</span> te
            acompaña con rutas personalizadas, tutor IA y herramientas para que aprendas mejor y construyas tu
            futuro.
          </p>
        </div>

        <p className="elyron-footer relative z-10 text-xs font-bold tracking-wide text-ink-950 dark:text-white">
          © 2026 <span className="text-sky-400 dark:text-sky-300">Elyron</span> · Aprendizaje que deja huella
        </p>
      </motion.aside>

      {/* Panel del formulario */}
      <motion.main
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="login-form-panel relative flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-8"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <ElyronLogo />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-mint-700 dark:bg-mint-500/10 dark:text-mint-600">
            <GraduationCap size={12} />
            Bienvenido de nuevo
          </span>

          <h2 className="display mt-3 text-4xl leading-tight text-slate-900 dark:text-white">
            Inicia sesión en <span className="text-mint-600 dark:text-mint-600">Elyron</span>
          </h2>

          <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-300">
            Accede a tu cuenta y continúa aprendiendo.
          </p>

          <div className="login-institution-tabs relative mt-6 flex gap-1.5 rounded-2xl bg-white p-1.5 dark:bg-black">
            {DEMO_INSTITUTIONS.map((institution) => {
              const isActive = institutionId === institution.id;
              return (
                <button
                  key={institution.id}
                  type="button"
                  onClick={() => selectInstitution(institution.id as InstitutionId)}
                  className="relative flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-extrabold transition-colors duration-300"
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeInstitution"
                      transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.9 }}
                      className="login-institution-active absolute inset-0 rounded-xl bg-white shadow-soft ring-2 ring-mint-500/30 dark:bg-black dark:ring-mint-400/30"
                    />
                  )}
                  <Zap
                    size={13}
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-mint-500' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {INSTITUTION_TAB_LABEL[institution.id] ?? institution.shortName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selector de rol (Divulgación Progresiva) */}
          <div className="mt-5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Elige tu rol
              </span>
              <span className="h-px flex-1 bg-line ml-4" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={institutionId}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex flex-wrap gap-1.5"
              >
                {(ROLE_OPTIONS[institutionId] ?? []).map((role, index) => {
                  const active = selectedRole === role.email;
                  return (
                    <motion.button
                      key={role.email}
                      type="button"
                      onClick={() => chooseRole(role)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.045, duration: 0.3, ease: EASE }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                        active
                          ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-900 scale-105 dark:bg-ink-950 dark:text-white dark:ring-ink-950'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-white'
                      }`}
                    >
                      {active && <Check size={11} strokeWidth={3} />}
                      {role.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
             <div className="login-field-group space-y-1.5">
              <label htmlFor="email" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Correo electrónico
              </label>
               <div className="login-field relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-2xl border border-line bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-ink-900 outline-none transition-all duration-300 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15 dark:bg-ink-900 dark:text-white dark:focus:border-mint-400"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

             <div className="login-field-group space-y-1.5">
              <label htmlFor="password" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
               <div className="login-field relative">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-2xl border border-line bg-white py-3.5 pl-11 pr-12 text-sm font-medium text-ink-900 outline-none transition-all duration-300 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15 dark:bg-ink-900 dark:text-white dark:focus:border-mint-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`grid size-5 place-items-center rounded-md border-2 transition-all duration-300 ${
                    rememberMe
                      ? 'border-mint-500 bg-mint-500'
                      : 'border-line-strong'
                  }`}
                >
                  <svg viewBox="0 0 12 12" width={11} height={11} fill="none" className="text-white transition-opacity duration-200">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: rememberMe ? 1 : 0 }}
                    />
                  </svg>
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Recordarme</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-mint-600 transition-colors hover:text-mint-700 dark:text-mint-600 dark:hover:text-mint-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? undefined : { transform: 'translateY(-2px)' }}
              whileTap={loading ? undefined : { transform: 'translateY(1px) scale(0.985)' }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="login-submit group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="login-submit-shine" aria-hidden="true" />
              <span className="relative z-10">
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
              </span>
              {!loading && <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
            </motion.button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">o continúa con</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex gap-2.5">
            <SocialButton
              label="Google"
              onClick={() => void iniciarSocial('google')}
              loading={socialCargando === 'google'}
              disabled={Boolean(socialCargando)}
            >
              <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
            </SocialButton>
            <SocialButton
              label="Microsoft"
              onClick={() => void iniciarSocial('microsoft')}
              loading={socialCargando === 'microsoft'}
              disabled={Boolean(socialCargando)}
            >
              <svg viewBox="0 0 23 23" width={15} height={15} aria-hidden>
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
              </svg>
            </SocialButton>
            <SocialButton
              label="GitHub"
              onClick={() => void iniciarSocial('github')}
              loading={socialCargando === 'github'}
              disabled={Boolean(socialCargando)}
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
            </SocialButton>
          </div>

          <p className="mt-6 text-center text-sm font-medium text-slate-500 dark:text-slate-300">
            ¿Eres aprendiz, estudiante o universitario?{' '}
            <Link
              to="/register"
              className="font-bold text-mint-600 transition-colors hover:text-mint-700 dark:text-mint-600 dark:hover:text-mint-500"
            >
              Crear cuenta
            </Link>
          </p>

          <div className="mt-5 rounded-2xl border border-line bg-slate-50 px-4 py-3 text-center dark:border-ink-700 dark:bg-ink-900/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
              ¿Eres personal, coordinador o administrador de tu institución?{' '}
              <Link
                to="/acceso-institucional"
                className="font-bold text-slate-900 underline-offset-2 transition-colors hover:text-mint-600 hover:underline dark:text-white dark:hover:text-mint-400"
              >
                Acceso institucional
              </Link>
            </p>
          </div>
        </div>
      </motion.main>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-5 flex items-center justify-center gap-2 pb-8 text-xs font-medium text-ink-400 lg:hidden"
      >
        <Shield size={13} className="text-ink-300" />
        Tus datos están protegidos con encriptación de extremo a extremo.
      </motion.p>
    </div>
  );
};
