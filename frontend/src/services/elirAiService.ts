import { getToken } from '../api';
import { elirPlanService } from './elirPlanService';
import type { ElirSource } from '../model/elir';

export const ELIR_SYSTEM_PROMPT = `Eres Elir, el tutor socrático de Elyron, una plataforma educativa multi-institución (SENA y universidades). Tu misión es que el estudiante razone por sí mismo.

Reglas:
- Responde siempre en español, con tono cercano pero exigente.
- Sé breve: máximo 150 palabras por respuesta.
- Usa markdown ligero: **negritas** para lo clave y listas cortas cuando ayuden.
- Método socrático: explica lo mínimo indispensable y cierra SIEMPRE con una pregunta guía que lleve al estudiante al siguiente paso.
- Nunca resuelvas tareas ni evidencias completas; acompaña el razonamiento.
- Si preguntan por fechas de entrega, calificaciones o datos personales, aclara que no tienes acceso a esa información y sugiere dónde revisarla en la plataforma.`;

export class ElirUnavailableError extends Error {
  constructor(message = 'El servicio de IA no está disponible') {
    super(message);
    this.name = 'ElirUnavailableError';
  }
}

export type ElirStreamHandler = {
  /** Recibe el texto acumulado en cada token (streaming fluido). */
  onMessage: (accumulatedText: string) => void;
  /** Recibe las fuentes reales que el backend confirma que se usaron. */
  onSources?: (sources: ElirSource[]) => void;
  /** Recibe metadatos al terminar (id de conversación persistida). */
  onMeta?: (meta: { conversationId?: string }) => void;
  /** Se invoca ante un error de red, HTTP o del propio servicio de IA. */
  onError?: (error: unknown) => void;
  /** Se invoca al terminar la generación con el texto completo. */
  onComplete?: (fullText: string) => void;
};

export interface ElirHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ElirStreamArgs extends ElirStreamHandler {
  history: ElirHistoryTurn[];
  mode?: string;
  program?: string | null;
  libraryContext?: string | null;
  documentIds?: string[];
  conversationId?: string;
  signal?: AbortSignal;
}

const DONE_MARKER = '[DONE]';

/** Extrae el contenido útil de un payload SSE (string plano, {content}, {delta}). */
const extractContent = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload.length > 0) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.delta === 'string') return obj.delta;
    if (typeof obj.text === 'string') return obj.text;
  }
  return null;
};

interface EventResult {
  resolved: 'done' | 'error' | 'none';
  sources?: ElirSource[];
  meta?: { conversationId?: string };
}

/** Resuelve un `data:` event-block acumulando tokens, fuentes y metadatos. */
const consumeEventBlock = (
  block: string,
  fullText: { value: string },
  onMessage: (accumulatedText: string) => void,
  onSources?: (sources: ElirSource[]) => void,
  onMeta?: (meta: { conversationId?: string }) => void,
): EventResult => {
  const result: EventResult = { resolved: 'none' };

  for (const rawLine of block.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.startsWith('data:')) continue;

    const payload = line.slice(5).trim();
    if (payload === '') continue;
    if (payload === DONE_MARKER) {
      result.resolved = 'done';
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = payload;
    }

    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const err = obj.error;
      if (err && typeof err === 'object') {
        const e = err as { message?: unknown; code?: unknown };
        const msg =
          typeof e.message === 'string'
            ? e.message
            : 'El servidor de IA rechazó la consulta.';
        const code = typeof e.code === 'string' ? e.code : undefined;
        const eo = new Error(msg) as Error & { code?: string };
        eo.code = code;
        result.resolved = 'error';
        throw eo;
      }
      if (typeof err === 'string') {
        result.resolved = 'error';
        throw new Error(err);
      }
      if (Array.isArray(obj.sources)) {
        result.sources = obj.sources as ElirSource[];
        onSources?.(obj.sources as ElirSource[]);
      }
      if (obj.done === true) {
        result.meta = { conversationId: typeof obj.conversationId === 'string' ? obj.conversationId : undefined };
        onMeta?.(result.meta);
        result.resolved = 'done';
        continue;
      }
    }

    const content = extractContent(parsed);
    if (content !== null && content.length > 0) {
      fullText.value += content;
      onMessage(fullText.value);
    }
  }

  return result;
};

/**
 * Conecta con el streaming de Elir en el backend NestJS (SSE) vía `fetch`.
 * El backend valida límites y ownership, inyecta el contexto de los
 * documentos del usuario y devuelve las fuentes REALES utilizadas.
 */
export const streamElirChat = async ({
  history,
  mode,
  program,
  libraryContext,
  documentIds,
  conversationId,
  signal,
  onMessage,
  onSources,
  onMeta,
  onError,
  onComplete,
}: ElirStreamArgs): Promise<string> => {
  const token = getToken();
  let response: Response;

  try {
    response = await fetch(elirPlanService.chatStreamUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: history[history.length - 1]?.content ?? '',
        history: history.slice(0, -1).slice(-12).map((m) => ({ role: m.role, content: m.content })),
        mode,
        program: program || null,
        libraryContext: libraryContext || null,
        documentIds: documentIds?.length ? documentIds : undefined,
        conversationId,
      }),
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    const err = new ElirUnavailableError('Sin conexión con el servidor de IA');
    (err as Error & { cause?: unknown }).cause = cause;
    onError?.(err);
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const parsed = safeParse(body);
    const nested = (parsed?.message as Record<string, unknown> | undefined) ?? {};
    const code = typeof parsed?.code === 'string' ? parsed.code : typeof nested.code === 'string' ? nested.code : undefined;
    const message = typeof nested.message === 'string' ? nested.message : undefined;
    const err = new Error(
      `El servidor de IA respondió con estado ${response.status}${message ? `: ${message}` : ''}`,
    ) as Error & { code?: string; status?: number };
    err.code = code;
    err.status = response.status;
    onError?.(err);
    throw err;
  }

  if (!response.body) {
    const err = new ElirUnavailableError('El servidor de IA no devolvió un cuerpo legible');
    onError?.(err);
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const fullText = { value: '' };
  let done = false;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done: readDone, value } = await reader.read();
      if (readDone) break;
      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        const res = consumeEventBlock(block, fullText, onMessage, onSources, onMeta);
        if (res.resolved === 'done') {
          done = true;
          break;
        }
      }
      if (done) break;
    }

    buffer += decoder.decode();
    if (!done && buffer.trim()) {
      consumeEventBlock(buffer, fullText, onMessage, onSources, onMeta);
    }
  } catch (cause) {
    if (signal?.aborted) {
      onError?.(cause);
      throw cause;
    }
    const err =
      cause instanceof Error
        ? cause
        : new ElirUnavailableError('Interrupción inesperada durante el streaming');
    onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }

  if (!fullText.value.trim() && !done) {
    const err = new ElirUnavailableError('El servidor de IA devolvió una respuesta vacía');
    onError?.(err);
    throw err;
  }

  onComplete?.(fullText.value);
  return fullText.value;
};

const safeParse = (text: string): Record<string, unknown> | null => {
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    return typeof j === 'object' && j ? j : null;
  } catch {
    return null;
  }
};
