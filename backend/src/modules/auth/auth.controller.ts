import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Param,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './guards/auth.guard';
import { Throttle, ThrottleGuard } from './guards/throttle.guard';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from '../users/users.service';
import {
  ChangePasswordDto,
  ActualizarMiPerfilDto,
} from '../users/dto/user.dto';
import { IsEmail, IsString, MinLength } from 'class-validator';
class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
}
class RefreshDto {
  @IsString()
  refreshToken: string;
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('sena/login')
  async loginSena(@Request() req) {
    return this.authService.loginForInstitucion(req.user, 'sena');
  }
  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('colegio/login')
  async loginColegio(@Request() req) {
    return this.authService.loginForInstitucion(req.user, 'colegio');
  }
  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('universidad/login')
  async loginUniversidad(@Request() req) {
    return this.authService.loginForInstitucion(req.user, 'universidad');
  }

  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('sena/panel-admin/login')
  async loginSenaPanel(@Request() req) {
    return this.authService.loginForPanel(req.user, 'sena');
  }
  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('colegio/panel-admin/login')
  async loginColegioPanel(@Request() req) {
    return this.authService.loginForPanel(req.user, 'colegio');
  }
  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('universidad/panel-admin/login')
  async loginUniversidadPanel(@Request() req) {
    return this.authService.loginForPanel(req.user, 'universidad');
  }

  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post('login')
  async login(
    @Request()
    req,
    @Body()
    _dto: LoginDto,
  ) {
    return this.authService.loginForInstitucion(
      req.user,
      req.user.institucion ?? 'sena',
    );
  }

  /** Puerta de ingreso institucional (personal): no se enlaza en la UI pública. */
  @Throttle(10, 900)
  @UseGuards(ThrottleGuard, LocalAuthGuard)
  @Post(':institucion/institucional/login')
  async loginInstitucional(
    @Param('institucion') institucion: string,
    @Request()
    req,
  ) {
    return this.authService.loginForPersonal(req.user, institucion);
  }

  @Throttle(30, 900)
  @UseGuards(ThrottleGuard)
  @Post('register')
  async register(
    @Body()
    dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Throttle(30, 900)
  @UseGuards(ThrottleGuard)
  @Post('verify-email')
  async verifyEmail(
    @Body()
    dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto.email, dto.token);
  }

  @Post('refresh')
  async refresh(
    @Body()
    dto: RefreshDto,
  ) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(
    @Request()
    req,
  ) {
    const user = req.user;
    const permisos =
      (user?.permisos as string[] | undefined) ??
      user?.role?.permissions?.map((p: { name: string }) => p.name) ??
      [];
    return {
      ...user,
      role: typeof user.role === 'string' ? user.role : user.role?.name,
      permisos,
    };
  }

  /** Cambio de contraseña del propio usuario (exige la actual). */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    await this.usersService.cambiarContrasena(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'Tu contraseña fue actualizada correctamente.' };
  }

  /** Actualiza SOLO datos personales del usuario autenticado (nunca académicos). */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Request() req, @Body() dto: ActualizarMiPerfilDto) {
    const user = await this.usersService.actualizarDatosPersonales(
      req.user.id,
      dto,
    );
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      institucion: user.institucion,
    };
  }
}
