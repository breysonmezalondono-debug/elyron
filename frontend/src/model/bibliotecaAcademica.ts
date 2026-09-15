/* ============================================================
   BIBLIOTECA ACADÉMICA INTELIGENTE · Elyron
   Arquitectura: Programa → Dominio académico → Áreas → Temas →
   Subtemas → Recursos especializados.

   REGLA ABSOLUTA DE AISLAMIENTO:
   La biblioteca se resuelve por el DOMINIO del programa. Dos
   programas de dominios distintos NUNCA comparten recursos. Un
   programa sin dominio configurado muestra estado vacío, jamás
   recursos de otra carrera.
   ============================================================ */

export type RecursoTipo =
  | 'documentacion'
  | 'curso'
  | 'libro'
  | 'herramienta'
  | 'oficial'
  | 'guia'
  | 'normativa';

export interface RecursoAcademico {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  tipo: RecursoTipo;
  fuente: string;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  tags: string[];
}

export interface SubtemaAcademico {
  nombre: string;
  recursos: RecursoAcademico[];
}

export interface TemaAcademico {
  nombre: string;
  subtemas: SubtemaAcademico[];
}

export interface AreaAcademica {
  nombre: string;
  icono: string;
  temas: TemaAcademico[];
}

export interface RecursoPlano {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  tipo: RecursoTipo;
  fuente: string;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  tags: string[];
  area: string;
  tema: string;
  subtema: string;
}

export interface BibliotecaResuelta {
  dominio: string;
  areas: AreaAcademica[];
  totalRecursos: number;
  recursos: RecursoPlano[];
  categorias: string[];
}

/* ============================================================
   MAPAS ACADÉMICOS POR DOMINIO
   ============================================================ */

const DOMINIOS: Record<string, AreaAcademica[]> = {
  /* ---------------- SOFTWARE ---------------- */
  software: [
    {
      nombre: 'Programación',
      icono: 'code',
      temas: [
        {
          nombre: 'Fundamentos de programación',
          subtemas: [
            {
              nombre: 'Algoritmos',
              recursos: [
                {
                  id: 'sw-alg-1',
                  nombre: 'Introducción a los algoritmos',
                  descripcion: 'Conceptos de algoritmos, pseudocódigo y lógica de programación.',
                  url: 'https://www.freecodecamp.org/espanol/news/introduccion-a-los-algoritmos/',
                  tipo: 'curso', fuente: 'freeCodeCamp', nivel: 'basico',
                  tags: ['algoritmos', 'lógica', 'programación'],
                },
              ],
            },
            {
              nombre: 'Estructuras de datos',
              recursos: [
                {
                  id: 'sw-eds-1',
                  nombre: 'Estructuras de datos — Guía',
                  descripcion: 'Arrays, listas, pilas, colas y árboles con ejemplos.',
                  url: 'https://www.geeksforgeeks.org/data-structures/',
                  tipo: 'curso', fuente: 'GeeksforGeeks', nivel: 'intermedio',
                  tags: ['estructuras de datos', 'algoritmos'],
                },
              ],
            },
            {
              nombre: 'POO',
              recursos: [
                {
                  id: 'sw-poo-1',
                  nombre: 'Programación Orientada a Objetos',
                  descripcion: 'Clases, objetos, herencia, polimorfismo y encapsulamiento.',
                  url: 'https://developer.mozilla.org/es/docs/Learn/JavaScript/Objects',
                  tipo: 'curso', fuente: 'MDN', nivel: 'intermedio',
                  tags: ['POO', 'objetos'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Python',
          subtemas: [
            {
              nombre: 'Sintaxis y fundamentos',
              recursos: [
                {
                  id: 'sw-py-1',
                  nombre: 'Python — Tutorial oficial',
                  descripcion: 'Sintaxis, funciones, módulos y excepciones.',
                  url: 'https://docs.python.org/es/3/tutorial/index.html',
                  tipo: 'documentacion', fuente: 'Python', nivel: 'basico',
                  tags: ['python', 'sintaxis'],
                },
              ],
            },
            {
              nombre: 'POO y módulos',
              recursos: [
                {
                  id: 'sw-py-2',
                  nombre: 'Python — Clases y módulos',
                  descripcion: 'Clases, herencia y organización de módulos.',
                  url: 'https://docs.python.org/es/3/tutorial/classes.html',
                  tipo: 'documentacion', fuente: 'Python', nivel: 'intermedio',
                  tags: ['python', 'POO', 'módulos'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'JavaScript',
          subtemas: [
            {
              nombre: 'Lenguaje y DOM',
              recursos: [
                {
                  id: 'sw-js-1',
                  nombre: 'JavaScript — MDN',
                  descripcion: 'Referencia completa de JavaScript, DOM y eventos.',
                  url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
                  tipo: 'documentacion', fuente: 'MDN', nivel: 'basico',
                  tags: ['javascript', 'DOM'],
                },
              ],
            },
            {
              nombre: 'Asincronía y fetch',
              recursos: [
                {
                  id: 'sw-js-2',
                  nombre: 'JavaScript — Asincronía',
                  descripcion: 'Promesas, async/await y consumo de APIs.',
                  url: 'https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous',
                  tipo: 'documentacion', fuente: 'MDN', nivel: 'intermedio',
                  tags: ['javascript', 'asincronía', 'fetch'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'TypeScript',
          subtemas: [
            {
              nombre: 'Tipado',
              recursos: [
                {
                  id: 'sw-ts-1',
                  nombre: 'TypeScript — Documentación oficial',
                  descripcion: 'Tipos, interfaces, generics y handbook.',
                  url: 'https://www.typescriptlang.org/docs/',
                  tipo: 'documentacion', fuente: 'TypeScript', nivel: 'intermedio',
                  tags: ['typescript', 'tipos'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Desarrollo Web',
      icono: 'globe',
      temas: [
        {
          nombre: 'HTML y CSS',
          subtemas: [
            {
              nombre: 'Estructura y estilos',
              recursos: [
                {
                  id: 'sw-html-1',
                  nombre: 'HTML — MDN',
                  descripcion: 'Elementos y estructura semántica.',
                  url: 'https://developer.mozilla.org/es/docs/Web/HTML',
                  tipo: 'documentacion', fuente: 'MDN', nivel: 'basico',
                  tags: ['html'],
                },
                {
                  id: 'sw-css-1',
                  nombre: 'CSS — MDN',
                  descripcion: 'Propiedades, flexbox, grid y responsividad.',
                  url: 'https://developer.mozilla.org/es/docs/Web/CSS',
                  tipo: 'documentacion', fuente: 'MDN', nivel: 'basico',
                  tags: ['css', 'layout'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'React',
          subtemas: [
            {
              nombre: 'Componentes y hooks',
              recursos: [
                {
                  id: 'sw-react-1',
                  nombre: 'React — Documentación oficial',
                  descripcion: 'Componentes, estado, hooks y renderizado.',
                  url: 'https://es.react.dev/',
                  tipo: 'documentacion', fuente: 'React', nivel: 'intermedio',
                  tags: ['react', 'hooks'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Bases de Datos',
      icono: 'database',
      temas: [
        {
          nombre: 'SQL',
          subtemas: [
            {
              nombre: 'Consultas',
              recursos: [
                {
                  id: 'sw-sql-1',
                  nombre: 'SQL — Tutorial y referencia',
                  descripcion: 'Consultas, JOIN, agregación y modelado.',
                  url: 'https://www.w3schools.com/sql/',
                  tipo: 'curso', fuente: 'W3Schools', nivel: 'basico',
                  tags: ['sql', 'consultas'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'PostgreSQL',
          subtemas: [
            {
              nombre: 'Documentación',
              recursos: [
                {
                  id: 'sw-pg-1',
                  nombre: 'PostgreSQL — Documentación',
                  descripcion: 'Referencia oficial, SQL y administración.',
                  url: 'https://www.postgresql.org/docs/',
                  tipo: 'documentacion', fuente: 'PostgreSQL', nivel: 'intermedio',
                  tags: ['postgresql'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'MongoDB',
          subtemas: [
            {
              nombre: 'NoSQL',
              recursos: [
                {
                  id: 'sw-mongo-1',
                  nombre: 'MongoDB — Documentación',
                  descripcion: 'Guías de bases NoSQL, modelos y consultas.',
                  url: 'https://www.mongodb.com/docs/',
                  tipo: 'documentacion', fuente: 'MongoDB', nivel: 'intermedio',
                  tags: ['mongodb', 'nosql'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Ingeniería de Software',
      icono: 'git',
      temas: [
        {
          nombre: 'Control de versiones',
          subtemas: [
            {
              nombre: 'Git',
              recursos: [
                {
                  id: 'sw-git-1',
                  nombre: 'Git — Documentación oficial',
                  descripcion: 'Referencia de Git, ramas y trabajo colaborativo.',
                  url: 'https://git-scm.com/doc',
                  tipo: 'documentacion', fuente: 'Git', nivel: 'intermedio',
                  tags: ['git', 'control de versiones'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'UML',
          subtemas: [
            {
              nombre: 'Diagramas',
              recursos: [
                {
                  id: 'sw-uml-1',
                  nombre: 'UML — Referencia de diagramas',
                  descripcion: 'Casos de uso, clases y secuencia.',
                  url: 'https://www.uml-diagrams.org/',
                  tipo: 'guia', fuente: 'UML Diagrams', nivel: 'intermedio',
                  tags: ['uml', 'diagramas'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Metodologías ágiles',
          subtemas: [
            {
              nombre: 'Scrum',
              recursos: [
                {
                  id: 'sw-scrum-1',
                  nombre: 'Scrum — Guía oficial',
                  descripcion: 'Roles, eventos y artefactos de Scrum.',
                  url: 'https://scrumguides.org/',
                  tipo: 'guia', fuente: 'Scrum', nivel: 'basico',
                  tags: ['scrum', 'ágil'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- REDES ---------------- */
  redes: [
    {
      nombre: 'Fundamentos de redes',
      icono: 'globe',
      temas: [
        {
          nombre: 'Modelo OSI y TCP/IP',
          subtemas: [
            {
              nombre: 'Capas y protocolos',
              recursos: [
                {
                  id: 'red-osi-1',
                  nombre: 'Modelo OSI — Explicación',
                  descripcion: 'Las 7 capas del modelo OSI y comparación con TCP/IP.',
                  url: 'https://www.cloudflare.com/es-es/learning/network-layer/what-is-the-osi-model/',
                  tipo: 'documentacion', fuente: 'Cloudflare', nivel: 'basico',
                  tags: ['OSI', 'TCP/IP', 'protocolos'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Direccionamiento IP',
          subtemas: [
            {
              nombre: 'IPv4 e IPv6',
              recursos: [
                {
                  id: 'red-ip-1',
                  nombre: 'Direccionamiento IP',
                  descripcion: 'IPv4, IPv6, subredes y máscaras.',
                  url: 'https://www.computernetworkingnotes.com/',
                  tipo: 'curso', fuente: 'Referencia', nivel: 'basico',
                  tags: ['IP', 'subredes'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Conmutación y enrutamiento',
      icono: 'route',
      temas: [
        {
          nombre: 'Switching',
          subtemas: [
            {
              nombre: 'VLAN y STP',
              recursos: [
                {
                  id: 'red-vlan-1',
                  nombre: 'VLAN y segmentación',
                  descripcion: 'VLAN, trunking y protocolos de enlace troncal.',
                  url: 'https://www.cisco.com/c/en/us/support/docs/switches/',
                  tipo: 'documentacion', fuente: 'Cisco', nivel: 'intermedio',
                  tags: ['VLAN', 'switching'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Routing',
          subtemas: [
            {
              nombre: 'Protocolos de enrutamiento',
              recursos: [
                {
                  id: 'red-route-1',
                  nombre: 'Enrutamiento estático y dinámico',
                  descripcion: 'Rutas, OSPF y enrutamiento entre VLAN.',
                  url: 'https://www.cisco.com/c/en/us/support/docs/ip/',
                  tipo: 'documentacion', fuente: 'Cisco', nivel: 'intermedio',
                  tags: ['routing', 'OSPF'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Seguridad de redes',
      icono: 'shield',
      temas: [
        {
          nombre: 'Firewalls',
          subtemas: [
            {
              nombre: 'Segmentación y control',
              recursos: [
                {
                  id: 'red-fw-1',
                  nombre: 'Firewalls — Fundamentos',
                  descripcion: 'Tipos de firewall y políticas de seguridad.',
                  url: 'https://www.cisco.com/c/en/us/support/docs/security/',
                  tipo: 'documentacion', fuente: 'Cisco', nivel: 'intermedio',
                  tags: ['firewall', 'seguridad'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- HARDWARE ---------------- */
  hardware: [
    {
      nombre: 'Ensamblaje y mantenimiento',
      icono: 'cpu',
      temas: [
        {
          nombre: 'Componentes del equipo',
          subtemas: [
            {
              nombre: 'Hardware',
              recursos: [
                {
                  id: 'hw-comp-1',
                  nombre: 'Componentes del computador',
                  descripcion: 'CPU, memoria, almacenamiento y tarjetas.',
                  url: 'https://www.crucial.com/',
                  tipo: 'guia', fuente: 'Crucial', nivel: 'basico',
                  tags: ['hardware', 'ensamblaje'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Diagnóstico',
          subtemas: [
            {
              nombre: 'Fallas',
              recursos: [
                {
                  id: 'hw-dia-1',
                  nombre: 'Diagnóstico de fallas',
                  descripcion: 'Identificación y solución de problemas de hardware.',
                  url: 'https://www.computerhope.com/',
                  tipo: 'guia', fuente: 'Computer Hope', nivel: 'intermedio',
                  tags: ['diagnóstico', 'mantenimiento'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Sistemas operativos',
      icono: 'monitor',
      temas: [
        {
          nombre: 'Instalación',
          subtemas: [
            {
              nombre: 'Windows y Linux',
              recursos: [
                {
                  id: 'hw-os-1',
                  nombre: 'Instalación de sistemas operativos',
                  descripcion: 'Particiones, instalación y drivers.',
                  url: 'https://support.microsoft.com/es-es/windows',
                  tipo: 'oficial', fuente: 'Microsoft', nivel: 'basico',
                  tags: ['sistemas operativos', 'instalación'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- MECATRÓNICA ---------------- */
  mecatronica: [
    {
      nombre: 'Electrónica',
      icono: 'zap',
      temas: [
        {
          nombre: 'Electrónica básica',
          subtemas: [
            {
              nombre: 'Componentes y circuitos',
              recursos: [
                {
                  id: 'mec-elect-1',
                  nombre: 'Electrónica básica',
                  descripcion: 'Resistores, capacitores, diodos y circuitos.',
                  url: 'https://www.electronics-tutorials.ws/',
                  tipo: 'curso', fuente: 'Electronics Tutorials', nivel: 'basico',
                  tags: ['electrónica', 'circuitos'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Automatización',
      icono: 'cpu',
      temas: [
        {
          nombre: 'PLC',
          subtemas: [
            {
              nombre: 'Programación Ladder',
              recursos: [
                {
                  id: 'mec-plc-1',
                  nombre: 'PLC — Programación',
                  descripcion: 'Lógica escalera, entradas/salidas y aplicaciones.',
                  url: 'https://www.plctutorials.org/',
                  tipo: 'curso', fuente: 'PLC Tutorials', nivel: 'intermedio',
                  tags: ['PLC', 'automatización'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Sensores y actuadores',
          subtemas: [
            {
              nombre: 'Sensores',
              recursos: [
                {
                  id: 'mec-sens-1',
                  nombre: 'Sensores y transductores',
                  descripcion: 'Tipos de sensores y aplicaciones industriales.',
                  url: 'https://www.electrical4u.com/',
                  tipo: 'documentacion', fuente: 'Electrical4U', nivel: 'intermedio',
                  tags: ['sensores', 'transductores'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Neumática e hidráulica',
          subtemas: [
            {
              nombre: 'Circuitos',
              recursos: [
                {
                  id: 'mec-neum-1',
                  nombre: 'Neumática — Fundamentos',
                  descripcion: 'Válvulas, cilindros y circuitos neumáticos.',
                  url: 'https://www.smcpneumatics.com/',
                  tipo: 'guia', fuente: 'Referencia', nivel: 'intermedio',
                  tags: ['neumática', 'hidráulica'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Robótica',
      icono: 'bot',
      temas: [
        {
          nombre: 'Robótica industrial',
          subtemas: [
            {
              nombre: 'Fundamentos',
              recursos: [
                {
                  id: 'mec-rob-1',
                  nombre: 'Robótica industrial',
                  descripcion: 'Cinemática, control y aplicaciones.',
                  url: 'https://www.robotics.org/',
                  tipo: 'documentacion', fuente: 'RIA', nivel: 'intermedio',
                  tags: ['robótica', 'control'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- MECÁNICA ---------------- */
  mecanica: [
    {
      nombre: 'Procesos industriales',
      icono: 'wrench',
      temas: [
        {
          nombre: 'Mecanizado',
          subtemas: [
            {
              nombre: 'Torno y fresadora',
              recursos: [
                {
                  id: 'mec-proc-1',
                  nombre: 'Procesos de mecanizado',
                  descripcion: 'Torneado, fresado y operaciones de maquinado.',
                  url: 'https://www.mmsonline.com/',
                  tipo: 'documentacion', fuente: 'Modern Machine Shop', nivel: 'intermedio',
                  tags: ['mecanizado', 'torno'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Soldadura',
          subtemas: [
            {
              nombre: 'Procesos de soldadura',
              recursos: [
                {
                  id: 'mec-sold-1',
                  nombre: 'Soldadura — Fundamentos',
                  descripcion: 'SMAW, MIG, TIG y seguridad en soldadura.',
                  url: 'https://www.lincolnelectric.com/',
                  tipo: 'documentacion', fuente: 'Lincoln Electric', nivel: 'intermedio',
                  tags: ['soldadura', 'SMAW'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Materiales',
      icono: 'atom',
      temas: [
        {
          nombre: 'Metales y aleaciones',
          subtemas: [
            {
              nombre: 'Propiedades',
              recursos: [
                {
                  id: 'mec-mat-1',
                  nombre: 'Materiales metálicos',
                  descripcion: 'Propiedades mecánicas y tratamientos térmicos.',
                  url: 'https://www.matweb.com/',
                  tipo: 'herramienta', fuente: 'MatWeb', nivel: 'intermedio',
                  tags: ['materiales', 'metales'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Metrología',
          subtemas: [
            {
              nombre: 'Medición',
              recursos: [
                {
                  id: 'mec-metr-1',
                  nombre: 'Metrología dimensional',
                  descripcion: 'Instrumentos de medición y tolerancias.',
                  url: 'https://www.mitutoyo.com/',
                  tipo: 'documentacion', fuente: 'Mitutoyo', nivel: 'basico',
                  tags: ['metrología', 'medición'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Mantenimiento',
      icono: 'settings',
      temas: [
        {
          nombre: 'Mantenimiento industrial',
          subtemas: [
            {
              nombre: 'Preventivo y predictivo',
              recursos: [
                {
                  id: 'mec-mant-1',
                  nombre: 'Mantenimiento industrial',
                  descripcion: 'Tipos de mantenimiento y planes de lubricación.',
                  url: 'https://www.plantengineering.com/',
                  tipo: 'documentacion', fuente: 'Plant Engineering', nivel: 'intermedio',
                  tags: ['mantenimiento', 'predictivo'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- ELECTRICIDAD ---------------- */
  electricidad: [
    {
      nombre: 'Instalaciones eléctricas',
      icono: 'zap',
      temas: [
        {
          nombre: 'Circuitos',
          subtemas: [
            {
              nombre: 'Cálculo y montaje',
              recursos: [
                {
                  id: 'ele-inst-1',
                  nombre: 'Instalaciones eléctricas',
                  descripcion: 'Circuitos, cableado y normativa.',
                  url: 'https://www.electrical4u.com/',
                  tipo: 'documentacion', fuente: 'Electrical4U', nivel: 'basico',
                  tags: ['instalaciones', 'circuitos'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Motores',
          subtemas: [
            {
              nombre: 'Motores eléctricos',
              recursos: [
                {
                  id: 'ele-mot-1',
                  nombre: 'Motores eléctricos',
                  descripcion: 'Principios, arranque y control de motores.',
                  url: 'https://www.electricaltechnology.org/',
                  tipo: 'documentacion', fuente: 'Electrical Technology', nivel: 'intermedio',
                  tags: ['motores', 'control'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Normativa',
      icono: 'shield',
      temas: [
        {
          nombre: 'RETIE',
          subtemas: [
            {
              nombre: 'Reglamento técnico',
              recursos: [
                {
                  id: 'ele-retie-1',
                  nombre: 'RETIE — Reglamento eléctrico',
                  descripcion: 'Reglamento Técnico de Instalaciones Eléctricas.',
                  url: 'https://www.minenergia.gov.co/',
                  tipo: 'oficial', fuente: 'MinEnergía', nivel: 'intermedio',
                  tags: ['RETIE', 'normativa'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- ADMINISTRACIÓN ---------------- */
  administracion: [
    {
      nombre: 'Administración',
      icono: 'briefcase',
      temas: [
        {
          nombre: 'Procesos administrativos',
          subtemas: [
            {
              nombre: 'Fundamentos',
              recursos: [
                {
                  id: 'adm-proc-1',
                  nombre: 'Administración — Fundamentos',
                  descripcion: 'Planeación, organización, dirección y control.',
                  url: 'https://www.redalyc.org/',
                  tipo: 'guia', fuente: 'Redalyc', nivel: 'basico',
                  tags: ['administración', 'procesos'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Organización empresarial',
          subtemas: [
            {
              nombre: 'Estructuras',
              recursos: [
                {
                  id: 'adm-org-1',
                  nombre: 'Organización empresarial',
                  descripcion: 'Estructuras organizacionales y manuales de funciones.',
                  url: 'https://www.ilo.org/es',
                  tipo: 'oficial', fuente: 'OIT', nivel: 'basico',
                  tags: ['organización', 'empresa'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Gestión documental',
      icono: 'file',
      temas: [
        {
          nombre: 'Archivo',
          subtemas: [
            {
              nombre: 'Clasificación',
              recursos: [
                {
                  id: 'adm-doc-1',
                  nombre: 'Gestión documental',
                  descripcion: 'Clasificación, archivo y normativa documental.',
                  url: 'https://www.archivogeneral.gov.co/',
                  tipo: 'oficial', fuente: 'AGN', nivel: 'basico',
                  tags: ['documentos', 'archivo'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Ofimática',
      icono: 'table',
      temas: [
        {
          nombre: 'Excel',
          subtemas: [
            {
              nombre: 'Hojas de cálculo',
              recursos: [
                {
                  id: 'adm-excel-1',
                  nombre: 'Excel — Guía de Microsoft',
                  descripcion: 'Fórmulas, tablas y funciones para gestión.',
                  url: 'https://support.microsoft.com/es-es/excel',
                  tipo: 'guia', fuente: 'Microsoft', nivel: 'basico',
                  tags: ['excel', 'ofimática'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- LOGÍSTICA ---------------- */
  logistica: [
    {
      nombre: 'Cadena de suministro',
      icono: 'truck',
      temas: [
        {
          nombre: 'Supply chain',
          subtemas: [
            {
              nombre: 'Conceptos',
              recursos: [
                {
                  id: 'log-sc-1',
                  nombre: 'Cadena de suministro',
                  descripcion: 'Conceptos de supply chain y flujo de materiales.',
                  url: 'https://www.cscmp.org/',
                  tipo: 'documentacion', fuente: 'CSCMP', nivel: 'basico',
                  tags: ['cadena de suministro', 'logística'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Inventarios',
      icono: 'boxes',
      temas: [
        {
          nombre: 'Gestión de inventarios',
          subtemas: [
            {
              nombre: 'Control',
              recursos: [
                {
                  id: 'log-inv-1',
                  nombre: 'Gestión de inventarios',
                  descripcion: 'Métodos de valoración y control de stock.',
                  url: 'https://www.investopedia.com/terms/i/inventory.asp',
                  tipo: 'documentacion', fuente: 'Investopedia', nivel: 'intermedio',
                  tags: ['inventarios', 'stock'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Almacenamiento y transporte',
      icono: 'warehouse',
      temas: [
        {
          nombre: 'WMS',
          subtemas: [
            {
              nombre: 'Sistemas de almacén',
              recursos: [
                {
                  id: 'log-wms-1',
                  nombre: 'Sistemas de gestión de almacenes',
                  descripcion: 'WMS, recepción, picking y despacho.',
                  url: 'https://www.sap.com/',
                  tipo: 'documentacion', fuente: 'SAP', nivel: 'intermedio',
                  tags: ['WMS', 'almacén'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- TALENTO HUMANO ---------------- */
  'talento-humano': [
    {
      nombre: 'Gestión de personal',
      icono: 'users',
      temas: [
        {
          nombre: 'Reclutamiento',
          subtemas: [
            {
              nombre: 'Selección',
              recursos: [
                {
                  id: 'th-recl-1',
                  nombre: 'Reclutamiento y selección',
                  descripcion: 'Procesos de selección y entrevistas por competencias.',
                  url: 'https://www.shrm.org/',
                  tipo: 'documentacion', fuente: 'SHRM', nivel: 'basico',
                  tags: ['reclutamiento', 'selección'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Nomina',
          subtemas: [
            {
              nombre: 'Liquidación',
              recursos: [
                {
                  id: 'th-nom-1',
                  nombre: 'Nómina y prestaciones',
                  descripcion: 'Cálculo de nómina, prestaciones y seguridad social.',
                  url: 'https://www.ilo.org/es',
                  tipo: 'oficial', fuente: 'OIT', nivel: 'intermedio',
                  tags: ['nómina', 'prestaciones'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Legislación laboral',
      icono: 'scale',
      temas: [
        {
          nombre: 'Código Sustantivo del Trabajo',
          subtemas: [
            {
              nombre: 'Normativa',
              recursos: [
                {
                  id: 'th-cst-1',
                  nombre: 'Código Sustantivo del Trabajo',
                  descripcion: 'Contratos, jornadas y terminación de la relación laboral.',
                  url: 'https://www.funcionpublica.gov.co/',
                  tipo: 'oficial', fuente: 'Función Pública', nivel: 'intermedio',
                  tags: ['CST', 'laboral'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Desarrollo del talento',
      icono: 'trending',
      temas: [
        {
          nombre: 'Capacitación',
          subtemas: [
            {
              nombre: 'Formación',
              recursos: [
                {
                  id: 'th-cap-1',
                  nombre: 'Capacitación y desarrollo',
                  descripcion: 'Planes de formación y evaluación del desempeño.',
                  url: 'https://www.shrm.org/',
                  tipo: 'documentacion', fuente: 'SHRM', nivel: 'intermedio',
                  tags: ['capacitación', 'desempeño'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- CONTABILIDAD ---------------- */
  contabilidad: [
    {
      nombre: 'Contabilidad',
      icono: 'calculator',
      temas: [
        {
          nombre: 'Contabilidad financiera',
          subtemas: [
            {
              nombre: 'Fundamentos',
              recursos: [
                {
                  id: 'con-fin-1',
                  nombre: 'Contabilidad — Conceptos',
                  descripcion: 'Ecuación contable, partida doble y estados financieros.',
                  url: 'https://www.ifrs.org/',
                  tipo: 'documentacion', fuente: 'IFRS', nivel: 'basico',
                  tags: ['contabilidad', 'finanzas'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'NIIF',
          subtemas: [
            {
              nombre: 'Estándares',
              recursos: [
                {
                  id: 'con-niif-1',
                  nombre: 'NIIF — Marco',
                  descripcion: 'Normas Internacionales de Información Financiera.',
                  url: 'https://www.ifrs.org/issued-standards/',
                  tipo: 'oficial', fuente: 'IFRS', nivel: 'intermedio',
                  tags: ['NIIF', 'contabilidad'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Tributaria',
      icono: 'scale',
      temas: [
        {
          nombre: 'Impuestos',
          subtemas: [
            {
              nombre: 'Normativa',
              recursos: [
                {
                  id: 'con-trib-1',
                  nombre: 'DIAN — Normatividad tributaria',
                  descripcion: 'Declaraciones, impuestos y régimen tributario.',
                  url: 'https://www.dian.gov.co/',
                  tipo: 'oficial', fuente: 'DIAN', nivel: 'intermedio',
                  tags: ['tributaria', 'impuestos'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Costos',
      icono: 'coins',
      temas: [
        {
          nombre: 'Contabilidad de costos',
          subtemas: [
            {
              nombre: 'Costos',
              recursos: [
                {
                  id: 'con-cos-1',
                  nombre: 'Contabilidad de costos',
                  descripcion: 'Costos directos, indirectos y sistemas de costeo.',
                  url: 'https://www.accountingcoach.com/',
                  tipo: 'curso', fuente: 'AccountingCoach', nivel: 'intermedio',
                  tags: ['costos', 'costeo'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Herramientas',
      icono: 'table',
      temas: [
        {
          nombre: 'Excel contable',
          subtemas: [
            {
              nombre: 'Fórmulas',
              recursos: [
                {
                  id: 'con-excel-1',
                  nombre: 'Excel para contabilidad',
                  descripcion: 'Fórmulas, tablas y análisis financiero.',
                  url: 'https://support.microsoft.com/es-es/excel',
                  tipo: 'guia', fuente: 'Microsoft', nivel: 'basico',
                  tags: ['excel', 'contabilidad'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- MARKETING ---------------- */
  marketing: [
    {
      nombre: 'Marketing digital',
      icono: 'megaphone',
      temas: [
        {
          nombre: 'SEO y SEM',
          subtemas: [
            {
              nombre: 'Posicionamiento',
              recursos: [
                {
                  id: 'mk-seo-1',
                  nombre: 'SEO — Guía de Google',
                  descripcion: 'Fundamentos de posicionamiento en buscadores.',
                  url: 'https://developers.google.com/search/docs',
                  tipo: 'oficial', fuente: 'Google', nivel: 'basico',
                  tags: ['SEO', 'posicionamiento'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Analítica',
          subtemas: [
            {
              nombre: 'Medición',
              recursos: [
                {
                  id: 'mk-anal-1',
                  nombre: 'Google Analytics — Documentación',
                  descripcion: 'Medición, informes y métricas de marketing.',
                  url: 'https://support.google.com/analytics/',
                  tipo: 'oficial', fuente: 'Google', nivel: 'intermedio',
                  tags: ['analítica', 'métricas'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Redes sociales',
      icono: 'share',
      temas: [
        {
          nombre: 'Gestión de contenido',
          subtemas: [
            {
              nombre: 'Redes',
              recursos: [
                {
                  id: 'mk-rs-1',
                  nombre: 'Estrategia de redes sociales',
                  descripcion: 'Contenido, pauta y comunidad en redes.',
                  url: 'https://www.hubspot.com/marketing',
                  tipo: 'guia', fuente: 'HubSpot', nivel: 'basico',
                  tags: ['redes sociales', 'contenido'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Publicidad',
      icono: 'target',
      temas: [
        {
          nombre: 'Publicidad digital',
          subtemas: [
            {
              nombre: 'Pauta',
              recursos: [
                {
                  id: 'mk-pub-1',
                  nombre: 'Google Ads — Guía',
                  descripcion: 'Campañas de publicidad pagada.',
                  url: 'https://support.google.com/google-ads/',
                  tipo: 'oficial', fuente: 'Google', nivel: 'intermedio',
                  tags: ['publicidad', 'Google Ads'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- CALIDAD ---------------- */
  calidad: [
    {
      nombre: 'Gestión de la calidad',
      icono: 'badge',
      temas: [
        {
          nombre: 'Sistemas de calidad',
          subtemas: [
            {
              nombre: 'ISO 9001',
              recursos: [
                {
                  id: 'cal-iso-1',
                  nombre: 'ISO 9001 — Sistemas de gestión de calidad',
                  descripcion: 'Requisitos y principios de la norma ISO 9001.',
                  url: 'https://www.iso.org/iso-9001-quality-management.html',
                  tipo: 'oficial', fuente: 'ISO', nivel: 'intermedio',
                  tags: ['ISO 9001', 'calidad'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Herramientas de calidad',
      icono: 'tool',
      temas: [
        {
          nombre: 'Control de procesos',
          subtemas: [
            {
              nombre: 'Mejora continua',
              recursos: [
                {
                  id: 'cal-her-1',
                  nombre: 'Herramientas de calidad',
                  descripcion: 'Diagrama de Pareto, Ishikawa y mejora continua.',
                  url: 'https://asq.org/',
                  tipo: 'documentacion', fuente: 'ASQ', nivel: 'intermedio',
                  tags: ['mejora continua', 'Pareto'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- TURISMO ---------------- */
  turismo: [
    {
      nombre: 'Turismo',
      icono: 'plane',
      temas: [
        {
          nombre: 'Destinos y servicios',
          subtemas: [
            {
              nombre: 'Operación turística',
              recursos: [
                {
                  id: 'tur-dest-1',
                  nombre: 'Operación turística',
                  descripcion: 'Destinos, paquetes y atención al viajero.',
                  url: 'https://www.unwto.org/es',
                  tipo: 'oficial', fuente: 'OMT', nivel: 'basico',
                  tags: ['turismo', 'destinos'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Hotelería',
      icono: 'bed',
      temas: [
        {
          nombre: 'Recepción y reservas',
          subtemas: [
            {
              nombre: 'Front desk',
              recursos: [
                {
                  id: 'tur-hotel-1',
                  nombre: 'Gestión hotelera — Recepción',
                  descripcion: 'Check-in, reservas y atención al huésped.',
                  url: 'https://www.hospitalitynet.org/',
                  tipo: 'documentacion', fuente: 'HospitalityNet', nivel: 'basico',
                  tags: ['hotelería', 'recepción'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Housekeeping',
          subtemas: [
            {
              nombre: 'Ama de llaves',
              recursos: [
                {
                  id: 'tur-hk-1',
                  nombre: 'Housekeeping hotelero',
                  descripcion: 'Limpieza y preparación de habitaciones.',
                  url: 'https://www.hospitalitynet.org/',
                  tipo: 'documentacion', fuente: 'HospitalityNet', nivel: 'basico',
                  tags: ['housekeeping', 'hotel'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Calidad turística',
      icono: 'star',
      temas: [
        {
          nombre: 'NTC de calidad',
          subtemas: [
            {
              nombre: 'Normas técnicas',
              recursos: [
                {
                  id: 'tur-ntc-1',
                  nombre: 'Normas de calidad turística',
                  descripcion: 'Normas técnicas sectoriales de turismo en Colombia.',
                  url: 'https://www.mincit.gov.co/',
                  tipo: 'oficial', fuente: 'MinCIT', nivel: 'intermedio',
                  tags: ['calidad', 'normas'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- SERVICIO AL CLIENTE ---------------- */
  'servicio-cliente': [
    {
      nombre: 'Servicio al cliente',
      icono: 'phone',
      temas: [
        {
          nombre: 'Atención',
          subtemas: [
            {
              nombre: 'Calidad del servicio',
              recursos: [
                {
                  id: 'cli-svc-1',
                  nombre: 'Servicio al cliente — Guía',
                  descripcion: 'Técnicas de atención y fidelización.',
                  url: 'https://www.hubspot.com/service',
                  tipo: 'guia', fuente: 'HubSpot', nivel: 'basico',
                  tags: ['servicio', 'atención'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Comunicación',
          subtemas: [
            {
              nombre: 'Comunicación efectiva',
              recursos: [
                {
                  id: 'cli-com-1',
                  nombre: 'Comunicación efectiva',
                  descripcion: 'Escucha activa, empatía y comunicación telefónica.',
                  url: 'https://www.ilo.org/es',
                  tipo: 'oficial', fuente: 'OIT', nivel: 'basico',
                  tags: ['comunicación', 'escucha'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Ventas',
      icono: 'tag',
      temas: [
        {
          nombre: 'Técnicas de venta',
          subtemas: [
            {
              nombre: 'Negociación',
              recursos: [
                {
                  id: 'cli-vent-1',
                  nombre: 'Técnicas de venta',
                  descripcion: 'Cierre de ventas y negociación.',
                  url: 'https://www.retailcustomerexperience.com/',
                  tipo: 'guia', fuente: 'Referencia', nivel: 'basico',
                  tags: ['ventas', 'negociación'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'CRM y PQRS',
      icono: 'users',
      temas: [
        {
          nombre: 'CRM',
          subtemas: [
            {
              nombre: 'Gestión de clientes',
              recursos: [
                {
                  id: 'cli-crm-1',
                  nombre: 'CRM — Conceptos',
                  descripcion: 'Uso de CRM en atención y seguimiento.',
                  url: 'https://www.salesforce.com/es/crm/',
                  tipo: 'guia', fuente: 'Salesforce', nivel: 'basico',
                  tags: ['CRM', 'clientes'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'PQRS',
          subtemas: [
            {
              nombre: 'Gestión de PQRS',
              recursos: [
                {
                  id: 'cli-pqrs-1',
                  nombre: 'Manejo de PQRS',
                  descripcion: 'Peticiones, quejas, reclamos y seguimiento.',
                  url: 'https://www.sic.gov.co/',
                  tipo: 'oficial', fuente: 'SIC', nivel: 'basico',
                  tags: ['PQRS', 'quejas'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- SST ---------------- */
  sst: [
    {
      nombre: 'Riesgos laborales',
      icono: 'shield',
      temas: [
        {
          nombre: 'Identificación de peligros',
          subtemas: [
            {
              nombre: 'Matriz de riesgos',
              recursos: [
                {
                  id: 'sst-matriz-1',
                  nombre: 'Matriz de riesgos laborales',
                  descripcion: 'Identificación, valoración y control de riesgos.',
                  url: 'https://www.osha.gov/',
                  tipo: 'oficial', fuente: 'OSHA', nivel: 'intermedio',
                  tags: ['riesgos', 'matriz'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Normativa SST',
      icono: 'scale',
      temas: [
        {
          nombre: 'Decreto 1072',
          subtemas: [
            {
              nombre: 'SG-SST',
              recursos: [
                {
                  id: 'sst-decreto-1',
                  nombre: 'Decreto 1072 — Sistema de Gestión SST',
                  descripcion: 'Reglamentación del SG-SST en Colombia.',
                  url: 'https://www.mintrabajo.gov.co/',
                  tipo: 'oficial', fuente: 'MinTrabajo', nivel: 'intermedio',
                  tags: ['SG-SST', 'Decreto 1072'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Prevención',
      icono: 'hard-hat',
      temas: [
        {
          nombre: 'EPP',
          subtemas: [
            {
              nombre: 'Elementos de protección',
              recursos: [
                {
                  id: 'sst-epp-1',
                  nombre: 'Elementos de protección personal',
                  descripcion: 'Selección y uso de EPP según el riesgo.',
                  url: 'https://www.osha.gov/',
                  tipo: 'oficial', fuente: 'OSHA', nivel: 'basico',
                  tags: ['EPP', 'prevención'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- AMBIENTAL ---------------- */
  ambiental: [
    {
      nombre: 'Gestión ambiental',
      icono: 'leaf',
      temas: [
        {
          nombre: 'ISO 14001',
          subtemas: [
            {
              nombre: 'Sistemas de gestión ambiental',
              recursos: [
                {
                  id: 'amb-iso-1',
                  nombre: 'ISO 14001 — Gestión ambiental',
                  descripcion: 'Requisitos del sistema de gestión ambiental.',
                  url: 'https://www.iso.org/iso-14001-environmental-management.html',
                  tipo: 'oficial', fuente: 'ISO', nivel: 'intermedio',
                  tags: ['ISO 14001', 'ambiental'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Residuos',
      icono: 'recycle',
      temas: [
        {
          nombre: 'Manejo de residuos',
          subtemas: [
            {
              nombre: 'Clasificación',
              recursos: [
                {
                  id: 'amb-res-1',
                  nombre: 'Gestión de residuos sólidos',
                  descripcion: 'Clasificación, aprovechamiento y disposición final.',
                  url: 'https://www.epa.gov/',
                  tipo: 'oficial', fuente: 'EPA', nivel: 'basico',
                  tags: ['residuos', 'reciclaje'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Impacto ambiental',
      icono: 'globe',
      temas: [
        {
          nombre: 'Estudios de impacto',
          subtemas: [
            {
              nombre: 'Evaluación',
              recursos: [
                {
                  id: 'amb-impact-1',
                  nombre: 'Evaluación de impacto ambiental',
                  descripcion: 'Metodologías de evaluación de impacto.',
                  url: 'https://www.unece.org/',
                  tipo: 'documentacion', fuente: 'UNECE', nivel: 'intermedio',
                  tags: ['impacto ambiental', 'evaluación'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- AGRO ---------------- */
  agro: [
    {
      nombre: 'Producción agrícola',
      icono: 'wheat',
      temas: [
        {
          nombre: 'Cultivos',
          subtemas: [
            {
              nombre: 'Manejo',
              recursos: [
                {
                  id: 'agro-cult-1',
                  nombre: 'Manejo de cultivos',
                  descripcion: 'Siembra, fertilización y control fitosanitario.',
                  url: 'https://www.fao.org/',
                  tipo: 'oficial', fuente: 'FAO', nivel: 'basico',
                  tags: ['cultivos', 'agricultura'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Producción pecuaria',
      icono: 'cow',
      temas: [
        {
          nombre: 'Ganadería',
          subtemas: [
            {
              nombre: 'Manejo',
              recursos: [
                {
                  id: 'agro-pec-1',
                  nombre: 'Producción pecuaria',
                  descripcion: 'Manejo de ganado, alimentación y sanidad.',
                  url: 'https://www.fao.org/',
                  tipo: 'oficial', fuente: 'FAO', nivel: 'basico',
                  tags: ['ganadería', 'pecuario'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Buenas prácticas',
      icono: 'leaf',
      temas: [
        {
          nombre: 'BPA',
          subtemas: [
            {
              nombre: 'Buenas prácticas agrícolas',
              recursos: [
                {
                  id: 'agro-bpa-1',
                  nombre: 'Buenas prácticas agrícolas',
                  descripcion: 'BPA en la producción de alimentos.',
                  url: 'https://www.fao.org/',
                  tipo: 'oficial', fuente: 'FAO', nivel: 'basico',
                  tags: ['BPA', 'agricultura'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- MODA ---------------- */
  moda: [
    {
      nombre: 'Diseño de moda',
      icono: 'scissors',
      temas: [
        {
          nombre: 'Diseño',
          subtemas: [
            {
              nombre: 'Ilustración de moda',
              recursos: [
                {
                  id: 'moda-dis-1',
                  nombre: 'Ilustración de moda',
                  descripcion: 'Figurines, croquis y técnica de dibujo.',
                  url: 'https://fashion-history.lovetoknow.com/',
                  tipo: 'guia', fuente: 'Referencia', nivel: 'basico',
                  tags: ['diseño', 'moda'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Confección',
      icono: 'needle',
      temas: [
        {
          nombre: 'Patronaje',
          subtemas: [
            {
              nombre: 'Patrones',
              recursos: [
                {
                  id: 'moda-pat-1',
                  nombre: 'Patronaje y confección',
                  descripcion: 'Trazado de patrones y técnicas de costura.',
                  url: 'https://www.sewguide.org/',
                  tipo: 'guia', fuente: 'SewGuide', nivel: 'basico',
                  tags: ['patronaje', 'confección'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Telas',
          subtemas: [
            {
              nombre: 'Textiles',
              recursos: [
                {
                  id: 'moda-telas-1',
                  nombre: 'Tipos de telas',
                  descripcion: 'Fibras textiles y su uso en confección.',
                  url: 'https://www.textileschool.com/',
                  tipo: 'documentacion', fuente: 'Textile School', nivel: 'basico',
                  tags: ['telas', 'textiles'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Producción',
      icono: 'factory',
      temas: [
        {
          nombre: 'Procesos',
          subtemas: [
            {
              nombre: 'Producción de prendas',
              recursos: [
                {
                  id: 'moda-prod-1',
                  nombre: 'Producción de prendas de vestir',
                  descripcion: 'Procesos industriales de confección.',
                  url: 'https://www.fibre2fashion.com/',
                  tipo: 'documentacion', fuente: 'Fibre2Fashion', nivel: 'intermedio',
                  tags: ['producción', 'confección'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- DISEÑO ---------------- */
  diseno: [
    {
      nombre: 'Fundamentos del diseño',
      icono: 'pen',
      temas: [
        {
          nombre: 'Composición',
          subtemas: [
            {
              nombre: 'Teoría del color',
              recursos: [
                {
                  id: 'dis-color-1',
                  nombre: 'Teoría del color',
                  descripcion: 'Psicología del color y armonías cromáticas.',
                  url: 'https://www.canva.com/colors/color-wheel/',
                  tipo: 'herramienta', fuente: 'Canva', nivel: 'basico',
                  tags: ['color', 'diseño'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Tipografía',
          subtemas: [
            {
              nombre: 'Tipografía',
              recursos: [
                {
                  id: 'dis-tipo-1',
                  nombre: 'Tipografía — Fundamentos',
                  descripcion: 'Clasificación tipográfica y jerarquía visual.',
                  url: 'https://fonts.google.com/',
                  tipo: 'herramienta', fuente: 'Google Fonts', nivel: 'basico',
                  tags: ['tipografía', 'fuentes'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Herramientas',
      icono: 'palette',
      temas: [
        {
          nombre: 'Adobe',
          subtemas: [
            {
              nombre: 'Photoshop e Illustrator',
              recursos: [
                {
                  id: 'dis-adobe-1',
                  nombre: 'Tutoriales de Adobe',
                  descripcion: 'Guías oficiales de Photoshop e Illustrator.',
                  url: 'https://helpx.adobe.com/es/',
                  tipo: 'oficial', fuente: 'Adobe', nivel: 'basico',
                  tags: ['Photoshop', 'Illustrator'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Identidad de marca',
      icono: 'star',
      temas: [
        {
          nombre: 'Branding',
          subtemas: [
            {
              nombre: 'Creación de marca',
              recursos: [
                {
                  id: 'dis-brand-1',
                  nombre: 'Diseño de identidad de marca',
                  descripcion: 'Logotipos, manual de marca y aplicaciones.',
                  url: 'https://www.creativebloq.com/',
                  tipo: 'documentacion', fuente: 'Creative Bloq', nivel: 'intermedio',
                  tags: ['branding', 'identidad'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- MULTIMEDIA ---------------- */
  multimedia: [
    {
      nombre: 'Producción audiovisual',
      icono: 'video',
      temas: [
        {
          nombre: 'Edición',
          subtemas: [
            {
              nombre: 'Video',
              recursos: [
                {
                  id: 'mm-video-1',
                  nombre: 'Edición de video',
                  descripcion: 'Edición, montaje y postproducción.',
                  url: 'https://helpx.adobe.com/es/premiere-pro/',
                  tipo: 'oficial', fuente: 'Adobe', nivel: 'basico',
                  tags: ['video', 'edición'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Animación',
      icono: 'film',
      temas: [
        {
          nombre: 'Animación 2D y 3D',
          subtemas: [
            {
              nombre: 'Animación',
              recursos: [
                {
                  id: 'mm-anim-1',
                  nombre: 'Principios de animación',
                  descripcion: 'Los 12 principios de animación.',
                  url: 'https://www.blender.org/',
                  tipo: 'herramienta', fuente: 'Blender', nivel: 'basico',
                  tags: ['animación', '3D'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Audio',
      icono: 'music',
      temas: [
        {
          nombre: 'Producción de audio',
          subtemas: [
            {
              nombre: 'Audio',
              recursos: [
                {
                  id: 'mm-audio-1',
                  nombre: 'Producción de audio',
                  descripcion: 'Grabación, mezcla y masterización.',
                  url: 'https://www.audacityteam.org/',
                  tipo: 'herramienta', fuente: 'Audacity', nivel: 'basico',
                  tags: ['audio', 'producción'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- SALUD ---------------- */
  salud: [
    {
      nombre: 'Fundamentos de salud',
      icono: 'heart',
      temas: [
        {
          nombre: 'Anatomía y fisiología',
          subtemas: [
            {
              nombre: 'Sistemas del cuerpo',
              recursos: [
                {
                  id: 'sal-anat-1',
                  nombre: 'Anatomía y fisiología',
                  descripcion: 'Estructura y función de los sistemas del cuerpo humano.',
                  url: 'https://www.msdmanuals.com/es/professional',
                  tipo: 'documentacion', fuente: 'MSD Manuals', nivel: 'basico',
                  tags: ['anatomía', 'fisiología'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Signos vitales',
          subtemas: [
            {
              nombre: 'Medición',
              recursos: [
                {
                  id: 'sal-signos-1',
                  nombre: 'Signos vitales — Guía',
                  descripcion: 'Técnica de medición de presión, pulso, temperatura y respiración.',
                  url: 'https://medlineplus.gov/spanish/vitalsigns.html',
                  tipo: 'documentacion', fuente: 'MedlinePlus', nivel: 'basico',
                  tags: ['signos vitales'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Bioseguridad',
      icono: 'shield',
      temas: [
        {
          nombre: 'Precauciones',
          subtemas: [
            {
              nombre: 'Asepsia',
              recursos: [
                {
                  id: 'sal-bio-1',
                  nombre: 'Bioseguridad y precauciones estándar',
                  descripcion: 'Lavado de manos, asepsia y manejo de elementos.',
                  url: 'https://www.paho.org/es',
                  tipo: 'oficial', fuente: 'OPS', nivel: 'basico',
                  tags: ['bioseguridad', 'asepsia'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Cuidado del paciente',
      icono: 'user',
      temas: [
        {
          nombre: 'Procedimientos',
          subtemas: [
            {
              nombre: 'Cuidados',
              recursos: [
                {
                  id: 'sal-cuid-1',
                  nombre: 'Cuidado del paciente',
                  descripcion: 'Movilización, higiene y confort del paciente.',
                  url: 'https://www.msdmanuals.com/es/hogar',
                  tipo: 'documentacion', fuente: 'MSD Manuals', nivel: 'intermedio',
                  tags: ['cuidado', 'paciente'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Farmacología',
          subtemas: [
            {
              nombre: 'Medicamentos',
              recursos: [
                {
                  id: 'sal-farma-1',
                  nombre: 'Farmacología — Administración segura',
                  descripcion: 'Vías de administración y seguridad del paciente.',
                  url: 'https://medlineplus.gov/spanish/druginfo.html',
                  tipo: 'documentacion', fuente: 'MedlinePlus', nivel: 'intermedio',
                  tags: ['farmacología', 'medicamentos'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- BELLEZA ---------------- */
  belleza: [
    {
      nombre: 'Estética',
      icono: 'sparkles',
      temas: [
        {
          nombre: 'Cuidado de la piel',
          subtemas: [
            {
              nombre: 'Facial',
              recursos: [
                {
                  id: 'belle-piel-1',
                  nombre: 'Cuidado facial profesional',
                  descripcion: 'Tipos de piel y tratamientos faciales.',
                  url: 'https://www.epa.gov/',
                  tipo: 'guia', fuente: 'Referencia', nivel: 'basico',
                  tags: ['estética', 'piel'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Bioseguridad',
      icono: 'shield',
      temas: [
        {
          nombre: 'Normas sanitarias',
          subtemas: [
            {
              nombre: 'Esterilización',
              recursos: [
                {
                  id: 'belle-bio-1',
                  nombre: 'Bioseguridad en estética',
                  descripcion: 'Esterilización de equipos y normas sanitarias.',
                  url: 'https://www.minsalud.gov.co/',
                  tipo: 'oficial', fuente: 'MinSalud', nivel: 'basico',
                  tags: ['bioseguridad', 'esterilización'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- GASTRONOMÍA ---------------- */
  gastronomia: [
    {
      nombre: 'Técnicas culinarias',
      icono: 'chef',
      temas: [
        {
          nombre: 'Mise en place',
          subtemas: [
            {
              nombre: 'Organización',
              recursos: [
                {
                  id: 'gas-mise-1',
                  nombre: 'Mise en place profesional',
                  descripcion: 'Preparación y organización del puesto de trabajo.',
                  url: 'https://www.finedininglovers.es/articulo/mise-en-place/',
                  tipo: 'guia', fuente: 'Fine Dining Lovers', nivel: 'basico',
                  tags: ['mise en place', 'cocina'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Cortes y técnicas',
          subtemas: [
            {
              nombre: 'Cortes',
              recursos: [
                {
                  id: 'gas-cortes-1',
                  nombre: 'Cortes clásicos',
                  descripcion: 'Brunoise, juliana, chiffonade y otros cortes.',
                  url: 'https://www.seriouseats.com/',
                  tipo: 'guia', fuente: 'Serious Eats', nivel: 'basico',
                  tags: ['cortes', 'técnicas'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Seguridad alimentaria',
      icono: 'shield',
      temas: [
        {
          nombre: 'Manipulación de alimentos',
          subtemas: [
            {
              nombre: 'BPM',
              recursos: [
                {
                  id: 'gas-bpm-1',
                  nombre: 'Buenas Prácticas de Manufactura',
                  descripcion: 'BPM en la manipulación de alimentos.',
                  url: 'https://www.invima.gov.co/',
                  tipo: 'oficial', fuente: 'INVIMA', nivel: 'basico',
                  tags: ['BPM', 'manipulación'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'HACCP',
          subtemas: [
            {
              nombre: 'Análisis de peligros',
              recursos: [
                {
                  id: 'gas-haccp-1',
                  nombre: 'HACCP — Análisis de peligros',
                  descripcion: 'Principios del sistema HACCP.',
                  url: 'https://www.fao.org/',
                  tipo: 'oficial', fuente: 'FAO', nivel: 'intermedio',
                  tags: ['HACCP', 'inocuidad'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Panadería y repostería',
      icono: 'cake',
      temas: [
        {
          nombre: 'Masas',
          subtemas: [
            {
              nombre: 'Masas básicas',
              recursos: [
                {
                  id: 'gas-masas-1',
                  nombre: 'Masas y leudado',
                  descripcion: 'Tipos de masas y técnicas de panadería.',
                  url: 'https://www.kingarthurbaking.com/',
                  tipo: 'guia', fuente: 'King Arthur Baking', nivel: 'basico',
                  tags: ['masas', 'panadería'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  /* ---------------- CONSTRUCCIÓN ---------------- */
  construccion: [
    {
      nombre: 'Construcción',
      icono: 'hammer',
      temas: [
        {
          nombre: 'Materiales',
          subtemas: [
            {
              nombre: 'Materiales de obra',
              recursos: [
                {
                  id: 'constr-mat-1',
                  nombre: 'Materiales de construcción',
                  descripcion: 'Concreto, acero, mampostería y acabados.',
                  url: 'https://www.cement.org/',
                  tipo: 'documentacion', fuente: 'ACI', nivel: 'basico',
                  tags: ['materiales', 'construcción'],
                },
              ],
            },
          ],
        },
        {
          nombre: 'Procesos',
          subtemas: [
            {
              nombre: 'Obra',
              recursos: [
                {
                  id: 'constr-proc-1',
                  nombre: 'Procesos de construcción',
                  descripcion: 'Cimentación, estructura y acabados.',
                  url: 'https://www.constructive.co/',
                  tipo: 'documentacion', fuente: 'Referencia', nivel: 'basico',
                  tags: ['obra', 'procesos'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Normativa',
      icono: 'scale',
      temas: [
        {
          nombre: 'NSR-10',
          subtemas: [
            {
              nombre: 'Reglamento sísmico',
              recursos: [
                {
                  id: 'constr-nsr-1',
                  nombre: 'NSR-10 — Reglamento de construcción',
                  descripcion: 'Reglamento Colombiano de Construcción Sismo Resistente.',
                  url: 'https://www.minvivienda.gov.co/',
                  tipo: 'oficial', fuente: 'MinVivienda', nivel: 'intermedio',
                  tags: ['NSR-10', 'normativa'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Planos y topografía',
      icono: 'compass',
      temas: [
        {
          nombre: 'Lectura de planos',
          subtemas: [
            {
              nombre: 'Planos',
              recursos: [
                {
                  id: 'constr-planos-1',
                  nombre: 'Lectura de planos',
                  descripcion: 'Interpretación de planos arquitectónicos y estructurales.',
                  url: 'https://www.autodesk.com/',
                  tipo: 'documentacion', fuente: 'Autodesk', nivel: 'basico',
                  tags: ['planos', 'diseño'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/* ============================================================
   MOTOR: RESOLUCIÓN DE BIBLIOTECA POR DOMINIO
   ============================================================ */

export function resolverBiblioteca(dominio: string | undefined | null): BibliotecaResuelta | null {
  if (!dominio) return null;
  const areas = DOMINIOS[dominio];
  if (!areas) return null;

  const recursos: RecursoPlano[] = [];
  const areasConRecursos: AreaAcademica[] = [];

  for (const area of areas) {
    const temasConRecursos = area.temas
      .map((tema) => ({
        ...tema,
        subtemas: tema.subtemas.filter((st) => st.recursos.length > 0),
      }))
      .filter((t) => t.subtemas.length > 0);
    if (temasConRecursos.length === 0) continue;
    areasConRecursos.push({ ...area, temas: temasConRecursos });
    for (const tema of temasConRecursos) {
      for (const st of tema.subtemas) {
        for (const r of st.recursos) {
          recursos.push({ ...r, area: area.nombre, tema: tema.nombre, subtema: st.nombre });
        }
      }
    }
  }

  return {
    dominio,
    areas: areasConRecursos,
    totalRecursos: recursos.length,
    recursos,
    categorias: areasConRecursos.map((a) => a.nombre),
  };
}

/* ============================================================
   BÚSQUEDA Y FILTROS (solo dentro del dominio actual)
   ============================================================ */

export function filtrarRecursos(
  recursos: RecursoPlano[],
  { query, categoria }: { query: string; categoria: string },
): RecursoPlano[] {
  const q = query.trim().toLowerCase();
  return recursos.filter((r) => {
    if (categoria !== 'todos' && r.area !== categoria) return false;
    if (!q) return true;
    return (
      r.nombre.toLowerCase().includes(q) ||
      r.descripcion.toLowerCase().includes(q) ||
      r.tema.toLowerCase().includes(q) ||
      r.subtema.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}