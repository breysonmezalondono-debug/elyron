import { ElirFilesService } from './elir-files.service';

function makeService() {
  const repo = {
    count: jest.fn().mockResolvedValue(0),
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((v) => v),
    save: jest.fn((v) => Promise.resolve(v)),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const svc = new ElirFilesService(repo as never);
  return { svc, repo };
}

const baseFile = (
  over: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    originalname: 'guia.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('%PDF-1.4 test content'),
    ...over,
  }) as Express.Multer.File;

describe('ElirFilesService · validación y seguridad de archivos', () => {
  it('rechaza archivos ejecutables (extensión peligrosa)', async () => {
    const { svc } = makeService();
    await expect(
      svc.upload(
        'u1',
        baseFile({
          originalname: 'malware.exe',
          mimetype: 'application/x-msdownload',
        }),
        null,
        5 * 1024 * 1024,
      ),
    ).rejects.toThrow(/no está permitido|extensión/);
  });

  it('rechaza cuando el MIME no coincide con la extensión (no confía solo en ext)', async () => {
    const { svc } = makeService();
    await expect(
      svc.upload(
        'u1',
        baseFile({ originalname: 'doc.pdf', mimetype: 'text/html' }),
        null,
        5 * 1024 * 1024,
      ),
    ).rejects.toThrow(/no corresponde/);
  });

  it('rechaza archivos que superan el tamaño máximo del plan', async () => {
    const { svc } = makeService();
    const big = baseFile({
      size: 6 * 1024 * 1024,
      buffer: Buffer.alloc(6 * 1024 * 1024),
    });
    await expect(svc.upload('u1', big, null, 5 * 1024 * 1024)).rejects.toThrow(
      /tamaño máximo/,
    );
  });

  it('acepta un PDF válido y devuelve su sha256 + kind file', async () => {
    const { svc, repo } = makeService();
    const doc = await svc.upload('u1', baseFile(), null, 5 * 1024 * 1024);
    expect(doc.kind).toBe('file');
    expect(doc.sha256).toHaveLength(64);
    expect(doc.ownerId).toBe('u1');
    expect(repo.create).toHaveBeenCalled();
  });

  it('clasifica una imagen como kind image', async () => {
    const { svc } = makeService();
    const doc = await svc.upload(
      'u1',
      baseFile({ originalname: 'foto.png', mimetype: 'image/png' }),
      null,
      5 * 1024 * 1024,
    );
    expect(doc.kind).toBe('image');
  });
});

describe('ElirFilesService · ownership (un usuario no accede a archivos de otro)', () => {
  it('getOwned rechaza cuando el documento pertenece a otro usuario', async () => {
    const { svc, repo } = makeService();
    repo.findOne.mockResolvedValue({
      id: 'd1',
      ownerId: 'usuarioB',
      storagePath: 'usuarioB/x.pdf',
    });
    await expect(svc.getOwned('d1', 'usuarioA')).rejects.toThrow(
      /No tienes acceso/,
    );
  });

  it('getOwned permite al dueño y lanza 404 si no existe', async () => {
    const { svc, repo } = makeService();
    repo.findOne.mockResolvedValue({
      id: 'd1',
      ownerId: 'usuarioA',
      storagePath: 'usuarioA/x.pdf',
    });
    const doc = await svc.getOwned('d1', 'usuarioA');
    expect(doc.id).toBe('d1');

    repo.findOne.mockResolvedValue(null);
    await expect(svc.getOwned('d1', 'usuarioA')).rejects.toThrow(
      /no encontrado/,
    );
  });

  it('remove valida ownership antes de eliminar', async () => {
    const { svc, repo } = makeService();
    repo.findOne.mockResolvedValue({
      id: 'd1',
      ownerId: 'usuarioB',
      storagePath: 'usuarioB/x.pdf',
    });
    await expect(svc.remove('d1', 'usuarioA')).rejects.toThrow(
      /No tienes acceso/,
    );
  });
});
