import { Controller, Get, Query } from '@nestjs/common';
import { ProgramasService } from './programas.service';

@Controller('catalogo-academico')
export class CatalogoAcademicoController {
  constructor(private readonly programasService: ProgramasService) {}

  @Get()
  getCatalogo() {
    return this.programasService.getCatalogoAcademico();
  }

  @Get('validar')
  validarCodigo(
    @Query('codigo') codigo: string,
    @Query('tipo') tipo: string,
    @Query('programa') programa?: string,
  ) {
    return this.programasService.validarCodigoCurso(codigo, tipo, programa);
  }
}
