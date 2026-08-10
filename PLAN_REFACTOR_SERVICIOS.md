# Plan de Migración a Arquitectura de Servicios (3 Capas)

Este documento define la hoja de ruta para extraer toda la lógica de negocio de los controladores actuales y moverla a la capa de `services/`, cumpliendo con la skill `api-design-principles`.

## 🎯 Objetivos de la Migración
1. **Controladores Limpios:** Los controladores solo manejarán objetos `req` y `res`, delegando el procesamiento.
2. **Reusabilidad:** La lógica de base de datos vivirá en servicios que pueden llamarse desde cualquier lado.
3. **Validación Segura:** Integrar middlewares de validación (Zod) antes de llegar al controlador.

---

## 📈 Fases de Migración

Hemos categorizado los controladores por tamaño y complejidad. Comenzaremos por los más pequeños para establecer el patrón de trabajo antes de atacar al "monstruo" de 2,500 líneas.

### Fase 1: Calentamiento (Módulos Pequeños)
El objetivo aquí es definir la estructura base (`X.service.js`) y aprender el flujo sin riesgo de romper procesos críticos.
- [ ] **`roles.controller.js`** (5 KB) - El más pequeño. Ideal para la primera prueba de concepto.
- [ ] **`auth.controller.js`** (9.6 KB) - Inicio de sesión y manejo de tokens.
- [ ] **`clients.controller.js`** (10 KB) - Gestión simple de clientes y personas.
- [ ] **`responsables.controller.js`** (11.8 KB) - Gestión de responsables.

### Fase 2: Complejidad Media (Módulos con dependencias)
Estos controladores tienen más reglas de negocio, queries anidadas y filtros de búsqueda.
- [ ] **`users.controller.js`** (16 KB) - Creación de asesores y perfiles.
- [ ] **`flights.controller.js`** (16.4 KB) - Lógica de Check-in, correos e itinerarios.
- [ ] **`commissions.controller.js`** (14.9 KB) - Liquidación y cálculo de comisiones.
- [ ] **`config.controller.js`** (15.4 KB) - Parámetros del sistema y catálogos.
- [ ] **`stats.controller.js`** (15.5 KB) - Estadísticas y dashboards.

### Fase 3: Los "Jefes Finales" (Módulos Pesados)
Aquí es donde la arquitectura de servicios brillará de verdad, dividiendo archivos enormes en pequeñas funciones testeables.
- [ ] **`products.controller.js`** (25.6 KB) - 15 endpoints diferentes para tiquetes, hoteles, visas, etc. *(Sugerencia: Dividir en varios servicios como `ticket.service.js`, `hotel.service.js`, etc.)*
- [ ] **`sales.controller.js`** (107 KB) - El núcleo de iTea Soft. Contiene raw SQL, cálculos financieros complejos e integración con Siigo. *(Sugerencia: Dividir en `sales.service.js`, `sales-payment.service.js`, `sales-reports.service.js`).*

---

## 🛠️ Reglas del Juego (El Estándar)

Durante cada refactor, aplicaremos este patrón estrictamente:

1. **Crear el Servicio:** 
   Se creará `backend/src/services/nombre.service.js`. Todas las funciones deben ser asíncronas y retornar objetos o lanzar errores (`throw new Error()`).
   
2. **Actualizar el Controlador:**
   ```javascript
   exports.list = async (req, res, next) => {
     try {
       // 1. Extraer datos de req
       const { search } = req.query;
       
       // 2. Llamar al servicio
       const data = await nombreService.listAll(search);
       
       // 3. Responder
       return success(res, data);
     } catch (err) {
       next(err); // El middleware global de errores se encarga
     }
   };
   ```

3. **Inyectar Validación (Fase Opcional pero recomendada):**
   Si es una ruta POST/PUT, crearemos esquemas en `schemas/` y los inyectaremos en la ruta con nuestro `validate.js`.
