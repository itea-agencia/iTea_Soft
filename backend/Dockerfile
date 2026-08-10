# 1. Usamos una imagen oficial de Node.js ligera como base
FROM node:20-alpine

# 2. Creamos y nos posicionamos en la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias primero (optimiza la caché de Docker)
COPY package*.json ./

# 4. Instalamos las dependencias del proyecto
RUN npm install

# 5. Copiamos el resto del código fuente del backend al contenedor
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# 6. Exponemos el puerto en el que corre tu API (por ejemplo, el 5000)
EXPOSE 3000

# 7. Comando para arrancar la app en modo desarrollo (ajústalo según tu package.json)
CMD ["npm", "run", "dev"]