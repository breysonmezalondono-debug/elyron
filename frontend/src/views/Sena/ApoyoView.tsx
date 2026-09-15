import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Coins, MessageCircle, ShieldCheck } from 'lucide-react';
import { aprendizServiciosService } from '../../services/aprendizServiciosService';
import type { Apoyo } from '../../services/aprendizServiciosService';
import { aprendizService } from '../../services/aprendizService';
import type { AprendizConvocatoria } from '../../services/aprendizService';

const EASE = [0.22, 1, 0.36, 1] as const;

const ESTADO_CONFIG: Record<string, { label: string; chip: string }> = {
  postulado: { label: 'Postulado', chip: 'bg-amber-100 text-amber-700' },
  en_revision: { label: 'En revisión', chip: 'bg-violet-100 text-violet-700' },
  aprobado: { label: 'Aprobado', chip: 'bg-mint-100 text-mint-700' },
  rechazado: { label: 'Rechazado', chip: 'bg-red-100 text-red-700' },
};

export const ApoyoView = () => {
  const [apoyo, setApoyo] = useState<Apoyo[]>([]);
  const [convocatoria, setConvocatoria] = useState<AprendizConvocatoria | null>(null);

  const cargar = useCallback(async () => {
    const [ap, convs] = await Promise.all([
      aprendizServiciosService.miApoyo(),
      aprendizService.convocatorias(),
    ]);
    setApoyo(ap);
    setConvocatoria(
      convs.find(
        (c) => /apoyo|sostenimiento/i.test(c.title),
      ) ?? null,
    );
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actual = apoyo[0] ?? null;

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
          Apoyo de sostenimiento
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Información, convocatorias, fechas, documentos y el estado de tu solicitud.
        </p>
      </header>

      {actual ? (
        <section className="surface shadow-lift relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-mint-100 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-mint-600">
                Estado de tu solicitud
              </p>
              <h2 className="display mt-2 text-2xl text-ink-950">
                {ESTADO_CONFIG[actual.estado]?.label ?? actual.estado}
              </h2>
              {actual.motivo && (
                <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-ink-500">
                  {actual.motivo}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${ESTADO_CONFIG[actual.estado]?.chip ?? 'bg-canvas-deep text-ink-500'}`}
              >
                {ESTADO_CONFIG[actual.estado]?.label ?? actual.estado}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-canvas-deep px-3 py-1 text-[11px] font-bold text-ink-600">
                <MessageCircle size={12} />
                {actual.chatActivo ? 'Chat con bienestar activo' : 'Sin chat activo'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <div className="surface p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-400">
            <ShieldCheck size={16} className="text-mint-600" />
            Aún no has postulado al apoyo de sostenimiento. Cuando haya convocatoria podrás aplicar.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="surface p-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-mint-600" />
            <h3 className="text-sm font-extrabold tracking-tight">Convocatoria actual</h3>
          </div>
          {convocatoria ? (
            <div className="mt-3">
              <p className="text-sm font-extrabold text-ink-900">{convocatoria.title}</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-ink-500">
                {convocatoria.description}
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-[11px] font-bold text-ink-400">
                  Cierre: {new Date(convocatoria.endDate).toLocaleDateString('es-CO')}
                </p>
                {convocatoria.requirements?.map((r) => (
                  <p
                    key={r}
                    className="flex items-center gap-2 text-[11px] font-bold text-ink-500"
                  >
                    <span className="size-1.5 rounded-full bg-mint-500" /> {r}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-ink-400">
              No hay convocatoria abierta en este momento.
            </p>
          )}
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-amber-500" />
            <h3 className="text-sm font-extrabold tracking-tight">Sobre el apoyo</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs font-semibold leading-relaxed text-ink-600">
            <li>Apoyo económico semestral para aprendices en estado activo.</li>
            <li>Requiere documentos al día y formulario diligenciado.</li>
            <li>La gestión se realiza a través de bienestar del centro.</li>
            <li>El seguimiento se coordina por chat con el responsable.</li>
          </ul>
        </div>
      </section>
    </motion.div>
  );
};
