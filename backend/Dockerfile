# Etapa de build - compila la aplicación NestJS
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa de producción - imagen ligera solo con dependencias necesarias
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Usuario sin privilegios por seguridad
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
