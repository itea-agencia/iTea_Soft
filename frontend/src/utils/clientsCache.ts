import { createCache } from './createCache';

const cache = createCache<unknown[]>('itea_clients_cache', 5 * 60 * 1000);

export const saveClientsCache = (clients: unknown[]): void => cache.write(clients);
export const loadClientsCache = (): unknown[] | null => cache.read();

/** Usar al cambiar clientes, ventas o pagos: un cliente muestra su deuda. */
export const invalidateClientsCache = (): void => cache.remove();
