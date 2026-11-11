// Lo que no se pudo cargar, por recurso. El aviso general guardaba un solo mensaje y no se
// quitaba nunca, aunque la carga se recuperara (hallazgo 9 de la auditoria del frontend).

// Un 401/403 no es un fallo de carga: es un recurso que ese rol no tiene permitido.
export const isAccessDenied = (err: any) => {
  const status = err?.response?.status;
  return status === 401 || status === 403;
};

export const withLoadFailure = (failures: string[], resource: string) =>
  failures.includes(resource) ? failures : [...failures, resource];

export const withoutLoadFailure = (failures: string[], resource: string) =>
  failures.includes(resource) ? failures.filter((f) => f !== resource) : failures;

export const loadErrorMessage = (failures: string[]) => {
  if (failures.length === 0) return null;
  const list = failures.length === 1 ? failures[0] : `${failures.slice(0, -1).join(', ')} y ${failures[failures.length - 1]}`;
  return `No se pudieron cargar ${list}. Lo que ves puede estar desactualizado: recarga la página.`;
};
