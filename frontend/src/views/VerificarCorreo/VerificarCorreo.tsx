import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, MailCheck, XCircle } from 'lucide-react';
import { authClient } from '../../api';
import { AuthShell } from '../../components/elyron/AuthShell';
import { AUTH_ROUTES } from '../../services/config';

const EASE = [0.22, 1, 0.36, 1] as const;

export const VerificarCorreo = () => {
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email') ?? '';
    const token = params.get('token') ?? '';

    if (!email || !token) {
      setEstado('error');
      setMensaje('El enlace de verificación es inválido.');
      return;
    }

    authClient
      .post(AUTH_ROUTES.verifyEmail, { email, token })
      .then((res) => {
        setEstado('ok');
        setMensaje(
          res.data?.message || 'Tu correo fue verificado correctamente.',
        );
      })
      .catch((err) => {
        setEstado('error');
        const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
        setMensaje(
          typeof data?.message === 'string'
            ? data.message
            : Array.isArray(data?.message) && data.message.length
              ? String(data.message[0])
              : 'No se pudo verificar tu correo.',
        );
      });
  }, []);

  return (
    <AuthShell
      eyebrow="Verificación de correo"
      title="Confirmando tu identidad"
      subtitle="Estamos validando tu correo electrónico para activar tu cuenta."
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={estado}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="space-y-4"
        >
          {estado === 'cargando' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="size-10 animate-spin rounded-full border-[3px] border-mint-500 border-t-transparent" />
              <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
                Verificando tu correo…
              </p>
            </div>
          )}

          {estado === 'ok' && (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-mint-200 bg-mint-50 p-4 text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-400">
                <BadgeCheck size={18} className="shrink-0" />
                <p className="text-sm font-bold">{mensaje}</p>
              </div>
              <p className="flex items-center gap-2 rounded-2xl bg-canvas-deep/40 px-4 py-3 text-[11px] font-bold text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
                <MailCheck size={14} className="shrink-0 text-mint-500" />
                Ahora puedes iniciar sesión con tu correo y contraseña.
              </p>
              <Link to="/login" className="btn-pill btn-pill-mint w-full justify-center">
                Iniciar sesión
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {estado === 'error' && (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <XCircle size={18} className="shrink-0" />
                <p className="text-sm font-bold">{mensaje}</p>
              </div>
              <Link to="/login" className="btn-pill btn-pill-ink w-full justify-center">
                Volver a iniciar sesión
              </Link>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
};