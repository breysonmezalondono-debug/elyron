import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ElirPlansService, ElirLimitError } from './elir-plans.service';
import { ElirFilesService } from './elir-files.service';
import { ElirService } from './elir.service';
import type { ElirChatStreamDto } from './elir.service';
import { AiService } from './ai.service';
import { AiPromptDto } from './dto/ai.dto';
import { ElirUploadDto, ElirGenerarQuizDto } from './dto/elir.dto';

const rolOf = (
  req: Request & { user: { role?: string | { name?: string } } },
): string | undefined => {
  const role = req.user.role;
  return typeof role === 'string' ? role : role?.name;
};

/** Convierte un error de límite del plan en una respuesta HTTP estructurada. */
const toHttp = (e: unknown): never => {
  if (e instanceof ElirLimitError) {
    throw new BadRequestException({ message: e.message, code: e.code });
  }
  throw e instanceof Error
    ? new BadRequestException(e.message)
    : new BadRequestException('Solicitud inválida');
};

@Controller('elir')
@UseGuards(JwtAuthGuard)
export class ElirController {
  constructor(
    private readonly plans: ElirPlansService,
    private readonly files: ElirFilesService,
    private readonly elir: ElirService,
    private readonly ai: AiService,
  ) {}

  /** Catálogo de planes (precios, features, límites) desde la BD configurable. */
  @Get('planes')
  planes() {
    return this.plans.planes();
  }

  /** Estado de uso del usuario autenticado (plan + consumo + límites). */
  @Get('uso')
  async uso(@Request() req) {
    return this.plans.estadoDeUso(req.user.id, rolOf(req));
  }

  /** Sube un documento/imagen real: valida, almacena aislado y extrae texto. */
  @Post('documentos')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 80 * 1024 * 1024 } }),
  )
  async subirDocumento(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ElirUploadDto,
  ) {
    const rol = rolOf(req);
    const plan = await this.plans.planDeUsuario(rol);
    try {
      if (file.mimetype.startsWith('image/')) {
        await this.plans.exigirCapacidad(
          req.user.id,
          rol,
          'imageAnalysis',
          'El análisis de imágenes',
        );
        await this.plans.registrarUso(req.user.id, rol, 'image');
      } else {
        await this.plans.registrarUso(req.user.id, rol, 'file');
      }
    } catch (e) {
      toHttp(e);
    }
    const doc = await this.files.upload(
      req.user.id,
      file,
      dto.program ?? null,
      plan.limits.maxFileSizeMB * 1024 * 1024,
    );
    // Extracción real del texto en segundo plano (ia-service). No bloquea la respuesta.
    void this.files.extractText(doc.id, req.user.id).catch(() => undefined);
    return {
      id: doc.id,
      name: doc.originalName,
      size: doc.sizeBytes,
      kind: doc.kind,
    };
  }

  /** Lista los documentos del usuario autenticado. */
  @Get('documentos')
  async misDocumentos(@Request() req) {
    const docs = await this.files.listOwned(req.user.id);
    return docs.map((d) => ({
      id: d.id,
      name: d.originalName,
      size: d.sizeBytes,
      kind: d.kind,
      status: d.status,
      createdAt: d.createdAt,
    }));
  }

  /** Elimina un documento (solo el dueño). */
  @Delete('documentos/:id')
  async borrarDocumento(@Request() req, @Param('id') id: string) {
    await this.files.remove(id, req.user.id);
    return { ok: true };
  }

  /** Chat de Elir en streaming (SSE) con contexto académico y fuentes reales. */
  @Post('chat/stream')
  @HttpCode(200)
  async chatStream(
    @Request() req,
    @Res() res: Response,
    @Body() dto: ElirChatStreamDto,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      const gen = this.elir.streamChat(req.user.id, rolOf(req), dto);
      for await (const evt of gen) {
        if (!res.writableEnded) res.write(`data: ${JSON.stringify(evt)}\n\n`);
      }
    } catch (e) {
      if (e instanceof ElirLimitError) {
        if (!res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({ error: { code: e.code, message: e.message } })}\n\n`,
          );
        }
      } else {
        if (!res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({ error: { code: 'SERVER_ERROR', message: 'Ocurrió un error al procesar tu consulta.' } })}\n\n`,
          );
        }
      }
    } finally {
      if (!res.writableEnded) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  }

  /** Chat de Elir no-streaming (compatibilidad/fallback). */
  @Post('chat')
  @HttpCode(200)
  async chat(@Request() req, @Body() dto: AiPromptDto) {
    try {
      await this.plans.registrarUso(req.user.id, rolOf(req), 'message');
    } catch (e) {
      toHttp(e);
    }
    return this.ai.processPrompt(dto);
  }

  /** Genera un cuestionario REAL de estudio con la IA (no hardcodeado). */
  @Post('generar')
  @HttpCode(200)
  async generarQuiz(@Request() req, @Body() dto: ElirGenerarQuizDto) {
    const quiz = await this.elir
      .generarQuiz(req.user.id, rolOf(req), dto.topic, dto.documentIds)
      .catch((e) => {
        if (e instanceof ElirLimitError) toHttp(e);
        throw new BadRequestException(
          'No se pudo generar el cuestionario. Inténtalo de nuevo.',
        );
      });
    return { quiz };
  }

  /** Validación/metadatos de uso (compatibilidad). */
  @Post('archivo')
  async archivo(
    @Request() req,
    @Body()
    dto: {
      tipo: 'file' | 'image' | 'advanced';
      capacidad?: keyof import('./elir-plans.service').ElirPlan['features'];
      nombre?: string;
    },
  ) {
    const rol = rolOf(req);
    if (dto.capacidad) {
      await this.plans.exigirCapacidad(
        req.user.id,
        rol,
        dto.capacidad,
        dto.nombre ?? 'Esta función',
      );
    }
    try {
      await this.plans.registrarUso(req.user.id, rol, dto.tipo);
    } catch (e) {
      toHttp(e);
    }
    return { ok: true };
  }
}
