import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  Library,
  Plus,
  School,
  Trash2,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type {
  CrearInstitucionPayload,
  InstitucionCatalogo,
} from '../../services/adminService';

const EASE = [0.22, 1, 0.36, 1] as const;

const TIPOS = [
  { value: 'colegio', label: 'Colegio', icon: School, hint: 'Institución educativa básica y media.' },
  { value: 'universidad', label: 'Universidad', icon: Library, hint: 'Institución de educación superior.' },
  { value: 'sena', label: 'Sede SENA', icon: GraduationCap, hint: 'Regional con sus centros de formación y municipios.' },
] as const;

type TipoKey = (typeof TIPOS)[number]['value'];

const seccion = (tipo: TipoKey) =>
  TIPOS.find((t) => t.value === tipo)?.label ?? tipo;

const AgregarInstitucionModal = ({
  open,
  onClose,
  onCreada,
}: {
  open: boolean;
  onClose: () => void;
  onCreada: () => void;
}) => {
  const [tipo, setTipo] = useState<TipoKey>('colegio');
  const [nombre, setNombre] = useState('');
  const [regional, setRegional] = useState('');
  const [centros, setCentros] = useState('');
  const [municipios, setMunicipios] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setTipo('colegio');
    setNombre('');
    setRegional('');
    setCentros('');
    setMunicipios('');
    setError('');
  };

  const handleGuardar = async () => {
    setError('');
    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (tipo === 'sena' && !regional.trim()) {
      setError('Indica el nombre de la regional SENA.');
      return;
    }
    const payload: CrearInstitucionPayload = {
      nombre: tipo === 'sena' ? regional.trim() : nombre.trim(),
      tipo,
      detalles:
        tipo === 'sena'
          ? {
              regional: regional.trim(),
              centros: centros
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              municipios: municipios
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : undefined,
    };
    setLoading(true);
    try {
      await adminService.crearInstitucion(payload);
      reset();
      onCreada();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg) && msg.length
            ? String(msg[0])
            : 'No se pudo agregar la institución.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-lift ring-1 ring-line dark:bg-ink-900"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-6 py-4 dark:border-ink-700/70">
            <div>
              <h2 className="admin-heading text-lg text-ink-950 dark:text-white">Agregar institución</h2>
              <p className="mt-0.5 text-xs font-semibold text-ink-400">
                Colegios, universidades o sedes SENA. Aparecerán en los formularios de registro.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl p-2 text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Tipo de institución <span className="text-mint-600">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => {
                  const activo = tipo === t.value;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipo(t.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition-all duration-200 ${
                        activo
                          ? 'bg-ink-900 text-white ring-1 ring-ink-900'
                          : 'bg-white text-ink-500 ring-1 ring-line hover:bg-canvas-deep dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
                      }`}
                    >
                      <Icon size={13} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                {TIPOS.find((t) => t.value === tipo)?.hint}
              </p>
            </div>

            {tipo === 'sena' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Regional SENA <span className="text-mint-600">*</span>
                  </label>
                  <input type="text" className="input" value={regional} onChange={(e) => setRegional(e.target.value)} placeholder="Ej: Tolima" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Centros de formación
                  </label>
                  <input type="text" className="input" value={centros} onChange={(e) => setCentros(e.target.value)} placeholder="Centro A, Centro B (separados por coma)" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Municipios
                  </label>
                  <input type="text" className="input" value={municipios} onChange={(e) => setMunicipios(e.target.value)} placeholder="Ibagué, Espinal (separados por coma)" />
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Nombre <span className="text-mint-600">*</span>
                </label>
                <input type="text" className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={`Nombre del ${seccion(tipo).toLowerCase()}`} />
              </div>
            )}

            {error && (
              <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line/70 px-6 py-4 dark:border-ink-700/70">
            <button type="button" onClick={onClose} className="btn-pill btn-pill-paper">Cancelar</button>
            <button type="button" onClick={() => void handleGuardar()} disabled={loading} className="btn-pill btn-pill-mint disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Guardando…' : (
                <>
                  <Plus size={15} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const InstitucionesAdminView = () => {
  const [instituciones, setInstituciones] = useState<InstitucionCatalogo[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    setError('');
    try {
      setInstituciones(await adminService.listarInstituciones());
    } catch {
      setError('No se pudieron cargar las instituciones del catálogo.');
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const eliminar = async (id: string) => {
    if (!window.confirm) return;
    if (!confirm('¿Eliminar esta institución del catálogo?')) return;
    try {
      await adminService.eliminarInstitucion(id);
      setInstituciones((prev) => (prev ?? []).filter((i) => i.id !== id));
    } catch {
      setError('No se pudo eliminar la institución.');
    }
  };

  const agrupadas = (tipo: TipoKey) =>
    (instituciones ?? []).filter((i) => i.tipo === tipo);

  const renderFila = (inst: InstitucionCatalogo) => (
    <li key={inst.id} className="flex items-center gap-3 rounded-xl border border-line bg-canvas-deep/40 px-3.5 py-2.5 dark:border-ink-700 dark:bg-ink-900/40">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-100 text-[10px] font-extrabold text-mint-700">
        {inst.nombre.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-900 dark:text-white">{inst.nombre}</span>
      {inst.tipo === 'sena' && (
        <span className="truncate text-[11px] font-medium text-ink-400">
          {inst.detalles?.centros?.length ?? 0} centros · {inst.detalles?.municipios?.length ?? 0} municipios
        </span>
      )}
      <button
        type="button"
        onClick={() => void eliminar(inst.id)}
        aria-label="Eliminar"
        className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
          <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
            Instituciones del catálogo
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            Colegios, universidades y sedes SENA disponibles en el registro.
          </p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="btn-pill btn-pill-mint">
          <Plus size={15} />
          Agregar institución
        </button>
      </motion.header>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {instituciones === null ? (
        <p className="text-sm font-semibold text-ink-400">Cargando catálogo…</p>
      ) : (
        <div className="space-y-5">
          {TIPOS.map((t) => {
            const filas = agrupadas(t.value);
            const Icon = t.icon;
            return (
              <section key={t.value} className="surface overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-canvas-deep text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold tracking-tight text-ink-950">{t.label}s</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-ink-400">
                        {filas.length} registradas
                      </span>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-deep px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                    <Building2 size={11} />
                    {filas.length}
                  </span>
                </button>
                <div className="border-t border-line/70 px-5 py-4">
                  {filas.length === 0 ? (
                    <p className="text-xs font-medium text-ink-400">
                      Aún no hay {t.label.toLowerCase()}s registradas. Usa "Agregar institución".
                    </p>
                  ) : (
                    <ul className="space-y-2">{filas.map(renderFila)}</ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <AgregarInstitucionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreada={() => {
          setModalOpen(false);
          void cargar();
        }}
      />
    </div>
  );
};