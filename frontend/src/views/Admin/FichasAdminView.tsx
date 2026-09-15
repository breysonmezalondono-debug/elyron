import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  Search,
  Users,
  UsersRound,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type {
  EstudianteFicha,
  FichaAdmin,
} from '../../services/adminService';

const EASE = [0.22, 1, 0.36, 1] as const;

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: 'Activa', cls: 'bg-mint-50 text-mint-700' },
  inactiva: { label: 'Inactiva', cls: 'bg-amber-50 text-amber-600' },
  egresado: { label: 'Egresada', cls: 'bg-violet-50 text-violet-600' },
};

const fechaLocal = (fecha?: string | Date | null): string => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
};

export const FichasAdminView = () => {
  const [fichas, setFichas] = useState<FichaAdmin[] | null>(null);
  const [query, setQuery] = useState('');
  const [abierta, setAbierta] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Record<string, EstudianteFicha[]>>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await adminService.listarFichas();
      setFichas(data);
    } catch {
      setError('No se pudieron cargar las fichas. Verifica tu sesión.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const filtradas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!fichas) return [];
    if (!normalized) return fichas;
    return fichas.filter(
      (f) =>
        f.code.toLowerCase().includes(normalized) ||
        f.name.toLowerCase().includes(normalized) ||
        (f.programa?.name ?? '').toLowerCase().includes(normalized),
    );
  }, [fichas, query]);

  const toggleFicha = async (fichaId: string) => {
    if (abierta === fichaId) {
      setAbierta(null);
      return;
    }
    setAbierta(fichaId);
    if (!estudiantes[fichaId]) {
      try {
        const lista = await adminService.listarEstudiantesDeFicha(fichaId);
        setEstudiantes((prev) => ({ ...prev, [fichaId]: lista }));
      } catch {
        setEstudiantes((prev) => ({ ...prev, [fichaId]: [] }));
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
          <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
            Fichas y estudiantes
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            {fichas ? `${fichas.length} fichas registradas.` : 'Consultando el catálogo…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por ficha, programa…"
              className="input pl-10"
            />
          </div>
          <button type="button" onClick={() => void cargar()} className="btn-pill btn-pill-paper">
            Refrescar
          </button>
        </div>
      </motion.header>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {cargando && !fichas && (
        <p className="text-sm font-semibold text-ink-400">Cargando fichas…</p>
      )}

      {fichas && (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtradas.map((ficha) => (
              <motion.article
                key={ficha.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="surface overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => void toggleFicha(ficha.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-sm font-extrabold text-white">
                      {ficha.code.slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-extrabold tracking-tight text-ink-950">
                        {ficha.code} · {ficha.name}
                      </h2>
                      <p className="mt-0.5 truncate text-xs font-medium text-ink-400">
                        {ficha.programa?.name ?? 'Sin programa'}
                        {ficha.tipoPrograma ? ` · ${ficha.tipoPrograma}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-deep px-3 py-1 text-[11px] font-bold text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                      <CalendarDays size={12} />
                      {fechaLocal(ficha.startDate)} → {fechaLocal(ficha.endDate)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${STATUS_LABEL[ficha.status]?.cls ?? 'bg-canvas-deep text-ink-600'}`}>
                      {STATUS_LABEL[ficha.status]?.label ?? ficha.status}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-300 ${abierta === ficha.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {abierta === ficha.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="border-t border-line/70"
                  >
                    <div className="px-5 py-4">
                      {estudiantes[ficha.id] === undefined ? (
                        <p className="text-xs font-semibold text-ink-400">Cargando estudiantes…</p>
                      ) : estudiantes[ficha.id].length === 0 ? (
                        <div className="flex items-center gap-2.5 text-xs font-medium text-ink-400">
                          <Users size={14} className="text-ink-300" />
                          Esta ficha aún no tiene estudiantes registrados.
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {estudiantes[ficha.id].map((est) => (
                            <li key={est.id} className="flex items-center gap-3 rounded-xl border border-line bg-canvas-deep/40 px-3.5 py-2.5 dark:border-ink-700 dark:bg-ink-900/40">
                              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-100 text-[10px] font-extrabold text-mint-700">
                                {`${est.firstName[0] ?? ''}${est.lastName[0] ?? ''}`.toUpperCase()}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-900 dark:text-white">
                                {`${est.firstName} ${est.lastName}`.trim()}
                              </span>
                              <span className="truncate text-[11px] font-medium text-ink-400">{est.email}</span>
                              {est.esVocero && (
                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-violet-600">Líder</span>
                              )}
                              {est.esVoceroSuplente && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600">Colíder</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {fichas && filtradas.length === 0 && (
        <section className="surface flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-[20px] bg-violet-50 text-violet-600 shadow-lift">
            <UsersRound size={26} />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">Sin resultados</h2>
            <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              Ninguna ficha coincide con la búsqueda.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};