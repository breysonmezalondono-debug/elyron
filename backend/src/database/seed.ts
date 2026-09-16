import { config } from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import { mysqlSslOptions } from './ssl-options';
import { entities } from './entities';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { Ficha } from '../modules/fichas/ficha.entity';
import { Competencia } from '../modules/competencias/competencia.entity';
import { Resultado } from '../modules/resultados/resultado.entity';
import { Evidencia } from '../modules/evidencias/evidencia.entity';
import { CalendarEvent } from '../modules/calendar/entities/calendar-event.entity';
import { JobListing } from '../modules/job-board/entities/job-listing.entity';
import { Call } from '../modules/calls/entities/call.entity';
import { CommunityPost } from '../modules/community/entities/community-post.entity';
import { CommunityAnnouncement } from '../modules/community/entities/community-announcement.entity';
import { Notification } from '../modules/notifications/notification.entity';
import { PerfilSena } from '../modules/perfiles/entities/perfil-sena.entity';
import { Grupo } from '../modules/colegio/entities/grupo.entity';
import { DocenteGrupo } from '../modules/colegio/entities/docente-grupo.entity';
import { RemisionColegio } from '../modules/colegio/entities/remision-colegio.entity';
import { FichaInstructor } from '../modules/sena/entities/ficha-instructor.entity';
import { Remision } from '../modules/sena/entities/remision.entity';
import { Solicitud } from '../modules/solicitudes/entities/solicitud.entity';
import { Comunicado } from '../modules/comunicados/entities/comunicado.entity';
import { RecursoBiblioteca } from '../modules/biblioteca/entities/recurso-biblioteca.entity';
import { DocumentoPersonal } from '../modules/documentos/entities/documento-personal.entity';
import { FichaAnuncio } from '../modules/liderazgo/entities/ficha-anuncio.entity';
import { Inquietud } from '../modules/liderazgo/entities/ficha-inquietud.entity';
import { Programa } from '../modules/programas/entities/programa.entity';
import { Actividad } from '../modules/docente/entities/actividad.entity';
import { Entrega } from '../modules/docente/entities/entrega.entity';
import { ReporteModeracion } from '../modules/moderacion/entities/reporte.entity';
import { AuditLog } from '../modules/auditoria/entities/audit-log.entity';
import * as bcrypt from 'bcrypt';
import {
  ROLES_SEED,
  SENA_ROLES,
  SenaRoleName,
  COLEGIO_ROLES,
  ColegioRoleName,
  UNIVERSIDAD_ROLES,
  UniversidadRoleName,
} from '../common/constants/roles';
import { INSTITUCIONES } from '../common/constants/instituciones';
config();
const MODULES = [
  'users',
  'roles',
  'permissions',
  'companies',
  'fichas',
  'competencias',
  'resultados',
  'evidencias',
  'community',
  'job-board',
  'notifications',
  'calendar',
  'chat',
  'ai',
  'calls',
  'perfiles',
  'sena',
  'colegio',
  'cases',
];
const ACTIONS = ['create', 'read', 'update', 'delete'];
const CASE_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'assign',
  'reassign',
  'change_status',
  'add_message',
  'add_internal_message',
  'attach_document',
  'resolve',
  'close',
  'reopen',
  'cancel',
];
const CASE_ROLE_PERMISSIONS: Record<string, string[]> = {
  aprendiz: ['create', 'read', 'update', 'add_message', 'attach_document'],
  estudiante: ['create', 'read', 'update', 'add_message', 'attach_document'],
  universitario: ['create', 'read', 'update', 'add_message', 'attach_document'],
  instructor: ['read', 'add_message', 'change_status', 'resolve'],
  docente: ['read', 'add_message', 'change_status', 'resolve'],
  coordinador: [
    'create',
    'read',
    'update',
    'delete',
    'assign',
    'reassign',
    'change_status',
    'resolve',
    'close',
    'reopen',
    'cancel',
    'add_message',
    'add_internal_message',
  ],
  bienestar_sena: ['read', 'add_message', 'change_status', 'resolve'],
  orientador: ['read', 'add_message', 'change_status', 'resolve'],
  coordinador_convivencia: ['read', 'add_message', 'change_status', 'resolve'],
  rector: [
    'create',
    'read',
    'update',
    'delete',
    'assign',
    'reassign',
    'change_status',
    'resolve',
    'close',
    'reopen',
    'cancel',
    'add_message',
    'add_internal_message',
  ],
  decano: [
    'create',
    'read',
    'update',
    'assign',
    'reassign',
    'change_status',
    'resolve',
    'close',
    'reopen',
    'cancel',
    'add_message',
    'add_internal_message',
  ],
  director_programa: [
    'create',
    'read',
    'update',
    'assign',
    'reassign',
    'change_status',
    'resolve',
    'close',
    'reopen',
    'cancel',
    'add_message',
    'add_internal_message',
  ],
  bienestar_universitario: ['read', 'add_message', 'change_status', 'resolve'],
};
const ROLE_PERMISSIONS: Partial<
  Record<
    SenaRoleName | ColegioRoleName | UniversidadRoleName,
    Record<string, string[]>
  >
> = {
  [SENA_ROLES.ESTUDIANTE]: {
    users: ['read', 'update'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['read'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    perfiles: ['create', 'read', 'update'],
  },
  [SENA_ROLES.APRENDIZ]: {
    users: ['read', 'update'],
    fichas: ['read'],
    competencias: ['read'],
    resultados: ['read'],
    evidencias: ['create', 'read', 'update', 'delete'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    perfiles: ['create', 'read', 'update'],
  },
  [SENA_ROLES.UNIVERSITARIO]: {
    users: ['read', 'update'],
    competencias: ['read'],
    resultados: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['read', 'create'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    perfiles: ['create', 'read', 'update'],
  },
  [SENA_ROLES.INSTRUCTOR]: {
    users: ['read'],
    companies: ['read'],
    fichas: ['read', 'create', 'update'],
    competencias: ['create', 'read', 'update', 'delete'],
    resultados: ['create', 'read', 'update', 'delete'],
    evidencias: ['read', 'update', 'delete'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['read'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['create', 'read', 'update', 'delete'],
    perfiles: ['read'],
  },
  [SENA_ROLES.BIENESTAR]: {
    users: ['read'],
    fichas: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    sena: ['read', 'create', 'update'],
  },
  [SENA_ROLES.COORDINADOR]: {
    users: ['create', 'read', 'update', 'delete'],
    companies: ['create', 'read', 'update', 'delete'],
    fichas: ['create', 'read', 'update', 'delete'],
    competencias: ['create', 'read', 'update', 'delete'],
    resultados: ['create', 'read', 'update', 'delete'],
    evidencias: ['create', 'read', 'update', 'delete'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['create', 'read', 'update', 'delete'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['create', 'read', 'update', 'delete'],
    perfiles: ['create', 'read', 'update'],
    sena: ['read', 'create', 'update', 'delete'],
  },
  [COLEGIO_ROLES.DOCENTE]: {
    users: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['read'],
    notifications: ['read'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['create', 'read', 'update', 'delete'],
    perfiles: ['read'],
    colegio: ['read'],
  },
  [COLEGIO_ROLES.RECTOR]: {
    users: ['create', 'read', 'update', 'delete'],
    companies: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    'job-board': ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['create', 'read', 'update', 'delete'],
    perfiles: ['create', 'read', 'update'],
    colegio: ['read', 'create', 'update', 'delete'],
  },
  [COLEGIO_ROLES.COORDINADOR_CONVIVENCIA]: {
    users: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['read'],
    calls: ['read'],
    colegio: ['read', 'create', 'update', 'delete'],
  },
  [COLEGIO_ROLES.ORIENTADOR]: {
    users: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['read'],
    calls: ['read'],
    perfiles: ['read'],
    colegio: ['read', 'create', 'update'],
  },
  [UNIVERSIDAD_ROLES.DECANO]: {
    users: ['read', 'create', 'update'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    perfiles: ['create', 'read', 'update'],
  },
  [UNIVERSIDAD_ROLES.DIRECTOR_PROGRAMA]: {
    users: ['read', 'create', 'update'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['create', 'read'],
    calls: ['read'],
    perfiles: ['create', 'read', 'update'],
  },
  [UNIVERSIDAD_ROLES.BIENESTAR_UNIVERSITARIO]: {
    users: ['read'],
    community: ['create', 'read', 'update', 'delete'],
    notifications: ['read', 'create'],
    calendar: ['create', 'read', 'update', 'delete'],
    chat: ['create', 'read'],
    ai: ['read'],
    calls: ['read'],
    perfiles: ['read'],
  },
};
async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || 'elyron',
    password: process.env.DB_PASSWORD || 'elyron123',
    database: process.env.DB_NAME || 'elyron_db',
    charset: 'utf8mb4',
    timezone: 'Z',
    ssl: mysqlSslOptions(),
    entities,
    synchronize: true,
  });
  await dataSource.initialize();
  console.log('Conexión a la base de datos establecida');
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);
  const roles = new Map<string, Role>();
  for (const roleDef of ROLES_SEED) {
    let role = await roleRepo.findOne({ where: { name: roleDef.name } });
    if (!role) {
      role = roleRepo.create(roleDef);
      role = await roleRepo.save(role);
      console.log(`Rol creado: ${role.name}`);
    }
    roles.set(role.name, role);
  }
  const permissions = new Map<string, Permission>();
  for (const moduleName of MODULES) {
    for (const action of ACTIONS) {
      const name = `${moduleName}.${action}`;
      let permission = await permissionRepo.findOne({ where: { name } });
      if (!permission) {
        permission = permissionRepo.create({
          name,
          module: moduleName,
          action,
        });
        permission = await permissionRepo.save(permission);
      }
      permissions.set(name, permission);
    }
  }
  for (const action of CASE_ACTIONS) {
    const name = `cases.${action}`;
    if (!permissions.has(name)) {
      let permission = await permissionRepo.findOne({ where: { name } });
      if (!permission) {
        permission = await permissionRepo.save(
          permissionRepo.create({ name, module: 'cases', action }),
        );
      }
      permissions.set(name, permission);
    }
  }
  console.log(`Permisos verificados: ${permissions.size}`);
  const allPermissions = Array.from(permissions.values());
  for (const [roleName, role] of roles) {
    if (roleName === SENA_ROLES.ADMINISTRADOR) {
      role.permissions = allPermissions;
    } else {
      const matriz = ROLE_PERMISSIONS[roleName] || {};
      role.permissions = allPermissions.filter((p) =>
        (matriz[p.module] || []).includes(p.action),
      );
    }
    const caseActions = CASE_ROLE_PERMISSIONS[roleName] || [];
    const casePermissions = allPermissions.filter(
      (p) => p.module === 'cases' && caseActions.includes(p.action),
    );
    const rolePermissionIds = new Set(role.permissions.map((p) => p.id));
    role.permissions = [
      ...role.permissions,
      ...casePermissions.filter((p) => !rolePermissionIds.has(p.id)),
    ];
    await roleRepo.save(role);
    console.log(
      `Permisos asignados al rol ${roleName}: ${role.permissions.length}`,
    );
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'breyadmin26@gmail.com';
  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error(
        '[seed] Para crear el usuario administrador define ADMIN_PASSWORD (mínimo 12 caracteres). ' +
        'Nunca uses valores por defecto en producción.',
      );
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Elyron',
        isActive: true,
        institucion: INSTITUCIONES.SENA,
        roleId: roles.get(SENA_ROLES.ADMINISTRADOR).id,
      }),
    );
    console.log(`Usuario administrador creado: ${adminEmail}`);
  } else {
    console.log(`El usuario administrador ya existe: ${adminEmail}`);
  }

  const seedDemoEnabled = process.env.SEED_DEMO !== 'false';
  if (seedDemoEnabled) {
    await seedDemo(dataSource, userRepo, roles);
  } else {
    console.log('SEED_DEMO=false: datos demo omitidos (solo roles/permisos/admin)');
  }
  await dataSource.destroy();
  console.log('Seed completado');
}

async function seedDemo(
  dataSource: DataSource,
  userRepo: Repository<User>,
  roles: Map<string, Role>,
): Promise<void> {
  const demoPassword = await bcrypt.hash('Test123*', 10);
  const fichaRepo = dataSource.getRepository(Ficha);
  const fiRepo = dataSource.getRepository(FichaInstructor);
  const remRepo = dataSource.getRepository(Remision);

  const crearUsuario = async (
    email: string,
    firstName: string,
    lastName: string,
    overrides: Partial<User> = {},
  ): Promise<User> => {
    const existente = await userRepo.findOne({ where: { email } });
    if (existente) return existente as User;
    const user = userRepo.create({
      email,
      password: demoPassword,
      firstName,
      lastName,
      institucion: INSTITUCIONES.SENA,
      isActive: true,
      ...overrides,
    });
    const saved = await userRepo.save(user);
    console.log(`Usuario demo creado: ${email}`);
    return saved as User;
  };

  let ficha = await fichaRepo.findOne({ where: { code: '2957489' } });
  if (!ficha) {
    ficha = await fichaRepo.save(
      fichaRepo.create({
        code: '2957489',
        name: 'ADSO',
        tipoPrograma: 'tecnologo',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2027-12-18'),
        status: 'active',
      }),
    );
    console.log('Ficha demo creada: 2957489 ADSO');
  }

  const instructor = await crearUsuario(
    'instructor@elyron.com',
    'Instructor',
    'Demo',
    {
      roleId: roles.get(SENA_ROLES.INSTRUCTOR)?.id,
    },
  );
  await crearUsuario('coordinador@elyron.com', 'Coordinador', 'Demo', {
    roleId: roles.get(SENA_ROLES.COORDINADOR)?.id,
  });
  const bienestar = await crearUsuario(
    'bienestar@elyron.com',
    'Bienestar',
    'Demo',
    {
      roleId: roles.get(SENA_ROLES.BIENESTAR)?.id,
    },
  );
  const vocero = await crearUsuario('vocero@elyron.com', 'Vocera', 'Demo', {
    roleId: roles.get(SENA_ROLES.APRENDIZ)?.id,
    fichaId: ficha.id,
    esVocero: true,
  });
  const aprendiz = await crearUsuario(
    'aprendiz@elyron.com',
    'Aprendiz',
    'Demo',
    {
      roleId: roles.get(SENA_ROLES.APRENDIZ)?.id,
      fichaId: ficha.id,
      esVocero: true,
      esVoceroSuplente: true,
    },
  );
  if (!aprendiz.esVocero || !aprendiz.esVoceroSuplente) {
    await userRepo.update(aprendiz.id, {
      esVocero: true,
      esVoceroSuplente: true,
    });
    aprendiz.esVocero = true;
    aprendiz.esVoceroSuplente = true;
    console.log('Aprendiz demo marcado como vocera y colíder');
  }

  const asignacion = await fiRepo.findOne({
    where: { fichaId: ficha.id, instructorId: instructor.id },
  });
  if (!asignacion) {
    await fiRepo.save(
      fiRepo.create({ fichaId: ficha.id, instructorId: instructor.id }),
    );
    console.log('Instructor asignado a la ficha demo');
  }

  const remision = await remRepo.findOne({
    where: { aprendizId: vocero.id, responsableId: bienestar.id },
  });
  if (!remision) {
    await remRepo.save(
      remRepo.create({
        aprendizId: vocero.id,
        responsableId: bienestar.id,
        fichaId: ficha.id,
        tipo: 'sostenimiento',
        estado: 'aprobado',
        chatActivo: true,
      }),
    );
    console.log('Remisión demo creada (vocero → bienestar, chat activo)');
  }

  const grupoRepo = dataSource.getRepository(Grupo);
  const dgRepo = dataSource.getRepository(DocenteGrupo);
  const remColegioRepo = dataSource.getRepository(RemisionColegio);

  await seedContenidoSena(dataSource, ficha, aprendiz, vocero, instructor);

  await seedModulosNuevos(dataSource, ficha, aprendiz, instructor);

  await crearUsuario('rector@elyron.com', 'Rectora', 'Demo', {
    roleId: roles.get(COLEGIO_ROLES.RECTOR)?.id,
    institucion: INSTITUCIONES.COLEGIO,
  });
  await crearUsuario('convivencia@elyron.com', 'Convivencia', 'Demo', {
    roleId: roles.get(COLEGIO_ROLES.COORDINADOR_CONVIVENCIA)?.id,
    institucion: INSTITUCIONES.COLEGIO,
  });
  const orientador = await crearUsuario(
    'orientador@elyron.com',
    'Orientadora',
    'Demo',
    {
      roleId: roles.get(COLEGIO_ROLES.ORIENTADOR)?.id,
      institucion: INSTITUCIONES.COLEGIO,
    },
  );
  const docente = await crearUsuario('docente@elyron.com', 'Docente', 'Demo', {
    roleId: roles.get(COLEGIO_ROLES.DOCENTE)?.id,
    institucion: INSTITUCIONES.COLEGIO,
  });

  let grupo = await grupoRepo.findOne({ where: { code: '10-02' } });
  if (!grupo) {
    grupo = await grupoRepo.save(
      grupoRepo.create({
        code: '10-02',
        nombre: 'Grado Décimo B',
        grado: 10,
        nivel: 'media',
        jornada: 'manana',
        anioLectivo: 2026,
        colegio: 'Colegio Demo Elyron',
        status: 'active',
      }),
    );
    console.log('Grupo demo creado: 10-02');
  }

  const personero = await crearUsuario(
    'personero@elyron.com',
    'Personera',
    'Demo',
    {
      roleId: roles.get(COLEGIO_ROLES.ESTUDIANTE)?.id,
      institucion: INSTITUCIONES.COLEGIO,
      grupoId: grupo.id,
      esPersonero: true,
    },
  );
  await crearUsuario('estudiante@elyron.com', 'Estudiante', 'Demo', {
    roleId: roles.get(COLEGIO_ROLES.ESTUDIANTE)?.id,
    institucion: INSTITUCIONES.COLEGIO,
    grupoId: grupo.id,
  });

  const asignacionDocente = await dgRepo.findOne({
    where: { grupoId: grupo.id, docenteId: docente.id },
  });
  if (!asignacionDocente) {
    await dgRepo.save(
      dgRepo.create({
        grupoId: grupo.id,
        docenteId: docente.id,
        asignatura: 'Matemáticas',
        activo: true,
      }),
    );
    console.log('Docente asignado al grupo demo');
  }

  const remColegio = await remColegioRepo.findOne({
    where: { estudianteId: personero.id, responsableId: orientador.id },
  });
  if (!remColegio) {
    await remColegioRepo.save(
      remColegioRepo.create({
        estudianteId: personero.id,
        responsableId: orientador.id,
        grupoId: grupo.id,
        tipo: 'orientacion',
        estado: 'aprobado',
        chatActivo: true,
        motivo: 'Acompañamiento de orientación (demo)',
      }),
    );
    console.log('Remisión de colegio demo creada (personero → orientador)');
  }

  const universidadEmail = 'university@prueba.com';
  const universitario = await userRepo.findOne({
    where: { email: universidadEmail },
  });
  const universitarioRoleId = roles.get(SENA_ROLES.UNIVERSITARIO)?.id;
  if (!universitario) {
    await crearUsuario(universidadEmail, 'Universitaria', 'Demo', {
      roleId: universitarioRoleId,
      institucion: INSTITUCIONES.UNIVERSIDAD,
    });
  } else if (
    universitario.institucion !== INSTITUCIONES.UNIVERSIDAD ||
    universitario.roleId !== universitarioRoleId
  ) {
    universitario.institucion = INSTITUCIONES.UNIVERSIDAD;
    universitario.roleId = universitarioRoleId;
    await userRepo.save(universitario);
    console.log('Usuario demo universidad actualizado (institución/rol)');
  }
}

async function seedContenidoSena(
  dataSource: DataSource,
  ficha: Ficha,
  aprendiz: User,
  vocero: User,
  instructor: User,
): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const perfilRepo = dataSource.getRepository(PerfilSena);
  const competenciaRepo = dataSource.getRepository(Competencia);
  const resultadoRepo = dataSource.getRepository(Resultado);
  const evidenciaRepo = dataSource.getRepository(Evidencia);
  const calendarioRepo = dataSource.getRepository(CalendarEvent);
  const ofertaRepo = dataSource.getRepository(JobListing);
  const callRepo = dataSource.getRepository(Call);
  const postRepo = dataSource.getRepository(CommunityPost);
  const notifRepo = dataSource.getRepository(Notification);

  await userRepo.update(aprendiz.id, {
    fichaId: ficha.id,
  });

  // Seguridad: NUNCA reasignar un perfil que ya pertenezca a otro usuario.
  // Solo se crea un perfil demo nuevo si el aprendiz demo aún no tiene uno.
  const perfilDemo = await perfilRepo.findOne({
    where: { usuarioId: aprendiz.id },
  });
  if (!perfilDemo) {
    await perfilRepo.save(
      perfilRepo.create({
        usuarioId: aprendiz.id,
        numeroFicha: '2957489',
        programaFormacion: 'Análisis y Desarrollo de Software',
        nivelFormacion: 'tecnologo',
        centroFormacion:
          'Centro de Tecnologías para la Construcción y la Madera',
        regional: 'Distrito Capital',
        etapa: 'lectiva',
        fechaInicio: new Date('2026-01-20'),
      }),
    );
    console.log('Perfil SENA del aprendiz demo creado');
  }

  const contenidos: Array<{
    nombre: string;
    resultados: Array<{ nombre: string; descripcion: string }>;
  }> = [
    {
      nombre: 'Desarrollo de software según requisitos',
      resultados: [
        {
          nombre:
            'Diseñar la base de datos relacional a partir del análisis del sistema',
          descripcion: 'Modelado entidad-relación y normalización 3FN.',
        },
        {
          nombre:
            'Construir la interfaz de usuario con framework de desarrollo',
          descripcion: 'Interfaz responsiva con componentes reutilizables.',
        },
        {
          nombre: 'Documentar el análisis y diseño del sistema',
          descripcion: 'Historias de usuario y documentación técnica.',
        },
      ],
    },
    {
      nombre: 'Interacción con bases de datos SQL',
      resultados: [
        {
          nombre: 'Modelar entidades normalizadas hasta tercera forma normal',
          descripcion: 'Aplicar normalización y claves foráneas.',
        },
        {
          nombre: 'Ejecutar consultas de agregación y JOIN',
          descripcion: 'Consultas avanzadas sobre múltiples tablas.',
        },
      ],
    },
    {
      nombre: 'Programación orientada a objetos',
      resultados: [
        {
          nombre: 'Diseñar clases y relaciones con herencia',
          descripcion: 'Modelar entidades con encapsulamiento y polimorfismo.',
        },
        {
          nombre: 'Implementar patrones de diseño básicos',
          descripcion: 'Aplicar patrones como singleton y factory.',
        },
      ],
    },
  ];

  const competencias = new Map<string, Competencia>();
  for (const c of contenidos) {
    const existente = await competenciaRepo.findOne({
      where: { name: c.nombre, fichaId: ficha.id },
    });
    let competencia = existente;
    if (!competencia) {
      competencia = await competenciaRepo.save(
        competenciaRepo.create({
          name: c.nombre,
          description: c.resultados[0].descripcion,
          weight: 30,
          fichaId: ficha.id,
        }),
      );
      console.log(`Competencia creada: ${c.nombre}`);
    }
    competencias.set(c.nombre, competencia);

    for (const r of c.resultados) {
      const resExistente = await resultadoRepo.findOne({
        where: { name: r.nombre, competenciaId: competencia.id },
      });
      if (!resExistente) {
        await resultadoRepo.save(
          resultadoRepo.create({
            name: r.nombre,
            description: r.descripcion,
            competenciaId: competencia.id,
          }),
        );
      }
    }
  }

  const eviExistente = await evidenciaRepo.count({
    where: { submittedById: aprendiz.id },
  });
  if (eviExistente === 0) {
    const primeraCompetencia = Array.from(competencias.values())[0];
    const resultados = primeraCompetencia
      ? await resultadoRepo.find({
          where: { competenciaId: primeraCompetencia.id },
        })
      : [];
    const eviData = [
      {
        title: 'Taller 1 · Modelo entidad relación',
        estado: 'approved',
        feedback: 'Excelente modelado y documentación de cardinalidades.',
      },
      {
        title: 'Taller 2 · Normalización 3FN',
        estado: 'approved',
        feedback: 'Correcto. Cumple tercera forma normal.',
      },
      { title: 'Proyecto · Interfaz de usuario en React', estado: 'pending' },
      { title: 'Taller 3 · Consultas SQL con JOIN', estado: 'pending' },
    ];
    for (const e of eviData) {
      const rId = resultados[eviData.indexOf(e) % resultados.length]?.id;
      if (!rId) continue;
      await evidenciaRepo.save(
        evidenciaRepo.create({
          title: e.title,
          status: e.estado,
          files: [
            '/uploads/' + e.title.replace(/\s+/g, '-').toLowerCase() + '.pdf',
          ],
          resultadoId: rId,
          submittedById: aprendiz.id,
          feedback: e.feedback || undefined,
          reviewedAt: e.estado === 'approved' ? new Date() : undefined,
        }),
      );
    }
    console.log('Evidencias del aprendiz creadas');
  }

  const calendarioRepoCount = await calendarioRepo.count();
  if (calendarioRepoCount === 0) {
    const eventos = [
      {
        title: 'Entrega · Proyecto interfaz React',
        desc: 'Subir la evidencia del proyecto',
        in: 2,
        type: 'Entrega',
      },
      {
        title: 'Taller · Consultas SQL',
        desc: 'Clase práctica de JOIN y agregación',
        in: 4,
        type: 'Taller',
      },
      {
        title: 'Comité de ficha',
        desc: 'Reunión con coordinación e instructor',
        in: 7,
        type: 'Reunión',
      },
      {
        title: 'Sesión · Buenas prácticas de programación',
        desc: 'Sesión con el instructor',
        in: 9,
        type: 'Taller',
      },
    ];
    for (const ev of eventos) {
      const start = new Date();
      start.setDate(start.getDate() + ev.in);
      const end = new Date(start);
      end.setHours(end.getHours() + 2);
      await calendarioRepo.save(
        calendarioRepo.create({
          title: ev.title,
          description: ev.desc,
          startDate: start,
          endDate: end,
          allDay: false,
          color:
            ev.type === 'Entrega'
              ? 'red'
              : ev.type === 'Reunión'
                ? 'violet'
                : 'mint',
          type: ev.type,
          createdById: instructor.id,
          attendees: [aprendiz.id],
        }),
      );
    }
    console.log('Eventos de calendario creados');
  }

  const ofertaCount = await ofertaRepo.count();
  if (ofertaCount === 0) {
    const ofertas = [
      {
        t: 'Desarrollador Full Stack Junior',
        d: 'Aplicación web con React y Node.js. Oportunidad para aprendices en etapa productiva.',
        c: 'TechSolutions',
        l: 'Bogotá',
        s: '$2.500.000',
        r: ['React', 'Node.js', 'SQL'],
      },
      {
        t: 'Analista de Datos (Practicante)',
        d: 'Apoyo en modelado y consultas SQL en equipo de datos.',
        c: 'InnovaSoft',
        l: 'Medellín',
        s: '$1.800.000',
        r: ['SQL', 'Excel', 'Python'],
      },
      {
        t: 'QA Trainee',
        d: 'Pruebas funcionales de aplicaciones web. Ideal para contratos de aprendizaje.',
        c: 'Kairos Labs',
        l: 'Remoto',
        s: '$1.920.000',
        r: ['Pruebas', 'Manual'],
      },
    ];
    for (const o of ofertas) {
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 2);
      await ofertaRepo.save(
        ofertaRepo.create({
          title: o.t,
          description: o.d,
          company: o.c,
          location: o.l,
          salary: o.s,
          status: 'active',
          requirements: o.r,
          expiresAt: exp,
          postedById: instructor.id,
        }),
      );
    }
    console.log('Ofertas de empleo creadas');
  }

  const callCount = await callRepo.count();
  if (callCount === 0) {
    const calls = [
      {
        t: 'Convocatoria · Apoyo de sostenimiento',
        d: 'Postúlate al apoyo económico para el semestre. Revisa requisitos y fechas.',
        start: 5,
        end: 20,
        r: ['Estar activo', 'Documentos al día', 'Formulario diligenciado'],
      },
      {
        t: 'Seminario de emprendimiento',
        d: 'Seminario certificable para aprendices interesados en crear empresa.',
        start: 12,
        end: 30,
        r: ['Inscripción previa'],
      },
    ];
    for (const c of calls) {
      const start = new Date();
      start.setDate(start.getDate() + c.start);
      const end = new Date();
      end.setDate(end.getDate() + c.end);
      await callRepo.save(
        callRepo.create({
          title: c.t,
          description: c.d,
          startDate: start,
          endDate: end,
          status: 'open',
          requirements: c.r,
          createdById: instructor.id,
        }),
      );
    }
    console.log('Convocatorias creadas');
  }

  const postCount = await postRepo.count();
  if (postCount === 0) {
    const posts = [
      {
        c: '¿Alguien ya resolvió el taller de JOIN con múltiples tablas? Compartan si ven algún detalle.',
        a: aprendiz,
        parent: null,
      },
      {
        c: 'Recuerden subir la evidencia del proyecto React antes del viernes. Cualquier duda me escriben.',
        a: instructor,
        parent: null,
      },
      {
        c: '+1, yo pude con la solución de normalización 3FN, puedo ayudar.',
        a: vocero,
        parent: null,
      },
    ];
    for (const p of posts) {
      await postRepo.save(
        postRepo.create({
          content: p.c,
          authorId: p.a.id,
          isVisible: true,
        }),
      );
    }
    console.log('Publicaciones de comunidad creadas');
  }

  const notifCount = await notifRepo.count({
    where: { userId: aprendiz.id },
  });
  if (notifCount === 0) {
    const notifs = [
      {
        t: 'Entrega próxima',
        m: 'Tienes una evidencia por entregar: Proyecto interfaz React.',
        type: 'warning',
        link: '/evidencias',
      },
      {
        t: 'Convocatoria abierta',
        m: 'El apoyo de sostenimiento ya está disponible. Revisa los requisitos.',
        type: 'info',
        link: '/apoyo',
      },
      {
        t: 'Nuevo comunicado de ficha',
        m: 'La vocera publicó una actualización importante para la ficha.',
        type: 'info',
        link: '/comunicados',
      },
    ];
    for (const n of notifs) {
      await notifRepo.save(
        notifRepo.create({
          title: n.t,
          message: n.m,
          type: n.type,
          userId: aprendiz.id,
          link: n.link,
        }),
      );
    }
    console.log('Notificaciones del aprendiz creadas');
  }

  await seedServiciosAprendiz(dataSource, aprendiz, vocero, instructor, ficha);
}

async function seedServiciosAprendiz(
  dataSource: DataSource,
  aprendiz: User,
  vocero: User,
  instructor: User,
  ficha: Ficha,
): Promise<void> {
  const solicitudRepo = dataSource.getRepository(Solicitud);
  const comunicadoRepo = dataSource.getRepository(Comunicado);
  const bibliotecaRepo = dataSource.getRepository(RecursoBiblioteca);
  const documentoRepo = dataSource.getRepository(DocumentoPersonal);
  const remisionRepo = dataSource.getRepository(Remision);

  const yaApoyo = await remisionRepo.findOne({
    where: { aprendizId: aprendiz.id, tipo: 'sostenimiento' },
  });
  if (!yaApoyo) {
    await remisionRepo.save(
      remisionRepo.create({
        aprendizId: aprendiz.id,
        responsableId: instructor.id,
        fichaId: ficha.id,
        tipo: 'sostenimiento',
        estado: 'en_revision',
        chatActivo: true,
        motivo: 'Apoyo de sostenimiento del semestre 2026-2',
      }),
    );
    console.log('Remisión de apoyo del aprendiz creada');
  }

  if ((await solicitudRepo.count()) === 0) {
    const sol = [
      {
        t: 'Certificado de notas del semestre',
        d: 'Solicitud de certificado para trámites de beca.',
        tipo: 'academico',
        s: 'en_proceso',
      },
      {
        t: 'Carnet institucional',
        d: 'Solicitud de reposición del carnet estudiantil.',
        tipo: 'institucional',
        s: 'abierta',
      },
    ];
    for (const x of sol) {
      await solicitudRepo.save(
        solicitudRepo.create({
          titulo: x.t,
          descripcion: x.d,
          tipo: x.tipo,
          estado: x.s,
          aprendizId: aprendiz.id,
        }),
      );
    }
    console.log('Solicitudes del aprendiz creadas');
  }

  if ((await comunicadoRepo.count()) === 0) {
    const coms = [
      {
        t: 'Reunión general de ficha',
        c: 'El jueves a las 10:00 a. m. vía Teams. Asistencia obligatoria.',
        p: 'alta',
        d: 'ficha',
        a: vocero,
      },
      {
        t: 'Inscripción proyectos de aula',
        c: 'Abren las inscripciones para los proyectos del bloque 2.',
        p: 'media',
        d: 'ficha',
        a: instructor,
      },
    ];
    for (const c of coms) {
      await comunicadoRepo.save(
        comunicadoRepo.create({
          titulo: c.t,
          contenido: c.c,
          prioridad: c.p,
          destinatario: c.d,
          autorId: c.a.id,
          fichaId: ficha.id,
        }),
      );
    }
    console.log('Comunicados creados');
  }

  if ((await bibliotecaRepo.count()) === 0) {
    const recursos = [
      {
        t: 'Base de datos relacionales — Elmasri',
        tipo: 'libro',
        a: 'Elmasri & Navathe',
        d: 'Texto guía del programa ADSO.',
      },
      {
        t: 'React: guía práctica',
        tipo: 'libro',
        a: 'Carlos Mesa',
        d: 'Manual de componentes y hooks.',
      },
      {
        t: 'Fundamentos de SQL',
        tipo: 'recurso_digital',
        a: 'Plataforma SENA',
        d: 'Curso interactivo con ejercicios.',
      },
      {
        t: 'Patrones de diseño',
        tipo: 'libro',
        a: 'Gamma et al.',
        d: 'Catálogo GOF de patrones clásicos.',
      },
    ];
    for (const r of recursos) {
      await bibliotecaRepo.save(
        bibliotecaRepo.create({
          titulo: r.t,
          tipo: r.tipo,
          autor: r.a,
          descripcion: r.d,
          estado: 'disponible',
        }),
      );
    }
    console.log('Recursos de biblioteca creados');
  }

  if (
    (await documentoRepo.count({ where: { aprendizId: aprendiz.id } })) === 0
  ) {
    const docs = [
      {
        t: 'Certificado de matrícula',
        tipo: 'academico',
        d: 'Documento oficial de matrícula del semestre actual.',
      },
      {
        t: 'Registro civil',
        tipo: 'institucional',
        d: 'Copia digital del registro civil.',
      },
    ];
    for (const x of docs) {
      await documentoRepo.save(
        documentoRepo.create({
          titulo: x.t,
          tipo: x.tipo,
          descripcion: x.d,
          url: '/uploads/' + x.t.replace(/\s+/g, '-').toLowerCase() + '.pdf',
          aprendizId: aprendiz.id,
        }),
      );
    }
    console.log('Documentos del aprendiz creados');
  }

  const anuncioRepo = dataSource.getRepository(FichaAnuncio);
  const inquietudRepo = dataSource.getRepository(Inquietud);

  if ((await anuncioRepo.count({ where: { fichaId: ficha.id } })) === 0) {
    const anuncios = [
      {
        t: 'Bienvenida al bloque 2',
        c: 'Arrancamos con la competencia de desarrollo de software y bases de datos. Revisen el calendario.',
        p: 'alta',
        cat: 'anuncio',
      },
      {
        t: 'Asamblea de ficha',
        c: 'Reunión de ficha el viernes 9:00 a. m. para acordar el cronograma de monitores.',
        p: 'media',
        cat: 'actividad',
      },
      {
        t: 'Acta de acuerdos',
        c: 'Quedan publicados los acuerdos de la última reunión: horario de monitorías y responsable de actas.',
        p: 'baja',
        cat: 'acta',
      },
    ];
    for (const a of anuncios) {
      await anuncioRepo.save(
        anuncioRepo.create({
          titulo: a.t,
          contenido: a.c,
          prioridad: a.p,
          categoria: a.cat,
          autorId: aprendiz.id,
          fichaId: ficha.id,
        }),
      );
    }
    console.log('Anuncios de ficha (vocera/cólider) creados');
  }

  if ((await inquietudRepo.count({ where: { fichaId: ficha.id } })) === 0) {
    const inq = [
      {
        t: 'Horario de monitorías de bases de datos',
        d: 'Solicitamos definir espacios de monitoría en la tarde para quienes trabajan en la mañana.',
        cat: 'academica',
        e: 'en_gestion',
      },
      {
        t: 'Cafetería del centro',
        d: 'Varios compañeros reportan demoras en el servicio durante el descanso.',
        cat: 'bienestar',
        e: 'abierta',
      },
    ];
    for (const q of inq) {
      await inquietudRepo.save(
        inquietudRepo.create({
          titulo: q.t,
          descripcion: q.d,
          categoria: q.cat,
          estado: q.e,
          autorId: aprendiz.id,
          fichaId: ficha.id,
        }),
      );
    }
    console.log('Inquietudes de representación creadas');
  }
}

async function seedModulosNuevos(
  dataSource: DataSource,
  ficha: Ficha,
  aprendiz: User,
  instructor: User,
): Promise<void> {
  const programaRepo = dataSource.getRepository(Programa);
  const actividadRepo = dataSource.getRepository(Actividad);
  const entregaRepo = dataSource.getRepository(Entrega);
  const reporteRepo = dataSource.getRepository(ReporteModeracion);
  const auditRepo = dataSource.getRepository(AuditLog);
  const anuncioComuRepo = dataSource.getRepository(CommunityAnnouncement);

  let programa = await programaRepo.findOne({
    where: { name: 'Análisis y Desarrollo de Software' },
  });
  if (!programa) {
    programa = await programaRepo.save(
      programaRepo.create({
        name: 'Análisis y Desarrollo de Software',
        institutionId: 'inst-sena',
        groupLabel: 'Ficha',
        instructorCount: 1,
        apprenticeCount: 1,
      }),
    );
    console.log('Programa creado: Análisis y Desarrollo de Software');
  }
  const programaRepoUpdate = dataSource.getRepository(Ficha);
  await programaRepoUpdate.update(ficha.id, { programaId: programa.id });

  if ((await actividadRepo.count()) === 0) {
    const actividades = [
      {
        title: 'Taller · Consultas SQL avanzadas',
        description: 'JOINs múltiples y agregaciones para el caso de estudio.',
        type: 'taller',
        competency: 'Interacción con bases de datos SQL',
        groupId: ficha.id,
        groupCode: ficha.code,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
      {
        title: 'Quiz · Normalización 3FN',
        description: 'Evaluación de modelado de datos normalizado.',
        type: 'quiz',
        competency: 'Interacción con bases de datos SQL',
        groupId: ficha.id,
        groupCode: ficha.code,
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        title: 'Proyecto · Interfaz en React',
        description: 'Entregable del proyecto integrador del bloque.',
        type: 'proyecto',
        competency: 'Desarrollo de software según requisitos',
        groupId: ficha.id,
        groupCode: ficha.code,
        dueDate: new Date(Date.now() + 14 * 86400000),
      },
    ];
    for (const a of actividades) {
      const guardada = await actividadRepo.save(actividadRepo.create(a));
      await entregaRepo.save(
        entregaRepo.create({
          student: `${aprendiz.firstName} ${aprendiz.lastName}`,
          activityTitle: a.title,
          activityType: a.type,
          groupCode: a.groupCode,
          submittedAt: new Date(),
          version: 1,
          late: false,
          status: a.type === 'taller' ? 'Calificado' : 'Pendiente',
          grade: a.type === 'taller' ? 4.5 : undefined,
          feedback:
            a.type === 'taller' ? 'Bien resuelto, revisar SQLi.' : undefined,
          actividadId: guardada.id,
        }),
      );
    }
    console.log('Actividades y entregas docentes creadas');
  }

  if ((await reporteRepo.count()) === 0) {
    await reporteRepo.save(
      reporteRepo.create({
        contentExcerpt:
          'Publicación con contenido promocional fuera de tema...',
        reportedBy: aprendiz.id,
        reportedByRole: 'aprendiz',
        reason: 'spam',
        status: 'pendiente',
        authorName: `${instructor.firstName} ${instructor.lastName}`,
      }),
    );
    console.log('Reporte de moderación creado');
  }

  if ((await auditRepo.count()) === 0) {
    await auditRepo.save(
      auditRepo.create({
        actor: 'breyadmin26@gmail.com',
        action: 'Configuró el semestre académico',
        target: 'Semestre 2026-2',
        time: `Hoy · ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
        category: 'configuracion',
      }),
    );
    console.log('Entrada de auditoría creada');
  }

  if ((await anuncioComuRepo.count()) === 0) {
    await anuncioComuRepo.save(
      anuncioComuRepo.create({
        title: 'Novedades del programa',
        body: 'Se publica el nuevo cronograma de actividades del semestre.',
        issuer: 'Coordinación SENA',
        audience: { scope: 'institucion' },
        pinned: true,
      }),
    );
    console.log('Anuncio de comunidad creado');
  }
}

seed().catch((error) => {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});
