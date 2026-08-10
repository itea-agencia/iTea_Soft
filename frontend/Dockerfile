
# 1. Usamos la misma base de Node.js
FROM node:20-alpine

# 2. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos todo el código del frontend
COPY . .

# 6. Exponemos el puerto del frontend (Vite suele usar 5173, React clásico 3000)
EXPOSE 5173

# 7. Comando para arrancar el servidor de desarrollo del frontend
CMD ["npm", "run", "dev", "--", "--host"]