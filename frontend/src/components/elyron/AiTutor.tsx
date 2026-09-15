import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Copy,
  FileText,
  ImagePlus,
  Minus,
  Paperclip,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Elir } from './Elir';
import { ElirLoader } from './ElirLoader';
import { ElirDisclaimer } from './ElirDisclaimer';
import type { ElirMessage, ElirSource } from '../../model/elir';
import { ELIR_QUICK_QUESTIONS, newElirSession } from '../../model/mock/elirData';
import { streamElirChat } from '../../services/elirAiService';
import { elirPlanService, parseElirError } from '../../services/elirPlanService';
import type { UsoElirFront } from '../../services/elirPlanService';
import { ELIR_PLANS, formatCOP, PRO_ONLY_FEATURES } from '../../model/plans';
import type { PlanId } from '../../model/plans';
import { perfilService } from '../../services/perfilService';

interface AiTutorProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export type TutorMode = 'responder' | 'explicar' | 'guiarme' | 'practicar' | 'examinarme';

const TUTOR_MODES: Array<{ id: TutorMode; label: string }> = [
  { id: 'responder', label: 'Responder' },
  { id: 'explicar', label: 'Explicar' },
  { id: 'guiarme', label: 'Guiarme' },
  { id: 'practicar', label: 'Practicar' },
  { id: 'examinarme', label: 'Examinarme' },
];

const EMPTY_SUGGESTIONS = [
  'Explícame un tema',
  'Prepárame para un examen',
  'Quiero practicar',
  'Busca en mi biblioteca',
];

const MARKDOWN_STYLES =
  '[&_p]:mt-2 [&_p:first-child]:mt-0 [&_strong]:font-extrabold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mt-0.5 [&_code]:rounded-md [&_code]:bg-canvas-deep [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]';

interface Adjunto {
  id: string;
  name: string;
  size: number;
  tipo: 'file' | 'image';
  preview?: string;
  file: File;
}

let messageId = 1;

export const AiTutor = ({ open, onOpenChange }: AiTutorProps) => {
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [messages, setMessages] = useState<ElirMessage[]>(() => newElirSession().messages);
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [modo, setModo] = useState<TutorMode>('responder');
  const [uso, setUso] = useState<UsoElirFront | null>(null);
  const [verPlanes, setVerPlanes] = useState(false);
  const [programa, setPrograma] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /* ---- Cargar plan y programa ---- */
  useEffect(() => {
    if (open) {
      void elirPlanService.estadoDeUso().then(setUso);
      void perfilService
        .miPerfil()
        .then((p) => setPrograma(p?.programaFormacion ?? null))
        .catch(() => setPrograma(null));
    }
  }, [open]);

  const plan = useMemo(
    () => (uso ? ELIR_PLANS[uso.plan as PlanId] ?? ELIR_PLANS.free : ELIR_PLANS.free),
    [uso],
  );

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (stickToBottom.current) scrollToBottom(true);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [messages, adjuntos, verPlanes]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const d = el.scrollHeight - (el.scrollTop + el.clientHeight);
      stickToBottom.current = d < 80;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, minimized]);

  const patchLast = (patch: (msg: ElirMessage) => ElirMessage) => {
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = patch(next[next.length - 1]);
      return next;
    });
  };

  /* ---- Contexto académico para el prompt ---- */
  const contextoSistema = useMemo(() => {
    const partes: string[] = [];
    partes.push(`Programa académico del estudiante: ${programa ?? 'no especificado'}.`);
    if (modo === 'guiarme') {
      partes.push(
        'Modo GUÍAME: NO des la respuesta directa. Primero pregunta "¿Qué has intentado?", luego "¿Qué concepto crees que debes aplicar?", y guía con pistas. Sé socrático.',
      );
    } else if (modo === 'explicar') {
      partes.push('Modo EXPLICAR: explica paso a paso, con ejemplos y lenguaje claro según el nivel del estudiante.');
    } else if (modo === 'practicar') {
      partes.push('Modo PRACTICAR: propón un ejercicio o problema y guía su resolución, corrigiendo con retroalimentación.');
    } else if (modo === 'examinarme') {
      partes.push('Modo EXAMINARME: hazme preguntas tipo evaluación, una a la vez, y da retroalimentación al final.');
    }
    return partes.join(' ');
  }, [programa, modo]);

  const deliverAnswer = async (
    questionText: string,
    history: ElirMessage[],
    context?: string,
    adjs?: Adjunto[],
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const turns = history
      .filter((m) => m.text.trim().length > 0)
      .map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));
    const isCurrent = () => abortRef.current === controller;

    // Sube los adjuntos reales al backend (valida límites y ownership).
    let documentIds: string[] | undefined;
    const filesToUpload = adjs ?? [];
    if (filesToUpload.length) {
      try {
        const uploaded: string[] = [];
        for (const a of filesToUpload) {
          const doc = await elirPlanService.subirDocumento(a.file, programa);
          uploaded.push(doc.id);
        }
        documentIds = uploaded;
      } catch (e) {
        const info = parseElirError(e);
        patchLast((m) => ({
          ...m,
          streaming: false,
          text: `No pude procesar un adjunto: ${info.message ?? 'inténtalo de nuevo'}`,
        }));
        setBusy(false);
        return;
      }
    }

    try {
      let sources: ElirSource[] = [];
      await streamElirChat({
        history: [...turns, { role: 'user', content: questionText }],
        mode: modo,
        program: programa,
        libraryContext: context || undefined,
        documentIds,
        conversationId,
        signal: controller.signal,
        onMessage: (acc) => patchLast((m) => ({ ...m, text: acc, streaming: true })),
        onSources: (srcs) => {
          sources = srcs;
          patchLast((m) => ({ ...m, sources: srcs }));
        },
        onMeta: (meta) => {
          if (meta.conversationId) setConversationId(meta.conversationId);
        },
        onError: () => {
          if (isCurrent() && !controller.signal.aborted) setOffline(true);
        },
        onComplete: () => {
          if (isCurrent()) setOffline(false);
        },
      });
      if (isCurrent()) {
        patchLast((m) => ({ ...m, streaming: false, sources: sources.length ? sources : m.sources }));
        setOffline(false);
        setBusy(false);
        void elirPlanService.estadoDeUso().then(setUso);
      }
    } catch (err) {
      if (controller.signal.aborted) {
        if (isCurrent()) {
          patchLast((m) => ({ ...m, streaming: false }));
          setBusy(false);
        }
        return;
      }
      const info = parseElirError(err);
      if (info.code === 'LIMIT_REACHED') {
        patchLast((m) => ({
          ...m,
          streaming: false,
          text: 'Has alcanzado el límite de tu plan gratuito.\n\nPuedes continuar mañana o actualizar a Pro.',
        }));
        setVerPlanes(true);
      } else {
        setOffline(true);
        const local = `Entiendo tu pregunta sobre **${questionText.slice(0, 60)}**. ${context ?? ''}
No tengo conexión con el servicio de IA en este momento. Cuando vuelva a estar disponible, podré analizar tus documentos y darte una respuesta con fuentes verificadas.
**Puedes intentar:** revisar tu Biblioteca Elyron o reenviar tu consulta.`;
        if (isCurrent()) patchLast((m) => ({ ...m, text: local, streaming: false, sources: undefined }));
      }
      setBusy(false);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const agregarArchivo = (file: File, tipo: 'file' | 'image') => {
    if (!plan.features.fileUpload) {
      setVerPlanes(true);
      return;
    }
    const maxMB = plan.limits.maxFileSizeMB;
    if (file.size > maxMB * 1024 * 1024) return;
    const id = `adj-${Date.now()}-${Math.random()}`;
    const adj: Adjunto = { id, name: file.name, size: file.size, tipo, file };
    if (tipo === 'image') {
      adj.preview = URL.createObjectURL(file);
    }
    setAdjuntos((prev) => [...prev, adj]);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) agregarArchivo(f, 'file');
    e.target.value = '';
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) agregarArchivo(f, 'image');
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    files.forEach((f) => {
      const esImagen = f.type.startsWith('image/');
      agregarArchivo(f, esImagen ? 'image' : 'file');
    });
  };

  const quitarAdjunto = (id: string) => {
    const a = adjuntos.find((x) => x.id === id);
    if (a?.preview) URL.revokeObjectURL(a.preview);
    setAdjuntos((prev) => prev.filter((x) => x.id !== id));
  };

  const send = (raw?: string, adjs = adjuntos) => {
    const text = (raw ?? input).trim();
    if ((!text && adjs.length === 0) || busy) return;

    // Registro de uso de mensaje
    if (uso) {
      const restantes = uso.limites.messagesPerDay - uso.mensajes;
      if (restantes <= 0) {
        setVerPlanes(true);
        return;
      }
    }

    setMessages((prev) => [
      ...prev,
      { id: `msg-${messageId++}`, role: 'user', text: text || (adjs.length ? '[Adjunto]' : '') },
      { id: `msg-${messageId++}`, role: 'elir', text: '', streaming: true },
    ]);
    setInput('');
    setAdjuntos((prev) => {
      prev.forEach((a) => a.preview && URL.revokeObjectURL(a.preview));
      return [];
    });
    setBusy(true);
    void deliverAnswer(
      text || 'Analiza el documento adjunto',
      messages,
      contextoSistema || undefined,
      adjs,
    );
  };

  /* ---- Acciones por respuesta ---- */
  const copiar = async (msg: ElirMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
    } catch {
      /* ignora */
    }
  };

  const accionAcademica = (accion: string, msg: ElirMessage) => {
    const pregunta = `${accion}: ${msg.text.slice(0, 80)}`;
    setMessages((prev) => [
      ...prev,
      { id: `msg-${messageId++}`, role: 'user', text: pregunta },
      { id: `msg-${messageId++}`, role: 'elir', text: '', streaming: true },
    ]);
    setBusy(true);
    void deliverAnswer(pregunta, messages, contextoSistema || undefined);
  };

  const mensajesRestantes = uso ? Math.max(0, uso.limites.messagesPerDay - uso.mensajes) : null;
  const pctUso = uso && uso.limites.messagesPerDay > 0 ? Math.min(100, Math.round((uso.mensajes / uso.limites.messagesPerDay) * 100)) : 0;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            type="button"
            aria-label="Abrir a Elir, tutor IA"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onOpenChange(true)}
            className="fixed bottom-6 right-6 z-50 grid size-[68px] place-items-center rounded-full border border-line bg-white shadow-pop"
          >
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint-400/50" />
            <Elir size={48} float={false} mood="happy" className="relative" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex h-[min(640px,88vh)] w-[400px] max-w-[calc(100vw-3rem)] origin-bottom-right flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-pop"
          >
            {/* Header */}
            <header className="border-b border-line bg-gradient-to-br from-ink-950 to-ink-800 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <Elir size={42} float={false} mood={busy ? 'thinking' : 'happy'} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold tracking-tight">Elir</p>
                  <p className="truncate text-[11px] font-semibold text-white/60">
                    Asistente académico · {plan.name}
                    {programa ? ` · ${programa}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVerPlanes(true)}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white/80 transition hover:bg-white/20"
                >
                  {plan.name}
                </button>
                <button
                  type="button"
                  aria-label={minimized ? 'Expandir' : 'Minimizar'}
                  onClick={() => setMinimized((m) => !m)}
                  className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <Minus size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => onOpenChange(false)}
                  className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
              {!minimized && uso && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white/60">
                    <span>Mensajes hoy</span>
                    <span>
                      {uso.mensajes}/{uso.limites.messagesPerDay}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/15">
                    <span
                      className="block h-full rounded-full bg-mint-400 transition-all"
                      style={{ width: `${pctUso}%` }}
                    />
                  </div>
                </div>
              )}
            </header>

            {offline && !minimized && (
              <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-bold text-amber-700">
                <TriangleAlert size={13} className="shrink-0" />
                Servidor de IA no disponible — respondiendo de forma segura.
              </div>
            )}

            {!minimized && (
              <>
                {/* Modos de tutor */}
                <div className="flex gap-1 border-b border-line bg-white px-3 py-2">
                  {TUTOR_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModo(m.id)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                        modo === m.id
                          ? 'bg-ink-900 text-white'
                          : 'text-ink-500 hover:bg-canvas-deep hover:text-ink-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Chat */}
                <div
                  ref={scrollRef}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`relative flex flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-4 transition ${dragOver ? 'ring-2 ring-mint-400 ring-inset' : ''}`}
                >
                  {dragOver && (
                    <div className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-mint-400 bg-mint-50/80">
                      <p className="text-sm font-extrabold text-mint-700">Suelta tu archivo aquí</p>
                    </div>
                  )}

                  {messages.length === 1 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
                      <Elir size={80} float={false} mood="happy" />
                      <div>
                        <p className="display text-xl text-ink-950">Hola, soy Elir.</p>
                        <p className="mt-1 text-sm font-semibold text-ink-500">
                          Tu tutor académico dentro de Elyron.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {EMPTY_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => send(s)}
                            className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-ink-600 shadow-soft transition hover:border-mint-400 hover:text-mint-700"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) =>
                      msg.role === 'user' ? (
                        <div
                          key={msg.id}
                          className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-ink-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
                        >
                          {msg.text}
                        </div>
                      ) : (
                        <div key={msg.id} className="max-w-[92%] self-start">
                          <div
                            className={`rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 text-sm leading-relaxed text-ink-800 shadow-soft ${MARKDOWN_STYLES}`}
                          >
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                            {msg.streaming && (
                              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-mint-500 align-middle" />
                            )}
                          </div>

                          {msg.sources && msg.sources.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 space-y-1"
                            >
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                                Fuentes utilizadas
                              </p>
                              {msg.sources.map((src) => (
                                <div
                                  key={src.name}
                                  className="flex items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-1.5 text-[11px] shadow-soft"
                                >
                                  <FileText size={12} className="shrink-0 text-mint-600" />
                                  <span className="min-w-0 flex-1 truncate font-bold text-ink-700">
                                    {src.name}
                                  </span>
                                  <span className="shrink-0 rounded-md bg-canvas-deep px-1.5 py-px text-[9px] font-extrabold text-ink-500">
                                    pág. {src.page} · {src.score}%
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}

                          {!msg.streaming && msg.text && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                aria-label="Me gusta"
                                className="grid size-6 place-items-center rounded-md text-ink-400 transition hover:bg-canvas-deep hover:text-mint-600"
                              >
                                <ThumbsUp size={11} />
                              </button>
                              <button
                                type="button"
                                aria-label="No me gusta"
                                className="grid size-6 place-items-center rounded-md text-ink-400 transition hover:bg-canvas-deep hover:text-red-500"
                              >
                                <ThumbsDown size={11} />
                              </button>
                              <button
                                type="button"
                                aria-label="Copiar"
                                onClick={() => copiar(msg)}
                                className="grid size-6 place-items-center rounded-md text-ink-400 transition hover:bg-canvas-deep hover:text-ink-700"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                type="button"
                                aria-label="Regenerar"
                                onClick={() => accionAcademica('Regenera esta respuesta', msg)}
                                className="grid size-6 place-items-center rounded-md text-ink-400 transition hover:bg-canvas-deep hover:text-ink-700"
                              >
                                <RefreshCw size={11} />
                              </button>
                              {plan.features.quizGeneration && (
                                <button
                                  type="button"
                                  onClick={() => accionAcademica('Crea un quiz', msg)}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-mint-700 transition hover:bg-mint-50"
                                >
                                  <Sparkles size={10} /> Quiz
                                </button>
                              )}
                              {plan.features.advancedTutor && (
                                <button
                                  type="button"
                                  onClick={() => accionAcademica('Crea ejercicios', msg)}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-mint-700 transition hover:bg-mint-50"
                                >
                                  <Sparkles size={10} /> Ejercicios
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )
                  )}

                  {busy && messages[messages.length - 1]?.text === '' && (
                    <div className="flex items-center gap-2 self-start rounded-2xl border border-line bg-white px-4 py-3 shadow-soft">
                      <ElirLoader variant="inline" label="Elir está pensando…" />
                    </div>
                  )}

                  {messages.length === 1 && !busy && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {ELIR_QUICK_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => send(q)}
                          className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-ink-600 shadow-soft transition hover:border-mint-400 hover:text-mint-700"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-line bg-white px-4 py-2">
                  <ElirDisclaimer />
                </div>

                {/* Composer */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="border-t border-line bg-white p-3"
                >
                  {adjuntos.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {adjuntos.map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas-deep px-2 py-1 text-[11px] font-bold text-ink-700"
                        >
                          {a.tipo === 'image' && a.preview ? (
                            <img src={a.preview} alt="" className="h-5 w-5 rounded object-cover" />
                          ) : (
                            <FileText size={12} className="text-mint-600" />
                          )}
                          <span className="max-w-32 truncate">{a.name}</span>
                          <button
                            type="button"
                            aria-label="Quitar adjunto"
                            onClick={() => quitarAdjunto(a.id)}
                            className="text-ink-400 transition hover:text-red-500"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Adjuntar archivo"
                      title="Adjuntar archivo"
                      onClick={() => fileInputRef.current?.click()}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-mint-600"
                    >
                      <Paperclip size={17} />
                    </button>
                    <button
                      type="button"
                      aria-label="Adjuntar imagen"
                      title="Adjuntar imagen"
                      onClick={() => imageInputRef.current?.click()}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-mint-600"
                    >
                      <ImagePlus size={17} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={onFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    />
                    <input
                      type="file"
                      ref={imageInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={onImageChange}
                    />
                    <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={onImageChange} />

                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Pregúntale a Elir…"
                      className="h-11 min-w-0 flex-1 rounded-full border border-line bg-canvas-deep/60 px-4 text-sm font-medium outline-none transition placeholder:text-ink-400 focus:border-mint-400 focus:bg-white focus:ring-4 focus:ring-mint-100"
                    />
                    <button
                      type="submit"
                      disabled={busy || (!input.trim() && adjuntos.length === 0)}
                      aria-label="Enviar"
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-500 text-white shadow-[0_3px_0_#16a34a] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none"
                    >
                      <Send size={16} />
                    </button>
                    {busy && (
                      <button
                        type="button"
                        onClick={stop}
                        aria-label="Detener"
                        className="grid size-11 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                      >
                        <Square size={14} fill="currentColor" />
                      </button>
                    )}
                  </div>
                  {mensajesRestantes !== null && mensajesRestantes <= 3 && (
                    <p className="mt-2 text-center text-[10px] font-bold text-amber-600">
                      {mensajesRestantes === 0
                        ? 'Has alcanzado el límite de tu plan. Puedes continuar mañana o actualizar a Pro.'
                        : `Te quedan ${mensajesRestantes} mensajes hoy.`}
                      <button
                        type="button"
                        onClick={() => setVerPlanes(true)}
                        className="ml-1 font-extrabold text-mint-600 underline"
                      >
                        Ver planes
                      </button>
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modal de planes */}
      <AnimatePresence>
        {verPlanes && (
          <motion.div
            key="planes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/40 p-4 backdrop-blur-sm"
            onClick={() => setVerPlanes(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white p-6 shadow-pop"
            >
              <div className="flex items-center justify-between">
                <h2 className="display text-2xl text-ink-950">Planes de Elir</h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setVerPlanes(false)}
                  className="grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-canvas-deep"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="mt-1 text-sm font-medium text-ink-500">
                Elige el plan que se ajuste a tu ritmo de estudio.
              </p>

              <div className="mt-5 space-y-3">
                {([ELIR_PLANS.free, ELIR_PLANS.pro, ELIR_PLANS.premium] as const).map((p) => {
                  const activo = uso?.plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`rounded-2xl border p-4 transition ${
                        activo ? 'border-mint-400 bg-mint-50/50 ring-1 ring-mint-200' : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-ink-900">
                            {p.name}
                            {activo && (
                              <span className="ml-2 rounded-full bg-mint-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-mint-700">
                                Actual
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-semibold text-ink-500">{p.tagline}</p>
                        </div>
                        <p className="text-lg font-extrabold tabular-nums text-ink-950">
                          {formatCOP(p.priceCOP)}
                          <span className="text-xs font-semibold text-ink-400">/mes</span>
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-600">
                        <span>{p.limits.messagesPerDay} mensajes/día</span>
                        <span>{p.limits.filesPerDay} archivos/día</span>
                        <span>{p.limits.imagesPerDay} imágenes/día</span>
                        <span>máx {p.limits.maxFileSizeMB} MB</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-canvas-deep/50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                  Disponible en Pro / Premium
                </p>
                <ul className="mt-2 space-y-1">
                  {PRO_ONLY_FEATURES.map((f) => (
                    <li key={f.key} className="flex items-center gap-2 text-xs font-semibold text-ink-600">
                      <Check size={13} className="text-mint-600" /> {f.label}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setVerPlanes(false)}
                  className="btn-pill btn-pill-mint mt-4 w-full justify-center"
                >
                  Actualizar a Pro
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
