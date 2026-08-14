# Plan de Mejora para `index.js` (Express Backend)

He analizado el archivo principal `backend/src/index.js` en contraste con los nuevos principios de diseño de APIs (api-design-principles) orientados a Node.js + Express. 

El archivo actual tiene una excelente base (ya implementa `helmet`, `cors`, `rateLimit` y un `errorHandler` global), pero existen varias áreas de oportunidad para estandarizar el comportamiento de la API y hacerla más robusta a nivel de infraestructura.

## 1. Versionado de la API (API Versioning)
**Problema actual:** Las rutas se montan directamente en `/api` (`app.use('/api', routes);`).
**Mejora propuesta:** Implementar el enrutamiento con versionamiento en la URL para permitir cambios a futuro sin romper la compatibilidad para los clientes actuales.
**Implementación:**
```javascript
// En lugar de: app.use('/api', routes);
app.use('/api/v1', routes);
```

## 2. Manejo Estándar para Rutas no Encontradas (404 Not Found)
**Problema actual:** Si un cliente solicita una ruta que no existe (ej. `/api/v1/unknown`), Express devolverá su página HTML por defecto de error 404. Esto rompe la consistencia en una API REST donde siempre se espera una respuesta JSON.
**Mejora propuesta:** Agregar un middleware "Catch-all" para rutas no encontradas justo antes del `errorHandler`.
**Implementación:**
```javascript
// Justo antes de app.use(errorHandler);
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    }
  });
});
```

## 3. Manejo Global de Errores Asíncronos (Process Level)
**Problema actual:** Si bien tienes un `errorHandler`, este solo captura los errores que pasan por el middleware de Express (`next(err)`). Si ocurre un error asíncrono no capturado (`unhandledRejection`) fuera del contexto de una ruta o un error fatal (`uncaughtException`), el servidor podría cerrarse abruptamente o quedar inestable.
**Mejora propuesta:** Suscribirse a los eventos del objeto `process` para registrarlos apropiadamente antes de cerrar el proceso de forma controlada.
**Implementación:**
```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Lógica para apagar el servidor si es necesario
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

## 4. Error explícito de CORS (403 Forbidden vs 500)
**Problema actual:** La configuración dinámica de CORS rechaza las peticiones devolviendo `callback(new Error('...'))`. En Express, cuando se pasa un objeto `Error` en la validación de CORS, se lanza por la cadena de middlewares y terminará devolviendo un Error `500 Internal Server Error` (si no está mapeado en el `errorHandler`) en lugar de un `403 Forbidden` (o similar) que deje claro que es un problema de autorización.
**Mejora propuesta:** Asegurar que el error de CORS se formatee correctamente usando una clase de error personalizada para que el `errorHandler` pueda devolver un HTTP 403.

## 5. Apagado Elegante (Graceful Shutdown)
**Problema actual:** Al presionar `Ctrl+C` (SIGINT) o durante reinicios de servidor (SIGTERM), el proceso se detiene inmediatamente, cortando conexiones activas y consultas a bases de datos a medias.
**Mejora propuesta:** Escuchar a las señales de apagado para cerrar la instancia del servidor y la base de datos (Prisma) ordenadamente.
**Implementación:**
```javascript
const server = app.listen(env.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${env.port}`);
});

const gracefulShutdown = () => {
  console.log('Cerrando servidor...');
  server.close(async () => {
    // await prisma.$disconnect();
    console.log('Servidor y base de datos cerrados correctamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```
