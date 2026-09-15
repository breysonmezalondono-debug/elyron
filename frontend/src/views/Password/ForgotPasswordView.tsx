import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { passwordResetService } from '../../services/passwordResetService';

const EASE = [0.22, 1, 0.36, 1] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordView = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    if (!correo) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(correo)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await passwordResetService.solicitarRecuperacion(correo);
      setEnviado(true);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'No fue posible procesar la solicitud. Inténtalo de nuevo.');
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

        {enviado ? (
          <div className="mt-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint-500/15 text-mint-600">
              <ShieldCheck size={26} />
            </span>
            <h1 className="display mt-4 text-2xl text-ink-950">Revisa tu correo</h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink-500">
              Si existe una cuenta asociada a este correo, recibirás un enlace para
              restablecer tu contraseña.
            </p>
            <Link
              to="/login"
              className="btn-pill btn-pill-mint mt-6 w-full justify-center"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h1 className="display mt-3 text-3xl text-ink-950">Recuperar contraseña</h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink-500">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos
              instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-email"
                  className="text-xs font-extrabold uppercase tracking-wider text-ink-600 dark:text-ink-300"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    id="forgot-email"
                    type="email"
                    className="input pl-11"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

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
                    <Loader2 size={16} className="animate-spin" /> Enviando…
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </>
        )}
      </section>
    </motion.main>
  );
};
