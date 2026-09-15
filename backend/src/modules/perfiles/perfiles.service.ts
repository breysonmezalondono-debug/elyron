import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PerfilColegio } from './entities/perfil-colegio.entity';
import { PerfilSena } from './entities/perfil-sena.entity';
import { PerfilUniversidad } from './entities/perfil-universidad.entity';
import { AuditLog } from '../auditoria/entities/audit-log.entity';
import { Programa } from '../programas/entities/programa.entity';
import { Ficha } from '../fichas/ficha.entity';
import { User } from '../users/user.entity';
import {
  CreatePerfilColegioDto,
  UpdatePerfilColegioDto,
  CreatePerfilSenaDto,
  UpdatePerfilSenaDto,
  CreatePerfilUniversidadDto,
  UpdatePerfilUniversidadDto,
} from './dto/perfiles.dto';
import {
  encryptSensitive,
  decryptSensitive,
  hashDocumento,
} from './crypto.util';
import {
  TrayectoriaEstimatorService,
  formatearFecha,
  formatearFechaBD,
} from './trayectoria-estimator.service';

const CONFIANZA = {
  VERIFICADA: 'verificada',
  DECLARADA: 'declarada',
  CALCULADA: 'calculada',
  NO_VERIFICADA: 'no_verificada',
} as const;

/** Convierte una fecha (posiblemente UTC por timezone 'Z' de la BD) a medianoche local. */
const normalizarFecha = (
  fecha: Date | string | null | undefined,
): Date | null => {
  if (!fecha) return null;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

@Injectable()
export class PerfilesService {
  constructor(
    @InjectRepository(PerfilColegio)
    private readonly colegioRepo: Repository<PerfilColegio>,
    @InjectRepository(PerfilSena)
    private readonly senaRepo: Repository<PerfilSena>,
    @InjectRepository(PerfilUniversidad)
    private readonly universidadRepo: Repository<PerfilUniversidad>,
    @InjectRepository(AuditLog)
    private readonly auditoriaRepo: Repository<AuditLog>,
    @InjectRepository(Programa)
    private readonly programaRepo: Repository<Programa>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly estimator: TrayectoriaEstimatorService,
  ) {}

  private async registrarAuditoria(
    actorId: string,
    accion: string,
    objetivo: string,
  ): Promise<void> {
    await this.auditoriaRepo.save(
      this.auditoriaRepo.create({
        actor: actorId,
        action: accion,
        target: objetivo,
        time: new Date().toISOString(),
        category: 'academico',
      }),
    );
  }

  private async validarDocumentoUnico(
    tipoDocumento: string,
    numeroDocumento: string,
    ignorarPerfil?: { tipo: string; id: string },
  ): Promise<void> {
    const hash = hashDocumento(numeroDocumento);
    const [sena, colegio, universidad] = await Promise.all([
      this.senaRepo.findOneBy({ documentoHash: hash }),
      this.colegioRepo.findOneBy({ documentoHash: hash }),
      this.universidadRepo.findOneBy({ documentoHash: hash }),
    ]);
    const coincidencias = [
      { tipo: 'sena', fila: sena },
      { tipo: 'colegio', fila: colegio },
      { tipo: 'universidad', fila: universidad },
    ].filter(
      (item) =>
        item.fila &&
        !(
          ignorarPerfil &&
          item.tipo === ignorarPerfil.tipo &&
          item.fila.id === ignorarPerfil.id
        ),
    );
    if (coincidencias.length > 0) {
      throw new ConflictException(
        'Ese número de documento ya está registrado en Elyron',
      );
    }
  }

  /**
   * Evita que una misma persona (por nombre y apellido) se registre dos veces
   * en cuentas distintas ya asignadas a una ficha o curso. El documento y el
   * correo ya son únicos; este refuerza el caso "mismo nombre, correo distinto".
   */
  private async validarNombreUnico(
    nombres: string,
    apellidos: string,
    usuarioId: string,
  ): Promise<void> {
    const [primerNombre, ...resto] = nombres.trim().split(/\s+/);
    const apellidoUsuario = resto.join(' ') || apellidos.trim();
    if (!primerNombre || !apellidoUsuario) return;

    const candidatos = await this.userRepo
      .createQueryBuilder('u')
      .where('LOWER(u.firstName) = LOWER(:fn)', { fn: primerNombre })
      .andWhere('LOWER(u.lastName) = LOWER(:ln)', { ln: apellidoUsuario })
      .andWhere('u.id <> :id', { id: usuarioId })
      .getMany();
    if (!candidatos.length) return;

    const ids = candidatos.map((c) => c.id);
    const [sena, cole, uni] = await Promise.all([
      this.senaRepo.find({ where: { usuarioId: In(ids) } }),
      this.colegioRepo.find({ where: { usuarioId: In(ids) } }),
      this.universidadRepo.find({ where: { usuarioId: In(ids) } }),
    ]);
    if (sena.length || cole.length || uni.length) {
      throw new ConflictException(
        'Ya existe una cuenta con este nombre registrada en una ficha o curso. Si eres tú, inicia sesión con tu correo anterior; no puedes crear otra cuenta en otra ficha.',
      );
    }
  }

  /**
   * Asigna la ficha al usuario y, si se solicita, valida la unicidad de
   * representación: solo UN líder y UN colíder por ficha.
   */
  private async asignarFichaYRepresentacion(
    usuarioId: string,
    ficha: Ficha,
    esLider?: boolean,
    esColider?: boolean,
  ): Promise<void> {
    if (esLider || esColider) {
      const columna = esLider ? 'esVocero' : 'esVoceroSuplente';
      const cargo = esLider ? 'líder' : 'colíder';
      const ocupado = await this.userRepo.findOne({
        where: { fichaId: ficha.id, [columna]: true },
      });
      if (ocupado && ocupado.id !== usuarioId) {
        throw new ConflictException(
          `Solo es permitido un ${cargo} por ficha. El cargo de ${cargo} ya está ocupado en la ficha ${ficha.code}.`,
        );
      }
    }
    await this.userRepo.update(usuarioId, {
      fichaId: ficha.id,
      esVocero: Boolean(esLider),
      esVoceroSuplente: Boolean(esColider),
    });
  }

  private async duracionDesdePrograma(
    programaFormacion: string,
  ): Promise<number | null> {
    const programa = await this.programaRepo.findOne({
      where: { name: programaFormacion.trim() },
    });
    return programa?.duracionMeses ?? null;
  }

  /** Resuelve la ficha por su número; si no existe, acepta cualquier
      ficha SENA válida (7 dígitos) y la crea automáticamente. */
  private async resolverFicha(numeroFicha: string): Promise<Ficha> {
    const codigo = numeroFicha.trim();
    let ficha = await this.fichaRepo.findOne({
      where: { code: codigo },
      relations: { programa: true },
    });
    if (!ficha) {
      if (!/^\d{7}$/.test(codigo)) {
        throw new BadRequestException(
          'Ingresa un número de ficha válido (7 dígitos).',
        );
      }
      const programa = await this.programaRepo.findOne({
        where: { name: 'Análisis y Desarrollo de Software' },
        order: { createdAt: 'DESC' },
      });
      const hoy = new Date();
      const fin = new Date();
      fin.setMonth(fin.getMonth() + (programa?.duracionMeses ?? 18));
      ficha = await this.fichaRepo.save(
        this.fichaRepo.create({
          code: codigo,
          name: `Ficha ${codigo}`,
          tipoPrograma: 'tecnologo',
          status: 'active',
          startDate: hoy,
          endDate: fin,
          programa: programa ?? null,
        }),
      );
    }
    if (ficha.status !== 'active') {
      throw new BadRequestException(
        'La ficha no existe o no está activa. Verifica el número de tu ficha.',
      );
    }
    return ficha;
  }

  async crearColegio(dto: CreatePerfilColegioDto, usuarioId: string) {
    /* Seguridad: el perfil se asocia SIEMPRE al usuario autenticado.
       Se ignora cualquier usuarioId enviado por el cliente. */
    const destino = usuarioId;
    const existe = await this.colegioRepo.findOneBy({ usuarioId: destino });
    if (existe) {
      throw new ConflictException(
        'El usuario ya tiene un perfil de colegio registrado',
      );
    }
    await this.validarDocumentoUnico(dto.tipoDocumento, dto.numeroDocumento);
    await this.validarNombreUnico(dto.nombres, dto.apellidos, usuarioId);

    const datos = this.prepararIdentificacion(dto, dto.numeroDocumento);
    const estimacion = this.estimator.estimarColegio(dto.anioAcademico);
    const estado = this.estimator.derivarEstado({
      tipo: 'colegio',
      estadoAcademico: dto.estadoAcademico || 'en_curso',
      fechaEstimada: estimacion.fecha,
    });

    const confianzas: Record<string, string> = {
      tipoDocumento: CONFIANZA.DECLARADA,
      numeroDocumento: CONFIANZA.DECLARADA,
      nombres: CONFIANZA.DECLARADA,
      apellidos: CONFIANZA.DECLARADA,
      colegio: CONFIANZA.DECLARADA,
      grado: CONFIANZA.DECLARADA,
      jornada: CONFIANZA.DECLARADA,
      anioAcademico: CONFIANZA.DECLARADA,
      fechaEstimadaFinalizacion: estimacion.fecha
        ? CONFIANZA.CALCULADA
        : CONFIANZA.NO_VERIFICADA,
    };

    const perfil = this.colegioRepo.create({
      ...datos,
      usuarioId: destino,
      colegio: dto.colegio,
      grado: dto.grado,
      jornada: dto.jornada,
      anioAcademico: dto.anioAcademico,
      estadoAcademico: dto.estadoAcademico || 'en_curso',
      ciudad: dto.ciudad,
      fechaEstimadaFinalizacion: estimacion.fecha,
      estimacion: estimacion.fecha
        ? {
            fecha: formatearFechaBD(estimacion.fecha),
            etiqueta: estimacion.etiqueta,
          }
        : null,
      estadoElyron: estado.estado,
      confianza: CONFIANZA.DECLARADA,
      confianzas,
    });
    const guardado = await this.colegioRepo.save(perfil);
    await this.registrarAuditoria(
      destino,
      'perfil_colegio.crear',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async actualizarColegio(dto: UpdatePerfilColegioDto, usuarioId: string) {
    const perfil = await this.colegioRepo.findOneBy({ usuarioId });
    if (!perfil) {
      throw new NotFoundException('No tienes un perfil de colegio registrado');
    }
    if (dto.numeroDocumento) {
      await this.validarDocumentoUnico(
        dto.tipoDocumento || perfil.tipoDocumento,
        dto.numeroDocumento,
        { tipo: 'colegio', id: perfil.id },
      );
      Object.assign(
        perfil,
        this.prepararIdentificacion(dto, dto.numeroDocumento),
      );
    }
    if (dto.nombres) perfil.nombres = dto.nombres;
    if (dto.apellidos) perfil.apellidos = dto.apellidos;
    if (dto.colegio) perfil.colegio = dto.colegio;
    if (dto.grado !== undefined) perfil.grado = dto.grado;
    if (dto.jornada) perfil.jornada = dto.jornada;
    if (dto.anioAcademico !== undefined)
      perfil.anioAcademico = dto.anioAcademico;
    if (dto.ciudad) perfil.ciudad = dto.ciudad;
    if (dto.estadoAcademico) perfil.estadoAcademico = dto.estadoAcademico;

    const estimacion = this.estimator.estimarColegio(perfil.anioAcademico);
    const estado = this.estimator.derivarEstado({
      tipo: 'colegio',
      estadoAcademico: perfil.estadoAcademico,
      fechaEstimada: estimacion.fecha,
    });
    perfil.fechaEstimadaFinalizacion = estimacion.fecha;
    perfil.estimacion = estimacion.fecha
      ? {
          fecha: formatearFechaBD(estimacion.fecha),
          etiqueta: estimacion.etiqueta,
        }
      : null;
    perfil.estadoElyron = estado.estado;

    const guardado = await this.colegioRepo.save(perfil);
    await this.registrarAuditoria(
      usuarioId,
      'perfil_colegio.actualizar',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async crearSena(dto: CreatePerfilSenaDto, usuarioId: string) {
    /* Seguridad: el perfil se asocia SIEMPRE al usuario autenticado. */
    const destino = usuarioId;
    const existe = await this.senaRepo.findOneBy({ usuarioId: destino });
    if (existe) {
      throw new ConflictException(
        'El usuario ya tiene un perfil de aprendiz SENA registrado',
      );
    }
    await this.validarDocumentoUnico(dto.tipoDocumento, dto.numeroDocumento);
    await this.validarNombreUnico(dto.nombres, dto.apellidos, usuarioId);

    const ficha = await this.resolverFicha(dto.numeroFicha);
    await this.asignarFichaYRepresentacion(
      usuarioId,
      ficha,
      dto.esLider,
      dto.esColider,
    );
    const programa = ficha.programa;
    const programaFormacion = programa?.name ?? ficha.name;
    const duracionMeses = programa?.duracionMeses ?? null;
    const fechaInicio = normalizarFecha(ficha.startDate);
    const institucional = Boolean(programa && fechaInicio);

    const datos = this.prepararIdentificacion(dto, dto.numeroDocumento);
    const estimacion = this.estimator.estimarSena(fechaInicio, duracionMeses);
    const estado = this.estimator.derivarEstado({
      tipo: 'sena',
      estadoAcademico: dto.estadoAcademico,
      etapa: dto.etapa,
      fechaEstimada: estimacion.fecha,
    });

    const etapa =
      dto.etapa ||
      (dto.estadoAcademico === 'etapa_productiva' ? 'productiva' : 'lectiva');
    const confianzas: Record<string, string> = {
      tipoDocumento: CONFIANZA.DECLARADA,
      numeroDocumento: CONFIANZA.DECLARADA,
      nombres: CONFIANZA.DECLARADA,
      apellidos: CONFIANZA.DECLARADA,
      numeroFicha: CONFIANZA.VERIFICADA,
      programaFormacion: programa ? CONFIANZA.VERIFICADA : CONFIANZA.DECLARADA,
      duracionMeses: programa ? CONFIANZA.VERIFICADA : CONFIANZA.NO_VERIFICADA,
      fechaInicio: fechaInicio ? CONFIANZA.VERIFICADA : CONFIANZA.NO_VERIFICADA,
      etapa: CONFIANZA.DECLARADA,
      fechaEstimadaFinalizacion: estimacion.fecha
        ? CONFIANZA.CALCULADA
        : CONFIANZA.NO_VERIFICADA,
    };

    const perfil = this.senaRepo.create({
      ...datos,
      usuarioId: destino,
      numeroFicha: ficha.code,
      programaFormacion,
      nivelFormacion:
        dto.tipoFormacion === 'tecnologo' ? 'tecnologo' : 'tecnico',
      tipoFormacion: dto.tipoFormacion,
      centroFormacion: dto.centroFormacion.trim(),
      regional: dto.regional || '',
      ciudad: dto.ciudad,
      modalidad: dto.modalidad,
      jornada: dto.jornada,
      fechaInicio,
      fechaMatricula: fechaInicio,
      estadoAcademico: dto.estadoAcademico || 'en_formacion',
      etapa,
      duracionMeses,
      modalidadProductiva: dto.modalidadProductiva,
      fechaEstimadaFinalizacion: estimacion.fecha,
      estimacion: estimacion.fecha
        ? {
            fecha: formatearFechaBD(estimacion.fecha),
            etiqueta: estimacion.etiqueta,
          }
        : null,
      estadoElyron: estado.estado,
      confianza: institucional ? CONFIANZA.VERIFICADA : CONFIANZA.DECLARADA,
      confianzas,
    });
    const guardado = await this.senaRepo.save(perfil);
    await this.registrarAuditoria(
      destino,
      'perfil_sena.crear',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async actualizarSena(dto: UpdatePerfilSenaDto, usuarioId: string) {
    const perfil = await this.senaRepo.findOneBy({ usuarioId });
    if (!perfil) {
      throw new NotFoundException(
        'No tienes un perfil de aprendiz SENA registrado',
      );
    }
    if (dto.numeroDocumento) {
      await this.validarDocumentoUnico(
        dto.tipoDocumento || perfil.tipoDocumento,
        dto.numeroDocumento,
        { tipo: 'sena', id: perfil.id },
      );
      Object.assign(
        perfil,
        this.prepararIdentificacion(dto, dto.numeroDocumento),
      );
    }
    if (dto.nombres) perfil.nombres = dto.nombres;
    if (dto.apellidos) perfil.apellidos = dto.apellidos;
    if (dto.telefono) perfil.telefono = dto.telefono;
    if (dto.numeroFicha) {
      const ficha = await this.resolverFicha(dto.numeroFicha);
      const programa = ficha.programa;
      perfil.numeroFicha = ficha.code;
      perfil.programaFormacion = programa?.name ?? ficha.name;
      perfil.fechaInicio = normalizarFecha(ficha.startDate);
      perfil.fechaMatricula = perfil.fechaInicio;
      perfil.duracionMeses = programa?.duracionMeses ?? null;
    }
    if (dto.nivelFormacion) perfil.nivelFormacion = dto.nivelFormacion;
    if (dto.centroFormacion)
      perfil.centroFormacion = dto.centroFormacion.trim();
    if (dto.regional !== undefined) perfil.regional = dto.regional;
    if (dto.ciudad !== undefined) perfil.ciudad = dto.ciudad;
    if (dto.modalidad) perfil.modalidad = dto.modalidad;
    if (dto.jornada) perfil.jornada = dto.jornada;
    if (dto.etapa) perfil.etapa = dto.etapa;
    if (dto.estadoAcademico) perfil.estadoAcademico = dto.estadoAcademico;
    if (dto.modalidadProductiva !== undefined)
      perfil.modalidadProductiva = dto.modalidadProductiva;

    const duracionOficial =
      perfil.duracionMeses ??
      (await this.duracionDesdePrograma(perfil.programaFormacion));
    const estimacion = this.estimator.estimarSena(
      perfil.fechaInicio,
      duracionOficial,
    );
    const estado = this.estimator.derivarEstado({
      tipo: 'sena',
      estadoAcademico: perfil.estadoAcademico,
      etapa: perfil.etapa,
      fechaEstimada: estimacion.fecha,
    });
    perfil.duracionMeses = duracionOficial;
    perfil.fechaEstimadaFinalizacion = estimacion.fecha;
    perfil.estimacion = estimacion.fecha
      ? {
          fecha: formatearFechaBD(estimacion.fecha),
          etiqueta: estimacion.etiqueta,
        }
      : null;
    perfil.estadoElyron = estado.estado;
    perfil.confianza = duracionOficial
      ? CONFIANZA.VERIFICADA
      : CONFIANZA.DECLARADA;

    const guardado = await this.senaRepo.save(perfil);
    await this.registrarAuditoria(
      usuarioId,
      'perfil_sena.actualizar',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async crearUniversidad(dto: CreatePerfilUniversidadDto, usuarioId: string) {
    /* Seguridad: el perfil se asocia SIEMPRE al usuario autenticado. */
    const destino = usuarioId;
    const existe = await this.universidadRepo.findOneBy({ usuarioId: destino });
    if (existe) {
      throw new ConflictException(
        'El usuario ya tiene un perfil universitario registrado',
      );
    }
    await this.validarDocumentoUnico(dto.tipoDocumento, dto.numeroDocumento);
    await this.validarNombreUnico(dto.nombres, dto.apellidos, usuarioId);

    const totalSemestres = dto.totalSemestres || 10;
    const semestreActual = dto.semestre;
    const estimacion = this.estimator.estimarUniversidad({
      anioIngreso: dto.anioIngreso,
      periodoIngreso: dto.periodoIngreso,
      semestreActual,
      totalSemestres,
    });
    const estado = this.estimator.derivarEstado({
      tipo: 'universidad',
      estadoAcademico: dto.estadoAcademico,
      fechaEstimada: estimacion.fecha,
    });

    const confianzas: Record<string, string> = {
      tipoDocumento: CONFIANZA.DECLARADA,
      numeroDocumento: CONFIANZA.DECLARADA,
      nombres: CONFIANZA.DECLARADA,
      apellidos: CONFIANZA.DECLARADA,
      universidad: CONFIANZA.DECLARADA,
      programaAcademico: CONFIANZA.DECLARADA,
      anioIngreso: CONFIANZA.DECLARADA,
      periodoIngreso: CONFIANZA.DECLARADA,
      semestre: CONFIANZA.DECLARADA,
      semestresRestantes: CONFIANZA.CALCULADA,
      fechaEstimadaFinalizacion: estimacion.fecha
        ? CONFIANZA.CALCULADA
        : CONFIANZA.NO_VERIFICADA,
    };

    const perfil = this.universidadRepo.create({
      ...this.prepararIdentificacion(dto, dto.numeroDocumento),
      usuarioId: destino,
      codigoEstudiantil:
        dto.codigoEstudiantil || `${dto.numeroDocumento.trim()}-ELYRON`,
      universidad: dto.universidad.trim(),
      facultad: dto.facultad || '',
      programaAcademico: dto.programaAcademico.trim(),
      nivelAcademico: dto.nivelAcademico,
      anioIngreso: dto.anioIngreso,
      periodoIngreso: dto.periodoIngreso,
      modalidad: dto.modalidad,
      jornada: dto.jornada,
      creditosPrograma: dto.creditosPrograma,
      semestre: semestreActual,
      totalSemestres,
      semestresRestantes: estimacion.semestresRestantes,
      creditosAprobados: dto.creditosAprobados,
      estadoAcademico: dto.estadoAcademico || 'activo',
      fechaEstimadaFinalizacion: estimacion.fecha,
      estimacion: estimacion.fecha
        ? {
            fecha: formatearFechaBD(estimacion.fecha),
            etiqueta: estimacion.etiqueta,
            semestresRestantes: estimacion.semestresRestantes,
          }
        : null,
      estadoElyron: estado.estado,
      confianza: CONFIANZA.DECLARADA,
      confianzas,
    });
    const guardado = await this.universidadRepo.save(perfil);
    await this.registrarAuditoria(
      destino,
      'perfil_universidad.crear',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async actualizarUniversidad(
    dto: UpdatePerfilUniversidadDto,
    usuarioId: string,
  ) {
    const perfil = await this.universidadRepo.findOneBy({ usuarioId });
    if (!perfil) {
      throw new NotFoundException(
        'No tienes un perfil universitario registrado',
      );
    }
    if (dto.numeroDocumento) {
      await this.validarDocumentoUnico(
        dto.tipoDocumento || perfil.tipoDocumento,
        dto.numeroDocumento,
        { tipo: 'universidad', id: perfil.id },
      );
      Object.assign(
        perfil,
        this.prepararIdentificacion(dto, dto.numeroDocumento),
      );
    }
    if (dto.nombres) perfil.nombres = dto.nombres;
    if (dto.apellidos) perfil.apellidos = dto.apellidos;
    if (dto.telefono) perfil.telefono = dto.telefono;
    if (dto.codigoEstudiantil) perfil.codigoEstudiantil = dto.codigoEstudiantil;
    if (dto.universidad) perfil.universidad = dto.universidad.trim();
    if (dto.facultad !== undefined) perfil.facultad = dto.facultad;
    if (dto.programaAcademico)
      perfil.programaAcademico = dto.programaAcademico.trim();
    if (dto.nivelAcademico) perfil.nivelAcademico = dto.nivelAcademico;
    if (dto.semestre !== undefined) perfil.semestre = dto.semestre;
    if (dto.totalSemestres !== undefined)
      perfil.totalSemestres = dto.totalSemestres;
    if (dto.jornada) perfil.jornada = dto.jornada;
    if (dto.modalidad) perfil.modalidad = dto.modalidad;
    if (dto.anioIngreso !== undefined) perfil.anioIngreso = dto.anioIngreso;
    if (dto.periodoIngreso !== undefined)
      perfil.periodoIngreso = dto.periodoIngreso;
    if (dto.creditosPrograma !== undefined)
      perfil.creditosPrograma = dto.creditosPrograma;
    if (dto.totalSemestres !== undefined)
      perfil.totalSemestres = dto.totalSemestres;
    if (dto.creditosAprobados !== undefined)
      perfil.creditosAprobados = dto.creditosAprobados;
    if (dto.estadoAcademico) perfil.estadoAcademico = dto.estadoAcademico;

    const totalSemestres = perfil.totalSemestres || perfil.semestre || 10;
    const estimacion = this.estimator.estimarUniversidad({
      anioIngreso: perfil.anioIngreso,
      periodoIngreso: perfil.periodoIngreso,
      semestreActual: perfil.semestre,
      totalSemestres,
    });
    const estado = this.estimator.derivarEstado({
      tipo: 'universidad',
      estadoAcademico: perfil.estadoAcademico,
      fechaEstimada: estimacion.fecha,
    });
    perfil.totalSemestres = totalSemestres;
    perfil.semestresRestantes = estimacion.semestresRestantes;
    perfil.fechaEstimadaFinalizacion = estimacion.fecha;
    perfil.estimacion = estimacion.fecha
      ? {
          fecha: formatearFechaBD(estimacion.fecha),
          etiqueta: estimacion.etiqueta,
          semestresRestantes: estimacion.semestresRestantes,
        }
      : null;
    perfil.estadoElyron = estado.estado;

    const guardado = await this.universidadRepo.save(perfil);
    await this.registrarAuditoria(
      usuarioId,
      'perfil_universidad.actualizar',
      `perfil:${guardado.id}`,
    );
    return this.mostrarSeguro(guardado);
  }

  async obtenerMiPerfil(usuario: {
    id: string;
    role?:
      | string
      | {
          name?: string;
        };
  }) {
    const rol =
      typeof usuario.role === 'string' ? usuario.role : usuario.role?.name;
    if (rol === 'estudiante') {
      const perfil = await this.colegioRepo.findOneBy({
        usuarioId: usuario.id,
      });
      return perfil ? this.mostrarSeguro(perfil) : null;
    }
    if (rol === 'aprendiz') {
      const perfil = await this.senaRepo.findOneBy({ usuarioId: usuario.id });
      return perfil ? this.mostrarSeguro(perfil) : null;
    }
    if (rol === 'universitario') {
      const perfil = await this.universidadRepo.findOneBy({
        usuarioId: usuario.id,
      });
      return perfil ? this.mostrarSeguro(perfil) : null;
    }
    return null;
  }

  private prepararIdentificacion(
    dto: object,
    numeroDocumento: string,
  ): Record<string, unknown> {
    const dato = dto as { [key: string]: unknown };
    return {
      tipoDocumento: dato.tipoDocumento as string,
      numeroDocumento: encryptSensitive(numeroDocumento),
      documentoHash: hashDocumento(numeroDocumento),
      nombres: dato.nombres as string,
      apellidos: dato.apellidos as string,
      telefono: (dato.telefono as string) || null,
    };
  }

  private mostrarSeguro(
    perfil: PerfilSena | PerfilUniversidad | PerfilColegio,
  ) {
    const copia: Record<string, unknown> = Object.keys(perfil).reduce(
      (acc, k) => {
        acc[k] = perfil[k];
        return acc;
      },
      {} as Record<string, unknown>,
    );
    if (typeof (perfil as PerfilSena).numeroDocumento === 'string') {
      copia.numeroDocumento = decryptSensitive(
        (perfil as PerfilSena).numeroDocumento,
      );
    }
    const estimacion = (perfil as PerfilSena).estimacion;
    if (estimacion?.etiqueta) {
      copia.finalizacionEstimada = estimacion.etiqueta;
    } else if (estimacion?.fecha) {
      copia.finalizacionEstimada = formatearFecha(new Date(estimacion.fecha));
    }
    return copia;
  }
}
