import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailAssetsController } from './mail-assets.controller';

@Global()
@Module({
  controllers: [MailAssetsController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
