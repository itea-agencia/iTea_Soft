/**
 * Invariantes compartidos de las listas de pasajeros e integrantes.
 *
 * El bloque de pasajeros está duplicado en TicketForm, LandTravelForm y PlanForm, y las
 * copias divergieron: TicketForm agrupa los radios con `name={`titular-${idx}`}`, un grupo
 * distinto por fila, así que se pueden marcar varios titulares a la vez; LandTravelForm ya
 * lo corrigió con `useId()`.
 *
 * Se comparte la lógica —donde vivían los bugs— y se deja duplicado el markup, que es
 * genuinamente distinto entre productos (tiquetería captura asiento y fecha de nacimiento,
 * terrestre captura dos asientos, paquetes captura booking y tiquete).
 */

/** Deja exactamente uno como titular. */
export function setTitular<T extends { esTitular?: boolean }>(lista: T[], idx: number): T[] {
  return lista.map((p, i) => ({ ...p, esTitular: i === idx }));
}

/** true si alguno está marcado como titular. */
export function hayTitular<T extends { esTitular?: boolean }>(lista: T[]): boolean {
  return lista.some((p) => p.esTitular === true);
}

/**
 * Índice del titular para efectos de presentación. Si datos heredados no traen ninguno
 * marcado, resalta el primero. Derivado, no escribe estado.
 */
export function idxTitular<T extends { esTitular?: boolean }>(lista: T[]): number {
  const i = lista.findIndex((p) => p.esTitular === true);
  return i === -1 ? 0 : i;
}

/** Sanea un código: solo alfanumérico, guion y guion bajo, en mayúsculas. */
export function sanearCodigo(valor: string, maxLen = 20): string {
  return String(valor || '').replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().slice(0, maxLen);
}
