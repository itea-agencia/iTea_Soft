# Flujo de trabajo y commits

## Flujo

1. Una rama por feature, `feat/nombre`, desde `main` actualizado. Verificá la rama antes de
   cada commit (ver "Trampas del entorno" en `CLAUDE.md`).
2. Antes de implementar algo no trivial, el diseño va en `docs/designs/` (sale de la skill
   de brainstorming). Si el cambio toca un invariante, la spec de `docs/specs/` se
   actualiza **primero**, no después.
3. La prueba que falla va primero. Si la lógica es una función pura del frontend, es una
   prueba en `frontend/tests/`; si no, una consulta SQL, un `curl` o un conteo que
   muestra el problema. Después va el código mínimo, y la misma verificación tiene que dar
   lo esperado. El `curl` contra la app local necesita permiso.
4. Lo que queda pendiente o se decidió no arreglar va en "Lo que queda abierto" de la spec.
   Si hubo un script de `backend/db-manual/`, su estado va en el README de esa carpeta.
5. Al cerrar: commit y push de la rama. **No se abre PR ni se mergea a `main`**: el merge
   lo hace el usuario, y mergear a `main` despliega (Render corre `prisma migrate deploy`
   solo).

## Mensajes de commit

En español, explicando el problema antes de la solución. Qué se rompía, por qué, qué
alternativa se descartó y cómo se verificó. Los de este repo son largos a propósito: son la
única documentación de decisiones que sobrevive.

La primera línea sigue la forma del historial, `tipo(área): qué`, p. ej.
`fix(creditos): una venta anulada ya no suma a la deuda del cliente`.

Terminar con la línea de atribución que indique el entorno.
