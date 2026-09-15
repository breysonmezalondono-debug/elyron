import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CircleUserRound,
  GraduationCap,
  Lock,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  User,
} from 'lucide-react';
import { perfilService } from '../../services/perfilService';
import type { PerfilSena } from '../../services/perfilService';
import { NIVEL_LABEL, ETAPA_LABEL } from '../../services/perfilService';
import { getToken } from '../../api';

const EASE = [0.22, 1, 0.36, 1] as const;

export const PerfilView = () => {
  const [perfil, setPerfil] = useState<PerfilSena | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirma, setPassConfirma] = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [mensajePass, setMensajePass] = useState('');

  const cargar = useCallback(async () => {
    const p = await perfilService.miPerfil();
    setPerfil(p);
    const token = getToken();
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(decodeURIComponent(escape(atob(payload))));
        setNombre(decoded.name ?? decoded.sub ?? '');
      } catch {
        setNombre('');
      }
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardarPersonales = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      await perfilService.actualizarDatosPersonales({
        phone: telefono || null,
      });
      setMensaje('Tus datos personales fueron actualizados.');
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'No fue posible actualizar tus datos.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const guardarPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMensajePass('');
    if (passNueva !== passConfirma) {
      setMensajePass('Las contraseñas no coinciden.');
      return;
    }
    setGuardandoPass(true);
    try {
      await perfilService.cambiarContrasena(passActual, passNueva);
      setMensajePass('Tu contraseña fue actualizada.');
      setPassActual('');
      setPassNueva('');
      setPassConfirma('');
    } catch (err) {
      setMensajePass(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'No fue posible cambiar la contraseña.',
      );
    } finally {
      setGuardandoPass(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-6"
    >
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
          Cuenta
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
          Mi perfil
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Tu información personal e institucional de formación.
        </p>
      </header>

      <section className="surface shadow-lift relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-mint-100 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-mint-100 text-2xl font-extrabold text-mint-700">
            {nombre[0]?.toUpperCase() || <CircleUserRound size={36} />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="display text-2xl text-ink-950 sm:text-3xl">{nombre || 'Usuario'}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-canvas-deep px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                <GraduationCap size={11} className="mr-1 inline" />
                {perfil ? NIVEL_LABEL[perfil.nivelFormacion ?? ''] ?? perfil.nivelFormacion : 'Tecnólogo'}
              </span>
              <span className="rounded-full bg-canvas-deep px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                {ETAPA_LABEL[perfil?.etapa ?? ''] ?? 'Etapa lectiva'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Formación (solo lectura; programa y ficha NO editables) */}
      <section className="surface p-6">
        <h2 className="text-sm font-extrabold tracking-tight">Formación</h2>
        <dl className="mt-4 space-y-4">
          {[
            { icon: GraduationCap, label: 'Programa', value: perfil?.programaFormacion },
            { icon: CalendarDays, label: 'Ficha', value: perfil?.numeroFicha },
            { icon: School, label: 'Centro de formación', value: perfil?.centroFormacion },
            { icon: MapPin, label: 'Regional', value: perfil?.regional },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-50 text-mint-600">
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                  {label}
                </dt>
                <dd className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                  {value || '—'}
                  {(label === 'Programa' || label === 'Ficha') && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-canvas-deep px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink-400">
                      <Lock size={9} /> No editable
                    </span>
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Datos personales editables */}
      <section className="surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
          <User size={15} className="text-mint-600" /> Información personal
        </h2>
        <form onSubmit={guardarPersonales} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
              Celular
            </label>
            <div className="relative">
              <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                className="input pl-10"
                placeholder="Número de celular"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 15))}
              />
            </div>
          </div>

          {mensaje && (
            <p className="rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-xs font-bold text-mint-700">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="btn-pill btn-pill-mint justify-center disabled:opacity-60"
          >
            {guardando ? 'Guardando…' : 'Guardar datos'}
          </button>
        </form>
      </section>

      {/* Seguridad: cambio de contraseña */}
      <section className="surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
          <ShieldCheck size={15} className="text-mint-600" /> Seguridad
        </h2>
        <form onSubmit={guardarPassword} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
              Contraseña actual
            </label>
            <input
              type="password"
              className="input"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="input"
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="input"
                value={passConfirma}
                onChange={(e) => setPassConfirma(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>

          {mensajePass && (
            <p
              className={`rounded-2xl px-4 py-3 text-xs font-bold ${
                mensajePass.includes('actualizada')
                  ? 'border border-mint-200 bg-mint-50 text-mint-700'
                  : 'border border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {mensajePass}
            </p>
          )}

          <button
            type="submit"
            disabled={guardandoPass}
            className="btn-pill btn-pill-ink justify-center disabled:opacity-60"
          >
            {guardandoPass ? 'Cambiando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>
    </motion.div>
  );
};
