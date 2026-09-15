import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle, ThrottleGuard } from '../auth/guards/throttle.guard';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Throttle(3, 900)
  @UseGuards(ThrottleGuard)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.solicitarRecuperacion(dto.email);
  }

  @Throttle(20, 900)
  @UseGuards(ThrottleGuard)
  @Get('reset-password/validate')
  async validarToken(@Query('token') token: string) {
    if (!token || token.length < 32) {
      return { valido: false, mensaje: 'Este enlace no es válido.' };
    }
    return this.passwordResetService.validarToken(token);
  }

  @Throttle(5, 900)
  @UseGuards(ThrottleGuard)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.restablecerPassword(
      dto.token,
      dto.password,
    );
  }
}
