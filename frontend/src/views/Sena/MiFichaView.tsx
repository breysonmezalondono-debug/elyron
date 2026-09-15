import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Crown, GraduationCap, Mic, UsersRound } from 'lucide-react';
import { aprendizService } from '../../services/aprendizService';
import type { MiFicha } from '../../services/aprendizService';
import { NIVEL_LABEL } from '../../services/perfilService';
import { getToken } from '../../api';

const EASE = [0.22, 1, 0.36, 1] as const;

export const MiFichaView = () => {
  const [ficha, setFicha] = useState<MiFicha | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const f = await aprendizService.miFicha();
    setFicha(f);
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

  if (!ficha) {
    return (
      <div className="surface p-6">
        <p className="text-sm font-semibold text-ink-400">
          No pudimos cargar la información de tu ficha.
        </p>
      </div>
    );
  }

  const aprendices = ficha.aprendices ?? [];
  const instructores = ficha.instructores ?? [];
  const lider = aprendices.find((a) => a.esVocero);
  const colider = aprendices.find((a) => a.esVoceroSuplente);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-6"
    >
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
          Comunidad · Mi ficha
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
          Mi ficha
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Tu programa, ficha, integrantes e instructores.
        </p>
      </header>

      <section className="surface shadow-lift relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-mint-100 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-deep px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                <GraduationCap size={11} /> {NIVEL_LABEL[ficha.tipoPrograma ?? ''] ?? 'Tecnólogo'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                  ficha.status === 'active' ? 'bg-mint-100 text-mint-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {ficha.status === 'active' ? 'Activa' : ficha.status}
              </span>
            </div>
            <h2 className="display mt-3 text-2xl text-ink-950 sm:text-3xl">
              Ficha {ficha.code} · {ficha.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold text-ink-500">
              {ficha.startDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} /> Inicio:{' '}
                  <strong>{new Date(ficha.startDate).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}</strong>
                </span>
              )}
              {ficha.endDate && (
                <span className="inline-flex items-center gap-1.5">
                  Fin:{' '}
                  <strong>{new Date(ficha.endDate).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <UsersRound size={13} /> <strong>{aprendices.length}</strong> aprendices
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-center gap-2">
          <Mic size={16} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">Instructores</h2>
        </div>
        {instructores.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-ink-400">Sin instructores asignados.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instructores.map((i) => (
              <li key={i.instructor.id} className="flex items-center gap-3 rounded-2xl bg-canvas-deep/60 p-4">
                <span className="grid size-10 place-items-center rounded-full bg-mint-100 text-mint-700">
                  <Mic size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink-900">
                    {i.instructor.firstName} {i.instructor.lastName}
                  </p>
                  <p className="truncate text-xs font-semibold text-ink-500">{i.instructor.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface p-6">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-amber-500" />
          <h2 className="text-sm font-extrabold tracking-tight">Liderazgo de la ficha</h2>
        </div>
        {!lider && !colider ? (
          <p className="mt-3 text-sm font-semibold text-ink-400">
            Tu ficha aún no tiene líder ni colíder asignados.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
                <Crown size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  Líder de esta ficha
                </p>
                <p className="truncate text-sm font-extrabold text-ink-900">
                  {lider ? `${lider.firstName} ${lider.lastName}` : 'Sin asignar'}
                </p>
                {lider && <p className="truncate text-xs font-semibold text-ink-500">{lider.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                <Crown size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                  Colíder de esta ficha
                </p>
                <p className="truncate text-sm font-extrabold text-ink-900">
                  {colider ? `${colider.firstName} ${colider.lastName}` : 'Sin asignar'}
                </p>
                {colider && <p className="truncate text-xs font-semibold text-ink-500">{colider.email}</p>}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="surface p-6">
        <div className="flex items-center gap-2">
          <UsersRound size={16} className="text-mint-600" />
          <h2 className="text-sm font-extrabold tracking-tight">
            Aprendices ({aprendices.length})
          </h2>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {aprendices.map((a) => (
            <li
              key={a.id}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                a.id === userId ? 'bg-mint-100/70' : 'bg-canvas-deep/50'
              }`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-xs font-extrabold text-ink-700">
                {a.firstName?.[0] || '?'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">
                  {a.firstName} {a.lastName}
                </p>
                <p className="truncate text-[10px] font-semibold text-ink-400">
                  {a.id === userId ? 'Tú' : a.email}
                  {a.esVocero ? ' · Líder' : ''}
                  {a.esVoceroSuplente ? ' · Colíder' : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
};
