import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  IsIn,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { INSTITUCIONES_LIST } from '../../../common/constants/instituciones';

const ROLES_VALIDOS = [
  'instructor',
  'docente',
  'orientador',
  'coordinador_convivencia',
  'bienestar_sena',
  'rector',
  'coordinador',
  'director_programa',
  'decano',
  'bienestar_universitario',
] as const;

const TIPOS_DOCUMENTO_PERSONAL = ['cc', 'ce', 'pasaporte'] as const;

export class TituloAcademicoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  @IsString()
  @IsNotEmpty()
  institucion: string;
  @IsString()
  @IsOptional()
  tipo?: string;
}

export class EducacionComplementariaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @IsString()
  @IsOptional()
  tipo?: string;
  @IsString()
  @IsOptional()
  intensidadHoraria?: string;
}

export class ExperienciaLaboralDto {
  @IsString()
  @IsNotEmpty()
  empresa: string;
  @IsString()
  @IsNotEmpty()
  cargo: string;
  @IsString()
  @IsOptional()
  funciones?: string;
  @IsString()
  @IsOptional()
  fechaInicio?: string;
  @IsString()
  @IsOptional()
  fechaFin?: string;
}

export class CrearCuentaDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsIn(ROLES_VALIDOS)
  roleKey: string;
  @IsOptional()
  @IsIn(INSTITUCIONES_LIST)
  institucion?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  /** Documento obligatorio para crear cuentas de personal. */
  @IsIn(TIPOS_DOCUMENTO_PERSONAL, {
    message: 'El tipo de documento no es válido (CC, CE o pasaporte).',
  })
  tipoDocumento: string;
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio.' })
  @Matches(/^\d{5,12}$/, {
    message: 'El número de documento debe contener entre 5 y 12 dígitos.',
  })
  numeroDocumento: string;
  @IsOptional()
  @IsString()
  @MaxLength(160)
  direccion?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TituloAcademicoDto)
  titulosAcademicos?: TituloAcademicoDto[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducacionComplementariaDto)
  educacionComplementaria?: EducacionComplementariaDto[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExperienciaLaboralDto)
  experienciaLaboral?: ExperienciaLaboralDto[];
  @IsOptional()
  @IsUUID()
  fichaId?: string;
  @IsOptional()
  @IsUUID()
  grupoId?: string;
}
export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsIn(INSTITUCIONES_LIST)
  institucion?: string;
  @IsOptional()
  @IsUUID()
  roleId?: string;
  @IsOptional()
  @IsUUID()
  fichaId?: string;
  @IsOptional()
  @IsBoolean()
  esVocero?: boolean;
  @IsOptional()
  @IsBoolean()
  esVoceroSuplente?: boolean;
  @IsOptional()
  @IsUUID()
  grupoId?: string;
  @IsOptional()
  @IsBoolean()
  esPersonero?: boolean;
  @IsOptional()
  @IsBoolean()
  esPersoneroSuplente?: boolean;
  @IsOptional()
  @IsString()
  companyId?: string;
}
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsString()
  avatar?: string;
  @IsOptional()
  @IsIn(INSTITUCIONES_LIST)
  institucion?: string;
  @IsOptional()
  @IsUUID()
  roleId?: string;
  @IsOptional()
  @IsUUID()
  fichaId?: string;
  @IsOptional()
  @IsBoolean()
  esVocero?: boolean;
  @IsOptional()
  @IsBoolean()
  esVoceroSuplente?: boolean;
  @IsOptional()
  @IsUUID()
  grupoId?: string;
  @IsOptional()
  @IsBoolean()
  esPersonero?: boolean;
  @IsOptional()
  @IsBoolean()
  esPersoneroSuplente?: boolean;
  @IsOptional()
  @IsString()
  companyId?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Cambio de contraseña del propio usuario autenticado.
 * Exige la contraseña actual para verificar identidad.
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72, { message: 'La contraseña es demasiado larga.' })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe incluir una letra minúscula.',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe incluir una letra mayúscula.',
  })
  @Matches(/\d/, { message: 'La contraseña debe incluir un número.' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'La contraseña debe incluir un carácter especial.',
  })
  newPassword: string;
}

/**
 * Actualización de datos personales del propio usuario.
 * SOLO datos personales (nombre, apellido, teléfono, foto). Nunca académicos.
 */
export class ActualizarMiPerfilDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  firstName?: string;
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  lastName?: string;
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string | null;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string | null;
}
