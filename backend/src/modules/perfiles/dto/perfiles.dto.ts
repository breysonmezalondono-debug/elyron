import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  Min,
  Max,
  IsUUID,
  Length,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import {
  TIPOS_FORMACION_SENA,
  ETAPAS_SENA,
  MODALIDADES_PRODUCTIVA,
} from '../entities/perfil-sena.entity';
import { JORNADAS } from '../entities/perfil-universidad.entity';
import {
  TIPOS_DOCUMENTO,
  MODALIDADES_SENA,
  MODALIDADES_UNIVERSIDAD,
  ESTADOS_ACADEMICOS_SENA,
  ESTADOS_ACADEMICOS_UNIVERSIDAD,
  ESTADOS_ACADEMICOS_COLEGIO,
  NIVELES_ACADEMICOS_UNIVERSIDAD,
} from '../academic.constants';
const TIPOS_DOCUMENTO_COLEGIO = ['RC', 'TI', 'CE', 'CC'] as const;

/* ============================================================
   REGLAS DE VALIDACIÓN DE CAMPOS · Elyron
   El backend es la autoridad: vuelve a validar cada campo,
   no confía en el frontend.
   ============================================================ */
/** Documento: únicamente 9–10 dígitos numéricos, sin letras/símbolos. */
const DOCUMENTO_REGEX = /^\d{9,10}$/;
const DOCUMENTO_MENSAJE =
  'El número de documento debe contener entre 9 y 10 dígitos.';
/** Nombre/apellidos: letras (incluido español), espacios, guiones y apóstrofos. */
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
const NOMBRE_MENSAJE = 'Ingresa un nombre válido (solo letras).';
/** Teléfono: únicamente 7–15 dígitos. */
const TELEFONO_REGEX = /^\d{7,15}$/;
const TELEFONO_MENSAJE =
  'Ingresa un número de teléfono válido (7 a 15 dígitos).';

export class CreatePerfilColegioDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;
  @IsIn(TIPOS_DOCUMENTO_COLEGIO)
  tipoDocumento: string;
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;
  @IsString()
  @MaxLength(100)
  colegio: string;
  @IsInt()
  @Min(0)
  @Max(11)
  grado: number;
  @IsIn(JORNADAS)
  jornada: string;
  @IsInt()
  @Min(1990)
  @Max(2100)
  anioAcademico: number;
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ciudad?: string;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_COLEGIO)
  estadoAcademico?: string;
}
export class UpdatePerfilColegioDto {
  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO_COLEGIO)
  tipoDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos?: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;
  @IsOptional()
  @IsString()
  colegio?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  grado?: number;
  @IsOptional()
  @IsIn(JORNADAS)
  jornada?: string;
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(2100)
  anioAcademico?: number;
  @IsOptional()
  @IsString()
  ciudad?: string;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_COLEGIO)
  estadoAcademico?: string;
}
export class CreatePerfilSenaDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsIn(TIPOS_DOCUMENTO)
  tipoDocumento: string;
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;

  @IsIn(TIPOS_FORMACION_SENA)
  tipoFormacion: string;
  @IsString()
  @MaxLength(120)
  programaFormacion: string;
  @IsString()
  @Length(3, 40)
  numeroFicha: string;
  @IsString()
  @MaxLength(100)
  centroFormacion: string;
  @IsOptional()
  @IsString()
  @MaxLength(60)
  regional?: string;
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ciudad?: string;
  @IsOptional()
  @IsIn(MODALIDADES_SENA)
  modalidad?: string;
  @IsOptional()
  @IsIn(JORNADAS)
  jornada?: string;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_SENA)
  estadoAcademico?: string;
  @IsOptional()
  @IsIn(ETAPAS_SENA)
  etapa?: string;
  @IsOptional()
  @IsIn(MODALIDADES_PRODUCTIVA)
  modalidadProductiva?: string;
  /** La persona se registra como Líder (vocera) de su ficha. Máx. uno por ficha. */
  @IsOptional()
  @IsBoolean()
  esLider?: boolean;
  /** La persona se registra como Colíder (vocera suplente) de su ficha. Máx. uno por ficha. */
  @IsOptional()
  @IsBoolean()
  esColider?: boolean;
}
export class UpdatePerfilSenaDto {
  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO)
  tipoDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos?: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;
  @IsOptional()
  @IsString()
  numeroFicha?: string;
  @IsOptional()
  @IsString()
  programaFormacion?: string;
  @IsOptional()
  @IsString()
  nivelFormacion?: string;
  @IsOptional()
  @IsString()
  centroFormacion?: string;
  @IsOptional()
  @IsString()
  regional?: string;
  @IsOptional()
  @IsString()
  ciudad?: string;
  @IsOptional()
  @IsIn(MODALIDADES_SENA)
  modalidad?: string;
  @IsOptional()
  @IsIn(JORNADAS)
  jornada?: string;
  @IsOptional()
  @IsIn(ETAPAS_SENA)
  etapa?: string;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_SENA)
  estadoAcademico?: string;
  @IsOptional()
  @IsIn(MODALIDADES_PRODUCTIVA)
  modalidadProductiva?: string;
}
export class CreatePerfilUniversidadDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsIn(TIPOS_DOCUMENTO)
  tipoDocumento: string;
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres: string;
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;

  @IsString()
  @MaxLength(100)
  universidad: string;
  @IsString()
  @MaxLength(120)
  programaAcademico: string;
  @IsOptional()
  @IsString()
  @MaxLength(100)
  facultad?: string;
  @IsIn(NIVELES_ACADEMICOS_UNIVERSIDAD)
  nivelAcademico: string;
  @IsOptional()
  @IsString()
  codigoEstudiantil?: string;
  @IsInt()
  @Min(1990)
  @Max(2100)
  anioIngreso: number;
  @IsInt()
  @Min(1)
  @Max(2)
  periodoIngreso: number;
  @IsOptional()
  @IsIn(JORNADAS)
  jornada?: string;
  @IsOptional()
  @IsIn(MODALIDADES_UNIVERSIDAD)
  modalidad?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  creditosPrograma?: number;
  @IsInt()
  @Min(1)
  @Max(12)
  semestre: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  totalSemestres?: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  creditosAprobados?: number;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_UNIVERSIDAD)
  estadoAcademico?: string;
}
export class UpdatePerfilUniversidadDto {
  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO)
  tipoDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(DOCUMENTO_REGEX, { message: DOCUMENTO_MENSAJE })
  numeroDocumento?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  nombres?: string;
  @IsOptional()
  @IsString()
  @Matches(NOMBRE_REGEX, { message: NOMBRE_MENSAJE })
  @Length(2, 40)
  apellidos?: string;
  @IsOptional()
  @IsString()
  @Matches(TELEFONO_REGEX, { message: TELEFONO_MENSAJE })
  telefono?: string;
  @IsOptional()
  @IsString()
  codigoEstudiantil?: string;
  @IsOptional()
  @IsString()
  universidad?: string;
  @IsOptional()
  @IsString()
  facultad?: string;
  @IsOptional()
  @IsString()
  programaAcademico?: string;
  @IsOptional()
  @IsIn(NIVELES_ACADEMICOS_UNIVERSIDAD)
  nivelAcademico?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  semestre?: number;
  @IsOptional()
  @IsIn(JORNADAS)
  jornada?: string;
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(2100)
  anioIngreso?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  periodoIngreso?: number;
  @IsOptional()
  @IsIn(MODALIDADES_UNIVERSIDAD)
  modalidad?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  creditosPrograma?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  totalSemestres?: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  creditosAprobados?: number;
  @IsOptional()
  @IsIn(ESTADOS_ACADEMICOS_UNIVERSIDAD)
  estadoAcademico?: string;
}
