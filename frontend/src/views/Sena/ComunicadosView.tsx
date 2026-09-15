import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';
import type { Comunicado } from '../../services/aprendizServiciosService';
import { getToken } from '../../api';

const EASE = [0.22, 1, 0.36, 1] as const;

const PRIORIDAD_CHIP: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-mint-100 text-mint-700',
};

export const ComunicadosView = () => {
  const [items, setItems] = useState<Comunicado[]>([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [enviando, setEnviando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const data = await aprendizServiciosService.listarComunicados();
    setItems(data);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = token.split('.')[1];
        setUserId(JSON.parse(decodeURIComponent(escape(atob(payload)))).sub ?? null);
      } catch {
        setUserId(null);
      }
    }
    cargar();
  }, [cargar]);

  const crear = async () => {
    if (!titulo.trim() || !contenido.trim()) return;
    setEnviando(true);
    try {
      await aprendizServiciosService.crearComunicado({
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        prioridad,
      });
      setTitulo('');
      setContenido('');
      await cargar();
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (id: string) => {
    await aprendizServiciosService.eliminarComunicado(id);
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
          Comunicados
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Mensajes de tu ficha, programa y centro, ordenados por prioridad.
        </p>
      </header>

      <section className="surface p-5">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">Publicar comunicado</h2>
        </div>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del comunicado"
          className="mt-4 w-full rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-900 outline-none transition focus:border-mint-400"
        />
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Contenido del comunicado"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-900 outline-none transition focus:border-mint-400"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            className="rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none transition focus:border-mint-400"
          >
            <option value="alta">Alta prioridad</option>
            <option value="media">Prioridad media</option>
            <option value="baja">Baja prioridad</option>
          </select>
          <button
            onClick={crear}
            disabled={enviando || !titulo.trim() || !contenido.trim()}
            className="btn-pill btn-pill-ink disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus size={15} /> Publicar
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="surface p-6">
            <p className="text-sm font-semibold text-ink-400">
              Aún no hay comunicados publicados.
            </p>
          </div>
        ) : (
          items.map((c) => (
            <article key={c.id} className="surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${PRIORIDAD_CHIP[c.prioridad] ?? 'bg-canvas-deep text-ink-500'}`}
                >
                  {c.prioridad}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  {c.destinatario}
                </span>
                {c.autor && (
                  <span className="text-[10px] font-bold text-ink-400">
                    · {c.autor.firstName} {c.autor.lastName}
                  </span>
                )}
                {c.autorId === userId && (
                  <button
                    onClick={() => eliminar(c.id)}
                    className="ml-auto text-ink-300 transition hover:text-red-500"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <h3 className="mt-2 text-sm font-extrabold text-ink-900">{c.titulo}</h3>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-ink-600">
                {c.contenido}
              </p>
            </article>
          ))
        )}
      </section>
    </motion.div>
  );
};
