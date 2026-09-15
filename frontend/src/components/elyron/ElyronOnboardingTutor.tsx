import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  Check,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Elir } from './Elir';

interface Goal {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const GOALS: Goal[] = [
  {
    id: 'logica',
    title: 'Dominar la lógica',
    desc: 'Bucles, condicionales y pensamiento computacional',
    icon: Brain,
  },
  {
    id: 'competencias',
    title: 'Reforzar competencias',
    desc: 'Repasa tus unidades de SENA o universidad',
    icon: Target,
  },
  {
    id: 'evaluacion',
    title: 'Preparar evaluaciones',
    desc: 'Practica con retos y quizzes cronometrados',
    icon: Timer,
  },
];

const METHOD = [
  { icon: Zap, label: 'Lecciones interactivas de 5 min' },
  { icon: Sparkles, label: 'Pistas socráticas, nunca respuestas' },
  { icon: TrendingUp, label: 'Rutas que se adaptan a tu avance' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export const ElyronOnboardingTutor = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    if (step !== 0) return;
    const t = setTimeout(() => setGreeted(true), 1100);
    return () => clearTimeout(t);
  }, [step]);

  const selectedGoal = GOALS.find((g) => g.id === goal) ?? null;
  const canContinue = step !== 1 || goal !== null;
  const isFinal = step === 3;

  const handleContinue = () => {
    if (!canContinue) return;
    if (isFinal) {
      navigate('/lecciones');
      return;
    }
    setStep((s) => s + 1);
  };

  const continueLabel = () => {
    if (isFinal) return 'Aceptar el reto';
    if (step === 0) return 'Hola, Elir';
    if (step === 2) return 'Suena bien';
    return 'Continuar';
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas dark:bg-canvas-deep">
      <div className="pointer-events-none absolute -left-32 top-16 size-96 rounded-full bg-mint-200/50 blur-3xl dark:bg-mint-500/5" />
      <div className="pointer-events-none absolute -right-28 bottom-24 size-80 rounded-full bg-amber-100/70 blur-3xl dark:bg-amber-500/5" />

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="absolute right-6 top-6 z-20 rounded-full px-4 py-2 text-xs font-bold text-ink-400 transition-all duration-300 hover:bg-white hover:text-ink-800 hover:shadow-soft dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white sm:right-10"
      >
        Saltar por ahora
      </button>

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 pb-44 pt-14">
        <motion.section
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="surface relative rounded-[36px] p-8 text-center shadow-lift transition-shadow duration-300 hover:shadow-pop sm:p-12"
        >
          {step > 0 && (
            <button
              type="button"
              aria-label="Paso anterior"
              onClick={() => setStep((s) => s - 1)}
              className="absolute left-5 top-5 grid size-9 place-items-center rounded-full border border-line bg-white text-ink-500 transition-all duration-300 hover:-translate-y-0.5 hover:text-ink-900 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-white"
            >
              <ChevronLeft size={16} strokeWidth={2.6} />
            </button>
          )}

          <div className="mx-auto flex w-fit items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === step ? 26 : 8,
                  backgroundColor: i === step ? '#18181b' : i < step ? '#22c55e' : '#e4e4e7',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -34 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="mt-8"
            >
              {step === 0 && (
                <div className="flex flex-col items-center">
                  <div className="grid place-items-center">
                    {!greeted && (
                      <div className="flex h-[150px] items-end pb-6">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-3 shadow-soft dark:border-ink-700 dark:bg-ink-800">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                              className="size-2 rounded-full bg-mint-500"
                            />
                          ))}
                        </span>
                      </div>
                    )}
                    {greeted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        <Elir size={150} mood="happy" />
                      </motion.div>
                    )}
                  </div>

                  {greeted && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
                      className="mt-4"
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-mint-600 dark:text-mint-400">
                        Tutor IA · Elyron
                      </p>
                      <h1 className="display mt-2 text-4xl text-ink-950 dark:text-white sm:text-5xl">
                        Hola, soy <span className="italic">Elir</span>
                      </h1>
                      <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-ink-500 dark:text-ink-300">
                        No te daré respuestas de regalo: te haré pensar, ejecutar
                        y descubrir. Así se aprende de verdad.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="display text-3xl text-ink-950 dark:text-white sm:text-4xl">
                    ¿Qué quieres lograr hoy?
                  </h1>
                  <p className="mt-2.5 text-sm font-medium text-ink-500 dark:text-ink-300">
                    Tu ruta se adapta a tu respuesta.
                  </p>
                  <div className="mt-7 space-y-2.5 text-left">
                    {GOALS.map(({ id, title, desc, icon: Icon }, idx) => {
                      const active = goal === id;
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          onClick={() => setGoal(id)}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * idx, duration: 0.35, ease: EASE }}
                          className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                            active
                              ? 'border-mint-400 bg-mint-50 ring-4 ring-mint-100 dark:border-mint-400 dark:bg-mint-500/10 dark:ring-mint-500/10'
                              : 'border-line-strong/70 bg-white hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lift dark:border-ink-700 dark:bg-ink-800 dark:hover:border-ink-500'
                          }`}
                        >
                          <span
                            className={`grid size-11 shrink-0 place-items-center rounded-full ${
                              active ? 'bg-mint-500 text-white' : 'bg-canvas-deep text-ink-600 dark:bg-ink-700 dark:text-ink-200'
                            }`}
                          >
                            <Icon size={19} strokeWidth={2.2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm ${active ? 'font-extrabold text-mint-800 dark:text-mint-300' : 'font-bold text-ink-800 dark:text-white'}`}>
                              {title}
                            </span>
                            <span className="block truncate text-xs font-medium text-ink-500 dark:text-ink-300">{desc}</span>
                          </span>
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
                              active ? 'border-mint-500 bg-mint-500 text-white' : 'border-line-strong dark:border-ink-600'
                            }`}
                          >
                            {active && <Check size={13} strokeWidth={3.4} />}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center">
                  <Elir size={130} mood="thinking" />
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-mint-600 dark:text-mint-400">
                    Ruta personalizada
                  </p>
                  <h1 className="display mt-2 text-3xl text-ink-950 dark:text-white sm:text-4xl">
                    Perfecto, tu plan está listo
                  </h1>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-canvas-deep px-5 py-2.5 text-sm font-bold text-ink-800 dark:bg-ink-800 dark:text-white">
                    {selectedGoal && <selectedGoal.icon size={15} className="text-mint-600" />}
                    {selectedGoal?.title ?? 'Ruta personalizada'}
                  </div>
                  <ul className="mt-6 space-y-2.5 text-left">
                    {METHOD.map(({ icon: Icon, label }, idx) => (
                      <motion.li
                        key={label}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx, duration: 0.35, ease: EASE }}
                        className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink-700 shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700 dark:bg-mint-500/15 dark:text-mint-300">
                          <Icon size={14} strokeWidth={2.4} />
                        </span>
                        {label}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center">
                  <Elir size={140} mood="celebrate" />
                  <h1 className="display mt-4 text-4xl text-ink-950 dark:text-white sm:text-5xl">
                    Aprende <span className="italic">haciendo</span>
                  </h1>
                  <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-ink-500 dark:text-ink-300">
                    Tu primer reto te espera: ejecutarás código real paso a paso
                    mientras Elir te guía con preguntas.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink-600 ring-1 ring-line dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700">
                      Bucles while
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink-600 ring-1 ring-line dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700">
                      +50 XP al completar
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink-600 ring-1 ring-line dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700">
                      ~5 min
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center bg-linear-to-t from-canvas via-canvas/90 to-transparent pb-8 pt-14 dark:from-canvas-deep dark:via-canvas-deep/90">
        <div className="pointer-events-auto flex flex-col items-center gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={!canContinue}
            onClick={handleContinue}
            className={`btn-pill px-10 py-4 text-base transition-all duration-300 hover:-translate-y-0.5 ${
              isFinal ? 'btn-pill-mint shadow-pop' : 'btn-pill-ink'
            } ${!canContinue ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            {continueLabel()}
            <ArrowRight size={17} strokeWidth={2.6} />
          </motion.button>
          {step === 3 && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-ink-400 underline-offset-4 transition hover:text-ink-800 hover:underline dark:text-ink-400 dark:hover:text-white"
            >
              Explorar mi panel primero
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
