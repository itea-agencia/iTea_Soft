// Que ventanas estan abiertas y cual esta arriba. Cada modal escribia por su cuenta en
// body.style.overflow: cerrar uno liberaba el fondo con otro abierto (hallazgo 15).
export function createModalStack() {
  const open: symbol[] = [];
  return {
    push() {
      const id = Symbol();
      open.push(id);
      return {
        isTop: () => open[open.length - 1] === id,
        // Devuelve si ya no queda ninguna abierta.
        remove: () => {
          open.splice(open.indexOf(id), 1);
          return open.length === 0;
        },
      };
    },
  };
}
