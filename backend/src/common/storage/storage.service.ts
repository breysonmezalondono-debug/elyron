import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandInput,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Abstracción de almacenamiento de archivos de Elyron.
 *
 * Modos (STORAGE_PROVIDER):
 *  - local: disco del contenedor bajo UPLOAD_DIR (por defecto ./uploads).
 *           Útil en desarrollo. NO apto para hosting efímero (Render free).
 *  - s3:    S3-compatible (Cloudflare R2, Backblaze B2, AWS S3, MinIO).
 *           Configuración vía STORAGE_* y URLs firmadas con signedUrl().
 *
 * Los metadatos (nombre, tamaño, mime, dueño, fecha) los guarda la BD;
 * aquí solo se persisten los bytes con claves opacas (UUIDs).
 */

export interface StoredObject {
  key: string;
  size: number;
  mime: string;
}

const SIGNED_URL_TTL_SECONDS = 900;

@Injectable()
export class StorageService {
  private readonly provider: 'local' | 's3';
  private readonly localRoot: string;
  private readonly client: S3Client | null;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.provider =
      (this.config.get<string>('STORAGE_PROVIDER', 'local') || 'local') === 's3'
        ? 's3'
        : 'local';

    this.localRoot = path.resolve(
      this.config.get<string>('UPLOAD_DIR', './uploads'),
    );
    if (this.provider === 'local') {
      if (!fs.existsSync(this.localRoot)) {
        fs.mkdirSync(this.localRoot, { recursive: true });
      }
      this.client = null;
      this.bucket = '';
      return;
    }

    const endpoint = this.config.get<string>('STORAGE_ENDPOINT', '');
    const region = this.config.get<string>('STORAGE_REGION', 'auto');
    const accessKey = this.config.get<string>('STORAGE_ACCESS_KEY', '');
    const secretKey = this.config.get<string>('STORAGE_SECRET_KEY', '');
    this.bucket = this.config.get<string>('STORAGE_BUCKET', '');

    if (!endpoint || !accessKey || !secretKey || !this.bucket) {
      throw new Error(
        '[storage] STORAGE_PROVIDER=s3 requiere STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY y STORAGE_BUCKET',
      );
    }

    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle:
        this.config.get<string>('STORAGE_FORCE_PATH_STYLE', 'true') !== 'false',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  /** Clave de objeto segura: scope (puede incluir subcarpetas) + UUID + extensión. */
  buildKey(scope: string, filename: string): string {
    const safeScope = scope
      .split('/')
      .map((s) => s.replace(/[^a-zA-Z0-9-_]/g, ''))
      .filter(Boolean)
      .join('/');
    const safeName = path.basename(filename).replace(/[^\w.-]/g, '');
    return `${safeScope}/${safeName}`;
  }

  async put(key: string, buffer: Buffer, mime: string): Promise<StoredObject> {
    if (this.provider === 's3' && this.client) {
      const input: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
      };
      await this.client.send(new PutObjectCommand(input));
      return { key, size: buffer.length, mime };
    }

    const abs = this.localAbs(key);
    this.assertInsideRoot(abs);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buffer);
    return { key, size: buffer.length, mime };
  }

  async get(key: string): Promise<{ buffer: Buffer; mime: string }> {
    if (this.provider === 's3' && this.client) {
      const input: GetObjectCommandInput = { Bucket: this.bucket, Key: key };
      const res = await this.client.send(new GetObjectCommand(input));
      const body = res.Body;
      if (!body) throw new NotFoundException('Archivo no encontrado');
      const bytes = await this.bodyToBuffer(body);
      const contentType = res.ContentType || 'application/octet-stream';
      return { buffer: bytes, mime: contentType };
    }

    const abs = this.localAbs(key);
    this.assertInsideRoot(abs);
    if (!fs.existsSync(abs))
      throw new NotFoundException('Archivo no encontrado');
    const buffer = fs.readFileSync(abs);
    return { buffer, mime: 'application/octet-stream' };
  }

  async remove(key: string): Promise<void> {
    if (this.provider === 's3' && this.client) {
      const input: DeleteObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
      };
      await this.client.send(new DeleteObjectCommand(input));
      return;
    }
    const abs = this.localAbs(key);
    this.assertInsideRoot(abs);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }

  /** URL firmada temporal para acceso directo desde el navegador (solo S3). */
  async signedUrl(
    key: string,
    ttlSeconds = SIGNED_URL_TTL_SECONDS,
  ): Promise<string | null> {
    if (this.provider !== 's3' || !this.client) return null;
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: ttlSeconds,
    });
    return url;
  }

  private async bodyToBuffer(
    body: GetObjectCommandOutput['Body'],
  ): Promise<Buffer> {
    const typed = body as {
      transformToByteArray?: () => Promise<Uint8Array>;
    };
    if (typeof typed.transformToByteArray === 'function') {
      const bytes = await typed.transformToByteArray();
      return Buffer.from(bytes);
    }
    // Fallback para cuerpos tipo Readable.
    const chunks: Buffer[] = [];
    const nodeStream = body as unknown as {
      on: (ev: string, cb: (c: Buffer) => void) => void;
    };
    await new Promise<void>((resolve, reject) => {
      nodeStream.on('data', (c: Buffer) => chunks.push(c));
      nodeStream.on('end', () => resolve());
      nodeStream.on('error', reject);
    });
    return Buffer.concat(chunks);
  }

  private localAbs(key: string): string {
    return path.resolve(this.localRoot, key);
  }

  private assertInsideRoot(abs: string): void {
    const root = this.localRoot.endsWith(path.sep)
      ? this.localRoot
      : this.localRoot + path.sep;
    if (abs !== this.localRoot && !abs.startsWith(root)) {
      throw new NotFoundException('Ruta de archivo inválida');
    }
  }
}
