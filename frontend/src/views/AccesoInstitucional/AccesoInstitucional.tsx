import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { AuthShell } from '../../components/elyron/AuthShell';
import { portalHomeForRole } from '../../model/permissions';

const EASE = [0.22, 1, 0.36, 1] as const;

const INSTITUCIONES = [
  { id: 'inst-sena', label: 'SENA' },
  { id: 'inst-colegio', label: 'Colegio' },
  { id: 'inst-aurora', label: 'Universidad' },
] as const;

export const AccesoInstitucional = () => {
  const [institutionId, setInstitutionId] = useState('inst-sena');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, activeRole, loginInstitucional } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={activeRole ? portalHomeForRole(activeRole) : '/seleccionar-rol'} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginInstitucional(email.trim(), password, { institutionId });
    } catch (err) {
      const msg =
        (isAxiosError(err) && err.response?.data?.message) ||
        (isAxiosError(err) &&
          Array.isArray(err.response?.data?.message) &&
          err.response?.data?.message[0]) ||
        (err instanceof Error && err.message) ||
        'No fue posible ingresar. Verifica tus datos o contacta al administrador.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Acceso institucional"
      title="Ingreso de personal"
      subtitle="Puerta reservada para el personal de las instituciones aliadas."
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Institución
          </label>
          <div className="flex gap-2">
            {INSTITUCIONES.map((inst) => (
              <button
                key={inst.id}
                type="button"
                onClick={() => setInstitutionId(inst.id)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-extrabold transition-all duration-300 ${
                  institutionId === inst.id
                    ? 'border-mint-500 bg-mint-50 text-mint-700 dark:border-mint-500/40 dark:bg-mint-500/10 dark:text-mint-400'
                    : 'border-line bg-white text-ink-600 hover:border-line-strong dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300'
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Correo institucional
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                id="email"
                type="email"
                className="input"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                style={{ paddingLeft: '2.75rem' }}
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

          {error && (
            <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-pill-ink w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar al panel'}
            {!loading && <ArrowRight size={16} />}
          </button>

          <p className="flex items-center justify-center gap-2 text-[11px] font-bold text-ink-400 dark:text-ink-500">
            <ShieldCheck size={12} />
            Las cuentas de personal las crea tu administrador o coordinador.
          </p>
        </form>
      </motion.div>
    </AuthShell>
  );
};