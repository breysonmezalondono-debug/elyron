import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(32, { message: 'El token no es válido.' })
  @MaxLength(256, { message: 'El token no es válido.' })
  token: string;

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
  password: string;
}
