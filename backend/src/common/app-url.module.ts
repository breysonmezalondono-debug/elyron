import { Global, Module } from '@nestjs/common';
import { AppUrlResolver } from './app-url.resolver';

/** Módulo global que expone la fuente central de URLs públicas. */
@Global()
@Module({
  providers: [AppUrlResolver],
  exports: [AppUrlResolver],
})
export class AppUrlModule {}
