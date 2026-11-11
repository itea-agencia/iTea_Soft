import { createCache } from './createCache';

const FIVE_MINUTES = 5 * 60 * 1000;
const salesCache = createCache<unknown[]>('itea_sales_cache', FIVE_MINUTES);
const clientsCache = createCache<unknown[]>('itea_clients_cache', FIVE_MINUTES);

// Por separado: guardar los dos juntos renovaba la antiguedad del que no se habia consultado
// (hallazgo 7 de la auditoria del frontend).
export const saveSalesCache = (sales: unknown[]): void => salesCache.write(sales);
export const saveClientsCache = (clients: unknown[]): void => clientsCache.write(clients);

export const loadSalesCache = (): unknown[] | null => salesCache.read();
export const loadClientsCache = (): unknown[] | null => clientsCache.read();

/** Invalida ambos cachés: una venta muestra datos de su cliente y un cliente, su deuda. Usar al cambiar ventas, pagos o clientes. */
export function invalidateSalesCache(): void {
  salesCache.remove();
  clientsCache.remove();
}
