import axios from 'axios';
import { AUTH_SERVICE_URL, EDUCORE_SERVICE_URL } from './services/config';

const TOKEN_KEY = 'elyron.sessionToken';

export const getToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

/* ============================================================
   ESTRUCTURA DE ERROR GLOBAL
   Unifica los fallos de red y de status HTTP en un objeto
   `ApiError` con forma predecible para los servicios de dominio.
   ============================================================ */
export class ApiError extends Error {
  constructor({
    status = 0,
    code = 'UNKNOWN',
    message = 'Error desconocido',
    data = null,
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const codeForStatus = (status) => {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status >= 500) return 'SERVER_ERROR';
  if (status >= 400) return 'CLIENT_ERROR';
  return 'UNKNOWN';
};

const isNetworkError = (error) =>
  !error.response && typeof error.request !== 'undefined';

const mapToApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (isNetworkError(error)) {
    return new ApiError({
      code: 'NETWORK_ERROR',
      message:
        error.code === 'ECONNABORTED'
          ? 'La solicitud tardó demasiado y fue cancelada.'
          : 'No es posible conectar con el servidor. Verifica tu conexión.',
    });
  }

  const status = error.response?.status ?? 0;
  const serverMessage = error.response?.data?.message;
  const detail = error.response?.data?.detail;
  return new ApiError({
    status,
    code: codeForStatus(status),
    message:
      typeof serverMessage === 'string'
        ? serverMessage
        : typeof detail === 'string'
          ? detail
          : `El servidor respondió con el estado ${status || 'desconocido'}.`,
    data: error.response?.data ?? null,
  });
};

/* ============================================================
   FACTORY DE CLIENTES
   Cada microservicio tiene su propia instancia con su baseURL.
   ============================================================ */
const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const status = error.response?.status;
      const isUnauthorized = status === 401 && !isLoginRequest;

      if (isUnauthorized) {
        clearToken();
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }

      return Promise.reject(mapToApiError(error));
    },
  );

  return client;
};

/** Cliente para el microservicio de Autenticación. */
export const authClient = createClient(AUTH_SERVICE_URL);

/** Cliente para el microservicio educativo núcleo (EduCore). */
export const educoreClient = createClient(EDUCORE_SERVICE_URL);

/** Reexport del cliente por defecto para compatibilidad (se usaba como `api`). */
const api = educoreClient;

/** Convierte una promesa del cliente a una respuesta estructurada. */
export const unwrap = async (promise) => {
  try {
    const response = await promise;
    return { ok: true, data: response.data, error: null };
  } catch (error) {
    const apiError = mapToApiError(error);
    return { ok: false, data: null, error: apiError };
  }
};

export default api;
