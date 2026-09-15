import { educoreClient } from '../api';
import { EDUCORE_ROUTES } from './config';
import { authClient } from '../api';

export interface PerfilSena {
  numeroFicha: string;
  programaFormacion: string;
  nivelFormacion: string;
  centroFormacion: string;
  regional: string;
  etapa: 'lectiva' | 'productiva';
  modalidadProductiva?: string | null;
  fechaInicio?: string;
}

export const NIVEL_LABEL: Record<string, string> = {
  tecnico: 'Técnico',
  tecnologo: 'Tecnólogo',
  operario: 'Operario',
  complementario: 'Complementario',
};

export const ETAPA_LABEL: Record<string, string> = {
  lectiva: 'Etapa lectiva',
  productiva: 'Etapa productiva',
};

/**
 * El perfil del usuario proviene SIEMPRE del backend (usuario autenticado).
 * No se usa localStorage ni datos mock para el perfil real: la base de datos
 * es la única fuente de verdad. Si no hay datos, devuelve null (sin inventar).
 */
export const perfilService = {
  async miPerfil(): Promise<PerfilSena | null> {
    try {
      const res = await educoreClient.get<PerfilSena>(
        EDUCORE_ROUTES.perfil.miPerfil,
      );
      if (res.data && res.data.numeroFicha) {
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /** Actualiza SOLO datos personales (nunca académicos). */
  async actualizarDatosPersonales(datos: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    avatar?: string | null;
  }): Promise<{ email: string; firstName: string; lastName: string; phone?: string; avatar?: string }> {
    const res = await authClient.put('/auth/me', datos);
    return res.data;
  },

  /** Cambia la contraseña del usuario autenticado. */
  async cambiarContrasena(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const res = await authClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
