# Usar Node.js 22 LTS
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias de backend
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copiar el resto del código del backend
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Etapa final
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3000

# Copiar lo necesario desde la etapa de construcción
COPY --from=builder /app /app

EXPOSE 3000

# Script de arranque: Ejecuta migraciones / push / seed y luego inicia la app
CMD ["sh", "-c", "npx prisma db push && npm start"]
