import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Fingerprint,
  FolderOpen,
  GraduationCap,
  HandCoins,
  Landmark,
  Lock,
  Megaphone,
  Mic,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { Count } from './elyron/Count';
import { LuxCard } from './elyron/LuxCard';
import { ProgressRing } from './elyron/ProgressRing';
import { IconTile } from './elyron/IconTile';
import type { IconTileVariant } from './elyron/IconTile';
import { NIVEL_LABEL, ETAPA_LABEL } from '../services/perfilService';
import type { PerfilSena } from '../services/perfilService';
import { aprendizService } from '../services/aprendizService';
import type { DashboardData } from '../services/aprendizService';

const levelLabel = (level: string | undefined): string => NIVEL_LABEL[level ?? ''] ?? 'Tecnólogo';

const formatDate = () =>
  new Date()
    .toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^./, (c) => c.toUpperCase());

const formatEvento = (start: string): string => {
  const fecha = new Date(start);
  const hoy = new Date();
  const diffDias = Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);
  if (diffDias <= 0) return 'Hoy';
  if (diffDias === 1) return 'Mañana';
  if (diffDias <= 7) return `En ${diffDias} días`;
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 flex items-center gap-4">
    <p className="admin-eyebrow shrink-0 text-[10px] text-ink-400">{children}</p>
    <span className="h-px flex-1 bg-line dark:bg-ink-700" />
  </div>
);

const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="admin-eyebrow text-[10px] text-ink-400">{children}</p>
);

const StatTile = ({
  icon,
  variant,
  label,
  value,
  delta,
  deltaLabel,
}: {
  icon: LucideIcon;
  variant: IconTileVariant;
  label: string;
  value: number;
  delta?: string;
  deltaLabel?: string;
}) => (
  <LuxCard className="rounded-3xl">
    <div className="flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex items-start justify-between">
        <IconTile icon={icon} variant={variant} size="md" />
        {delta && (
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-[11px] font-extrabold text-mint-700 dark:bg-mint-500/15 dark:text-mint-300">
            <Zap size={11} />
            {delta}
          </span>
        )}
      </div>
      <div>
        <Count to={value} className="admin-heading tabular-nums block text-3xl leading-none text-ink-950 dark:text-white" />
        <p className="mt-1.5 text-xs font-semibold text-ink-400">
          {label}
          {deltaLabel && <span className="text-mint-600 dark:text-mint-400"> · {deltaLabel}</span>}
        </p>
      </div>
    </div>
  </LuxCard>
);

export const ElyronDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let mounted = true;
    aprendizService.cargaDashboard().then((d) => {
      if (mounted) setData(d);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const perfil: PerfilSena | null = data?.perfil ?? null;
  const ficha = data?.ficha ?? null;
  const evidencias = data?.evidencias ?? [];
  const eventos = data?.proximosEventos ?? [];
  const ofertas = data?.ofertas ?? [];
  const convocatorias = data?.convocatorias ?? [];
  const aprobadas = evidencias.filter((e) => e.status === 'approved').length;
  const pendientes = evidencias.filter((e) => e.status === 'pending').length;
  const rechazadas = evidencias.filter((e) => e.status === 'rejected').length;
  const totalEv = evidencias.length;
  const pctAvance = totalEv ? Math.round((aprobadas / totalEv) * 100) : 0;

  const nombre = user?.name || user?.sub || 'aprendiz';
  const firstName = nombre.split(' ')[0];
  const inicial = (firstName[0] ?? 'A').toUpperCase();
  const numAprendices = ficha?.aprendices?.length ?? 0;
  const instructorNombre = ficha?.instructores?.[0]?.instructor;

  const metrics = useMemo(
    () =>
      [
        { icon: FolderOpen, label: 'Evidencias', value: totalEv, variant: 'mint' as IconTileVariant },
        { icon: CheckCircle2, label: 'Aprobadas', value: aprobadas, variant: 'ink' as IconTileVariant },
        { icon: Clock, label: 'Pendientes', value: pendientes, variant: 'amber' as IconTileVariant },
        { icon: XCircle, label: 'Devueltas', value: rechazadas, variant: 'violet' as IconTileVariant },
      ],
    [totalEv, aprobadas, pendientes, rechazadas],
  );

  const programRows: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: GraduationCap, label: 'Nivel', value: levelLabel(perfil?.nivelFormacion) },
    { icon: Landmark, label: 'Centro', value: perfil?.centroFormacion ?? '—' },
    { icon: Landmark, label: 'Regional', value: perfil?.regional ?? '—' },
    { icon: FolderOpen, label: 'Ficha', value: perfil?.numeroFicha ?? '—' },
    {
      icon: Mic,
      label: 'Instructor',
      value: instructorNombre
        ? `${instructorNombre.firstName} ${instructorNombre.lastName}`
        : 'Sin asignar',
    },
    { icon: UsersRound, label: 'Integrantes', value: `${numAprendices} aprendices` },
  ];

  const modules: Array<{
    icon: LucideIcon;
    index: string;
    title: string;
    description: string;
    to: string;
    count: string;
  }> = [
    {
      icon: BookOpen,
      index: '01',
      title: 'Formación',
      description: 'Evidencias, entregas y calendario académico.',
      to: '/lecciones',
      count: `${totalEv} evidencias`,
    },
    {
      icon: UsersRound,
      index: '02',
      title: 'Comunidad',
      description: 'Ficha, líder, comunicados y solicitudes.',
      to: '/ficha',
      count: `${numAprendices} aprendices`,
    },
    {
      icon: HandCoins,
      index: '03',
      title: 'Servicios',
      description: 'Apoyo de sostenimiento, biblioteca y documentos.',
      to: '/apoyo',
      count: `${convocatorias.length} convocatorias`,
    },
    {
      icon: BriefcaseBusiness,
      index: '04',
      title: 'Oportunidades',
      description: 'Empresas vinculadas y bolsa de empleo.',
      to: '/ofertas',
      count: `${ofertas.length} ofertas`,
    },
  ];

  const steps: Array<{ label: string; sub: string; state: 'done' | 'active' | 'todo' }> = [
    { label: 'Ficha', sub: perfil?.numeroFicha ?? 'Pendiente', state: perfil ? 'done' : 'todo' },
    {
      label: 'Evidencias',
      sub: totalEv ? `${aprobadas} de ${totalEv}` : 'Sin entregas',
      state: totalEv === 0 ? 'todo' : aprobadas === totalEv ? 'done' : 'active',
    },
    {
      label: 'Etapa productiva',
      sub: ETAPA_LABEL[perfil?.etapa ?? ''] ?? 'Pendiente',
      state: perfil?.etapa === 'productiva' ? 'done' : 'todo',
    },
  ];

  const activeIdx = steps.findIndex((s) => s.state === 'active');
  const lastDoneIdx = steps.map((s) => s.state).lastIndexOf('done');
  const furthest = Math.max(activeIdx, lastDoneIdx, 0);
  const linePct = (furthest / (steps.length - 1)) * 100;

  const summaryRows: Array<{ icon: LucideIcon; label: string; value: string | number }> = [
    { icon: Bell, label: 'Notificaciones sin leer', value: data?.notificacionesNoLeidas ?? 0 },
    { icon: Megaphone, label: 'Convocatorias activas', value: convocatorias.length },
    { icon: BriefcaseBusiness, label: 'Ofertas disponibles', value: ofertas.length },
    { icon: UsersRound, label: 'Comunidad', value: numAprendices },
  ];

  const leccionPct = 72;

  return (
    <div className="space-y-10">
      {/* Banner de bienvenida + lección recomendada */}
      <section className="space-y-4">
        <LuxCard className="rounded-[28px]">
          <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.25fr_1fr] lg:p-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-paper text-accent dark:border-ink-700 dark:bg-ink-800">
                  <span className="display text-lg">{inicial}</span>
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
                    Inicio · Panel del aprendiz
                  </p>
                  <p className="text-sm font-bold text-ink-400">{formatDate()}</p>
                </div>
              </div>

              <h1 className="display mt-5 text-4xl leading-[1.05] text-ink-950 sm:text-5xl dark:text-white">
                Buen día, {firstName}.
                <em
                  className="block mt-1 text-xl font-sans font-semibold italic sm:text-2xl"
                  style={{ color: 'var(--app-accent)' }}
                >
                  Tu aprendizaje te lleva lejos.
                </em>
              </h1>

              {/* Lección recomendada */}
              <Link
                to="/lecciones"
                className="group mt-7 block rounded-3xl border border-mint-200/70 bg-linear-to-br from-mint-50 via-white to-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-mint-300 hover:shadow-lift dark:border-mint-500/20 dark:from-mint-500/10 dark:via-canvas dark:to-canvas"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-mint-700 dark:text-mint-300">
                  <Sparkles size={11} />
                  Lección recomendada · Lógica
                </span>
                <h2 className="display mt-3 text-2xl text-ink-950 dark:text-white">
                  Piensa como una máquina: <span className="italic">bucles while</span>
                </h2>
                <p className="mt-1.5 max-w-md text-sm font-medium leading-relaxed text-ink-500 dark:text-ink-300">
                  Ejecuta el código paso a paso, predice su comportamiento y gana{' '}
                  <strong className="text-mint-600 dark:text-mint-300">+50 XP</strong> al
                  dominarlo.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 text-xs font-extrabold text-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md dark:bg-white dark:text-ink-950">
                    <Play size={13} fill="currentColor" />
                    Continuar lección · 5 min
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas-deep dark:bg-ink-800">
                      <ProgressBar pct={leccionPct} />
                    </span>
                    <span className="text-[11px] font-extrabold text-ink-500 dark:text-ink-300">
                      {leccionPct}%
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Progreso general */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
              <p className="admin-eyebrow mb-3 text-[10px] text-ink-400">Tu progreso general</p>
              <ProgressRing
                value={pctAvance}
                size={88}
                stroke={7}
                color="var(--app-accent)"
                trackColor="var(--app-canvas-deep)"
                centerClassName="admin-heading tabular-nums text-xl text-ink-950 dark:text-white"
                subLabel="completado"
              />
              <p className="mt-3 text-xs font-semibold text-ink-500 dark:text-ink-300">
                {aprobadas} de {totalEv} evidencias calificadas
              </p>
            </div>
          </div>
        </LuxCard>
      </section>

      {/* Stat tiles gamificados */}
      <section>
        <SectionTitle>Resumen</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <StatTile
              key={metric.label}
              icon={metric.icon}
              variant={metric.variant}
              label={metric.label}
              value={metric.value}
              delta={i === 0 ? '+3' : undefined}
            />
          ))}
        </div>
      </section>

      {/* Programas */}
      <section>
        <SectionTitle>Mi ruta de aprendizaje</SectionTitle>
        <div className="grid grid-cols-1 gap-4">
          <LuxCard className="rounded-3xl" delay={0.05}>
            <div className="p-7">
              {perfil ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <Kicker>Programa</Kicker>
                      <h2 className="admin-heading mt-1 text-ink-950 dark:text-white">
                        {perfil.programaFormacion}
                      </h2>
                    </div>
                    <BadgeCheck size={20} strokeWidth={1.4} className="text-accent" />
                  </div>
                  <dl className="space-y-3.5">
                    {programRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-3 last:border-0 last:pb-0 dark:border-ink-700/60"
                      >
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                          {row.label}
                        </dt>
                        <dd className="min-w-0 text-right text-sm font-bold text-ink-800 dark:text-ink-100">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-canvas-deep dark:bg-ink-800">
                    <GraduationCap size={26} strokeWidth={1.4} className="text-ink-400" />
                  </span>
                  <div>
                    <h2 className="admin-heading text-ink-950 dark:text-white">
                      Completa tu perfil académico
                    </h2>
                    <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-ink-500 dark:text-ink-300">
                      Registra tu programa, ficha y centro de formación para que Elyron construya
                      tu trayectoria y calcule tu fecha estimada de finalización.
                    </p>
                  </div>
                  <Link
                    to="/perfil"
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-extrabold text-white transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--app-accent)' }}
                  >
                    Completar perfil <ArrowRight size={12} strokeWidth={1.8} />
                  </Link>
                </div>
              )}
            </div>
          </LuxCard>
        </div>
      </section>

      {/* Módulos */}
      <section>
        <SectionTitle>Explora</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module, i) => (
            <LuxCard key={module.title} className="rounded-3xl" delay={0.08 + i * 0.05}>
              <Link
                to={module.to}
                className="group flex h-full flex-col justify-between gap-6 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <IconTile icon={module.icon} variant="mint" size="md" />
                  <span className="admin-heading text-sm leading-none text-ink-300 dark:text-ink-500">
                    {module.index}
                  </span>
                </div>
                <div>
                  <h3 className="admin-heading text-[15px] text-ink-950 dark:text-white">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-ink-500 dark:text-ink-300">
                    {module.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 dark:border-ink-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                      {module.count}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-accent transition-all duration-300 group-hover:gap-2">
                      Explorar <ArrowRight size={12} strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </Link>
            </LuxCard>
          ))}
        </div>
      </section>

      {/* Progreso */}
      <section>
        <SectionTitle>Mi progreso</SectionTitle>
        <LuxCard className="rounded-3xl" delay={0.05}>
          <div className="p-7 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Route size={18} strokeWidth={1.4} className="text-accent" />
                <h2 className="admin-heading text-ink-950 dark:text-white">Progreso en el programa</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:text-ink-300">
                <CheckCircle2 size={12} strokeWidth={1.8} className="text-accent" />
                {aprobadas} de {totalEv} evidencias ok
              </span>
            </div>

            <div className="relative mt-9">
              <div className="h-[4px] w-full rounded-full bg-canvas-deep dark:bg-ink-800" />
              <div
                className="absolute inset-y-0 left-0 h-[4px] rounded-full"
                style={{ width: `${linePct}%`, backgroundColor: 'var(--app-accent)' }}
              />
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(i / (steps.length - 1)) * 100}%` }}
                >
                  {step.state === 'done' ? (
                    <span
                      className="grid size-[18px] place-items-center rounded-full ring-4 ring-paper dark:ring-ink-900"
                      style={{ backgroundColor: 'var(--app-accent)' }}
                    >
                      <Check size={9} strokeWidth={4} className="text-white" />
                    </span>
                  ) : step.state === 'active' ? (
                    <span className="relative grid size-[18px] place-items-center rounded-full border-2 bg-paper ring-4 ring-paper dark:bg-ink-900 dark:ring-ink-900"
                      style={{ borderColor: 'var(--app-accent)' }}
                    >
                      <span
                        className="absolute inset-0 animate-pulse-ring rounded-full border"
                        style={{ borderColor: 'var(--app-accent)', color: 'var(--app-accent)' }}
                      />
                      <span className="size-[7px] rounded-full" style={{ backgroundColor: 'var(--app-accent)' }} />
                    </span>
                  ) : (
                    <span className="size-[18px] rounded-full border-2 border-line-strong bg-paper ring-4 ring-paper dark:border-ink-600 dark:bg-ink-900 dark:ring-ink-900" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  className={i === 0 ? 'text-left' : i === steps.length - 1 ? 'text-right' : 'text-center'}
                >
                  <p className="text-[11px] font-extrabold text-ink-700 dark:text-ink-200">{step.label}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-ink-400">{step.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </LuxCard>
      </section>

      {/* Seguimiento */}
      <section>
        <SectionTitle>Seguimiento</SectionTitle>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 xl:col-span-2">
            <LuxCard delay={0.03}>
              <CardHeader icon={CalendarDays} title="Próximas actividades" action={<LinkA to="/calendario">Ver calendario</LinkA>} />
              {eventos.length === 0 ? (
                <p className="px-7 py-6 text-sm font-semibold text-ink-400">
                  Aún no hay actividades programadas. Tu calendario se actualizará con entregas y
                  sesiones.
                </p>
              ) : (
                <ul className="divide-y divide-line/60 dark:divide-ink-700/60">
                  {eventos.map((ev) => {
                    const overdue = new Date(ev.startDate).getTime() < new Date().getTime();
                    return (
                      <li key={ev.id}>
                        <Link to="/calendario" className="flex items-center gap-4 px-7 py-4 transition-colors hover:bg-canvas-deep/50 dark:hover:bg-ink-800/50">
                          <span className={`grid size-9 shrink-0 place-items-center rounded-lg border ${overdue ? 'border-amber-200 text-amber-600 dark:border-amber-500/30' : 'border-line text-accent dark:border-ink-700'}`}>
                            {overdue ? <Clock size={16} strokeWidth={1.4} /> : <CalendarDays size={16} strokeWidth={1.4} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink-900 dark:text-white">{ev.title}</span>
                            <span className="block truncate text-xs font-semibold text-ink-400">{ev.description}</span>
                          </span>
                          <span className={`shrink-0 text-xs font-extrabold ${overdue ? 'text-amber-600 dark:text-amber-400' : 'text-accent'}`}>
                            {formatEvento(ev.startDate)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </LuxCard>

            <LuxCard delay={0.06}>
              <CardHeader icon={Megaphone} title="Convocatorias" action={<LinkA to="/ofertas">Ver todas</LinkA>} />
              {convocatorias.length === 0 ? (
                <p className="px-7 py-6 text-sm font-semibold text-ink-400">
                  No hay convocatorias abiertas en este momento.
                </p>
              ) : (
                <ul className="divide-y divide-line/60 dark:divide-ink-700/60">
                  {convocatorias.map((conv) => (
                    <li key={conv.id} className="flex items-start gap-4 px-7 py-4">
                      <Megaphone size={16} strokeWidth={1.4} className="mt-0.5 shrink-0 text-ink-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-ink-900 dark:text-white">{conv.title}</p>
                        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-ink-500 dark:text-ink-300">{conv.description}</p>
                        <p className="admin-eyebrow mt-1.5 text-[9px] text-ink-400">
                          Cierra{' '}
                          {new Date(conv.endDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </LuxCard>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <LuxCard delay={0.03}>
              <CardHeader icon={Sparkles} title="Elir" action={<LinkA to="/bienvenida">Hablar con Elir</LinkA>} />
              <p className="px-6 py-6 text-sm font-semibold leading-relaxed text-ink-600 dark:text-ink-300">
                {pendientes > 0
                  ? `Tienes ${pendientes} evidencia${pendientes !== 1 ? 's' : ''} por entregar. ¿Repasamos el contenido pendiente de tu ficha?`
                  : 'Vas al día con tus entregas. Puedes explorar las convocatorias u ofertas disponibles.'}
              </p>
            </LuxCard>

            <LuxCard delay={0.06}>
              <CardHeader icon={Bell} title="Al día" />
              <ul className="space-y-3 p-6">
                {summaryRows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-sm font-bold text-ink-600 dark:text-ink-200">
                      <row.icon size={15} strokeWidth={1.5} className="text-ink-400" />
                      {row.label}
                    </span>
                    <Count to={Number(row.value)} className="admin-heading tabular-nums text-sm text-ink-900 dark:text-white" />
                  </li>
                ))}
              </ul>
            </LuxCard>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-700">
        <p className="inline-flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-ink-400">
          <span className="inline-flex items-center gap-1.5"><Lock size={12} strokeWidth={1.6} /> Conexión segura SSL</span>
          <span className="inline-flex items-center gap-1.5"><Fingerprint size={12} strokeWidth={1.6} /> Acceso verificado</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={12} strokeWidth={1.6} /> Datos protegidos</span>
          <span className="inline-flex items-center gap-1.5"><BadgeCheck size={12} strokeWidth={1.6} /> {perfil?.centroFormacion ?? 'Institución'} validado</span>
        </p>
        <span className="text-[11px] font-extrabold text-ink-400">{formatDate()}</span>
      </footer>
    </div>
  );
};

const ProgressBar = ({ pct }: { pct: number }) => (
  <motion.span
    initial={{ width: 0 }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
    className="block h-full rounded-full bg-mint-500 dark:bg-mint-400"
  />
);

const CardHeader = ({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-line/60 px-6 py-5 dark:border-ink-700/60">
    <div className="flex min-w-0 items-center gap-2.5">
      <Icon size={16} strokeWidth={1.4} className="shrink-0 text-accent" />
      <h3 className="admin-heading truncate text-sm text-ink-900 dark:text-white">{title}</h3>
    </div>
    {action}
  </div>
);

const LinkA = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-ink-400 transition-all duration-300 hover:gap-2 hover:text-accent"
  >
    {children} <ArrowRight size={12} strokeWidth={1.8} />
  </Link>
);
