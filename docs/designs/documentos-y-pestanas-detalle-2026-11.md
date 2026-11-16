# Documentos y pestañas del detalle de venta

Corrección solicitada por el usuario tras revisar la venta 185, 2026-11-16.

- El resumen del titular busca `clientDocType/clientDocNumber`, ausentes en GET, aunque el cliente ya tiene documento. Exponer ambos en el detalle y usar el cliente cargado como respaldo para respuestas anteriores.
- SIM devuelve el nombre del pasajero pero omite su documento; mascota también omite el documento del dueño. Reutilizar la lectura del documento del pasajero que ya hace check-in, desde la persona vinculada, sin heredar valores de otros productos.
- El payload de Beto Bodega (equipaje) no envió documento. No reconstruir su identidad por nombre ni asignarle el documento del titular: conservar el nombre y mostrar «Sin documento registrado».
- Extraer la lista actual de personas a una función pura para probar titular, SIM y ausencia de documento. Conservar los formatos antiguos que ya acepta el resumen, sin tomar booking, tiquete ni licencia como documento.
- Centralizar las secciones del detalle con su etiqueta e icono. Las pestañas muestran «Check-in», «SIM Card», «Renta de Vehículos» y «Viajes Terrestres»; cada categoría tiene icono, incluido autobús para terrestre. El detalle se despacha por la categoría interna, no por el texto visible.
- No cambiar registros existentes, tablas ni totales. Pruebas de regresión antes del código; suite, TypeScript/build y sintaxis al finalizar. Verificación local de la lectura y frontend actualizado requieren autorización para esa etapa.
- El usuario aprobó la sección 10 y, después de actualizar los contenedores locales, confirmó también las correcciones de la sección 11.

## Evidencia de implementación

- Regresión: documento del pasajero (2 casos), resumen y etiquetas/iconos (3 casos); fallaron antes de crear los módulos y pasaron tras el código. La prueba del icono usa React compartido con el renderizador para ejercitar Lucide real, sin simularlo.
- `npm test`: 24 archivos sin fallos. TypeScript/build, sintaxis del controlador/helper y `git diff --check` correctos. Vite mantiene su aviso de chunks grandes.
- Con autorización se reconstruyeron backend y frontend locales. Los hashes del controlador y helper coinciden con el repositorio.
- Relectura real de la 185: el documento del titular coincide con SQL; Sonia devuelve CC 9930000701; check-in, SIM y mascota dan documentos consistentes en GET y `/details`. Las categorías de autos y terrestre siguen disponibles. Total 187.000. No se crearon ni modificaron ventas; sesión de pruebas cerrada.
- El resumen calculado con ese GET real conserva documentos de Prueba Regla y Sonia, y deja vacío el de Beto, cuya presentación indica «Sin documento registrado».
- Revisión visual completada: el usuario aprobó estas correcciones (sección 11) y autorizó commit y push a `feat-bayrol`.
