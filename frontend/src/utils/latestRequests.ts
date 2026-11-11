// Cada begin() deja viejas a las peticiones anteriores. Con una consulta en curso, un cambio de
// filtro se ignoraba y la pantalla mostraba el rango anterior (hallazgo 8 de la auditoria).
export function createLatestRequests() {
  let latest = 0;
  return {
    begin() {
      const id = ++latest;
      return () => id === latest;
    },
  };
}
