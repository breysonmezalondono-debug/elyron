import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';
import { Elir } from './Elir';
import { ElirLoader } from './ElirLoader';
import { ElirDisclaimer } from './ElirDisclaimer';
import { elirPlanService } from '../../services/elirPlanService';
import type { ElirQuiz, ElirQuizQuestion } from '../../model/elir';

interface QuizGeneratorCardProps {
  topicKey?: string;
}

const TYPE_LABEL: Record<string, string> = {
  multiple: 'Selección múltiple',
  truefalse: 'Verdadero / Falso',
  open: 'Respuesta abierta',
};

export const QuizGeneratorCard = ({ topicKey = 'default' }: QuizGeneratorCardProps) => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<ElirQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(true);
  const [tried, setTried] = useState(false);

  const handleGenerate = async () => {
    if (quiz || loading) return;
    setLoading(true);
    setTried(true);
    try {
      const generated = await elirPlanService.generarQuiz(topicKey === 'default' ? 'Tema general de estudio' : topicKey);
      setQuiz(generated);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, value: string) => {
    if (revealed[questionId]) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const reveal = (questionId: string) => {
    setRevealed((prev) => ({ ...prev, [questionId]: true }));
  };

  const score = quiz
    ? quiz.questions.filter((q) => q.type !== 'open' && answers[q.id] === q.correct).length
    : 0;

  const scoreTotal = quiz
    ? quiz.questions.filter((q) => q.type !== 'open').length
    : 0;

  return (
    <div className="mt-4 border-t border-line pt-4">
      {!quiz && !loading && (
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-4 py-2 text-xs font-extrabold text-mint-700 shadow-soft transition hover:border-mint-400 hover:bg-mint-50"
        >
          <Elir size={18} float={false} mood="happy" />
          Generar cuestionario con Elir
          <Sparkles size={13} className="text-mint-400" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-mint-100 bg-mint-50/50 px-4 py-3"
          >
            <ElirLoader variant="inline" />
            <div className="flex-1">
              <p className="text-xs font-bold text-mint-800">Elir está generando el cuestionario…</p>
              <p className="text-[11px] font-medium text-mint-600">
                Seleccionando preguntas relevantes a tu tema
              </p>
            </div>
            <Elir size={28} float={false} mood="thinking" />
          </motion.div>
        )}

        {quiz && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl border border-mint-200 bg-white shadow-soft"
          >
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-canvas-deep/30"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-100">
                <Sparkles size={16} className="text-mint-600" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-ink-900">{quiz.title}</span>
                <span className="block text-[11px] font-semibold text-ink-400">
                  {quiz.topic} · {quiz.questions.length} preguntas
                </span>
              </span>
              {scoreTotal > 0 && (
                <span className="shrink-0 rounded-full bg-mint-100 px-2.5 py-1 text-[10px] font-extrabold text-mint-700">
                  {score}/{scoreTotal}
                </span>
              )}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-ink-400" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 border-t border-line px-5 py-5">
                    {quiz.questions.map((q, idx) => (
                      <QuizQuestion
                        key={q.id}
                        question={q}
                        index={idx}
                        selected={answers[q.id]}
                        isRevealed={!!revealed[q.id]}
                        onSelect={(val) => selectAnswer(q.id, val)}
                        onReveal={() => reveal(q.id)}
                      />
                    ))}
                  </div>

                  <div className="border-t border-line px-5 py-3">
                    <ElirDisclaimer />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && tried && !quiz && (
          <motion.p
            key="no-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-semibold text-ink-400"
          >
            No se pudo generar el cuestionario.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

interface QuizQuestionProps {
  question: ElirQuizQuestion;
  index: number;
  selected?: string;
  isRevealed: boolean;
  onSelect: (value: string) => void;
  onReveal: () => void;
}

const QuizQuestion = ({
  question,
  index,
  selected,
  isRevealed,
  onSelect,
  onReveal,
}: QuizQuestionProps) => {
  const isCorrect = selected === question.correct;
  const isTrueFalse = question.type === 'truefalse';
  const isOpen = question.type === 'open';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas-deep text-[11px] font-extrabold text-ink-500">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-ink-800">{question.question}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-ink-400">{TYPE_LABEL[question.type]}</p>
        </div>
      </div>

      {isTrueFalse ? (
        <div className="ml-10 flex gap-2">
          {['true', 'false'].map((val) => {
            const active = selected === val;
            return (
              <button
                key={val}
                type="button"
                disabled={isRevealed}
                onClick={() => onSelect(val)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isRevealed && val === question.correct
                    ? 'border-mint-400 bg-mint-50 text-mint-800 ring-4 ring-mint-100'
                    : isRevealed && active && !isCorrect
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : active
                        ? 'border-ink-300 bg-ink-900 text-white'
                        : 'border-line-strong/70 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-800'
                }`}
              >
                {val === 'true' ? 'Verdadero' : 'Falso'}
              </button>
            );
          })}
        </div>
      ) : isOpen ? (
        <div className="ml-10">
          <textarea
            value={selected ?? ''}
            onChange={(e) => onSelect(e.target.value)}
            disabled={isRevealed}
            placeholder="Escribe tu respuesta aquí…"
            rows={3}
            className={`w-full resize-none rounded-2xl border bg-canvas-deep/30 px-4 py-3 text-sm text-ink-700 outline-none transition placeholder:text-ink-400 focus:border-mint-400 focus:bg-white focus:ring-4 focus:ring-mint-100 ${
              isRevealed ? 'border-line cursor-default' : 'border-line-strong/70'
            }`}
          />
        </div>
      ) : (
        <div className="ml-10 space-y-2">
          {question.options?.map((opt, i) => {
            const active = selected === opt;
            return (
              <button
                key={i}
                type="button"
                disabled={isRevealed}
                onClick={() => onSelect(opt)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                  isRevealed && opt === question.correct
                    ? 'border-mint-400 bg-mint-50 text-mint-800 ring-4 ring-mint-100'
                    : isRevealed && active && !isCorrect
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : isRevealed && active
                        ? 'border-line bg-white text-ink-300'
                        : active
                          ? 'border-ink-300 bg-ink-900 text-white'
                          : 'border-line-strong/70 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                      isRevealed && opt === question.correct
                        ? 'bg-mint-500 text-white'
                        : isRevealed && active && !isCorrect
                          ? 'bg-red-500 text-white'
                          : active
                            ? 'bg-white/20 text-white'
                            : 'bg-canvas-deep text-ink-500'
                    }`}
                  >
                    {isRevealed && opt === question.correct ? (
                      <Check size={11} strokeWidth={3.2} />
                    ) : isRevealed && active && !isCorrect ? (
                      <X size={11} strokeWidth={3.2} />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!isRevealed && ((selected && !isOpen) || (isOpen && selected?.trim())) && (
        <div className="ml-10">
          <button
            type="button"
            onClick={onReveal}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs font-extrabold text-white shadow-[0_2px_0_#18181b] transition active:translate-y-0.5 active:shadow-none"
          >
            <CheckCircle2 size={13} />
            Verificar respuesta
          </button>
        </div>
      )}

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-10"
          >
            <div
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                isCorrect || isOpen
                  ? 'border-mint-200 bg-mint-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <Elir size={36} float={false} mood={isCorrect || isOpen ? 'happy' : 'thinking'} />
              <div className="min-w-0">
                <p
                  className={`text-xs font-extrabold ${
                    isCorrect || isOpen ? 'text-mint-800' : 'text-amber-800'
                  }`}
                >
                  {isOpen
                    ? 'Revisa tu respuesta:'
                    : isCorrect
                      ? 'Correcto.'
                      : 'No es la correcta.'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">
                  {question.feedback}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
