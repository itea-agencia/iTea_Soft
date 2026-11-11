// Cache en localStorage por usuario, con tiempo de vida. La clave lleva el id del token, y
// clearSessionCaches (api/client.ts) la borra por ese prefijo: no cambiar su forma.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function createCache<T>(baseKey: string, ttlMs: number) {
  const key = () => {
    try {
      const token = localStorage.getItem('itea_token');
      if (!token) return `${baseKey}_anonymous`;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `${baseKey}_${payload.userId || 'unknown'}`;
    } catch {
      return `${baseKey}_anonymous`;
    }
  };

  return {
    read(): T | null {
      try {
        const raw = localStorage.getItem(key());
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp > ttlMs) {
          localStorage.removeItem(key());
          return null;
        }
        return entry.data;
      } catch {
        return null;
      }
    },
    write(data: T): void {
      try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        localStorage.setItem(key(), JSON.stringify(entry));
      } catch {
        // localStorage puede estar lleno: sin cache la app sigue funcionando.
      }
    },
    remove(): void {
      try {
        localStorage.removeItem(key());
      } catch {}
    },
  };
}
