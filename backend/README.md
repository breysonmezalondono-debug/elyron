# Elyron API - Backend

Backend de la plataforma acadÃ©mica **Elyron** (mÃ³dulo SENA) construido con NestJS 11, TypeORM y MySQL. Gestiona fichas, competencias, resultados de aprendizaje, evidencias, comunidad, bolsa de empleo, chat en tiempo real, calendario, videollamadas y asistente educativo con IA.

## Stack

- **NestJS 11** + TypeScript
- **MySQL 8** con TypeORM (sincronizaciÃ³n automÃ¡tica en desarrollo, charset utf8mb4)
- **JWT** (access + refresh) con Passport
- **Socket.IO** para chat, notificaciones y seÃ±alizaciÃ³n de llamadas
- **Multer** para carga de archivos

## Puesta en marcha

### Requisitos

- Node.js 20+
- MySQL 8 corriendo (o Docker)

### OpciÃ³n A: local

```bash
npm install
cp .env.example .env          # ajustar credenciales
npm run seed                  # roles SENA + permisos + usuario admin
npm run start:dev
```

> El seed y la API crean las tablas automÃ¡ticamente (`synchronize`), pero la base de datos debe existir antes: crÃ©ala con `CREATE DATABASE elyron_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` o usa la opciÃ³n Docker.

### OpciÃ³n B: Docker (MySQL + API)

```bash
cp .env.example .env          # ajustar credenciales
docker compose up --build -d
```

El seed se ejecuta aparte contra la base expuesta en `localhost:3306`:

```bash
npm run seed
```

### Credenciales iniciales del admin

Las define el seed a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` (por defecto `admin@elyron.com` / `Admin123*`). El registro pÃºblico siempre asigna el rol **aprendiz**; los roles privilegiados se otorgan desde el panel admin.

## Variables de entorno

Ver `.env.example`. Las relevantes:

| Variable | DescripciÃ³n |
|---|---|
| `DB_*` | ConexiÃ³n MySQL (puerto 3306) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Firmas de tokens |
| `PORT` | Puerto HTTP (3000) |
| `NODE_ENV` | En `production` desactiva `synchronize` de TypeORM |
| `FRONTEND_URL` | Origen permitido por CORS |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credenciales del seed |
| `UPLOAD_DIR`, `MAX_FILE_SIZE` | Carpeta de uploads y lÃ­mite por archivo en bytes (default 50 MB) |
| `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`, `AI_MAX_TOKENS` | Proveedor de IA compatible con OpenAI |

## Arquitectura

```
src/
â”œâ”€â”€ common/            # BaseEntity, guards (Roles), decorators (Roles, Permissions, CurrentUser), DTOs compartidos
â”œâ”€â”€ config/
â”œâ”€â”€ database/seed.ts   # Seed idempotente: roles SENA, permisos modulo.accion, admin
â””â”€â”€ modules/           # Un mÃ³dulo por dominio (controller + service + entities + dto)
```

Roles del sistema: `aprendiz`, `instructor`, `coordinador`, `administrador` (`src/common/constants/roles.ts`).

## Contratos API

Prefijo global: `/api`. AutenticaciÃ³n: `Authorization: Bearer <accessToken>` salvo endpoints marcados como pÃºblicos.

### Auth (`/api/auth`) - pÃºblico

| MÃ©todo | Ruta | DescripciÃ³n |
|---|---|---|
| POST | `/login` | `{ email, password }` â†’ `{ user, accessToken, refreshToken }` |
| POST | `/register` | Registro pÃºblico deshabilitado; las cuentas las crea la administraciÃ³n |
| POST | `/refresh` | `{ refreshToken }` â†’ nuevos tokens |
| GET | `/me` | Usuario autenticado |

### Usuarios / Roles / Permisos

CRUD completo en `/api/users`, `/api/roles`, `/api/permissions`. Roles y permissions requieren rol `administrador`.

### Estructura acadÃ©mica

| Recurso | Endpoints destacados |
|---|---|
| `/api/companies` | CRUD |
| `/api/fichas` | CRUD, listado paginado |
| `/api/competencias` | CRUD, `GET ?fichaId` vÃ­a `/ficha/:fichaId` |
| `/api/resultados` | CRUD, `GET /competencia/:competenciaId` |
| `/api/evidencias` | CRUD + filtros: `GET ?page=&limit=&resultadoId=<uuid>&status=pending\|approved\|rejected`. POST valida que el resultado exista; PUT valida transiciones `pending â†’ approved/rejected` (no se puede volver a `pending`) y registra `reviewedAt` automÃ¡ticamente |

### Comunidad (`/api/community`)

| MÃ©todo | Ruta | Auth | DescripciÃ³n |
|---|---|---|---|
| GET | `/` | pÃºblico | Feed paginado (solo visibles) |
| GET | `/user/:authorId` | pÃºblico | Publicaciones por autor |
| GET | `/:id` | pÃºblico | Detalle |
| POST | `/` | JWT | Crear publicaciÃ³n |
| POST | `/:id/like` | JWT | Toggle like por usuario â†’ `{ liked, likesCount }` |
| PUT / DELETE | `/:id` | JWT | Editar / eliminar |

### Chat

REST bajo JWT: `GET /api/chat/conversation/:userId?page=&limit=` (historial paginado, orden ascendente), `GET /api/chat/unread` (no leÃ­dos agrupados por remitente), `PUT /api/chat/read/:senderId`. EnvÃ­o, typing y recepciÃ³n en tiempo real por Socket.IO (gateway `chat`).

### Archivos (`/api/files`) - JWT

| MÃ©todo | Ruta | DescripciÃ³n |
|---|---|---|
| POST | `/upload` | multipart `file` + `folder` opcional â†’ `{ url, filename }` |
| POST | `/upload-multiple` | hasta 10 archivos |
| DELETE | `/:filename` | Elimina (folder por body) |

Los archivos se sirven estÃ¡ticamente en `/uploads`. Nombres regenerados con UUID, carpetas validadas contra path traversal y lÃ­mite por archivo configurable (`MAX_FILE_SIZE`).

### IA (`/api/ai`) - JWT

| MÃ©todo | Ruta | Body | DescripciÃ³n |
|---|---|---|---|
| POST | `/chat` | `{ prompt, context? }` | Asistente educativo (no hace tareas completas) |
| POST | `/generate` | `{ topic, type }` | Genera contenido estructurado |

Tipos soportados: `resumen`, `explicacion`, `cuestionario`, `guia`, `examen`, `plan_clase`, `recomendacion`. Errores del proveedor se propagan con detalle (HTTP 502) e incluye reintento automÃ¡tico ante fallos transitorios (429/5xx/red).

### Otros

- `/api/notifications`: listado, unread-count, marcar leÃ­das; crear requiere administrador.
- `/api/calendar`, `/api/calls`, `/api/job-board`: CRUD.
- `GET /api/health`: estado del servicio (pÃºblico).
- WebSocket Socket.IO en la raÃ­z para chat/notificaciones/llamadas.

## Scripts

```bash
npm run build       # compilar a dist/
npm run seed        # seed idempotente
npm run lint        # eslint + prettier
npm run test        # jest unitarios
```
