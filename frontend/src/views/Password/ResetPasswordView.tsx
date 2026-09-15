import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { passwordResetService } from '../../services/passwordResetService';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Requisito {
  label: string;
  test: (v: string) => boolean;
}

const REQUISITOS: Requisito[] = [
  { label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
  { label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { label: 'Un número', test: (v) => /\d/.test(v) },
  { label: 'Un carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

type Estado = 'cargando' | 'valido' | 'invalido' | 'expirado' | 'completado';

export const ResetPasswordView = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [estado, setEstado] = useState<Estado>('cargando');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('invalido');
      return;
    }
    let activo = true;
    passwordResetService
      .validarToken(token)
      .then((res) => {
        if (!activo) return;
        if (res.valido) setEstado('valido');
        else if (res.mensaje?.toLowerCase().includes('expirado')) setEstado('expirado');
        else setEstado('invalido');
      })
      .catch((err) => {
        if (!activo) return;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
        if (msg?.toLowerCase().includes('expirado')) setEstado('expirado');
        else setEstado('invalido');
      });
    return () => {
      activo = false;
    };
  }, [token]);

  const coinciden = password === confirm && password.length > 0;
  const cumpleRequisitos = REQUISITOS.every((r) => r.test(password));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coinciden) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!cumpleRequisitos) {
      setError('La contraseña no cumple los requisitos de seguridad.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await passwordResetService.restablecerPassword(token, password);
      setEstado('completado');
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'No fue posible cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12"
    >
      <section className="surface w-full max-w-md p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-mint-600">
          Elyron
        </p>

        {estado === 'cargando' && (
          <div className="flex flex-col items-center py-12">
            <Loader2 size={26} className="animate-spin text-mint-600" />
            <p className="mt-4 text-sm font-semibold text-ink-500">Validando enlace…</p>
          </div>
        )}

        {estado === 'invalido' && (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={26} />
            </span>
            <h1 className="display mt-4 text-2xl text-ink-950">Este enlace ya no es válido.</h1>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Solicita un nuevo enlace de recuperación para continuar.
            </p>
            <Link to="/forgot-password" className="btn-pill btn-pill-mint mt-6 w-full justify-center">
              Solicitar un nuevo enlace
            </Link>
          </div>
        )}

        {estado === 'expirado' && (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle size={26} />
            </span>
            <h1 className="display mt-4 text-2xl text-ink-950">
              Este enlace de recuperación ha expirado.
            </h1>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Solicita un nuevo enlace para restablecer tu contraseña.
            </p>
            <Link to="/forgot-password" className="btn-pill btn-pill-mint mt-6 w-full justify-center">
              Solicitar un nuevo enlace
            </Link>
          </div>
        )}

        {estado === 'completado' && (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint-500/15 text-mint-600">
              <ShieldCheck size={26} />
            </span>
            <h1 className="display mt-4 text-2xl text-ink-950">Contraseña actualizada</h1>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.
            </p>
            <Link to="/login" className="btn-pill btn-pill-mint mt-6 w-full justify-center">
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        {estado === 'valido' && (
          <>
            <h1 className="display mt-3 text-3xl text-ink-950">Crear nueva contraseña</h1>
            <p className="mt-2 text-sm font-medium text-ink-500">
              Elige una contraseña segura para tu cuenta.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-xs font-extrabold uppercase tracking-wider text-ink-600 dark:text-ink-300"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {REQUISITOS.map((r) => {
                    const ok = r.test(password);
                    return (
                      <p
                        key={r.label}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                          ok ? 'text-mint-600' : 'text-ink-400'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} className={ok ? '' : 'opacity-30'} />
                        {r.label}
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-extrabold uppercase tracking-wider text-ink-600 dark:text-ink-300"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-11"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {confirm.length > 0 && (
                  <p
                    className={`text-[11px] font-semibold ${
                      coinciden ? 'text-mint-600' : 'text-red-500'
                    }`}
                  >
                    {coinciden ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`grid size-5 place-items-center rounded-md border-2 transition-all ${
                    showPassword ? 'border-mint-500 bg-mint-500' : 'border-line-strong'
                  }`}
                >
                  {showPassword && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>
                <span className="text-xs font-bold text-ink-600 dark:text-ink-300">
                  Mostrar contraseña
                </span>
              </label>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-pill btn-pill-mint w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Cambiando…
                  </>
                ) : (
                  'Cambiar contraseña'
                )}
              </button>
            </form>
          </>
        )}
      </section>
    </motion.main>
  );
};
