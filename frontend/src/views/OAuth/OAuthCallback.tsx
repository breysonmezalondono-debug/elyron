import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react';
import { setToken, clearToken } from '../../api';
import decodeJwt from '../../utils/jwt';
import { isTokenExpired } from '../../utils/jwt';
import { distinctRoleSessions, portalHomeForRole } from '../../model/permissions';
import { useAuth } from '../../context/useAuth';
import { AuthShell } from '../../components/elyron/AuthShell';
import { OAUTH_LABEL, OAuthProvider } from '../../services/oauthService';

const EASE = [0.22, 1, 0.36, 1] as const;

const leerParametros = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
};

export const OAuthCallback = () => {
  const { isAuthenticated, activeRole } = useAuth();
  const [mensaje, setMensaje] = useState<{
    tipo: 'ok' | 'error' | 'info';
    texto: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) return;
    const params = leerParametros();
    const error = params.error;

    if (error) {
      const providerLabel = OAUTH_LABEL[params.provider as OAuthProvider] ?? 'el proveedor';
      if (error === 'NO_ACCOUNT') {
        setMensaje({
          tipo: 'info',
          texto:
            params.message ||
            `No existe una cuenta de Elyron asociada a ${params.email}. Regístrate para continuar.`,
          email: params.email,
        });
      } else {
        setMensaje({
          tipo: 'error',
          texto:
            params.message ||
            `No se pudo iniciar sesión con ${providerLabel}. Intenta de nuevo.`,
        });
      }
      return;
    }

    const token = params.accessToken;
    if (!token) {
      setMensaje({ tipo: 'error', texto: 'La respuesta de inicio de sesión no es válida.' });
      return;
    }
    if (isTokenExpired(token)) {
      setMensaje({ tipo: 'error', texto: 'La sesión expiró. Inicia sesión nuevamente.' });
      return;
    }

    clearToken();
    setToken(token);
    const decoded = decodeJwt(token);
    const sessions = distinctRoleSessions(decoded?.memberships);
    const unico = sessions.length === 1 ? sessions[0].roleKey : null;
    const destino = decoded ? portalHomeForRole(unico ?? decoded.role) : '/login';
    setMensaje({ tipo: 'ok', texto: 'Sesión iniciada correctamente.' });
    window.location.assign(destino);
  }, [isAuthenticated]);

  if (isAuthenticated && activeRole) {
    return <Navigate to={portalHomeForRole(activeRole)} replace />;
  }

  return (
    <AuthShell
      eyebrow="Inicio de sesión"
      title="Conectando tu cuenta"
      subtitle="Estamos verificando tu identidad con el proveedor seleccionado."
    >
      <AnimatePresence mode="wait" initial={false}>
        {!mensaje ? (
          <motion.div
            key="cargando"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <span className="size-10 animate-spin rounded-full border-[3px] border-mint-500 border-t-transparent" />
            <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
              Verificando e iniciando tu sesión…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                mensaje.tipo === 'ok'
                  ? 'border-mint-200 bg-mint-50 text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-400'
                  : mensaje.tipo === 'info'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400'
                    : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
              }`}
            >
              {mensaje.tipo === 'ok' ? (
                <BadgeCheck size={18} className="shrink-0" />
              ) : mensaje.tipo === 'info' ? (
                <ShieldCheck size={18} className="shrink-0" />
              ) : (
                <AlertTriangle size={18} className="shrink-0" />
              )}
              <p className="text-sm font-bold">{mensaje.texto}</p>
            </div>

            {mensaje.tipo === 'info' && (
              <Link
                to={`/register${
                  mensaje.email ? `?email=${encodeURIComponent(mensaje.email)}` : ''
                }`}
                className="btn-pill btn-pill-mint w-full justify-center"
              >
                Crear mi cuenta de Elyron
                <ArrowRight size={16} />
              </Link>
            )}
            {mensaje.tipo === 'error' && (
              <Link to="/login" className="btn-pill btn-pill-mint w-full justify-center">
                Volver a iniciar sesión
              </Link>
            )}
            {mensaje.tipo === 'info' && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
              >
                Ya tengo cuenta · Iniciar sesión
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
};