import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './password-reset-token.entity';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { UsersModule } from '../users/users.module';
import { ThrottleGuard } from '../auth/guards/throttle.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetToken]), UsersModule],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, ThrottleGuard],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
