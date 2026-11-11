import { createCache } from './createCache';

const cache = createCache<any>('itea_dashboard_cache', 5 * 60 * 1000);

export const saveDashboardCache = (data: any): void => cache.write(data);
export const loadDashboardCache = (): any | null => cache.read();
export const invalidateDashboardCache = (): void => cache.remove();
