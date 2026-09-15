import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024;
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body('folder')
    folder?: string,
  ) {
    return this.filesService.uploadFile(file, folder);
  }
  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  uploadMultipleFiles(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body('folder')
    folder?: string,
  ) {
    return this.filesService.uploadMultipleFiles(files, folder);
  }

  /**
   * Descarga autenticada de archivos. Reemplaza el antiguo estático /uploads
   * (que era público). Requiere JWT y valida el nombre para evitar path
   * traversal.
   */
  @Get('archivo')
  async download(
    @Query('filename') filename: string,
    @Query('folder') folder: string | undefined,
    @Res() res: Response,
  ) {
    if (!filename)
      return res.status(400).json({ message: 'filename requerido' });
    const { buffer, mime } = await this.filesService.readFile(filename, folder);
    res.setHeader('Content-Type', mime);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.send(buffer);
  }

  @Delete(':filename')
  deleteFile(
    @Param('filename')
    filename: string,
    @Body('folder')
    folder?: string,
  ) {
    return this.filesService.deleteFile(filename, folder);
  }
}
