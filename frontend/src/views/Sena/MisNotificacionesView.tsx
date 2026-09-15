import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, Megaphone, AlertTriangle, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt?: string;
}

const TYPE_ICON: Record<string, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  megaphone: Megaphone,
  calendar: CalendarDays,
};

const TYPE_TONE: Record<string, string> = {
  info: 'bg-mint-50 text-mint-600',
  warning: 'bg-amber-50 text-amber-600',
  megaphone: 'bg-violet-50 text-violet-600',
  calendar: 'bg-mint-50 text-mint-600',
};

export const MisNotificacionesView = () => {
  const [items, setItems] = useState<Notif[]>([]);

  const cargar = useCallback(async () => {
    const data = await aprendizServiciosService.listarNotificaciones();
    setItems(data as Notif[]);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const noLeidas = items.filter((n) => !n.isRead).length;

  const body = (n: Notif): React.ReactNode => {
    const Icon = TYPE_ICON[n.type] ?? Bell;
    const inner = (
      <div className="flex items-start gap-4 rounded-2xl bg-canvas-deep/40 p-4 transition hover:bg-canvas-deep/70">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ${TYPE_TONE[n.type] ?? 'bg-canvas text-ink-500'}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold text-ink-900">{n.title}</p>
            {!n.isRead && <span className="size-2 rounded-full bg-mint-500" />}
          </div>
          <p className="mt-0.5 text-xs font-semibold leading-relaxed text-ink-500">{n.message}</p>
        </div>
      </div>
    );
    return n.link ? <Link to={n.link}>{inner}</Link> : inner;
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
            Notificaciones
          </h1>
          {noLeidas > 0 && (
            <span className="rounded-full bg-mint-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-mint-700">
              {noLeidas} sin leer
            </span>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Alertas de formación, institucional, comunicación, apoyo, bienestar y calendario.
        </p>
      </header>

      <section className="surface p-4">
        <div className="flex items-center gap-2 px-2 pt-1">
          <Bell size={15} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">Todas tus notificaciones</h2>
        </div>
        {items.length === 0 ? (
          <p className="p-4 text-sm font-semibold text-ink-400">
            No tienes notificaciones.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">{items.map((n) => <li key={n.id}>{body(n)}</li>)}</ul>
        )}
      </section>
    </motion.div>
  );
};
