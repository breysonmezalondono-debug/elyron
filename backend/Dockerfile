# ============================================================
# ELYRON API · Dockerfile de producción (multi-stage)
# Imagen final ligera: solo runtime Node + dist compilado.
# Sin secretos en la imagen: todo llega por variables de entorno.
# ============================================================

# ---------- Etapa 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Dependencias completas (dev incluidas) para compilar TS
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: producción ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción (más pequeña y segura)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Código compilado + assets (correo, migraciones SQL)
COPY --from=build /app/dist ./dist

# Usuario sin privilegios
USER node

EXPOSE 3000

# Salud: responde 200 con {status, database} en /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/api/health >/dev/null 2>&1 || exit 1

# Puerto dinámico: el host inyecta PORT
CMD ["sh", "-c", "node dist/main"]
