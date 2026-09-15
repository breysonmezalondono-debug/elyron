import { AppUrlResolver } from './app-url.resolver';

function resolverCon(env: Record<string, string>) {
  const configService = {
    get: (key: string, fallback?: string) =>
      env[key] !== undefined ? env[key] : fallback,
  } as any;
  return new AppUrlResolver(configService);
}

describe('AppUrlResolver · fuente central de URLs', () => {
  it('usa APP_URL para los enlaces públicos (no localhost)', () => {
    const r = resolverCon({ APP_URL: 'http://192.168.1.50:3000' });
    expect(r.resetPasswordUrl('tok')).toBe(
      'http://192.168.1.50:3000/reset-password?token=tok',
    );
    expect(r.verificationUrl('a@b.com', 't')).toBe(
      'http://192.168.1.50:3000/verificar-correo?email=a%40b.com&token=t',
    );
    // No debe contener localhost
    expect(r.resetPasswordUrl('t')).not.toContain('localhost');
  });

  it('respeta FRONTEND_URL si no hay APP_URL (compatibilidad)', () => {
    const r = resolverCon({
      FRONTEND_URL: 'http://192.168.1.50:5173,http://localhost:5174',
    });
    expect(r.getFrontendBase()).toBe('http://192.168.1.50:5173');
  });

  it('quita la barra final', () => {
    const r = resolverCon({ APP_URL: 'https://elyron.app/' });
    expect(r.resetPasswordUrl('t')).toBe(
      'https://elyron.app/reset-password?token=t',
    );
  });

  it('usa el fallback local solo si no hay configuración', () => {
    const r = resolverCon({});
    expect(r.getFrontendBase()).toBe('http://localhost:5173');
    expect(r.getApiBase()).toBe('http://localhost:3000');
  });

  it('soporta producción (dominio real) sin hardcodear', () => {
    const r = resolverCon({ APP_URL: 'https://mi-elyron.com' });
    expect(r.resetPasswordUrl('tok')).toBe(
      'https://mi-elyron.com/reset-password?token=tok',
    );
  });
});
