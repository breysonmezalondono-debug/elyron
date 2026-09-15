import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Check,
  ChevronLeft,
  Diamond,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { Elir } from './Elir';
import { IconTile } from './IconTile';
import { QuizGeneratorCard } from './QuizGeneratorCard';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

type Phase = 'sim' | 'quiz' | 'lab' | 'done';

type InstrId = 'while' | 'avanzar' | 'recolectar';

interface SimStep {
  kind: 'check' | 'move' | 'collect';
  instr: InstrId;
  posAfter: number;
  condTrue?: boolean;
}

const META = 6;
const TRACK_CELLS = 7;

const SIM_STEPS: SimStep[] = (() => {
  const steps: SimStep[] = [];
  let pos = 0;
  while (pos < META) {
    steps.push({ kind: 'check', instr: 'while', posAfter: pos, condTrue: true });
    steps.push({ kind: 'move', instr: 'avanzar', posAfter: pos + 1 });
    pos += 1;
  }
  steps.push({ kind: 'check', instr: 'while', posAfter: pos, condTrue: false });
  steps.push({ kind: 'collect', instr: 'recolectar', posAfter: pos });
  return steps;
})();

const INSTRUCTIONS: { id: InstrId; text: string; mono: boolean }[] = [
  { id: 'while', text: 'while (celda < meta)', mono: true },
  { id: 'avanzar', text: 'avanzar()', mono: true },
  { id: 'recolectar', text: 'recolectar()', mono: true },
];

const QUIZ = {
  question: 'Si la condición del while nunca se vuelve falsa, ¿qué ocurre?',
  options: [
    { id: 'a', text: 'El programa se detiene automáticamente' },
    { id: 'b', text: 'Bucle infinito: la máquina repite el ciclo sin fin' },
    { id: 'c', text: 'El compilador corrige la condición' },
  ],
  correct: 'b',
  explanation:
    'Un while necesita que algo cambie dentro de su cuerpo para dejar de cumplirse. Si avanzar() nunca modifica celda, la condición sigue siendo verdadera y el ciclo se repite indefinidamente.',
};

const PHASE_LABELS: Record<Exclude<Phase, 'done'>, string> = {
  sim: 'Simulador',
  quiz: 'Trivia',
  lab: 'Laboratorio',
};

const PHASE_ORDER: Exclude<Phase, 'done'>[] = ['sim', 'quiz', 'lab'];

function stepLine(step: SimStep): string {
  if (step.kind === 'check') {
    return step.condTrue
      ? `¿celda(${step.posAfter}) < ${META}?  ->  sí`
      : `¿celda(${step.posAfter}) < ${META}?  ->  no · sale del bucle`;
  }
  if (step.kind === 'move') return `avanzar()  ->  celda = ${step.posAfter}`;
  return 'recolectar()  ·  gema obtenida';
}

export const ElyronInteractiveLesson = () => {
  const [phase, setPhase] = useState<Phase>('sim');
  const [maxPhaseIdx, setMaxPhaseIdx] = useState(0);
  const [cursor, setCursor] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const [chosen, setChosen] = useState<string | null>(null);
  const [iterations, setIterations] = useState(6);

  const finished = cursor >= SIM_STEPS.length - 1;
  const activePos = cursor < 0 ? 0 : SIM_STEPS[cursor].posAfter;
  const activeInstr = cursor < 0 ? null : SIM_STEPS[cursor].instr;

  const consoleLines = useMemo(
    () => SIM_STEPS.slice(Math.max(0, cursor - 5), cursor + 1).map(stepLine),
    [cursor],
  );

  useEffect(() => {
    if (!playing || finished) return;
    const t = setTimeout(
      () => setCursor((c) => Math.min(c + 1, SIM_STEPS.length - 1)),
      650,
    );
    return () => clearTimeout(t);
  }, [playing, finished, cursor]);

  const advanceTo = (next: Phase) => {
    const idx = PHASE_ORDER.indexOf(next as Exclude<Phase, 'done'>);
    if (idx >= 0) setMaxPhaseIdx((m) => Math.max(m, idx));
    setPhase(next);
  };

  const resetSim = () => {
    setPlaying(false);
    setCursor(-1);
  };

  const resetAll = () => {
    setPlaying(false);
    setCursor(-1);
    setChosen(null);
    setIterations(6);
    setMaxPhaseIdx(0);
    setPhase('sim');
  };

  const elirMood =
    phase === 'done'
      ? 'celebrate'
      : playing
        ? 'thinking'
        : chosen && chosen !== QUIZ.correct
          ? 'curious'
          : chosen === QUIZ.correct
            ? 'celebrate'
            : 'happy';

  return (
    <motion.div
      variants={cascade}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-4xl space-y-6"
    >
      <motion.header variants={rise} className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-ink-500 transition hover:bg-white hover:text-ink-900 hover:shadow-soft"
        >
          <ChevronLeft size={14} strokeWidth={2.6} />
          Volver al panel
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            Módulo 1 · Lógica de programación
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-3 py-1.5 text-[11px] font-extrabold text-mint-700">
            <Zap size={11} strokeWidth={2.8} />
            +50 XP
          </span>
        </div>
      </motion.header>

      <motion.section variants={rise} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink-950 sm:text-5xl">
            Piensa como una máquina
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-ink-500">
            Ejecuta un bucle while paso a paso, predice su comportamiento y
            ajusta sus variables hasta dominarlo.
          </p>
        </div>
        <Elir size={92} mood={elirMood} />
      </motion.section>

      <motion.nav variants={rise} className="flex gap-1.5 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line">
        {PHASE_ORDER.map((id, idx) => {
          const unlocked = idx <= maxPhaseIdx && phase !== 'done';
          const isActive = phase === id;
          const completed =
            idx < maxPhaseIdx ||
            (phase === 'done' && idx < PHASE_ORDER.length);
          return (
            <button
              key={id}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && setPhase(id)}
              className={`relative flex-1 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                isActive ? 'text-white' : unlocked ? 'text-ink-500 hover:text-ink-800' : 'cursor-not-allowed text-ink-300'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="lesson-phase-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-full bg-ink-900"
                />
              )}
              <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                {completed && !isActive && (
                  <Check size={12} strokeWidth={3.2} className="text-mint-500" />
                )}
                {idx + 1}. {PHASE_LABELS[id]}
              </span>
          </button>
        );
        })}
      </motion.nav>

      <AnimatePresence mode="wait">
        {phase === 'sim' && (
          <motion.section
            key="sim"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="surface space-y-5 p-6 sm:p-8"
          >
            <div className="simulator overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-ink-400">
                <span className="inline-flex items-center gap-2">
                  <Terminal size={12} />
                  EJECUTOR DE LÓGICA ELYRON
                </span>
                <span className="font-bold text-mint-400">
                  PASO {Math.max(0, cursor + 1)}/{SIM_STEPS.length}
                </span>
              </div>

              <div className="mt-4 flex justify-center gap-1.5 sm:gap-2.5">
                {Array.from({ length: TRACK_CELLS }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`relative grid aspect-square w-full max-w-14 place-items-center rounded-xl border transition-colors duration-300 ${
                      idx === META
                        ? 'border-mint-500/60 bg-mint-500/15 text-mint-300'
                        : idx === activePos
                          ? 'border-slate-700 bg-slate-800/80'
                          : 'border-slate-800 bg-slate-900/70'
                    }`}
                  >
                    {idx === META ? (
                      <Diamond size={16} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.55)]" fill="currentColor" />
                    ) : (
                      <span className="font-mono text-[10px] text-slate-600">{idx}</span>
                    )}
                    {idx === activePos && (
                      <motion.div
                        layoutId="lesson-bot"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute -top-3.5 grid size-7 place-items-center rounded-lg bg-white text-ink-900 shadow-pop"
                      >
                        <Bot size={15} strokeWidth={2.4} />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center font-mono text-[11px] text-slate-500">
                {finished
                  ? 'Programa terminado · gema recolectada con éxito'
                  : 'Evaluando siguiente instrucción…'}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                  Instrucciones de la lección
                </p>
                {INSTRUCTIONS.map((ins) => {
                  const active = activeInstr === ins.id;
                  return (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        setCursor(SIM_STEPS.findIndex((s) => s.instr === ins.id));
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left font-mono text-sm transition-all ${
                        active
                          ? 'border-mint-300 bg-mint-50 font-bold text-mint-800 ring-4 ring-mint-100'
                          : 'border-line-strong/70 bg-canvas-deep/60 text-ink-600 hover:bg-canvas-deep'
                      }`}
                    >
                      <span>{ins.text}</span>
                      {active && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-mint-600">
                          ejecutando
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-line-strong/70 bg-canvas-deep/60 px-4 py-3 font-mono text-xs text-ink-600">
                  <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Variables</p>
                  <p>celda = <span className="font-bold text-ink-950">{activePos}</span></p>
                  <p>meta&nbsp; = <span className="font-bold text-ink-950">{META}</span></p>
                </div>
                <div className="rounded-2xl bg-ink-950 p-4 font-mono text-[11px] leading-relaxed text-slate-400">
                  <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <Terminal size={10} /> Consola
                  </p>
                  {consoleLines.length === 0 && <p className="text-slate-600">$ esperando ejecución…</p>}
                  {consoleLines.map((line, i) => (
                    <motion.p key={`${cursor}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                      {line}
                    </motion.p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={finished}
                onClick={() => setPlaying((p) => !p)}
                className="btn-pill btn-pill-mint btn-pill-sm disabled:opacity-40"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Pausar' : 'Ejecutar todo'}
              </button>
              <button
                type="button"
                disabled={finished || playing}
                onClick={() => setCursor((c) => Math.min(c + 1, SIM_STEPS.length - 1))}
                className="btn-pill btn-pill-paper btn-pill-sm disabled:opacity-40"
              >
                Paso a paso
                <ArrowRight size={14} />
              </button>
              <button type="button" onClick={resetSim} className="btn-pill btn-pill-paper btn-pill-sm">
                <RotateCcw size={14} />
                Reiniciar
              </button>
            </div>

            <AnimatePresence>
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-mint-200 bg-mint-50 px-5 py-4"
                >
                  <p className="inline-flex items-center gap-2.5 text-sm font-bold text-mint-800">
                    <span className="grid size-8 place-items-center rounded-full bg-mint-500 text-white">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    Bucle completado en {SIM_STEPS.length} micro-pasos. Así razona la máquina.
                  </p>
                  <button type="button" onClick={() => advanceTo('quiz')} className="btn-pill btn-pill-ink btn-pill-sm">
                    Ir a la trivia
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {phase === 'quiz' && (
          <motion.section
            key="quiz"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="surface space-y-5 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <IconTile icon={Lightbulb} variant="mint" />
              <h2 className="display pt-1 text-2xl leading-snug text-ink-950 sm:text-3xl">{QUIZ.question}</h2>
            </div>

            <div className="space-y-2.5">
              {QUIZ.options.map((opt, idx) => {
                const isCorrect = opt.id === QUIZ.correct;
                const isSelected = opt.id === chosen;
                const revealed = chosen !== null;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => setChosen(opt.id)}
                    animate={
                      revealed && isSelected && !isCorrect
                        ? { x: [0, -8, 8, -5, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.4 }}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition-all ${
                      revealed && isCorrect
                        ? 'border-mint-400 bg-mint-50 text-mint-800 ring-4 ring-mint-100'
                        : revealed && isSelected
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : revealed
                            ? 'border-line bg-white text-ink-300'
                            : 'border-line-strong/70 bg-white text-ink-700 shadow-soft hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lift'
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                          revealed && isCorrect
                            ? 'bg-mint-500 text-white'
                            : revealed && isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-canvas-deep text-ink-500'
                        }`}
                      >
                        {revealed && isCorrect ? <Check size={13} strokeWidth={3.2} /> : revealed && isSelected ? <X size={13} strokeWidth={3.2} /> : String.fromCharCode(65 + idx)}
                      </span>
                      {opt.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {chosen && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
                    chosen === QUIZ.correct ? 'border-mint-200 bg-mint-50' : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <Elir size={52} float={false} mood={chosen === QUIZ.correct ? 'happy' : 'thinking'} />
                    <div className="min-w-0">
                      <p className={`text-sm font-extrabold ${chosen === QUIZ.correct ? 'text-mint-800' : 'text-amber-800'}`}>
                        {chosen === QUIZ.correct ? 'Exacto. Razonamiento socrático aprobado.' : 'Casi. Piénsalo desde la condición.'}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-600">{QUIZ.explanation}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => advanceTo('lab')} className="btn-pill btn-pill-ink btn-pill-sm shrink-0">
                    Al laboratorio
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {phase === 'lab' && (
          <motion.section
            key="lab"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="surface space-y-6 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="display text-2xl text-ink-950 sm:text-3xl">Laboratorio de variables</h2>
                <p className="mt-1.5 text-sm font-medium text-ink-500">
                  Mueve <span className="font-mono font-bold text-ink-800">n</span> y observa cuánto trabajo hace el bucle.
                </p>
              </div>
              <div className="rounded-2xl border border-line-strong/70 bg-canvas-deep/60 px-5 py-3 text-center font-mono">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Costo</p>
                <p className="text-lg font-bold text-ink-950">T(n) ≈ n + 1</p>
                <p className="text-[11px] text-mint-700">operaciones actuales: {iterations + 1}</p>
              </div>
            </div>

            <div className="flex h-36 items-end justify-center gap-1.5 rounded-2xl bg-canvas-deep/50 px-4 py-4">
              {Array.from({ length: iterations }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.045, type: 'spring', stiffness: 320, damping: 22 }}
                  style={{ transformOrigin: 'bottom' }}
                  className={`w-full max-w-8 flex-1 rounded-t-lg ${i === iterations - 1 ? 'bg-ink-900' : 'bg-mint-400'}`}
                />
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-ink-500">
                <span className="font-mono">n = {iterations} iteraciones</span>
                <span className="font-mono">+ 1 comprobación final</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full accent-mint-500"
                aria-label="Número de iteraciones del bucle"
              />
              <div className="flex justify-between font-mono text-[10px] text-ink-400">
                {[1, 4, 8, 12].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>

            <p className="rounded-2xl border border-line bg-canvas-deep/40 px-5 py-3.5 text-xs leading-relaxed text-ink-600">
              Esto es crecimiento <span className="font-mono font-bold text-ink-900">O(n)</span>: duplicar las vueltas
              duplica el trabajo. Los buenos algoritmos buscan reducir estas curvas antes que acelerar el hardware.
            </p>

            <div className="flex justify-end">
              <button type="button" onClick={() => advanceTo('done')} className="btn-pill btn-pill-mint">
                Terminar lección
                <Trophy size={15} />
              </button>
            </div>
          </motion.section>
        )}

        {phase === 'done' && (
          <motion.section
            key="done"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="surface relative overflow-hidden p-8 text-center sm:p-12"
          >
            <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-mint-100 blur-3xl" />
            <div className="relative flex flex-col items-center">
              <Elir size={150} mood="celebrate" />
              <h2 className="display mt-4 text-4xl text-ink-950">Lección dominada</h2>
              <p className="mt-2 max-w-sm text-sm font-medium text-ink-500">
                Ejecutaste el bucle, predijiste su comportamiento y mediste su costo. Elir registra tu avance.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-4 py-2 text-xs font-extrabold text-mint-700">
                  <Zap size={12} strokeWidth={2.8} /> +50 XP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink-600 ring-1 ring-line">
                  <Trophy size={12} className="text-amber-500" /> {SIM_STEPS.length} micro-pasos ejecutados
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink-600 ring-1 ring-line">
                  <Check size={12} className="text-mint-600" /> Trivia superada
                </span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={resetAll} className="btn-pill btn-pill-paper">
                  <RotateCcw size={15} />
                  Repetir lección
                </button>
                <Link to="/dashboard" className="btn-pill btn-pill-ink">
                  Volver al panel
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {phase === 'done' && (
        <motion.section
          key="quiz-gen"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="surface p-6 sm:p-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <IconTile icon={Lightbulb} variant="mint" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">¿Quieres practicar más?</h2>
              <p className="text-xs font-medium text-ink-500">
                Elir puede generar un cuestionario completo sobre este tema.
              </p>
            </div>
          </div>
          <QuizGeneratorCard />
        </motion.section>
      )}
    </motion.div>
  );
};
