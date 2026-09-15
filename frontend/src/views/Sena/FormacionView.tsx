import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FolderOpen,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import { Count } from '../../components/elyron/Count';
import { LuxCard } from '../../components/elyron/LuxCard';
import { aprendizService } from '../../services/aprendizService';
import type { AprendizEvidencia } from '../../services/aprendizService';
import { perfilService, ETAPA_LABEL } from '../../services/perfilService';
import type { PerfilSena } from '../../services/perfilService';

const EASE = [0.16, 1, 0.3, 1] as const;

const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="admin-eyebrow text-[10px] text-ink-400">{children}</p>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 flex items-center gap-4">
    <p className="admin-eyebrow shrink-0 text-[10px] text-ink-400">{children}</p>
    <span className="h-px flex-1 bg-line" />
  </div>
);

const STATUS_META: Record<
  AprendizEvidencia['status'],
  { label: string; chip: string; icon: LucideIcon }
> = {
  approved: {
    label: 'Aprobada',
    chip: 'bg-mint-50 text-mint-700 ring-mint-200',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendiente',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock,
  },
  rejected: {
    label: 'Devuelta',
    chip: 'bg-red-50 text-red-600 ring-red-200',
    icon: XCircle,
  },
};

const ORDEN_GRUPOS: Array<'pending' | 'rejected' | 'approved'> = ['pending', 'rejected', 'approved'];

const GRUPO_LABEL: Record<AprendizEvidencia['status'], { title: string; hint: string }> = {
  pending: { title: 'Pendientes de revisión', hint: 'En espera de revisión por tu instructor' },
  rejected: { title: 'Devueltas', hint: 'Requieren revisión antes de reentregar' },
  approved: { title: 'Aprobadas', hint: 'Validadas por tu instructor' },
};

const formatearFecha = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const FormacionView = () => {
  const [perfil, setPerfil] = useState<PerfilSena | null>(null);
  const [evidencias, setEvidencias] = useState<AprendizEvidencia[]>([]);
  const [carga, setCarga] = useState(true);

  const cargar = useCallback(async () => {
    setCarga(true);
    const [p] = await Promise.all([
      perfilService.miPerfil().catch(() => null),
      aprendizService.miFicha().catch(() => null),
    ]);
    setPerfil(p);
    setEvidencias(await aprendizService.evidenciasDelUsuario());
    setCarga(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const aprobadas = evidencias.filter((e) => e.status === 'approved').length;
  const pendientes = evidencias.filter((e) => e.status === 'pending').length;
  const rechazadas = evidencias.filter((e) => e.status === 'rejected').length;
  const totalEvidencias = evidencias.length;
  const pctAvance = totalEvidencias ? Math.round((aprobadas / totalEvidencias) * 100) : 0;

  const stats = useMemo(
    () =>
      [
        { icon: FolderOpen, label: 'Evidencias entregadas', value: totalEvidencias },
        { icon: CheckCircle2, label: 'Aprobadas', value: aprobadas },
        { icon: Clock, label: 'Pendientes', value: pendientes },
        { icon: XCircle, label: 'Devueltas', value: rechazadas },
      ] as Array<{ icon: LucideIcon; label: string; value: number }>,
    [totalEvidencias, aprobadas, pendientes, rechazadas],
  );

  const porEstado = useMemo(() => {
    const mapa: Record<AprendizEvidencia['status'], AprendizEvidencia[]> = {
      pending: [],
      rejected: [],
      approved: [],
    };
    evidencias.forEach((e) => mapa[e.status].push(e));
    return mapa;
  }, [evidencias]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-12"
    >
      <LuxCard>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6 p-7 sm:p-9 lg:p-11">
          <div className="min-w-0 flex-1">
            <Kicker>Formación · Evidencias</Kicker>
            <h1 className="display mt-4 text-[2.6rem] leading-none text-ink-950 sm:text-5xl">
              Mis{' '}
              <em className="italic" style={{ color: 'var(--app-accent)' }}>
                evidencias
              </em>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-ink-500">
              Tus entregas de formación y su estado de revisión, organizadas por pendientes,
              devueltas y aprobadas.
            </p>
            {perfil && (
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-ink-500">
                <span>{perfil.programaFormacion}</span>
                <span className="size-1 rounded-full bg-ink-200" />
                <span>Ficha {perfil.numeroFicha}</span>
                <span className="size-1 rounded-full bg-ink-200" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-deep px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-700">
                  <GraduationCap size={11} />
                  {ETAPA_LABEL[perfil.etapa] ?? perfil.etapa}
                </span>
              </div>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link
                to="/evidencias"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-extrabold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--app-accent)' }}
              >
                Entregar evidencia <ArrowRight size={12} strokeWidth={1.8} />
              </Link>
              <Link
                to="/ficha"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-xs font-extrabold text-ink-700 transition hover:border-line-strong hover:bg-canvas-deep/50"
              >
                Ver mi ficha
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xs">
            <Kicker>Avance del programa</Kicker>
            <div className="flex items-end gap-2">
              <Count
                to={pctAvance}
                className="admin-heading tabular-nums text-6xl leading-none text-ink-950"
              />
              <span className="text-xl font-bold text-ink-400">%</span>
            </div>
            {totalEvidencias > 0 && (
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-canvas-deep">
                {aprobadas > 0 && (
                  <span
                    className="h-full"
                    style={{ width: `${(aprobadas / totalEvidencias) * 100}%`, backgroundColor: 'var(--app-accent)' }}
                  />
                )}
                {pendientes > 0 && (
                  <span
                    className="h-full bg-amber-400"
                    style={{ width: `${(pendientes / totalEvidencias) * 100}%` }}
                  />
                )}
                {rechazadas > 0 && (
                  <span
                    className="h-full bg-red-400"
                    style={{ width: `${(rechazadas / totalEvidencias) * 100}%` }}
                  />
                )}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--app-accent)' }} />
                {aprobadas} aprobadas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400" /> {pendientes} pendientes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-400" /> {rechazadas} devueltas
              </span>
            </div>
          </div>
        </div>
      </LuxCard>

      <section>
        <SectionTitle>Resumen</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <LuxCard key={s.label} delay={i * 0.06}>
              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="admin-eyebrow text-[9px] text-ink-400">{s.label}</p>
                  <s.icon size={15} strokeWidth={1.4} className="text-ink-300" />
                </div>
                <Count
                  to={s.value}
                  className="admin-heading tabular-nums mt-3 block text-4xl text-ink-950"
                />
              </div>
            </LuxCard>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Mis evidencias</SectionTitle>
        {carga ? (
          <LuxCard>
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="block h-3 w-64 rounded-full bg-canvas-deep" />
                    <span className="block h-2.5 w-40 rounded-full bg-canvas-deep/70" />
                  </div>
                  <span className="block h-5 w-20 rounded-full bg-canvas-deep" />
                </div>
              ))}
            </div>
          </LuxCard>
        ) : evidencias.length === 0 ? (
          <LuxCard>
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-canvas-deep">
                <FolderOpen size={26} strokeWidth={1.4} className="text-ink-400" />
              </span>
              <p className="max-w-sm text-sm font-semibold text-ink-500">
                Aún no has entregado evidencias. Tus entregas y su estado aparecerán aquí.
              </p>
            </div>
          </LuxCard>
        ) : (
          <LuxCard>
            <div className="divide-y divide-line">
              {ORDEN_GRUPOS.map((estado) => {
                const lista = porEstado[estado];
                if (lista.length === 0) return null;
                const meta = STATUS_META[estado];
                const info = GRUPO_LABEL[estado];
                return (
                  <div key={estado}>
                    <div className="flex items-center gap-2 px-6 pb-2 pt-5">
                      <meta.icon size={14} />
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                        {info.title}
                      </h2>
                      <span className="rounded-full bg-canvas-deep px-2 py-0.5 text-[10px] font-extrabold text-ink-500">
                        {lista.length}
                      </span>
                      <span className="ml-1 hidden text-[10px] font-semibold text-ink-400 sm:inline">
                        {info.hint}
                      </span>
                    </div>
                    <ul>
                      {lista.map((e) => {
                        const fecha = formatearFecha(e.reviewedAt);
                        return (
                          <li
                            key={e.id}
                            className="flex items-start justify-between gap-4 px-6 py-3.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold text-ink-900">{e.title}</p>
                              {e.description && (
                                <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-relaxed text-ink-400">
                                  {e.description}
                                </p>
                              )}
                              {e.status === 'rejected' && e.feedback && (
                                <p className="mt-2 rounded-xl border border-red-200/70 bg-red-50/60 px-3 py-2 text-xs font-semibold leading-relaxed text-red-700">
                                  <span className="font-extrabold">Retroalimentación: </span>
                                  {e.feedback}
                                </p>
                              )}
                              {e.status === 'approved' && e.feedback && (
                                <p className="mt-2 rounded-xl border border-mint-200/70 bg-mint-50/60 px-3 py-2 text-xs font-semibold leading-relaxed text-mint-700">
                                  <Check size={12} className="mr-1 inline" strokeWidth={2} />
                                  {e.feedback}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${meta.chip}`}
                              >
                                <meta.icon size={11} />
                                {meta.label}
                              </span>
                              {fecha && (
                                <span className="text-[10px] font-bold text-ink-400">{fecha}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </LuxCard>
        )}
      </section>
    </motion.div>
  );
};