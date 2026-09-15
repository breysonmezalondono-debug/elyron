import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class FilesService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly uploadRoot = path.resolve(
    process.env.UPLOAD_DIR || './uploads',
  );
  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
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
  private assertInsideUploadDir(...segments: string[]): string {
    const resolved = path.resolve(this.uploadDir, ...segments);
    if (
      resolved !== this.uploadRoot &&
      !resolved.startsWith(this.uploadRoot + path.sep)
    ) {
      throw new BadRequestException('Ruta de archivo inválida');
    }
    return resolved;
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
    const folderPath = safeFolder
      ? this.assertInsideUploadDir(safeFolder)
      : this.uploadRoot;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, file.buffer);
    return {
      url: `/uploads/${safeFolder ? `${safeFolder}/` : ''}${filename}`,
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
  async deleteFile(filename: string, folder?: string): Promise<void> {
    this.sanitizeFilename(filename);
    const safeFolder = this.sanitizeFolder(folder);
    const filePath = this.assertInsideUploadDir(safeFolder || '', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
