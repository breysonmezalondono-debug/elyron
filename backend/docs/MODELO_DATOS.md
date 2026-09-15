# Modelo de datos - Elyron (MySQL 8)

El modelado estÃ¡ definido por las entidades TypeORM en `src/modules/**/entities` y `src/common/base.entity.ts`. En desarrollo (`NODE_ENV != production`) TypeORM crea y actualiza las tablas automÃ¡ticamente con `synchronize: true`; no hace falta escribir DDL a mano.

Todas las tablas heredan de `BaseEntity`:

| Columna | Tipo MySQL | DescripciÃ³n |
|---|---|---|
| `id` | `char(36)` PK | UUID generado por la aplicaciÃ³n |
| `createdAt` | `datetime(6)` | Fecha de creaciÃ³n |
| `updatedAt` | `datetime(6)` | Ãšltima actualizaciÃ³n |

Charset de conexiÃ³n: `utf8mb4` (soporta emojis y acentos), zona horaria UTC (`timezone: 'Z'`).

## Diagrama entidad-relaciÃ³n

```mermaid
erDiagram
    ROLES ||--o{ USERS : "tiene"
    COMPANIES ||--o{ USERS : "emplea"
    COMPANIES ||--o{ FICHAS : "patrocina"
    ROLES }o--o{ PERMISSIONS : "role_permissions"
    COMPANIES }o--o{ USERS : "company_trainers"
    FICHAS ||--o{ COMPETENCIAS : "agrupa"
    COMPETENCIAS ||--o{ RESULTADOS : "define"
    RESULTADOS ||--o{ EVIDENCIAS : "demuestra"
    USERS ||--o{ EVIDENCIAS : "submite"
    USERS ||--o{ COMMUNITY_POSTS : "autor"
    COMMUNITY_POSTS |o--o{ COMMUNITY_POSTS : "parentId respuestas"
    COMMUNITY_POSTS ||--o{ POST_LIKES : "recibe"
    USERS ||--o{ POST_LIKES : "da"
    USERS ||--o{ CHAT_MESSAGES_SENDER : "envia"
    USERS ||--o{ CHAT_MESSAGES_RECEIVER : "recibe"
    USERS ||--o{ NOTIFICATIONS : "destinatario"
    USERS ||--o{ CALENDAR_EVENTS : "creador"
    USERS ||--o{ JOB_LISTINGS : "publica"
    USERS ||--o{ CALLS : "convoca"

    ROLES {
        char_36 id PK
        varchar_255 name UK
        varchar_255 description
    }
    PERMISSIONS {
        char_36 id PK
        varchar_255 name UK "modulo.accion"
        varchar_255 module
        varchar_255 action
    }
    USERS {
        char_36 id PK
        varchar_255 email UK
        varchar_255 password "bcrypt, select:false"
        varchar_255 firstName
        varchar_255 lastName
        varchar_255 phone
        varchar_255 avatar
        boolean isActive
        boolean isEmailVerified
        char_36 roleId FK
        char_36 companyId FK
        varchar_255 refreshToken
    }
    COMPANIES {
        char_36 id PK
        varchar_255 name
        varchar_255 nit
        varchar_255 address
        varchar_255 phone
        varchar_255 email
        varchar_255 logo
        varchar_255 website
        boolean isActive
    }
    FICHAS {
        char_36 id PK
        varchar_255 code
        varchar_255 name
        varchar_255 description
        datetime_6 startDate
        datetime_6 endDate
        varchar_255 status "active"
        char_36 companyId FK
    }
    COMPETENCIAS {
        char_36 id PK
        varchar_255 name
        varchar_255 description
        int weight "promedio ponderado"
        char_36 fichaId FK
    }
    RESULTADOS {
        char_36 id PK
        varchar_255 name
        varchar_255 description
        char_36 competenciaId FK
    }
    EVIDENCIAS {
        char_36 id PK
        varchar_255 title
        varchar_255 description
        varchar_255 status "pending|approved|rejected"
        json files
        char_36 resultadoId FK
        char_36 submittedById FK
        datetime_6 reviewedAt
        varchar_255 feedback
    }
    COMMUNITY_POSTS {
        char_36 id PK
        text content
        json images
        int likesCount
        int commentsCount
        char_36 authorId FK
        char_36 parentId FK "comentarios en hilo"
        boolean isVisible
    }
    POST_LIKES {
        char_36 id PK
        char_36 postId FK
        char_36 userId FK
    }
    CHAT_MESSAGES {
        char_36 id PK
        text content
        char_36 senderId FK
        char_36 receiverId FK
        boolean isRead
        varchar_255 roomId
    }
    NOTIFICATIONS {
        char_36 id PK
        varchar_255 title
        text message
        varchar_255 type "info|warning|success|error"
        boolean isRead
        char_36 userId FK
        varchar_255 link
    }
    CALENDAR_EVENTS {
        char_36 id PK
        varchar_255 title
        varchar_255 description
        datetime_6 startDate
        datetime_6 endDate
        boolean allDay
        varchar_255 color
        char_36 createdById FK
        varchar_255 type
        json attendees
    }
    JOB_LISTINGS {
        char_36 id PK
        varchar_255 title
        text description
        varchar_255 company
        varchar_255 location
        varchar_255 salary
        varchar_255 status
        datetime_6 expiresAt
        json requirements
        char_36 postedById FK
        int applicationsCount
    }
    CALLS {
        char_36 id PK
        varchar_255 title
        text description
        datetime_6 startDate
        datetime_6 endDate
        varchar_255 status "open|closed|expired"
        json requirements
        int maxParticipants
        char_36 createdById FK
        int applicationsCount
    }
```

## JerarquÃ­a acadÃ©mica (nÃºcleo del SENA)

```
COMPANIES â”€â”€< FICHAS â”€â”€< COMPETENCIAS â”€â”€< RESULTADOS â”€â”€< EVIDENCIAS >â”€â”€ USERS
```

Cada nivel es un `ManyToOne` con columna FK explÃ­cita (`fichaId`, `competenciaId`, `resultadoId`), lo que permite los filtros por query param que ya expone la API.

## Tablas de uniÃ³n generadas automÃ¡ticamente

| Tabla | Origen | Columnas |
|---|---|---|
| `role_permissions` | `@ManyToMany` Roleâ†”Permission | `roleId`, `permissionId` |
| `company_trainers` | `@ManyToMany` Companyâ†”User | `companyId`, `trainerId` |

## Restricciones clave

- `users.email` y `roles.name`: Ãºnicos.
- `permissions.name`: Ãºnico (formato `modulo.accion`, ej. `evidencias.approve`).
- `post_likes`: constraint Ãºnico `(postId, userId)` â€” garantiza un like por usuario.
- FKs como `char(36)` sin constraint fÃ­sico duro en algunos casos: las relaciones se validan en servicio (ej. evidencia valida que el resultado exista antes de guardar).
- Estados como `varchar` con default: `fichas.status='active'`, `evidencias.status='pending'`, `calls.status='open'`, `job_listings.status='active'`. La transiciÃ³n de evidencias se valida en `EvidenciasService.update`.

## Puesta en marcha contra tu MySQL local

Ejecuta una sola vez como root (Workbench o `mysql -u root -p`):

```sql
CREATE DATABASE IF NOT EXISTS elyron_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'elyron'@'localhost' IDENTIFIED BY 'elyron123';
CREATE USER IF NOT EXISTS 'elyron'@'%' IDENTIFIED BY 'elyron123';
GRANT ALL PRIVILEGES ON elyron_db.* TO 'elyron'@'localhost';
GRANT ALL PRIVILEGES ON elyron_db.* TO 'elyron'@'%';
FLUSH PRIVILEGES;
```

DespuÃ©s:

```bash
npm run seed     # roles SENA + permisos modulo.accion + admin
npm run start:dev
```

Las tablas se crean solas al arrancar. Para ver el diagrama renderizado pega el bloque mermaid de arriba en https://mermaid.live o en un README de GitHub/Notion.
