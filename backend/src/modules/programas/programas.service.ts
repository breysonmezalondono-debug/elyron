import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programa } from './entities/programa.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
import { InstitucionCatalogo } from '../contexto/entities/institucion-catalogo.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  UNIVERSIDADES_DISPONIBLES,
  COLEGIOS_DISPONIBLES,
  REGIONALES_SENA,
} from '../../common/constants/entidades-academicas';

const formatearFecha = (fecha: Date | string | null): string | null => {
  if (!fecha) return null;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

@Injectable()
export class ProgramasService {
  constructor(
    @InjectRepository(Programa)
    private readonly programaRepo: Repository<Programa>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(InstitucionCatalogo)
    private readonly institucionCatalogoRepo: Repository<InstitucionCatalogo>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.programaRepo.findAndCount({
      relations: { fichas: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Programa> {
    const programa = await this.programaRepo.findOne({
      where: { id },
      relations: { fichas: true },
    });
    if (!programa) throw new NotFoundException('Programa no encontrado');
    return programa;
  }

  getInstituciones() {
    return [
      { id: 'inst-sena', name: 'SENA', shortName: 'sena', type: 'sena' },
      {
        id: 'inst-colegio',
        name: 'Colegio Aurora',
        shortName: 'colegio',
        type: 'colegio',
      },
      {
        id: 'inst-aurora',
        name: 'Universidad Aurora',
        shortName: 'universidad',
        type: 'universidad',
      },
      {
        id: 'inst-instituto',
        name: 'Instituto Técnico',
        shortName: 'instituto',
        type: 'instituto',
      },
      {
        id: 'inst-academia',
        name: 'Academia de Artes',
        shortName: 'academia',
        type: 'academia',
      },
    ];
  }

  async getCatalogoAcademico() {
    const programas = await this.programaRepo.find({
      order: { name: 'ASC' },
    });
    const fichas = await this.fichaRepo.find({
      relations: { programa: true },
      order: { code: 'ASC' },
    });
    const grupos = await this.grupoRepo.find({
      order: { code: 'ASC' },
    });

    const catalogadas = await this.institucionCatalogoRepo.find({
      where: { status: 'active' },
      order: { nombre: 'ASC' },
    });
    const colegiosBd = catalogadas
      .filter((i) => i.tipo === 'colegio')
      .map((i) => i.nombre);
    const universidadesBd = catalogadas
      .filter((i) => i.tipo === 'universidad')
      .map((i) => i.nombre);
    const sedesBd = catalogadas.filter((i) => i.tipo === 'sena');

    return {
      universidades: Array.from(
        new Set([...UNIVERSIDADES_DISPONIBLES, ...universidadesBd]),
      ),
      colegios: Array.from(new Set([...COLEGIOS_DISPONIBLES, ...colegiosBd])),
      regionales: [
        ...REGIONALES_SENA,
        ...sedesBd.map((sede) => ({
          id: sede.id,
          nombre: sede.nombre,
          centros:
            (sede.detalles as { centros?: string[] } | null)?.centros ?? [],
          municipios:
            (sede.detalles as { municipios?: string[] } | null)?.municipios ??
            [],
        })),
      ],
      programas: programas.map((p) => ({
        id: p.id,
        name: p.name,
        duracionMeses: p.duracionMeses,
      })),
      fichas: fichas.map((f) => ({
        code: f.code,
        name: f.name,
        tipoPrograma: f.tipoPrograma,
        programa: f.programa?.name ?? null,
        duracionMeses: f.programa?.duracionMeses ?? null,
        fechaInicio: formatearFecha(f.startDate),
        fechaFinalizacion: formatearFecha(f.endDate),
      })),
      grupos: grupos.map((g) => ({
        code: g.code,
        nombre: g.nombre,
        grado: g.grado,
        colegio: g.colegio,
      })),
    };
  }

  async validarCodigoCurso(codigo: string, tipo: string, programa?: string) {
    const codigoTrim = (codigo ?? '').trim();
    if (!codigoTrim) {
      return {
        valido: false,
        mensaje: 'Ingresa el código de tu ficha o curso.',
      };
    }
    if (tipo === 'sena' || tipo === 'aprendiz') {
      const ficha = await this.fichaRepo.findOne({
        where: { code: codigoTrim },
        relations: { programa: true },
      });

      /* Si la ficha no existe aún, se acepta cualquier número de ficha
         SENA válido (7 dígitos) y se crea automáticamente vinculada al
         programa elegido por el usuario (o al por defecto). */
      if (!ficha) {
        if (!/^\d{7}$/.test(codigoTrim)) {
          return {
            valido: false,
            mensaje: 'Ingresa un número de ficha válido (7 dígitos).',
          };
        }
        const nombrePrograma = (programa ?? '').trim();
        const programaDefecto =
          nombrePrograma || 'Análisis y Desarrollo de Software';
        let programaEntidad = await this.programaRepo.findOne({
          where: { name: programaDefecto },
          order: { createdAt: 'DESC' },
        });
        if (!programaEntidad) {
          programaEntidad = await this.programaRepo.save(
            this.programaRepo.create({
              name: programaDefecto,
              duracionMeses: 18,
            }),
          );
        }
        const hoy = new Date();
        const fin = new Date();
        fin.setMonth(fin.getMonth() + (programaEntidad.duracionMeses ?? 18));
        const nueva = await this.fichaRepo.save(
          this.fichaRepo.create({
            code: codigoTrim,
            name: programaDefecto,
            tipoPrograma: 'tecnologo',
            status: 'active',
            startDate: hoy,
            endDate: fin,
            programa: programaEntidad,
          }),
        );
        return {
          valido: true,
          tipo: 'ficha',
          codigo: nueva.code,
          nombre: programaDefecto,
          tipoPrograma: 'tecnologo',
          programa: programaEntidad.name,
          duracionMeses: programaEntidad.duracionMeses ?? 18,
          fechaInicio: formatearFecha(nueva.startDate),
          fechaFinalizacion: formatearFecha(nueva.endDate),
        };
      }

      if (ficha.status !== 'active') {
        return {
          valido: false,
          mensaje:
            'Esa ficha no existe o no está activa. Verifica el número de tu ficha.',
        };
      }
      return {
        valido: true,
        tipo: 'ficha',
        codigo: ficha.code,
        nombre: ficha.name,
        tipoPrograma: ficha.tipoPrograma,
        programa: ficha.programa?.name ?? null,
        duracionMeses: ficha.programa?.duracionMeses ?? null,
        fechaInicio: formatearFecha(ficha.startDate),
        fechaFinalizacion: formatearFecha(ficha.endDate),
      };
    }
    if (tipo === 'colegio' || tipo === 'estudiante') {
      const grupo = await this.grupoRepo.findOne({
        where: { code: codigoTrim },
      });
      if (!grupo || grupo.status !== 'active') {
        return {
          valido: false,
          mensaje: 'Ese código de curso no existe o no está activo.',
        };
      }
      return {
        valido: true,
        tipo: 'grupo',
        codigo: grupo.code,
        nombre: grupo.nombre,
        grado: grupo.grado,
        colegio: grupo.colegio,
      };
    }
    return { valido: false, mensaje: 'Tipo de curso no válido.' };
  }
}
