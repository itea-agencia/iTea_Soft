---
name: api-design-principles
description: Guía de arquitectura y principios de diseño de APIs REST específicas para Node.js con Express. Usa esta skill al crear nuevas rutas, controladores o refactorizar el backend.
---

# Principios de Diseño de API para Node.js + Express

Esta skill define las mejores prácticas, arquitectura y patrones de diseño para construir APIs REST escalables, seguras y mantenibles usando **Node.js** y **Express.js**.

## Cuándo usar esta Skill

- Al crear nuevos *endpoints* (rutas) en Express.
- Al diseñar o refactorizar controladores y servicios.
- Al implementar validaciones de datos y manejo de errores.
- Al configurar middlewares de seguridad o rendimiento.

## 1. Arquitectura de Capas (Separation of Concerns)

No pongas toda la lógica de negocio en los archivos de rutas. Utiliza una arquitectura de 3 capas:

1. **Routes (Rutas):** Solo mapean la URL y el método HTTP (GET, POST, etc.) al controlador correspondiente. Aplican middlewares de autenticación o validación.
2. **Controllers (Controladores):** Extraen los datos de la petición (`req.body`, `req.params`), llaman a los servicios correspondientes y envían la respuesta HTTP (`res.status().json()`).
3. **Services (Servicios):** Contienen la lógica de negocio pesada, llamadas a la base de datos (Prisma/Mongoose), y no saben absolutamente nada sobre `req` o `res`.

## 2. Nomenclatura de Endpoints (RESTful)

- Usa sustantivos en plural para los recursos, nunca verbos.
  - ✅ **Correcto:** `GET /api/users`, `POST /api/sales`
  - ❌ **Incorrecto:** `GET /api/getUsers`, `POST /api/createSale`
- Usa identificadores en las URLs para recursos específicos:
  - ✅ `GET /api/users/:id`
- Mantén una jerarquía lógica:
  - ✅ `GET /api/users/:id/sales` (Ventas de un usuario específico)

## 3. Manejo de Errores Centralizado (Error Handling)

No repitas `try/catch` con `res.status(500).json(...)` en cada controlador de la misma manera.

1. **Usa un Middleware Global de Errores** en Express (`app.use((err, req, res, next) => { ... })`).
2. **Usa envoltorios Async/Await** o pasa los errores a `next(err)` dentro del `catch`.
3. **Estructura de error estándar:** Devuelve siempre un formato predecible para el frontend:
   ```json
   {
     "success": false,
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Faltan campos obligatorios",
       "details": ["El email es requerido"]
     }
   }
   ```

## 4. Validaciones de Entrada (Input Validation)

Nunca confíes en los datos del cliente (`req.body`, `req.query`).
- Valida los datos antes de que lleguen al controlador usando middlewares y bibliotecas como **Zod** o **Joi**.
- Extrae la validación a un middleware reutilizable.

## 5. Códigos de Estado HTTP Correctos

Devuelve los códigos apropiados según el resultado de la operación:
- **200 OK:** Petición exitosa (GET, PUT, PATCH).
- **201 Created:** Recurso creado exitosamente (POST).
- **204 No Content:** Petición exitosa pero sin cuerpo de respuesta (comúnmente en DELETE).
- **400 Bad Request:** Datos de entrada inválidos.
- **401 Unauthorized:** Falla de autenticación (Token faltante o inválido).
- **403 Forbidden:** El usuario está autenticado pero no tiene permisos.
- **404 Not Found:** El recurso no existe.
- **500 Internal Server Error:** Error no controlado en el servidor.

## 6. Seguridad y Rendimiento en Express

- **Helmet:** Úsalo para configurar cabeceras HTTP seguras.
- **CORS:** Configura estrictamente los orígenes permitidos en producción.
- **Rate Limiting (Límites de peticiones):** Usa `express-rate-limit` para evitar ataques de fuerza bruta o DDoS.
- **Paginación:** Siempre implementa paginación (`limit`, `offset`/`page`) en los endpoints que devuelven listas grandes de la base de datos para no bloquear el Event Loop de Node.

## 7. Formato de Respuestas Exitosas

Usa un formato unificado para todas las respuestas exitosas de la API:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```
