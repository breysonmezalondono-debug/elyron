import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Send, Trash2 } from 'lucide-react';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';
import type { Solicitud } from '../../services/aprendizServiciosService';

const EASE = [0.22, 1, 0.36, 1] as const;

const EstadoPill: Record<string, string> = {
  abierta: 'bg-amber-100 text-amber-700',
  en_proceso: 'bg-violet-100 text-violet-700',
  resuelta: 'bg-mint-100 text-mint-700',
};

const EstadoLabel: Record<string, string> = {
  abierta: 'Abierta',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
};

export const SolicitudesView = () => {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('general');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const data = await aprendizServiciosService.misSolicitudes();
    setItems(data);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async () => {
    if (!titulo.trim()) return;
    setEnviando(true);
    try {
      await aprendizServiciosService.crearSolicitud({
        titulo: titulo.trim(),
        tipo,
        descripcion: descripcion.trim() || undefined,
      });
      setTitulo('');
      setDescripcion('');
      await cargar();
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (id: string) => {
    await aprendizServiciosService.eliminarSolicitud(id);
    await cargar();
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
          Comunidad · Comunicación
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
          Solicitudes
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Gestiona y da seguimiento a las solicitudes que envías durante tu formación.
        </p>
      </header>

      <section className="surface p-5">
        <div className="flex items-center gap-2">
          <Send size={16} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">Nueva solicitud</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Asunto de la solicitud"
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-900 outline-none transition focus:border-mint-400"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none transition focus:border-mint-400"
          >
            <option value="general">General</option>
            <option value="academico">Académico</option>
            <option value="institucional">Institucional</option>
            <option value="bienestar">Bienestar</option>
          </select>
        </div>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalla tu solicitud (opcional)"
          rows={2}
          className="mt-3 w-full resize-none rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-900 outline-none transition focus:border-mint-400"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={crear}
            disabled={enviando || !titulo.trim()}
            className="btn-pill btn-pill-ink disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus size={15} /> Enviar solicitud
          </button>
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="text-base font-extrabold tracking-tight">Tus solicitudes</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm font-semibold text-ink-400">
            Aún no tienes solicitudes registradas.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {items.map((s) => (
              <li key={s.id} className="flex items-start gap-4 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-mint-600">
                  <Check size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-ink-900">{s.titulo}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${EstadoPill[s.estado] ?? 'bg-canvas-deep text-ink-500'}`}
                    >
                      {EstadoLabel[s.estado] ?? s.estado}
                    </span>
                  </div>
                  {s.descripcion && (
                    <p className="mt-0.5 text-xs font-semibold text-ink-500">{s.descripcion}</p>
                  )}
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    {s.tipo}
                  </p>
                </div>
                <button
                  onClick={() => eliminar(s.id)}
                  className="shrink-0 text-ink-300 transition hover:text-red-500"
                  aria-label="Eliminar"
                >
                  <Trash2 size={17} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
};
