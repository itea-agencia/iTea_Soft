import { createCache } from './createCache';

// 15 minutos: los catalogos cambian con menos frecuencia que las ventas.
const cache = createCache<Record<string, any[]>>('itea_config_cache', 15 * 60 * 1000);

export function saveConfigCache(config: Record<string, any>): void {
  // Los permisos de rol siempre se consultan frescos: no entran en la cache.
  const cacheData = { ...config };
  delete cacheData.rolePermissions;
  cache.write(cacheData);
}

export const loadConfigCache = (): Record<string, any[]> | null => cache.read();
export const invalidateConfigCache = (): void => cache.remove();
