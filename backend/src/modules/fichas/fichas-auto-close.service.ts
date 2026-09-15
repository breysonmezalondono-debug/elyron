import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { FichasService } from './fichas.service';

@Injectable()
export class FichasAutoCloseService implements OnModuleDestroy, OnModuleInit {
  private timer?: NodeJS.Timeout;
  private initialTimer?: NodeJS.Timeout;

  constructor(private readonly fichasService: FichasService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.ejecutar(), 6 * 60 * 60 * 1000);
    this.timer.unref();
    this.initialTimer = setTimeout(() => void this.ejecutar(), 30_000);
    this.initialTimer.unref();
  }

  async ejecutar(): Promise<void> {
    try {
      const count = await this.fichasService.cerrarVencidas();
      if (count > 0) {
        Logger.log(
          `Fichas cerradas por fecha de fin: ${count}`,
          'FichasAutoClose',
        );
      }
    } catch (error) {
      Logger.error('Error al cerrar fichas vencidas', error as Error);
    }
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.initialTimer) clearTimeout(this.initialTimer);
  }
}
