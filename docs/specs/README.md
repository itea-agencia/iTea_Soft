# Specs

Documentos que fijan **qué debe cumplirse y por qué**, no qué se hizo. Un changelog cuenta
la historia; una spec dice la regla que no hay que volver a romper.

Nacieron de una tanda de trabajo entre el 9 y el 17 de septiembre de 2026 en la que el
mismo error aparecía una y otra vez en lugares distintos, y el mismo formato se siguió
usando después para lo que se encontró revisando seguridad y sesiones entre el 21 y el 22.
Cada spec enuncia un invariante, explica el daño concreto que causó no tenerlo, dice dónde
está la regla en el código y cómo comprobar que sigue viva.

| Spec | Invariante |
|---|---|
| [datos-por-pasajero](2026-09-17-datos-por-pasajero.md) | Lo que es de una persona vive en la persona, no en el producto |
| [dinero-y-totales](2026-09-17-dinero-y-totales.md) | El servidor es la autoridad sobre el dinero; los agregados se derivan |
| [facturacion-siigo](2026-09-17-facturacion-siigo.md) | La interfaz no afirma lo que no puede saber |
| [vocabulario](2026-09-17-vocabulario.md) | Cada cosa se llama igual en todo el flujo, y cosas distintas se llaman distinto |
| [migraciones](2026-09-17-migraciones.md) | El esquema solo cambia por una migración versionada |
| [autenticacion-y-autorizacion](2026-09-21-autenticacion-y-autorizacion.md) | Sin autenticación no hay acceso, y un permiso se comprueba dato por dato |
| [bajas-y-sesiones](2026-09-21-bajas-y-sesiones.md) | Una baja no pierde ventas, y una sesión revocada no vale |

## Otras carpetas de documentación

- `docs/designs/` — diseños por funcionalidad, escritos antes de implementar. Responden
  "cómo vamos a hacer X". Salen de la skill de brainstorming.
- `docs/superpowers/specs/` — un design doc de arquitectura previo a esta tanda
  (paginación de modales). Se deja donde está por trazabilidad.
- `backend/db-manual/README.md` — operaciones manuales sobre la base, con su estado.

## Cómo se lee una spec de acá

Cada una tiene la misma forma:

1. **El invariante** en una frase.
2. **Qué pasó sin él** — casos reales, con los datos de producción que lo probaron.
3. **Dónde vive la regla** — archivo y función, para que se pueda auditar.
4. **Cómo verificarlo** — un comando o una consulta que responde sí o no.
5. **Lo que queda abierto** — lo que se sabe que falta, dicho en voz alta.
