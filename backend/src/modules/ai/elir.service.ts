import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElirPlansService } from './elir-plans.service';
import { ElirFilesService } from './elir-files.service';
import { AiService } from './ai.service';
import { ElirConversation } from './entities/elir-conversation.entity';
import {
  ElirMessage,
  ElirCitationSource,
} from './entities/elir-message.entity';

export interface ElirChatStreamDto {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  documentIds?: string[];
  mode?: 'responder' | 'explicar' | 'guiarme' | 'practicar' | 'examinarme';
  program?: string | null;
  libraryContext?: string | null;
  conversationId?: string;
}

const MAX_CONTEXT_CHARS = 60_000;

@Injectable()
export class ElirService {
  private readonly logger = new Logger(ElirService.name);

  constructor(
    private readonly plans: ElirPlansService,
    private readonly files: ElirFilesService,
    private readonly ai: AiService,
    @InjectRepository(ElirConversation)
    private readonly convRepo: Repository<ElirConversation>,
    @InjectRepository(ElirMessage)
    private readonly msgRepo: Repository<ElirMessage>,
  ) {}

  private modoInstruccion(mode: ElirChatStreamDto['mode']): string {
    switch (mode) {
      case 'guiarme':
        return 'Modo GUÍAME (socrático): NO entregues la respuesta directa. Primero pregunta "¿Qué has intentado?", después "¿Qué concepto crees que debes aplicar?", y guía con pistas hasta que el estudiante llegue solo a la solución. Sé breve y una pregunta a la vez.';
      case 'explicar':
        return 'Modo EXPLICAR: explica paso a paso, con ejemplos y lenguaje claro según el nivel académico del estudiante. Cierra con una pregunta que verifique comprensión.';
      case 'practicar':
        return 'Modo PRACTICAR: propón un ejercicio o problema concreto y guía su resolución, corrigiendo con retroalimentación.';
      case 'examinarme':
        return 'Modo EXAMINARME: formula preguntas tipo evaluación, UNA a la vez, y da retroalimentación constructiva al final de cada respuesta.';
      default:
        return 'Modo RESPONDER: responde con claridad, respetando el método socrático cuando ayude a razonar.';
    }
  }

  private buildSystemPrompt(
    dto: ElirChatStreamDto,
    docs: { id: string; name: string; text: string }[],
  ): string {
    const partes: string[] = [
      'Eres Elir, el tutor académico inteligente de Elyron. Responde siempre en español, con tono cercano, exigente y académico.',
      'Responsabilidad académica: no afirmes que algo es correcto si no tienes suficiente información. Si la respuesta depende de un documento y no está en el contexto, dilo ("Necesito revisar el documento" o "Esto no aparece en las fuentes disponibles").',
      'Nunca resuelvas evidencias ni entregas finales completas por el estudiante; acompaña su razonamiento.',
      'NO inventes documentos, citas ni fuentes. Solo puedes citar los documentos que se incluyan explícitamente en el contexto de esta consulta.',
    ];
    if (dto.program) {
      partes.push(
        `Contexto académico: el estudiante pertenece al programa "${dto.program}". Responde únicamente con base en recursos y biblioteca de este programa; no traigas contenido de otros programas.`,
      );
    } else {
      partes.push(
        'Contexto académico: no se informó el programa del estudiante. No asumas un programa específico ni inventes su biblioteca.',
      );
    }
    if (dto.libraryContext) {
      partes.push(`Biblioteca Elyron disponible:\n${dto.libraryContext}`);
    }
    partes.push(this.modoInstruccion(dto.mode));

    if (docs.length > 0) {
      const contexto = docs
        .map(
          (d) =>
            `--- DOCUMENTO: ${d.name} ---\n${d.text}\n--- FIN DOCUMENTO ${d.name} ---`,
        )
        .join('\n\n')
        .slice(0, MAX_CONTEXT_CHARS);
      partes.push(
        `El estudiante adjuntó los siguientes documentos. Úsalos como fuente principal de la respuesta.\n${contexto}`,
      );
      partes.push(
        `Al responder, cuando uses información de un documento, indícalo citando el nombre exacto del documento que aparece en los bloques anteriores. No cites ningún otro documento ni inventes páginas.`,
      );
    } else {
      partes.push(
        'No se adjuntó ningún documento. Responde con tus conocimientos y, si hace falta un documento del programa, indícalo con honestidad.',
      );
    }
    return partes.join('\n\n');
  }

  /**
   * Orquesta una respuesta de Elir con streaming:
   * 1) valida y registra el uso del mensaje (backend),
   * 2) carga los documentos del usuario verificando ownership,
   * 3) construye el prompt real y lo envía al proveedor,
   * 4) emite eventos SSE ({content} … {sources} … {done}),
   * 5) persiste la conversación y los mensajes con sus citas reales.
   */
  async *streamChat(
    userId: string,
    rol: string | undefined,
    dto: ElirChatStreamDto,
  ): AsyncGenerator<Record<string, unknown>, void, void> {
    await this.plans.registrarUso(userId, rol, 'message');

    const docs = await this.files.loadContextFor(
      userId,
      dto.documentIds?.slice(0, 5) ?? [],
    );
    const docTexts = docs
      .filter((d) => d.extractedText)
      .map((d) => ({ id: d.id, name: d.originalName, text: d.extractedText! }));

    const systemPrompt = this.buildSystemPrompt(dto, docTexts);
    const history = (dto.history ?? []).slice(-12).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 12000),
    }));
    const userMessage =
      dto.message?.trim() ||
      (docs.length ? 'Analiza los documentos adjuntos' : '');

    // Persistencia del historial
    const conv = await this.resolveConversation(
      userId,
      dto,
      docs[0]?.program ?? dto.program ?? null,
    );
    const savedUser = await this.msgRepo.save(
      this.msgRepo.create({
        conversationId: conv.id,
        role: 'user',
        content: userMessage,
      }),
    );
    void savedUser;

    let full = '';
    const usage: { inputTokens?: number; outputTokens?: number } = {};
    try {
      const stream = this.ai.streamChat(
        [...history, { role: 'user', content: userMessage }],
        systemPrompt,
      );

      while (true) {
        const { done, value } = await stream.next();
        if (done) {
          Object.assign(usage, value ?? {});
          break;
        }
        full += value;
        yield { content: value };
      }
    } catch (err) {
      this.logger.error(
        `Error en stream de Elir: ${err instanceof Error ? err.message : err}`,
      );
      // Guardamos el error real; el frontend lo muestra con honestidad.
      yield {
        content:
          '\n\n_[El servicio de IA no respondió correctamente. Revisa tu conexión e inténtalo de nuevo.]_',
      };
    }

    const sources: ElirCitationSource[] = docs
      .filter((d) => d.extractedText)
      .map((d) => ({
        id: d.id,
        name: d.originalName,
        page: null,
        score: 100,
        quote: undefined,
        kind: d.kind,
      }));

    const final = full.trim();
    if (final) {
      await this.msgRepo.save(
        this.msgRepo.create({
          conversationId: conv.id,
          role: 'assistant',
          content: final,
          sources: sources.length ? sources : null,
        }),
      );
    }

    yield { sources };
    yield {
      done: true,
      conversationId: conv.id,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      },
    };
  }

  private async resolveConversation(
    userId: string,
    dto: ElirChatStreamDto,
    program: string | null,
  ): Promise<ElirConversation> {
    if (dto.conversationId) {
      const existing = await this.convRepo
        .findOne({ where: { id: dto.conversationId, ownerId: userId } })
        .catch(() => null);
      if (existing) {
        existing.title =
          existing.title === 'Nueva conversación'
            ? this.deriveTitle(dto.message)
            : existing.title;
        existing.mode = dto.mode ?? existing.mode;
        if (program) existing.program = program;
        return this.convRepo.save(existing);
      }
    }
    return this.convRepo.save(
      this.convRepo.create({
        ownerId: userId,
        title: this.deriveTitle(dto.message),
        program,
        mode: dto.mode ?? 'responder',
      }),
    );
  }

  private deriveTitle(message: string): string {
    const t = message.trim().slice(0, 60);
    return t.length ? t : 'Nueva conversación';
  }

  /** Historial persistido de una conversación (verificando ownership). */
  async historial(
    userId: string,
    conversationId: string,
  ): Promise<ElirMessage[]> {
    const conv = await this.convRepo
      .findOne({ where: { id: conversationId, ownerId: userId } })
      .catch(() => null);
    if (!conv) return [];
    return this.msgRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: 100,
    });
  }

  /**
   * Genera un cuestionario REAL de estudio con el backend de IA (nunca
   * hardcodeado). Recibe el tema y opcionalmente documentos del usuario
   * como contexto. Valida el límite de "tareas avanzadas" del plan.
   */
  async generarQuiz(
    userId: string,
    rol: string | undefined,
    tema: string,
    documentIds?: string[],
  ): Promise<{
    title: string;
    topic: string;
    questions: Array<{
      id: string;
      type: 'multiple' | 'truefalse' | 'open';
      question: string;
      options?: string[];
      correct?: string;
      feedback: string;
    }>;
  }> {
    await this.plans.registrarUso(userId, rol, 'advanced');

    const docs = await this.files.loadContextFor(
      userId,
      documentIds?.slice(0, 3) ?? [],
    );
    const docContext = docs
      .filter((d) => d.extractedText)
      .map(
        (d) =>
          `--- ${d.originalName} ---\n${d.extractedText!.slice(0, 8000)}\n---`,
      )
      .join('\n\n')
      .slice(0, 20000);

    const prompt = [
      'Genera un cuestionario académico de estudio. Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta forma:',
      '{"title":"...","topic":"...","questions":[{"id":"q1","type":"multiple","question":"...","options":["a","b","c","d"],"correct":"a","feedback":"..."}]}',
      'Reglas:',
      '- type puede ser "multiple" (con options y correct), "truefalse" (correct "true"/"false") u "open" (sin options ni correct, solo feedback).',
      '- Al menos 4 preguntas, mezclando tipos.',
      '- No inventes datos: usa solo el tema y el contexto proporcionado.',
      '',
      `Tema: ${tema || 'tema general de estudio'}`,
      docContext
        ? `Contexto de los documentos del estudiante:\n${docContext}`
        : '',
    ].join('\n');

    const result = await this.ai.processPrompt({ prompt });
    const parsed = this.parseQuizJson(result.response);
    return parsed;
  }

  private parseQuizJson(raw: string): {
    title: string;
    topic: string;
    questions: Array<{
      id: string;
      type: 'multiple' | 'truefalse' | 'open';
      question: string;
      options?: string[];
      correct?: string;
      feedback: string;
    }>;
  } {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    const json =
      start >= 0 && end >= start ? cleaned.slice(start, end + 1) : cleaned;
    const parsed = JSON.parse(json) as {
      title?: string;
      topic?: string;
      questions?: Array<{
        id?: string;
        type?: string;
        question?: string;
        options?: string[];
        correct?: string;
        feedback?: string;
      }>;
    };
    const questions = (parsed.questions ?? []).map((q, i) => ({
      id: q.id ?? `q${i + 1}`,
      type: (q.type === 'truefalse' || q.type === 'open'
        ? q.type
        : 'multiple') as 'multiple' | 'truefalse' | 'open',
      question: q.question ?? '',
      options: q.options,
      correct: q.correct,
      feedback: q.feedback ?? '',
    }));
    return {
      title: parsed.title ?? 'Cuestionario generado por Elir',
      topic: parsed.topic ?? 'Estudio',
      questions,
    };
  }
}
