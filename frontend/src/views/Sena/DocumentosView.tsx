import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';
import type { DocumentoPersonal } from '../../services/aprendizServiciosService';

const EASE = [0.22, 1, 0.36, 1] as const;

const TIPO_CHIP: Record<string, string> = {
  academico: 'bg-mint-100 text-mint-700',
  institucional: 'bg-violet-100 text-violet-700',
  certificacion: 'bg-amber-100 text-amber-700',
};

const TIPO_LABEL: Record<string, string> = {
  academico: 'Académico',
  institucional: 'Institucional',
  certificacion: 'Certificación',
};

export const DocumentosView = () => {
  const [items, setItems] = useState<DocumentoPersonal[]>([]);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('academico');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const data = await aprendizServiciosService.misDocumentos();
    setItems(data);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async () => {
    if (!titulo.trim()) return;
    setEnviando(true);
    try {
      await aprendizServiciosService.crearDocumento({
        titulo: titulo.trim(),
        tipo,
      });
      setTitulo('');
      await cargar();
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (id: string) => {
    await aprendizServiciosService.eliminarDocumento(id);
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
          Servicios del aprendiz
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
          Documentos
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Tu bóveda personal de documentos académicos, institucionales y certificaciones.
        </p>
      </header>

      <section className="surface p-5">
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">Agregar documento</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre del documento"
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-900 outline-none transition focus:border-mint-400"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded-2xl border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none transition focus:border-mint-400"
          >
            <option value="academico">Académico</option>
            <option value="institucional">Institucional</option>
            <option value="certificacion">Certificación</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={crear}
            disabled={enviando || !titulo.trim()}
            className="btn-pill btn-pill-ink disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus size={15} /> Agregar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && (
          <div className="surface col-span-full p-6">
            <p className="text-sm font-semibold text-ink-400">Aún no tienes documentos.</p>
          </div>
        )}
        {items.map((d) => (
          <article key={d.id} className="surface flex items-start gap-3 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-mint-600">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink-900">{d.titulo}</p>
              {d.url && (
                <a
                  href={d.url}
                  className="mt-0.5 block truncate text-xs font-semibold text-mint-600 hover:underline"
                >
                  Ver archivo
                </a>
              )}
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${TIPO_CHIP[d.tipo] ?? 'bg-canvas-deep text-ink-500'}`}
              >
                {TIPO_LABEL[d.tipo] ?? d.tipo}
              </span>
            </div>
            <button
              onClick={() => eliminar(d.id)}
              className="shrink-0 text-ink-300 transition hover:text-red-500"
              aria-label="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </section>
    </motion.div>
  );
};
