import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class FilesService {
  constructor(private readonly storage: StorageService) {}

  private sanitizeFilename(filename: string): void {
    if (filename.includes('..') || /[\\/]/.test(filename)) {
      throw new BadRequestException('Nombre de archivo inválido');
    }
  }
  private sanitizeFolder(folder?: string): string | undefined {
    if (!folder) return undefined;
    if (folder.includes('..') || !/^[a-zA-Z0-9-_]+$/.test(folder)) {
      throw new BadRequestException('Nombre de carpeta inválido');
    }
    return folder;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{
    url: string;
    filename: string;
  }> {
    if (!file) throw new BadRequestException('No se proporcionó archivo');
    const safeFolder = this.sanitizeFolder(folder);
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const scope = safeFolder || 'general';
    const key = this.storage.buildKey(scope, filename);
    await this.storage.put(
      key,
      file.buffer,
      file.mimetype || 'application/octet-stream',
    );
    return {
      url: `/api/files/archivo?folder=${safeFolder ? encodeURIComponent(safeFolder) : ''}&filename=${encodeURIComponent(filename)}`,
      filename,
    };
  }
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<
    {
      url: string;
      filename: string;
    }[]
  > {
    const results: {
      url: string;
      filename: string;
    }[] = [];
    for (const file of files) {
      results.push(await this.uploadFile(file, folder));
    }
    return results;
  }

  /** Devuelve los bytes de un archivo (disco o S3). */
  async readFile(
    filename: string,
    folder?: string,
  ): Promise<{ buffer: Buffer; mime: string }> {
    this.sanitizeFilename(filename);
    const safeFolder = this.sanitizeFolder(folder);
    const scope = safeFolder || 'general';
    const key = this.storage.buildKey(scope, filename);
    return this.storage.get(key);
  }

  async deleteFile(filename: string, folder?: string): Promise<void> {
    this.sanitizeFilename(filename);
    const safeFolder = this.sanitizeFolder(folder);
    const scope = safeFolder || 'general';
    const key = this.storage.buildKey(scope, filename);
    await this.storage.remove(key);
  }
}
