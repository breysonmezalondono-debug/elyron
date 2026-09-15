import {
  Injectable,
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGenerateDto, AiPromptDto } from './dto/ai.dto';
const SYSTEM_PROMPT = `Eres el asistente educativo de Elyron, una plataforma académica institucional.
Tu propósito es ayudar al usuario a aprender y comprender, no a hacer sus tareas por él.
Puedes resumir documentos, explicar conceptos, resolver dudas sobre contenidos disponibles,
generar preguntas de práctica y orientar sobre dónde encontrar información académica.
Si el usuario pide que le hagas una actividad completa para entregarla como propia, explícale
el tema y guíalo paso a paso en su lugar, sin desarrollar la entrega final por él.
Responde siempre en español, con formato markdown estructurado usando títulos, listas y ejemplos.`;
const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  resumen: `Genera un resumen académico del tema indicado. Estructura:
## Resumen
(2-3 párrafos claros)
## Puntos clave
(lista con viñetas)
## Conceptos importantes
(lista de términos con definición breve)`,
  explicacion: `Explica el tema indicado como si el usuario fuera principiante. Estructura:
## Explicación
(explicación sencilla con analogías)
## Ejemplo
(ejemplo práctico)
## Para recordar
(lista corta de ideas principales)`,
  cuestionario: `Genera un cuestionario de estudio sobre el tema indicado. Estructura:
## Cuestionario
(preguntas numeradas de opción múltiple, 4 opciones cada una)
## Respuestas
(al final, lista numerada con la respuesta correcta y una breve justificación)`,
  guia: `Genera una guía de estudio del tema indicado. Estructura:
## Guía de estudio
## Objetivos de aprendizaje
(lista)
## Contenidos
(secciones numeradas con explicación breve)
## Actividades sugeridas
(lista)`,
  examen: `Genera un examen de práctica del tema indicado. Estructura:
## Examen de práctica
### Sección 1: Preguntas abiertas
(preguntas numeradas)
### Sección 2: Verdadero o falso
(afirmaciones numeradas)
## Solucionario
(respuestas breves al final)`,
  plan_clase: `Genera un plan de clase del tema indicado para instructores. Estructura:
## Plan de clase
## Objetivo
## Duración sugerida
## Momentos de la clase
(apertura, desarrollo, cierre - con tiempos y actividades)
## Recursos necesarios
(lista)
## Evaluación
(cómo verificar el aprendizaje)`,
  recomendacion: `Genera recomendaciones de estudio y aprendizaje sobre el tema indicado. Estructura:
## Recomendaciones
(lista organizada)
## Ruta sugerida
(pasos ordenados para profundizar)
## Recursos adicionales
(tipos de recursos que puede consultar)`,
};
interface AiChatCompletionResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}
interface AiProviderErrorResponse {
  error?: {
    message?: string;
  };
}
class AiTransientError extends Error {}
@Injectable()
export class AiService {
  private readonly apiKey: string | undefined;
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly timeoutMs: number;
  private static readonly RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
  private static readonly MAX_ATTEMPTS = 3;
  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY');
    this.apiUrl =
      this.configService.get<string>('AI_API_URL') ||
      'https://api.openai.com/v1/chat/completions';
    this.model = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';
    this.maxTokens = Number(
      this.configService.get<string>('AI_MAX_TOKENS') || 2000,
    );
    this.temperature = Number(
      this.configService.get<string>('AI_TEMPERATURE') ?? 0.7,
    );
    this.timeoutMs = Number(
      this.configService.get<string>('AI_TIMEOUT_MS') || 60000,
    );
  }
  async processPrompt(dto: AiPromptDto): Promise<{
    response: string;
  }> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'El servicio de IA no está configurado. Define AI_API_KEY en el archivo .env',
      );
    }
    let lastError: unknown;
    for (let attempt = 1; attempt <= AiService.MAX_ATTEMPTS; attempt++) {
      try {
        return await this.callProvider(dto);
      } catch (error) {
        lastError = error;
        const retryable =
          error instanceof AiTransientError && attempt < AiService.MAX_ATTEMPTS;
        if (!retryable) break;
        await this.delay(500 * Math.pow(2, attempt - 1));
      }
    }
    throw lastError;
  }
  private async callProvider(dto: AiPromptDto): Promise<{
    response: string;
  }> {
    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(this.timeoutMs),
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          messages: [
            {
              role: 'system',
              content: dto.context
                ? `${SYSTEM_PROMPT}\n\nContexto adicional del usuario:\n${dto.context}`
                : SYSTEM_PROMPT,
            },
            { role: 'user', content: dto.prompt },
          ],
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new BadGatewayException(
          `El servicio de IA tardó demasiado en responder (${this.timeoutMs}ms)`,
        );
      }
      throw new AiTransientError(
        `Error de red al contactar el servicio de IA: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!response.ok) {
      const detail = await this.extractProviderError(response);
      if (AiService.RETRYABLE_STATUS.has(response.status)) {
        throw new AiTransientError(detail);
      }
      throw new BadGatewayException(detail);
    }
    const data = (await response.json()) as AiChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadGatewayException('La IA no generó respuesta');
    }
    return { response: content };
  }
  private async extractProviderError(response: Response): Promise<string> {
    let detail = '';
    try {
      const body = (await response.json()) as AiProviderErrorResponse;
      detail = body?.error?.message ? `: ${body.error.message}` : '';
    } catch (error) {
      void error;
    }
    return `El servicio de IA respondió con error (${response.status})${detail}`;
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async generateContent(dto: AiGenerateDto): Promise<{
    content: string;
  }> {
    const typePrompt =
      CONTENT_TYPE_PROMPTS[dto.type] ||
      `Genera contenido educativo tipo "${dto.type}" bien estructurado.`;
    const result = await this.processPrompt({
      prompt: `${typePrompt}\n\nTema: ${dto.topic}`,
    });
    return { content: result.response };
  }

  /**
   * Streaming de chat hacia el proveedor OpenAI-compatible.
   * Devuelve un iterador async de fragmentos de texto (SSE) y, al final,
   * el conteo de tokens si el proveedor lo reporta.
   */
  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    systemPrompt?: string,
  ): AsyncGenerator<
    string,
    { inputTokens?: number; outputTokens?: number },
    void
  > {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'El servicio de IA no está configurado. Define AI_API_KEY en el archivo .env',
      );
    }
    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: true,
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
    };

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(this.timeoutMs * 2),
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new AiTransientError(
        `Error de red al contactar el servicio de IA: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!response.ok) {
      const detail = await this.extractProviderError(response);
      throw new BadGatewayException(detail);
    }
    if (!response.body)
      throw new BadGatewayException('Respuesta de IA sin cuerpo.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          for (const rawLine of block.split('\n')) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') return { inputTokens, outputTokens };
            if (!payload) continue;
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{
                  delta?: { content?: string };
                  message?: { content?: string };
                }>;
                usage?: { prompt_tokens?: number; completion_tokens?: number };
              };
              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens ?? inputTokens;
                outputTokens = parsed.usage.completion_tokens ?? outputTokens;
              }
              const delta =
                parsed.choices?.[0]?.delta?.content ??
                parsed.choices?.[0]?.message?.content;
              if (delta) yield delta;
            } catch {
              /* ignora fragmento no-JSON */
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    return { inputTokens, outputTokens };
  }
}
