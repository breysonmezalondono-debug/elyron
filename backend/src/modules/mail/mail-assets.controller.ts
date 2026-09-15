import { Controller, Get, NotFoundException, Res, Param } from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

const ASSETS_DIR = join(__dirname, 'correoimg');

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

/**
 * Sirve únicamente las imágenes de marca usadas en los correos
 * (antes colgaban de /uploads, que ya no es público).
 */
@Controller('mail-assets')
export class MailAssetsController {
  @Get(':file')
  asset(@Param('file') file: string, @Res() res: Response) {
    if (!/^[\w.-]+$/.test(file)) {
      return res.status(400).json({ message: 'Nombre inválido' });
    }
    const abs = join(ASSETS_DIR, file);
    if (!existsSync(abs)) throw new NotFoundException('Asset no encontrado');
    const ext = file.split('.').pop()?.toLowerCase() || '';
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return createReadStream(abs).pipe(res);
  }
}
