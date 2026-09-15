import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  MessageSquareText,
  Plus,
  Send,
  Trash2,
  UsersRound,
  Crown,
  CheckCircle2,
  Clock,
  RotateCcw,
  CalendarCheck,
} from 'lucide-react';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';
import type {
  FichaAnuncio,
  Inquietud,
  Representacion,
} from '../../services/aprendizServiciosService';
import { aprendizService } from '../../services/aprendizService';
import type { MiFicha } from '../../services/aprendizService';
import { AsistenciaPanelWrap } from '../../components/elyron/AsistenciaPlanilla';
import { getToken } from '../../api';

const EASE = [0.22, 1, 0.36, 1] as const;

const PRIORIDAD_CHIP: Record<string, string> = {
  alta: 'bg-red-50 text-red-600 ring-red-200',
  media: 'bg-amber-50 text-amber-700 ring-amber-200',
  baja: 'bg-canvas-deep text-ink-500 ring-line',
};

const PRIORIDAD_LABEL: Record<string, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const CATEGORIA_LABEL: Record<string, string> = {
  anuncio: 'Anuncio',
  actividad: 'Actividad',
  convocatoria: 'Convocatoria',
  acta: 'Acta',
};

const INQ_ESTADO: Record<
  Inquietud['estado'],
  { label: string; chip: string; icon: typeof Clock }
> = {
  abierta: { label: 'Abierta', chip: 'bg-red-50 text-red-600 ring-red-200', icon: Clock },
  en_gestion: { label: 'En gestión', chip: 'bg-amber-50 text-amber-700 ring-amber-200', icon: RotateCcw },
  resuelta: { label: 'Resuelta', chip: 'bg-mint-50 text-mint-700 ring-mint-200', icon: CheckCircle2 },
};

const INQ_CATEGORIA_LABEL: Record<string, string> = {
  academica: 'Académica',
  bienestar: 'Bienestar',
  instalaciones: 'Instalaciones',
  general: 'General',
};

const parseUserId = (): string | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(decodeURIComponent(escape(atob(payload))));
    return decoded.sub || decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
};

function AnuncioComposer({
  onCreate,
}: {
  onCreate: (dto: {
    titulo: string;
    contenido: string;
    prioridad: string;
    categoria: string;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [categoria, setCategoria] = useState('anuncio');
  const [enviando, setEnviando] = useState(false);

  const canSubmit = titulo.trim().length > 2 && contenido.trim().length > 3;

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || enviando) return;
    setEnviando(true);
    try {
      await onCreate({ titulo: titulo.trim(), contenido: contenido.trim(), prioridad, categoria });
      setTitulo('');
      setContenido('');
      setPrioridad('media');
      setCategoria('anuncio');
      setOpen(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-canvas-deep/50 ring-1 ring-line">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-mint-600 shadow-soft">
            <Plus size={16} strokeWidth={3} />
          </span>
          <span className="text-sm font-bold text-ink-500">
            Publicar un anuncio para tu ficha…
          </span>
        </button>
      ) : (
        <form onSubmit={handle} className="p-4 space-y-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del anuncio *"
            className="input"
            required
          />
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Mensaje para los aprendices de tu ficha *"
            className="input min-h-24 resize-y"
            required
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="input h-10 w-auto"
            >
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
              <option value="baja">Prioridad baja</option>
            </select>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="input h-10 w-auto"
            >
              <option value="anuncio">Anuncio</option>
              <option value="actividad">Actividad</option>
              <option value="convocatoria">Convocatoria</option>
              <option value="acta">Acta</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-pill btn-pill-paper btn-pill-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || enviando}
              className="btn-pill btn-pill-mint btn-pill-sm justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} />
              {enviando ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function InquietudComposer({
  onCreate,
}: {
  onCreate: (dto: { titulo: string; descripcion: string; categoria: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('general');
  const [enviando, setEnviando] = useState(false);

  const canSubmit = titulo.trim().length > 2 && descripcion.trim().length > 3;

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || enviando) return;
    setEnviando(true);
    try {
      await onCreate({ titulo: titulo.trim(), descripcion: descripcion.trim(), categoria });
      setTitulo('');
      setDescripcion('');
      setCategoria('general');
      setOpen(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-canvas-deep/50 ring-1 ring-line">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-violet-600 shadow-soft">
            <Plus size={16} strokeWidth={3} />
          </span>
          <span className="text-sm font-bold text-ink-500">
            Levantar una inquietud de la ficha…
          </span>
        </button>
      ) : (
        <form onSubmit={handle} className="p-4 space-y-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título de la inquietud *"
            className="input"
            required
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿Qué necesita la ficha? *"
            className="input min-h-24 resize-y"
            required
          />
          <div className="flex items-end justify-between gap-3">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="input h-10 w-auto"
            >
              <option value="general">General</option>
              <option value="academica">Académica</option>
              <option value="bienestar">Bienestar</option>
              <option value="instalaciones">Instalaciones</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-pill btn-pill-paper btn-pill-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit || enviando}
                className="btn-pill btn-pill-ink btn-pill-sm justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                {enviando ? 'Guardando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export const LiderazgoCentro = ({
  rol,
  tieneRol = false,
}: {
  rol: 'vocera' | 'colider';
  tieneRol?: boolean;
}) => {
  const [rep, setRep] = useState<Representacion | null>(null);
  const [ficha, setFicha] = useState<MiFicha | null>(null);
  const [anuncios, setAnuncios] = useState<FichaAnuncio[]>([]);
  const [inquietudes, setInquietudes] = useState<Inquietud[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    const [r, f, a, q] = await Promise.all([
      aprendizServiciosService.miRepresentacion(),
      aprendizService.miFicha(),
      aprendizServiciosService.anunciosDeFicha(),
      aprendizServiciosService.inquietudesDeFicha(),
    ]);
    setRep(r);
    setFicha(f);
    setAnuncios(a);
    setInquietudes(q);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const userId = parseUserId();
  const miembroFicha = ficha?.aprendices?.find(
    (a) => a.id === userId || a.email === userId,
  );
  const gestionaPorRolEnFicha =
    rol === 'vocera'
      ? Boolean(miembroFicha?.esVocero)
      : Boolean(miembroFicha?.esVoceroSuplente);
  const puedoGestionar =
    tieneRol ||
    Boolean(rep?.esVocero) ||
    Boolean(rep?.esVoceroSuplente) ||
    gestionaPorRolEnFicha;

  const representantes = ficha?.aprendices?.filter(
    (a) => a.esVocero || a.esVoceroSuplente,
  );

  const crearAnuncio = async (dto: {
    titulo: string;
    contenido: string;
    prioridad: string;
    categoria: string;
  }) => {
    const nuevo = await aprendizServiciosService.crearAnuncio(dto);
    setAnuncios((prev) => [nuevo, ...prev]);
  };

  const borrarAnuncio = async (id: string) => {
    await aprendizServiciosService.eliminarAnuncio(id);
    setAnuncios((prev) => prev.filter((a) => a.id !== id));
  };

  const crearInquietud = async (dto: {
    titulo: string;
    descripcion: string;
    categoria: string;
  }) => {
    const nuevo = await aprendizServiciosService.crearInquietud(dto);
    setInquietudes((prev) => [nuevo, ...prev]);
  };

  const cambiarEstado = async (id: string, estado: string) => {
    const actualizado = await aprendizServiciosService.actualizarEstadoInquietud(id, estado);
    setInquietudes((prev) => prev.map((q) => (q.id === id ? actualizado : q)));
  };

  const esVocal = rol === 'vocera';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Comunidad · Representación
          </p>
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
            {esVocal ? (
              <>
                Líder de la <span className="italic text-amber-500">ficha</span>
              </>
            ) : (
              <>
                Colíder de la <span className="italic text-violet-500">ficha</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
            {esVocal
              ? 'Eres el líder de tu ficha: comunicas, representas y das seguimiento a lo que necesita tu grupo.'
              : 'Acompañas al líder: difundes anuncios, recoges inquietudes y representas a tu ficha cuando el líder no está.'}
          </p>
        </div>
        <div
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider ring-1 ${
            esVocal
              ? 'bg-amber-50 text-amber-700 ring-amber-200'
              : 'bg-violet-50 text-violet-700 ring-violet-200'
          }`}
        >
          <Crown size={14} />
          {rol === 'colider' ? 'Colíder' : 'Líder'}
        </div>
      </header>

      {loading ? (
        <div className="surface flex items-center justify-center py-16 text-sm font-semibold text-ink-400">
          Cargando tu centro de representación…
        </div>
      ) : (
        <>
          <section className="surface p-5">
            <div className="flex items-center gap-2">
              <UsersRound size={16} className="text-mint-600" />
              <h2 className="text-sm font-extrabold tracking-tight">Equipo de representación de tu ficha</h2>
            </div>
            {representantes && representantes.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {representantes.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${
                      r.esVocero
                        ? 'bg-amber-50/60 ring-amber-200'
                        : 'bg-violet-50/60 ring-violet-200'
                    }`}
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full ${
                        r.esVocero ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      <Crown size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-ink-900">{`${r.firstName} ${r.lastName}`}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        {r.esVocero ? 'Líder' : 'Colíder'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink-400">
                Tu ficha aún no tiene representación asignada.
              </p>
            )}
          </section>

          {(esVocal || rol === 'colider') && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-mint-600" />
                <h2 className="text-sm font-extrabold tracking-tight">Asistencia de la ficha</h2>
                <span className="ml-auto text-[11px] font-bold text-ink-400">
                  {rol === 'colider'
                    ? 'Solo lectura · el líder es quien la modifica.'
                    : 'Como en Excel: marca quien vino, quien pidió permiso y quien faltó.'}
                </span>
              </div>
              <AsistenciaPanelWrap grupoId="g-2451310" soloLectura={rol === 'colider'} />
            </section>
          )}

          {esVocal && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-amber-500" />
                <h2 className="text-sm font-extrabold tracking-tight">Comunícate con tu ficha</h2>
                <span className="ml-auto rounded-full bg-canvas-deep px-2.5 py-0.5 text-[11px] font-bold text-ink-400">
                  {anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''}
                </span>
              </div>
              {puedoGestionar && <AnuncioComposer onCreate={crearAnuncio} />}
              {anuncios.length === 0 ? (
                <div className="surface py-10 text-center text-sm font-semibold text-ink-400">
                  Sin anuncios todavía. Publica el primero.
                </div>
              ) : (
                <ul className="space-y-3">
                  {anuncios.map((a) => (
                    <li key={a.id} className="surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${PRIORIDAD_CHIP[a.prioridad]}`}
                          >
                            {PRIORIDAD_LABEL[a.prioridad]}
                          </span>
                          <span className="rounded-full bg-canvas-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 ring-1 ring-line">
                            {CATEGORIA_LABEL[a.categoria] ?? a.categoria}
                          </span>
                        </div>
                        {puedoGestionar && a.autorId === userId && (
                          <button
                            type="button"
                            aria-label="Eliminar anuncio"
                            onClick={() => borrarAnuncio(a.id)}
                            className="grid size-8 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-extrabold text-ink-900">{a.titulo}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{a.contenido}</p>
                      <p className="mt-2 text-[11px] font-bold text-ink-400">
                        {a.autor
                          ? `${a.autor.firstName} ${a.autor.lastName} · `
                          : ''}
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquareText size={16} className="text-violet-500" />
                <h2 className="text-sm font-extrabold tracking-tight">Inquietudes de representación</h2>
                <span className="ml-auto rounded-full bg-canvas-deep px-2.5 py-0.5 text-[11px] font-bold text-ink-400">
                  {inquietudes.length}
                </span>
              </div>
              {puedoGestionar && <InquietudComposer onCreate={crearInquietud} />}
              {inquietudes.length === 0 ? (
                <div className="surface py-10 text-center text-sm font-semibold text-ink-400">
                  Sin inquietudes levantadas.
                </div>
              ) : (
                <ul className="space-y-3">
                  {inquietudes.map((q) => {
                    const meta = INQ_ESTADO[q.estado];
                    const Icon = meta.icon;
                    return (
                      <li key={q.id} className="surface p-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-canvas-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 ring-1 ring-line">
                            {INQ_CATEGORIA_LABEL[q.categoria] ?? q.categoria}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${meta.chip}`}
                          >
                            <Icon size={11} />
                            {meta.label}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-extrabold text-ink-900">{q.titulo}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{q.descripcion}</p>
                        {puedoGestionar && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => cambiarEstado(q.id, 'en_gestion')}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-line transition ${
                                q.estado === 'en_gestion'
                                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                  : 'text-ink-500 hover:bg-canvas-deep'
                              }`}
                            >
                              En gestión
                            </button>
                            <button
                              type="button"
                              onClick={() => cambiarEstado(q.id, 'resuelta')}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-line transition ${
                                q.estado === 'resuelta'
                                  ? 'bg-mint-50 text-mint-700 ring-mint-200'
                                  : 'text-ink-500 hover:bg-canvas-deep'
                              }`}
                            >
                              Resuelta
                            </button>
                            <button
                              type="button"
                              onClick={() => cambiarEstado(q.id, 'abierta')}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-line transition ${
                                q.estado === 'abierta'
                                  ? 'bg-red-50 text-red-600 ring-red-200'
                                  : 'text-ink-500 hover:bg-canvas-deep'
                              }`}
                            >
                              Abierta
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
          )}
        </>
      )}
    </motion.div>
  );
};
