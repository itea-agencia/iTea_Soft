import { createCache } from './createCache';

// 3 minutos: los usuarios cambian con menor frecuencia que las ventas.
const cache = createCache<unknown[]>('itea_users_cache', 3 * 60 * 1000);

export const saveUsersCache = (users: unknown[]): void => cache.write(users);
export const loadUsersCache = (): unknown[] | null => cache.read();
export const invalidateUsersCache = (): void => cache.remove();
