# Documento de Pruebas: Refactorización de Roles

Este documento describe los pasos para probar que la separación en 3 capas (Controlador -> Servicio) en el módulo de Roles se realizó exitosamente y que no se rompió ninguna funcionalidad existente.

## Qué cambió internamente:
- El archivo `backend/src/controllers/roles.controller.js` bajó de 147 líneas a **solo 25 líneas**.
- Toda la lógica pesada, validación del rol y mapeo de bases de datos se movió a `backend/src/services/roles.service.js`.

---

## Pruebas Manuales (Pasos a seguir)

### 1. Iniciar el Backend
Asegúrate de reiniciar tu servidor de backend para que tome los nuevos archivos:
```bash
docker compose restart backend
# O si estás corriendo en modo dev directo en node:
npm run dev
```

### 2. Prueba de Obtención de Permisos (GET)
Esta prueba verifica que `rolesService.getRolePermissions` formatea y lee la base de datos correctamente.

**Acción en la interfaz (Frontend):**
1. Inicia sesión con una cuenta de Administrador.
2. Ve al módulo de **Configuración** -> **Roles y Permisos**.
3. Selecciona el rol **"Asesor"** o **"Freelancer"**.

**Resultado Esperado:**
- La interfaz debe cargar los permisos (checkboxes y menús desplegables) de forma idéntica a como lo hacía antes.
- En la consola del navegador, la respuesta de red (Network) debe ser un JSON estructurado con:
  ```json
  {
    "success": true,
    "data": {
      "dashboard": { "view": "own" },
      "sales": { "view": "own", "create": "true", ... }
    }
  }
  ```

### 3. Prueba de Actualización de Permisos (PUT)
Esta prueba verifica que `rolesService.updateRolePermissions` borra, guarda permisos en base de datos e invalida correctamente la caché.

**Acción en la interfaz (Frontend):**
1. En la misma pantalla de **Configuración -> Roles**, apaga o enciende algún permiso (por ejemplo, quita el permiso de "Crear Clientes" para el rol Asesor).
2. Haz clic en "Guardar Cambios".

**Resultado Esperado:**
- Debe aparecer un mensaje de éxito ("Permisos de rol actualizados").
- (Opcional) Ingresa con un usuario de prueba que tenga el rol "Asesor" y verifica que efectivamente ya no puede acceder a crear clientes.

### 4. Prueba de Validación de Errores
Esta prueba valida que el `throw error` desde el servicio es interceptado correctamente por el manejador global.

**Acción con herramienta API (Postman / Thunder Client) o URL directa:**
1. Haz una petición GET (enviando tu Bearer token de admin) a:
   `http://localhost:3000/api/roles/un-rol-falso/permissions`

**Resultado Esperado:**
- La respuesta del servidor DEBE ser un error 400 limpio:
  ```json
  {
    "success": false,
    "error": {
      "message": "Rol inválido. Use: asesor, freelancer"
    }
  }
  ```

---
**Firma de éxito:**
Si los pasos 2, 3 y 4 funcionan, la Fase 1 del plan de refactorización de `roles` queda oficialmente marcada como exitosa y estable. ✅
