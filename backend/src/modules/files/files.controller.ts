import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
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
