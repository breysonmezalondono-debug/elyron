import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  FileText,
  ListChecks,
  Sparkles,
  Target,
} from 'lucide-react';
import { Elir } from './Elir';
import { ElirLoader } from './ElirLoader';
import { ElirDisclaimer } from './ElirDisclaimer';
import { EVIDENCE_ANALYSES } from '../../model/mock/evidenceData';
import type { ElirAnalysis } from '../../model/elir';

interface EvidenceAnalysisCardProps {
  evidenceId: string;
}

const SECTIONS = [
  { key: 'objectives', label: 'Objetivos', icon: Target },
  { key: 'activities', label: 'Actividades', icon: ListChecks },
  { key: 'dates', label: 'Fechas clave', icon: CalendarDays },
  { key: 'tasks', label: 'Tareas accionables', icon: CheckSquare },
] as const;

export const EvidenceAnalysisCard = ({ evidenceId }: EvidenceAnalysisCardProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ElirAnalysis | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [tried, setTried] = useState(false);

  const handleAnalyze = () => {
    if (result || loading) return;
    setLoading(true);
    setTried(true);
    setTimeout(() => {
      setResult(EVIDENCE_ANALYSES[evidenceId] ?? null);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      {!result && !loading && (
        <button
          type="button"
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-4 py-2 text-xs font-extrabold text-mint-700 shadow-soft transition hover:border-mint-400 hover:bg-mint-50"
        >
          <Elir size={18} float={false} mood="happy" />
          Analizar con Elir
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
              <p className="text-xs font-bold text-mint-800">Elir está analizando el documento…</p>
              <p className="text-[11px] font-medium text-mint-600">
                Extrayendo texto y evaluando contenido estructural
              </p>
            </div>
            <Elir size={28} float={false} mood="thinking" />
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
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
                <span className="block text-sm font-extrabold text-ink-900">
                  Análisis de Elir
                </span>
                <span className="block text-[11px] font-semibold text-ink-400">
                  Resultado estructurado del documento
                </span>
              </span>
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
                  <div className="space-y-7 border-t border-line px-5 py-5">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-ink-400" />
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                          Resumen
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-700">{result.summary}</p>
                    </div>

                    {SECTIONS.map(({ key, label, icon: Icon }) => {
                      const items = result[key] as string[];
                      if (!items || items.length === 0) return null;
                      const isTasks = key === 'tasks';
                      return (
                        <div key={key}>
                          <div className="mb-3 flex items-center gap-2">
                            <Icon
                              size={14}
                              strokeWidth={2.2}
                              className={isTasks ? 'text-mint-500' : 'text-ink-400'}
                            />
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                              {label}
                            </p>
                          </div>
                          <ul className="space-y-2">
                            {items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
                                {isTasks ? (
                                  <span className="mt-1 size-4 shrink-0 rounded border-2 border-line-strong" />
                                ) : (
                                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-300" />
                                )}
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-line px-5 py-3">
                    <ElirDisclaimer />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && tried && !result && (
          <motion.p
            key="no-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-semibold text-ink-400"
          >
            No se encontró análisis para esta evidencia.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
