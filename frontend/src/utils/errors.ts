// El backend responde los errores como `{ success: false, error: { message, code } }`. Varias
// pantallas leian `response.data.message`, que no existe: mostraban siempre su texto generico
// y las reglas de negocio ("un administrador no se puede desactivar...") no se veian nunca.
export function mensajeDeError(err: any, respaldo: string): string {
  return err?.response?.data?.error?.message || err?.response?.data?.message || respaldo;
}
