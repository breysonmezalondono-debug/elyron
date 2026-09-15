import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CalendarCheck, ChevronDown } from 'lucide-react';
import { AsistenciaPlanilla } from '../../components/elyron/AsistenciaPlanilla';
import { ASISTENCIA_META, useAsistencia } from '../../model/asistencia';
import type { AsistenciaEstado } from '../../model/asistencia';

const EASE = [0.22, 1, 0.36, 1] as const;

const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const AsistenciaDocenteView = () => {
  const asistencia = useAsistencia();
  const [grupoId, setGrupoId] = useState<string>(() => asistencia.grupos[0]?.id ?? '');

  const grupo = asistencia.grupos.find((g) => g.id === grupoId);

  const hoyResumen = useMemo(() => {
    const hoyKey = keyOf(new Date());
    const cuenta: Record<AsistenciaEstado, number> = { asistio: 0, permiso: 0, no_vino: 0 };
    if (!grupo) return cuenta;
    grupo.aprendices.forEach((a) => {
      const e = asistencia.registroDe(hoyKey, a.id);
      if (e) cuenta[e] += 1;
    });
    return cuenta;
  }, [grupo, asistencia.registros]);

  const sinMarcarHoy = useMemo(() => {
    if (!grupo) return 0;
    const hoyKey = keyOf(new Date());
    return grupo.aprendices.filter((a) => !asistencia.registroDe(hoyKey, a.id)).length;
  }, [grupo, asistencia.registros]);

  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="mx-auto max-w-6xl space-y-7">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Enseñanza · Asistencia
          </p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            Planilla de <span className="italic">asistencia</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-ink-500">
            Marca quién vino, quién pidió permiso y quién faltó. Cada color se refleja en el
            calendario del aprendiz (verde asistió · salmón permiso · rojo no vino).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hoyResumen.asistio + hoyResumen.permiso + hoyResumen.no_vino > 0 && (
            <span className="rounded-full bg-canvas-deep px-3 py-1.5 text-[11px] font-extrabold text-ink-500">
              Hoy: {hoyResumen.asistio} asistieron · {hoyResumen.permiso} permiso ·{' '}
              {hoyResumen.no_vino} faltas
            </span>
          )}
          {sinMarcarHoy > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200">
              {sinMarcarHoy} sin marcar hoy
            </span>
          )}
        </div>
      </motion.header>

      <motion.section variants={rise}>
        <div className="relative">
          <select
            aria-label="Seleccionar ficha"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            className="input h-11 w-full appearance-none pr-10 font-bold sm:w-80"
          >
            {asistencia.grupos.map((g) => (
              <option key={g.id} value={g.id}>
                Ficha {g.ficha} · {g.nombre}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        </div>
      </motion.section>

      {grupo ? (
        <AsistenciaPlanilla grupoId={grupo.id} key={grupo.id} />
      ) : (
        <section className="surface flex flex-col items-center gap-3 p-10 text-center">
          <CalendarCheck size={28} className="text-ink-300" />
          <p className="text-sm font-semibold text-ink-500">No hay fichas que gestionar.</p>
        </section>
      )}

      <p className="text-center text-[11px] font-semibold text-ink-400">
        {Object.values(ASISTENCIA_META).map((m) => m.label).join(' · ')} — cambios visibles al
        instante para los aprendices.
      </p>
    </motion.div>
  );
};