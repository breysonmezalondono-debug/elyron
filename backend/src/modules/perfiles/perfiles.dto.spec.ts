import { validate } from 'class-validator';
import { CreatePerfilSenaDto } from './dto/perfiles.dto';

/* ============================================================
   Validación de campos · Elyron
   Verifica que el backend rechace documentos/nombres/teléfonos
   inválidos y acepte los válidos (regla 19 del prompt).
   ============================================================ */

const baseValido = {
  tipoDocumento: 'cc',
  tipoFormacion: 'tecnologo',
  numeroFicha: '2451310',
  programaFormacion: 'Análisis y Desarrollo de Software',
  centroFormacion: 'Centro de Gestión de Mercados',
  nombres: 'Laura María',
  apellidos: 'Gómez Ramírez',
};

const erroresDe = (dto: Record<string, unknown>, campo: string): string[] => {
  const instancia = Object.assign(new CreatePerfilSenaDto(), dto);
  return validate(instancia).then((errores) => {
    const e = errores.find((x) => x.property === campo);
    if (!e) return [];
    return Object.values(e.constraints ?? {});
  });
};

describe('Validación de número de documento (9–10 dígitos)', () => {
  const validos = ['123456789', '1234567890'];
  const invalidos = [
    '12345678',
    '12345678901',
    '12345678A',
    'ABC123456',
    '123.456.789',
    '123-456-789',
    '123 456 789',
    '123@456789',
    '',
    '12345678-9',
  ];

  it.each(validos)('acepta documento válido: %s', async (doc) => {
    const msgs = await erroresDe(
      { ...baseValido, numeroDocumento: doc },
      'numeroDocumento',
    );
    expect(msgs).toHaveLength(0);
  });

  it.each(invalidos)('rechaza documento inválido: %s', async (doc) => {
    const msgs = await erroresDe(
      { ...baseValido, numeroDocumento: doc },
      'numeroDocumento',
    );
    expect(msgs.length).toBeGreaterThan(0);
  });
});

describe('Validación de nombres y apellidos', () => {
  const validos = [
    'Juan',
    'María José',
    'Álvaro Pérez',
    "D'artagnan",
    "O'Connor",
  ];
  const invalidos = ['123', 'Juan@123', 'Carlos_', 'x'];

  it.each(validos)('acepta nombre válido: %s', async (nombre) => {
    const msgs = await erroresDe({ ...baseValido, nombres: nombre }, 'nombres');
    expect(msgs).toHaveLength(0);
  });

  it.each(invalidos)('rechaza nombre inválido: %s', async (nombre) => {
    const msgs = await erroresDe({ ...baseValido, nombres: nombre }, 'nombres');
    expect(msgs.length).toBeGreaterThan(0);
  });
});

describe('Validación de teléfono', () => {
  const validos = ['3001234567', '571234567', '1234567'];
  const invalidos = [
    'abc123',
    '300 123 4567',
    '123',
    '123456',
    '1234567890123456',
  ];

  it.each(validos)('acepta teléfono válido: %s', async (tel) => {
    const msgs = await erroresDe({ ...baseValido, telefono: tel }, 'telefono');
    expect(msgs).toHaveLength(0);
  });

  it.each(invalidos)('rechaza teléfono inválido: %s', async (tel) => {
    const msgs = await erroresDe({ ...baseValido, telefono: tel }, 'telefono');
    expect(msgs.length).toBeGreaterThan(0);
  });
});
