# Etapa 1: Construcción con Node.js
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Servidor Web NGINX para producción
FROM nginx:alpine AS runner

# Copiar build estático de Vite a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de NGINX para SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
