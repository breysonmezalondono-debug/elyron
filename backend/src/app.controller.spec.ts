import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  const fakeDataSource = {
    query: jest.fn().mockResolvedValue([{ '1': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: getDataSourceToken(), useValue: fakeDataSource },
      ],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('debe devolver status ok con BD conectada', async () => {
      const result = await appController.health();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(fakeDataSource.query).toHaveBeenCalled();
    });

    it('debe reportar degraded si la BD no responde', async () => {
      fakeDataSource.query.mockRejectedValueOnce(new Error('boom'));
      const result = await appController.health();
      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
    });

    it('no debe exponer detalles internos de error', async () => {
      fakeDataSource.query.mockRejectedValueOnce(new Error('secret interno'));
      const result = await appController.health();
      expect(JSON.stringify(result)).not.toContain('secret interno');
    });
  });
});
