import {
  IsEmail,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * Único perfil auto-registrable: perfiles aprendientes (aprendiz SENA,
 * estudiante de colegio o universitario). Instructor y administración
 * se crean EXCLUSIVAMENTE por la administración (ROLE_WHITELIST).
 */
export const ALLOWED_REGISTER_ROLES = [
  'aprendiz',
  'estudiante',
  'universitario',
] as const;
export type RegisterRoleKey = (typeof ALLOWED_REGISTER_ROLES)[number];

export class RegisterDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(60, { message: 'El nombre no puede superar los 60 caracteres' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(60, { message: 'El apellido no puede superar los 60 caracteres' })
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'La contraseña debe incluir al menos una letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe incluir al menos una letra mayúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'La contraseña debe incluir al menos un número',
  })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'La contraseña debe incluir al menos un carácter especial',
  })
  password: string;

  @IsIn(ALLOWED_REGISTER_ROLES as unknown as string[], {
    message: 'Tipo de cuenta no permitido',
  })
  roleKey: RegisterRoleKey;
}
