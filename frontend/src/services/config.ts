/* ============================================================
   CONFIGURACIÓN DE MICROSERVICIOS · Elyron / EduCore
   Punto único de verdad para las URLs base y las rutas de los
   microservicios FastAPI. Los servicios de dominio importan estas
   constantes en lugar de hardcodear rutas o hosts.
   ============================================================ */

const env = (key: string, fallback: string): string =>
  (import.meta.env[key as keyof ImportMetaEnv] as string | undefined) ?? fallback;

/**
 * URL base del backend (API). En desarrollo conviene apuntar a la IP de la
 * máquina (no localhost) si la app se abre desde otro dispositivo de la red.
 * Se configura con VITE_API_URL en el frontend.
 */
const API_BASE = env('VITE_API_URL', 'http://localhost:3000').replace(/\/$/, '');

/** Microservicio de autenticación / identidad (Auth Service). */
export const AUTH_SERVICE_URL = (env('VITE_AUTH_URL', '') || API_BASE + '/api').replace(/\/$/, '');

/** Microservicio núcleo educativo: perfiles, fichas, evidencias, comunidad, etc. */
export const EDUCORE_SERVICE_URL = (env('VITE_EDUCORE_URL', '') || API_BASE + '/api').replace(/\/$/, '');

/** Microservicio de IA (Elir / tutor socrático / streaming). */
export const AI_SERVICE_URL = env('VITE_AI_URL', 'http://localhost:8000').replace(/\/$/, '');

/** Modo demo sin backend: true = datos Mock, false = llamadas HTTP reales.
    Opt-in explícito: si no se define la variable, se usa el backend real
    (seguro para builds de producción). */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/* ============================================================
   RUTAS · Auth Service
   ============================================================ */
export const AUTH_ROUTES = {
  login: (slug: string) => `/auth/${slug}/login`,
  loginInstitucional: (slug: string) => `/auth/${slug}/institucional/login`,
  register: '/auth/register',
  verifyEmail: '/auth/verify-email',
} as const;

/* ============================================================
   RUTAS · EduCore Service (perfil, fichas, evidencias, módulos)
   ============================================================ */
export const EDUCORE_ROUTES = {
  perfil: {
    miPerfil: '/perfiles/mi-perfil',
    crearSena: '/perfiles/sena',
    actualizarSena: '/perfiles/sena',
    crearColegio: '/perfiles/colegio',
    actualizarColegio: '/perfiles/colegio',
    crearUniversidad: '/perfiles/universidad',
    actualizarUniversidad: '/perfiles/universidad',
  },
  ficha: {
    miFicha: '/sena/mi-ficha',
  },
  competencias: {
    deFicha: (fichaId: string) => `/competencias/ficha/${fichaId}`,
  },
  resultados: {
    deCompetencia: (competenciaId: string) => `/resultados/competencia/${competenciaId}`,
  },
  evidencias: {
    listar: (limit = 100) => `/evidencias?limit=${limit}`,
  },
  calendario: {
    proximos: (limit = 8) => `/calendar?limit=${limit}`,
  },
  ofertas: {
    listar: (limit = 20) => `/job-board?limit=${limit}`,
  },
  convocatorias: {
    listar: (limit = 20) => `/calls?limit=${limit}`,
  },
  notificaciones: {
    noLeidas: '/notifications/unread-count',
    listar: (limit = 50) => `/notifications?limit=${limit}`,
  },
  solicitudes: {
    listar: '/solicitudes/mis-solicitudes',
    crear: '/solicitudes',
    eliminar: (id: string) => `/solicitudes/${id}`,
  },
  comunicados: {
    listar: '/comunicados',
    crear: '/comunicados',
    eliminar: (id: string) => `/comunicados/${id}`,
  },
  biblioteca: {
    catalogo: '/biblioteca/catalogo',
    misPrestamos: '/biblioteca/mis-prestamos',
    reservar: (id: string) => `/biblioteca/${id}/reservar`,
    devolver: (id: string) => `/biblioteca/${id}/devolver`,
  },
  documentos: {
    listar: '/documentos/mis-documentos',
    crear: '/documentos',
    eliminar: (id: string) => `/documentos/${id}`,
  },
  apoyo: {
    miApoyo: '/sena/mi-apoyo',
  },
  representacion: {
    miRepresentacion: '/sena/mi-representacion',
  },
  liderazgo: {
    anuncios: '/liderazgo/anuncios',
    anuncio: (id: string) => `/liderazgo/anuncios/${id}`,
    inquietudes: '/liderazgo/inquietudes',
    inquietudEstado: (id: string) => `/liderazgo/inquietudes/${id}/estado`,
  },
} as const;

/* ============================================================
   RUTAS · AI Service (Elir)
   ============================================================ */
export const AI_ROUTES = {
  chatStream: '/api/v1/chat/stream',
  health: '/health',
} as const;

/** Rutas de Elir que viven en el backend NestJS (validación, ownership,
 *  límites, streaming con fuentes reales). Base = EDUCORE_SERVICE_URL. */
export const ELIR_ROUTES = {
  chatStream: '/elir/chat/stream',
  documentos: '/elir/documentos',
  planes: '/elir/planes',
  uso: '/elir/uso',
  archivo: '/elir/archivo',
  generar: '/elir/generar',
} as const;

/* Compensación de distancia de slashes al concatenar base + ruta. */
export const joinUrl = (base: string, path: string): string =>
  `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
