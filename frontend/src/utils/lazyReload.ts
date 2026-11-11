// Al publicar se reemplazan los archivos: una pestana abierta desde antes pide uno que ya no
// existe. Se recarga una sola vez para traer la version nueva; la marca evita un bucle si el
// fallo es otro (hallazgo 16 de la auditoria del frontend).
const RELOAD_FLAG = 'itea_chunk_reload';

type FlagStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export async function importWithReload<T>(
  load: () => Promise<T>,
  storage: FlagStorage = sessionStorage,
  reload: () => void = () => window.location.reload(),
): Promise<T> {
  try {
    const loaded = await load();
    try {
      storage.removeItem(RELOAD_FLAG);
    } catch {}
    return loaded;
  } catch (err) {
    // Sin poder guardar la marca no se recarga: no habria forma de frenar el bucle.
    let canReload = false;
    try {
      if (storage.getItem(RELOAD_FLAG) === null) {
        storage.setItem(RELOAD_FLAG, '1');
        canReload = true;
      }
    } catch {}
    if (!canReload) throw err;
    reload();
    return new Promise<T>(() => {});
  }
}
