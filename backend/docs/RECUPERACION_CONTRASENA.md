# Recuperación de contraseña por correo · Elyron

Flujo completo y seguro de restablecimiento de contraseña (frontend + backend +
base de datos + envío real de correo).

## Flujo

```
Login → ¿Olvidaste tu contraseña? → /forgot-password
  → ingresa correo → POST /api/auth/forgot-password
  → se genera token criptográfico (256 bits) → se guarda su HASH en BD
  → se envía correo real con enlace → /reset-password?token=TOKEN
  → GET /api/auth/reset-password/validate?token=TOKEN  (valida token)
  → el usuario elige nueva contraseña → POST /api/auth/reset-password
  → se hashea la nueva contraseña, se invalida el token y las sesiones
  → volver al login
```

## Endpoints (backend, prefijo `/api`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/forgot-password` | Solicita recuperación. Respuesta SIEMPRE genérica (anti-enumeración). |
| GET | `/auth/reset-password/validate?token=…` | Valida un token (existente, activo, no usado, no expirado, usuario existe). |
| POST | `/auth/reset-password` | Cambia la contraseña con token válido. |

Rate limiting (guard `ThrottleGuard` en memoria por IP):
- forgot-password: **3 solicitudes / 15 min por IP**.
- validate: **20 / 15 min**.
- reset-password: **5 / 15 min**.
- Además, el servicio limita **3 solicitudes por correo / 15 min** (anti spam).

## Seguridad

- **Token**: `crypto.randomBytes(32).toString('hex')` → **256 bits de entropía**. Nunca `Math.random()`.
- **Almacenamiento**: en BD solo se guarda el **HASH SHA-256** del token (tabla `password_reset_tokens`), nunca el token plano. El token original solo existe en el enlace del correo.
- **Expiración**: 15 minutos por defecto (configurable).
- **Un solo uso**: el token se marca `usedAt` al usarse; reutilizarlo es rechazado (validado en backend).
- **Rotación**: al solicitar un nuevo enlace, se revocan los tokens anteriores del usuario.
- **Race conditions**: el cambio de contraseña se hace en una **transacción** con bloqueo del token no usado, de modo que dos solicitudes simultáneas con el mismo token no pueden ejecutarse dos veces.
- **Anti-enumeración**: la respuesta es idéntica exista o no la cuenta, con pausa uniforme (300 ms).
- **Hash de contraseña**: `bcrypt` (cost 12), nunca texto plano / MD5 / SHA-1.
- **Invalidación de sesiones**: al cambiar la contraseña se incrementa `User.tokenVersion` (columna nueva) y se limpia `refreshToken`. El `JwtStrategy` rechaza los JWT emitidos antes de esa versión. Los JWT antiguos (sin `tokenVersion`) siguen siendo válidos por compatibilidad.

## Base de datos / ORM

- ORM: **TypeORM** con MySQL.
- Entidad nueva: `PasswordResetToken` (tabla `password_reset_tokens`) con:
  - `userId` (FK → `usuarios`, `onDelete: CASCADE`)
  - `tokenHash` (SHA-256, **unique**)
  - `expiresAt` (indexada)
  - `usedAt` / `revokedAt` (nullable)
- Columna nueva en `User`: `tokenVersion` (int, default 0).
- El proyecto usa `synchronize: true` en desarrollo (no hay migraciones formales). En producción se debe migrar el esquema manualmente antes de desplegar.

## Variables de entorno (`.env`)

```
# Correo (SMTP) — real
MAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=

# URL para los enlaces de los correos
FRONTEND_URL=http://localhost:5173     # (o PUBLIC_API_URL en prod)

# TTL del enlace de recuperación (minutos)
RESET_PASSWORD_TTL_MINUTES=15
```

Si `MAIL_ENABLED=false` o faltan credenciales, el correo se **imprime en consola**
(modo preview) — útil para desarrollo: el enlace con el token aparece en el log.

## Archivos modificados/creados

Backend:
- `src/modules/password-reset/password-reset-token.entity.ts` (nueva)
- `src/modules/password-reset/password-reset.service.ts` (nuevo)
- `src/modules/password-reset/password-reset.controller.ts` (nuevo)
- `src/modules/password-reset/password-reset.module.ts` (nuevo)
- `src/modules/password-reset/dto/forgot-password.dto.ts` (nuevo)
- `src/modules/password-reset/dto/reset-password.dto.ts` (nuevo)
- `src/modules/password-reset/password-reset.service.spec.ts` (nuevo, pruebas)
- `src/modules/mail/mail.service.ts` (método `enviarRestablecimiento`)
- `src/modules/users/user.entity.ts` (`tokenVersion`)
- `src/modules/users/users.service.ts` (`findByIdWithPassword`, `actualizarPasswordYVersiones`)
- `src/modules/auth/auth.service.ts` (tokenVersion en payload)
- `src/modules/auth/strategies/jwt.strategy.ts` (valida tokenVersion)
- `src/app.module.ts` (entidad + módulo registrados)
- `.env.example` (nuevas variables)

Frontend:
- `src/services/passwordResetService.ts` (nuevo)
- `src/views/Password/ForgotPasswordView.tsx` (nuevo)
- `src/views/Password/ResetPasswordView.tsx` (nuevo)
- `src/views/Login/Login.tsx` (enlace → `/forgot-password`)
- `src/App.jsx` (rutas `/forgot-password`, `/reset-password`)

## Pruebas

```bash
cd backend
npx jest password-reset            # flujo de recuperación (11 pruebas)
npx jest perfiles.dto              # validación de campos (29 pruebas)
```

Cubre: solicitud con correo válido/inexistente, anti-enumeración, token válido/
inválido/expirado/usado/reutilizado, cambio exitoso, contraseña insegura, exceso
de solicitudes, hash del token en BD, contraseña hasheada, rotación de tokens.

## Probarlo localmente

1. Arranca el backend (`npm run start:dev` o `node dist/main` tras `npm run build`).
2. Asegura `FRONTEND_URL=http://localhost:5173` y deja `MAIL_ENABLED=false` (modo preview).
3. Ve a `http://localhost:5173/login` → "¿Olvidaste tu contraseña?".
4. Ingresa un correo existente (p. ej. `admin@elyron.com` del seed).
5. Copia el enlace `http://localhost:5173/reset-password?token=…` del log del backend.
6. Ábrelo, define la nueva contraseña y vuelve a iniciar sesión.

Para envío real: pon `MAIL_ENABLED=true` + credenciales SMTP válidas (Gmail usa
"contraseña de aplicación").
