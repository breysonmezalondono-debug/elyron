# Elyron — Frontend (React + Vite + Tailwind CSS 4)

Frontend del plataforma educativa **Elyron / EduCore**. SPA React 19 con
React Router, Tailwind CSS v4 y Framer Motion. Se organiza en **portales
independientes** por rol (Campus para estudiantes; y portales separados para
Instructor, Profesor, Coordinador, Admin y Colegio), cada uno con su propio
layout y guarda de seguridad (`RoleGate`).

---

## Requisitos

- Node.js ≥ 20.19 (requerido por Vite 8)
- npm

---

## 1. Instalar dependencias

```bash
cd frontend
npm install
```

## 2. Variables de entorno

Copia el ejemplo a `.env`:

```bash
cp .env.example .env
```

Variables disponibles (ver `.env.example`):

| Variable | Descripción | Default |
|---|---|---|
| `VITE_AUTH_URL` | Microservicio de Autenticación | `http://localhost:3000/api` |
| `VITE_EDUCORE_URL` | Microservicio educativo núcleo | `http://localhost:3000/api` |
| `VITE_AI_URL` | Microservicio de IA (Tutor Elir) | `http://localhost:8000` |
| `VITE_USE_MOCK_AUTH` | `true` = datos mock sin backend · `false` = llamadas reales | `true` |

> Para probar el frontend **sin backend**, deja `VITE_USE_MOCK_AUTH=true`
> (es el default). El Login expone cuentas demo por institución que
> autocompletan credenciales al elegir un rol.

## 3. Arrancar en desarrollo

```bash
npm run dev
```

El servidor de desarrollo corre por defecto en:

```
http://localhost:5173
```

Abre esa URL. Te dirigirá a `/login`.

---

## Cuentas demo (modo mock)

En `/login`, elige institución → elige un rol → **Iniciar sesión**.
Contraseña de autocompletado: `Test123*`.

| Portal | URL | Rol / correo |
|---|---|---|
| Campus (estudiantes) | `/campus` | `aprendiz@elyron.com` · `estudiante@elyron.com` · `university@prueba.com` |
| Instructor | `/instructor` | `instructor@elyron.com` |
| Profesor (Docente) | `/profesor` | `docente@elyron.com` |
| Coordinador | `/coordinador` | `coordinador@elyron.com` |
| Admin | `/admin` | `admin@elyron.com` |
| Colegio | `/colegio` | `rector@elyron.com` |

Cada portal está aislado con una guarda estricta: si intentas entrar a URL de
otro rol, verás el mensaje **403 — Acceso no autorizado**.

---

## Tutor Inteligente (IA · Elir) — requiere ia-service

El chat del Tutor IA (`/api/v1/chat/stream`) **NO** usa mock: se conecta en
tiempo real al microservicio de IA vía **SSE**. Para que funcione, el
`ia-service` debe estar corriendo.

El frontend ya incluye un microservicio de IA en la carpeta `../ia-service`.
Para levantarlo:

```bash
cd ia-service
python -m venv venv
venv\Scripts\activate           # Windows
source venv/bin/activate        # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Debe quedar escuchando en `http://localhost:8000` (lo que apunta
`VITE_AI_URL`). Verifica que responde en `http://localhost:8000/health`.

> En `ia-service/.env` configura `OPENAI_API_KEY` y `OPENAI_BASE_URL`
> (Groq/OpenAI/xAI). Sin esto, la IA responde un error y el chat del frontend
> cae al modo simulado con una alerta.

Si el servicio de IA **no** está corriendo, el chat muestra en pantalla:
«Servidor de IA no disponible — respondiendo en modo simulado».

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (HMR) |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | ESLint (`eslint src`) |
| `npm run typecheck` | `tsc --noEmit` |

## Verificación rápida

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Estructura relevante

```
src/
├── App.jsx                     # Router con portales por rol (RoleGate)
├── layouts/                    # CampusLayout · AdminLayout · PortalAwareLayout
├── router/guards/              # RoleGate (guarda estricta por rol)
├── pages/                      # campus/ · admin/ (homes de portal)
├── components/                 # Shell, dashboards, componentes Elyron
├── context/                    # Auth · Institution · Theme
├── services/                   # api, config (URLs), servicios de dominio, Elir IA
└── model/                      # Permisos/roles, institution, y mocks de datos
```

Para el contrato de endpoints que espera el backend, consulta
[`HANDOFF_BACKEND.md`](../HANDOFF_BACKEND.md).
