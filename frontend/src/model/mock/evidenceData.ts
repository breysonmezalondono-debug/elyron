import type { ElirAnalysis } from '../elir';

export type EvidenceFileType = 'pdf' | 'docx' | 'pptx' | 'video' | 'link' | 'image' | 'sql' | 'zip';

export const ANALYZABLE_EXTENSIONS: readonly EvidenceFileType[] = ['pdf', 'docx', 'pptx'];

export const EVIDENCE_ANALYSES: Record<string, ElirAnalysis> = {
  'evi-1': {
    summary:
      'La evidencia presenta un modelo entidad-relación para una base de datos de gestión académica. Inuye 8 entidades principales (Estudiante, Programa, Grupo, Instructor, Actividad, Evidencia, Calificación, Competencia) con sus relationships cardinality correctamente definidas. Se identifican 3 entidades débiles y 2 herencias. El modelo cumple con las reglas de normalización hasta 3FN.',
    objectives: [
      'Diseñar un modelo entidad-relación completo para el dominio académico',
      'Identificar entidades fuertes, débiles y sus relationships de dependencia',
      'Aplicar las reglas de cardinalidad (1:1, 1:N, M:N) en cada relationship',
      'Validar que el modelo resultante cumpla con Tercera Forma Normal (3FN)',
    ],
    activities: [
      'Análisis de requerimientos del sistema de gestión académica',
      'Identificación de entidades y atributos a partir del diccionario de datos',
      'Diseño del diagrama ER en notación Chen',
      'Conversión del modelo conceptual al modelo relacional',
      'Validación de normalización aplicando dependencias funcionales',
    ],
    dates: [
      'Fecha de entrega: 10 de agosto de 2026',
      'Fecha de retroalimentación: 12 de agosto de 2026',
      'Cierre de corrección del Taller 1: 15 de agosto de 2026',
    ],
    tasks: [
      'Corregir la relationship entre Actividad y Evidencia: actualmente está en M:M pero debería ser 1:N',
      'Agregar atributo fecha_creación a la entidad Evidencia',
      'Documentar las dependencias funcionales en una tabla aparte',
      'Incluir el diagrama en formato PNG de alta resolución',
      'Revisar que la entida Calificación no tenga redundancia transitiva',
    ],
  },
  'evi-2': {
    summary:
      'Taller de normalización de una base de datos relacional hasta Tercera Forma Normal (3FN). La aprendiz modeló entidades normalizadas, documentó dependencias funcionales y validó la ausencia de dependencias transitivas. La entrega cumple el objetivo del resultado de aprendizaje "Modelar entidades normalizadas hasta tercera forma normal" y fue aprobada por el instructor.',
    objectives: [
      'Aplicar la primera, segunda y tercera forma normal sobre un esquema propuesto',
      'Identificar dependencias funcionales y dependencias transitivas',
      'Documentar el proceso de descomposición de tablas con sus justificaciones',
      'Validar que el esquema resultante sea consistente con el modelo entidad-relación',
    ],
    activities: [
      'Análisis del esquema inicial con redundancias y duplicación de datos',
      'Descomposición de tablas hasta 1FN aplicando atomicidad de atributos',
      'Eliminación de dependencias parciales para alcanzar 2FN',
      'Eliminación de dependencias transitivas para alcanzar 3FN',
      'Comparación del esquema final contra las reglas de negocio',
    ],
    dates: [
      'Fecha de entrega: 10 de agosto de 2026',
      'Fecha de retroalimentación: 12 de agosto de 2026',
      'Cierre de corrección del Taller 2: 15 de agosto de 2026',
    ],
    tasks: [
      'Justificar en una tabla la decisión de cada descomposición aplicada',
      'Documentar las dependencias funcionales de todas las tablas finales',
      'Añadir un ejemplo de consulta que valide la integridad del esquema',
      'Revisar que no existan campos calculados almacenados en las tablas',
    ],
  },
  'evi-p1': {
    summary:
      'Proyecto integrador de frontend que implementa una interfaz de usuario completa en React 19. Utiliza componentes funcionales con hooks (useState, useEffect, useContext), React Router para navegación y un sistema de diseño basado en design tokens. El proyecto incluye autenticación mock, dashboard con estadísticas, sistema de lecciones interactivas y panel de IA tutor. La entrega fue devuelta por el instructor por no incluir el módulo de autenticación con persistencia.',
    objectives: [
      'Construir una SPA responsive con React 19 y React Router',
      'Implementar autenticación basada JWT con persistencia de sesión',
      'Reusable components con Tailwind CSS y design tokens',
      'Desarrollar componentes interactivos con animaciones usando framer-motion',
    ],
    activities: [
      'Configuración del proyecto con Vite + React + TypeScript',
      'Implementación del módulo de autenticación (login, registro, roles)',
      'Desarrollo del dashboard principal con tarjetas de estadísticas',
      'Creación del sistema de lecciones con fases simulador/quiz/lab',
      'Integración del panel de IA tutor con streaming SSE',
      'Implementación del sidebar role-aware y navegación dinámica',
    ],
    dates: [
      'Fecha de entrega: 30 de agosto de 2026',
      'Revisión intermedia: 22 de agosto de 2026',
      'Fecha límite de corrección: 5 de septiembre de 2026',
    ],
    tasks: [
      'Completar el módulo de autenticación con login y persistencia de sesión',
      'Implementar la recuperación de sesión al recargar la página',
      'Agregar protección de rutas por rol usando el token decodificado',
      'Documentar el flujo de inicio y cierre de sesión en la memoria de la entrega',
    ],
  },
  'evi-3': {
    summary:
      'Evidencia pendiente de entrega. Corresponde a un taller práctico de consultas SQL con cláusulas JOIN (INNER, LEFT, RIGHT, FULL) sobre una base de datos relacional de ejemplo. El taller incluye 12 consultas progresivas que van desde SELECT simple hasta subconsultas correlacionadas con agregación.',
    objectives: [
      'Escribir consultas SQL que utilicen diferentes tipos de JOIN',
      'Resolver problemas de duplicación de filas en resultados de JOIN',
      'Aplicar funciones de agregación (COUNT, SUM, AVG) con GROUP BY',
      'Construir subconsultas correlionadas para filtros avanzados',
    ],
    activities: [
      'Práctica guiada de INNER JOIN con 2 tablas',
      'Ejercicios de LEFT/RIGHT JOIN para identificar registros huérfanos',
      'Taller de FULL OUTER JOIN y CROSS JOIN',
      'Resolución de casos reales con subconsultas en WHERE y SELECT',
    ],
    dates: [
      'Fecha de publicación: 18 de agosto de 2026',
      'Fecha límite de entrega: 27 de agosto de 2026',
      'Revisión por el instructor: hasta el 29 de agosto de 2026',
    ],
    tasks: [
      'Completar las 12 consultas del taller',
      'Documentar cada consulta con una explicación del resultado esperado',
      'Incluir capturas de pantalla de la ejecución en el SGBD',
      'Resolver la consulta bonus: top 3 de estudiantes con mayor promedio por programa',
      'Entregar el archivo .sql con todas las consultas y el .pdf con la documentación',
    ],
  },
};