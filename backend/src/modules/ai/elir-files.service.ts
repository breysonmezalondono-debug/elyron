import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import * as path from 'path';
import { StorageService } from '../../common/storage/storage.service';
import {
  ElirDocument,
  ElirDocumentKind,
} from './entities/elir-document.entity';

const MAX_FILES = 40;

const ALLOWED: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  txt: ['text/plain'],
  csv: ['text/csv', 'application/csv', 'text/comma-separated-values'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  gif: ['image/gif'],
  webp: ['image/webp'],
};

/** Extensiones consideradas ejecutables o peligrosas: siempre rechazadas. */
const FORBIDDEN_EXTS = new Set([
  'exe',
  'msi',
  'bat',
  'cmd',
  'sh',
  'ps1',
  'vbs',
  'js',
  'mjs',
  'jar',
  'dll',
  'so',
  'dylib',
  'app',
  'com',
  'scr',
  'pif',
  'hta',
  'svg',
  'php',
]);

@Injectable()
export class ElirFilesService {
  constructor(
    @InjectRepository(ElirDocument)
    private readonly repo: Repository<ElirDocument>,
    private readonly storage: StorageService,
  ) {}

  /**
   * Valida la extensión, el MIME real y el tamaño, y rechaza archivos
   * ejecutables. No se confía únicamente en la extensión ni en el nombre.
   */
  private validate(
    originalName: string,
    mime: string,
    size: number,
    maxBytes: number,
  ): { ext: string; kind: ElirDocumentKind } {
    const ext = path.extname(originalName).replace(/^\./, '').toLowerCase();
    if (!ext) throw new BadRequestException('El archivo no tiene extensión.');
    if (FORBIDDEN_EXTS.has(ext)) {
      throw new BadRequestException('Este tipo de archivo no está permitido.');
    }
    const allowedMimes = ALLOWED[ext];
    if (!allowedMimes) {
      throw new BadRequestException(`Extensión no permitida: .${ext}`);
    }
    // MIME declarado por el cliente debe coincidir con lo esperado para la extensión.
    if (!allowedMimes.includes(mime)) {
      throw new BadRequestException(
        `El tipo de archivo no corresponde con la extensión .${ext}.`,
      );
    }
    if (size <= 0) throw new BadRequestException('El archivo está vacío.');
    if (size > maxBytes) {
      throw new BadRequestException(
        `El archivo supera el tamaño máximo permitido (${Math.round(maxBytes / 1024 / 1024)} MB).`,
      );
    }
    const kind: ElirDocumentKind =
      ext === 'png' ||
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'gif' ||
      ext === 'webp'
        ? 'image'
        : 'file';
    return { ext, kind };
  }

  private userDir(_userId: string): string {
    // Mantenido por compatibilidad; la persistencia real la hace StorageService.
    return '';
  }

  /**
   * Sube y persiste un documento perteneciente a `ownerId`.
   * `assertSize` no se usa aquí: el límite de bytes llega desde el plan.
   */
  async upload(
    ownerId: string,
    file: Express.Multer.File,
    program: string | null,
    maxBytes: number,
  ): Promise<ElirDocument> {
    if (!file?.buffer)
      throw new BadRequestException('No se recibió el archivo.');
    const { ext, kind } = this.validate(
      file.originalname,
      file.mimetype,
      file.size,
      maxBytes,
    );

    const count = await this.repo.count({ where: { ownerId } }).catch(() => 0);
    if (count >= MAX_FILES) {
      throw new BadRequestException(
        'Has superado el número máximo de documentos almacenados.',
      );
    }

    const storageName = `${randomUUID()}.${ext}`;
    const storagePath = `elir/${ownerId}/${storageName}`;
    await this.storage.put(storagePath, file.buffer, file.mimetype);

    const sha256 = createHash('sha256').update(file.buffer).digest('hex');

    const doc = this.repo.create({
      ownerId,
      originalName: path.basename(file.originalname),
      storageName,
      storagePath,
      mime: file.mimetype,
      ext,
      sizeBytes: file.size,
      sha256,
      kind,
      program,
      status: 'processing',
    });
    return this.repo.save(doc);
  }

  /** Marca el documento con el texto extraído (contexto real de la respuesta). */
  async attachExtractedText(
    id: string,
    ownerId: string,
    text: string | null,
  ): Promise<void> {
    const doc = await this.getOwned(id, ownerId);
    doc.extractedText =
      text && text.trim().length > 0 ? text.slice(0, 200_000) : null;
    doc.status = text && text.trim().length > 0 ? 'ready' : 'error';
    await this.repo.save(doc);
  }

  /**
   * Extracción REAL del texto del documento delegando al ia-service
   * (Python: pypdf / python-docx / openpyxl …). Lee el archivo del disco
   * y lo envía en multipart. Si el ia-service no está disponible, devuelve
   * el documento en estado "error" sin inventar contenido.
   */
  async extractText(id: string, ownerId: string): Promise<ElirDocument> {
    const doc = await this.getOwned(id, ownerId);
    if (doc.extractedText) return doc;
    let buffer: Buffer;
    try {
      const res = await this.storage.get(doc.storagePath);
      buffer = res.buffer;
    } catch {
      doc.status = 'error';
      return this.repo.save(doc);
    }
    const extractUrl = `${(process.env.IA_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '')}/api/v1/extract`;
    try {
      const form = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: doc.mime });
      form.append('file', blob, doc.originalName);
      const res = await fetch(extractUrl, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        doc.status = 'error';
        return this.repo.save(doc);
      }
      const data = (await res.json()) as { text?: string };
      return this.attachExtractedText(id, ownerId, data?.text ?? null).then(
        () => doc,
      );
    } catch {
      doc.status = 'error';
      return this.repo.save(doc);
    }
  }

  /** Recupera un documento verificando que pertenezca a `ownerId`. */
  async getOwned(id: string, ownerId: string): Promise<ElirDocument> {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado.');
    if (doc.ownerId !== ownerId) {
      throw new ForbiddenException('No tienes acceso a este documento.');
    }
    return doc;
  }

  /** Lista los documentos del usuario autenticado. */
  async listOwned(ownerId: string): Promise<ElirDocument[]> {
    return this.repo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
      take: MAX_FILES,
    });
  }

  /** Carga el texto extraído de varios documentos, validando ownership de cada uno. */
  async loadContextFor(
    ownerId: string,
    ids: string[],
  ): Promise<ElirDocument[]> {
    const docs = await Promise.all(
      ids.map((id) => this.getOwned(id, ownerId).catch(() => null)),
    );
    return docs.filter((d): d is ElirDocument => d !== null);
  }

  /** Elimina un documento del usuario (dueño o expiración). */
  async remove(id: string, ownerId: string): Promise<void> {
    const doc = await this.getOwned(id, ownerId);
    await this.storage.remove(doc.storagePath).catch(() => undefined);
    await this.repo.delete({ id });
  }

  /** Eliminación segura de un documento por expiración (interno, sin ownership). */
  async removeExpired(id: string): Promise<void> {
    const doc = await this.repo.findOne({ where: { id } }).catch(() => null);
    if (!doc) return;
    await this.storage.remove(doc.storagePath).catch(() => undefined);
    await this.repo.delete({ id }).catch(() => undefined);
  }

  /** Devuelve los bytes de un documento verificando que pertenezca a `ownerId`. */
  async readOwned(
    id: string,
    ownerId: string,
  ): Promise<{ buffer: Buffer; mime: string; originalName: string }> {
    const doc = await this.getOwned(id, ownerId);
    const res = await this.storage.get(doc.storagePath);
    return {
      buffer: res.buffer,
      mime: doc.mime,
      originalName: doc.originalName,
    };
  }

  /** URL firmada temporal para acceso directo (si el proveedor la soporta). */
  async signedUrlFor(id: string, ownerId: string): Promise<string | null> {
    const doc = await this.getOwned(id, ownerId);
    return this.storage.signedUrl(doc.storagePath);
  }
}
