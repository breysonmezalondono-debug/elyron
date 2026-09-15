import type { ElirConversation } from '../elir';
import { createElirConversation } from '../elir';

/* ============================================================
   ELIR · datos estáticos del asistente
   Solo contenido real y de producto:
   - mensaje de bienvenida
   - preguntas rápidas de orientación de plataforma
   - constructor de sesión

   NO contiene respuestas "enlatadas" ni fuentes inventadas.
   Las respuestas y los cuestionarios los genera el backend de IA
   en tiempo real; nunca se fabrican aquí.
   ============================================================ */

export const ELIR_WELCOME_TEXT =
  'Hola, soy Elir. No doy respuestas de regalo: razonamos juntos y cito las fuentes de tu institución. ¿Qué quieres entender hoy?';

export const ELIR_QUICK_QUESTIONS = [
  '¿Dónde subo mi evidencia?',
  '¿Cómo veo mis comunicados?',
  "¿Qué significa el estado 'pendiente'?",
  '¿Cómo contacto a bienestar?',
];

export const newElirSession = (): ElirConversation =>
  createElirConversation(ELIR_WELCOME_TEXT);
