export interface SalesFilters {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const SALES_PAGE_SIZE = 10;

// El dia de los filtros es el de Colombia, como lo muestra la tabla (formatDate): del 00:00 al
// 23:59:59.999 con -05:00 (Colombia no tiene horario de verano). Antes "Desde" se leia en UTC y
// "Hasta" en la hora del navegador: desde el 10 entraban ventas del 9 desde las 19:00.
export function buildSalesParams(filters: SalesFilters, page: number, perPage = SALES_PAGE_SIZE) {
  const params: Record<string, string | number> = { page, perPage, sortBy: 'id', sortOrder: 'desc' };
  const search = filters.search.trim();
  if (search) params.search = search;
  if (filters.status !== 'all') params.status = filters.status;
  if (filters.startDate) params.dateFrom = `${filters.startDate}T00:00:00.000-05:00`;
  if (filters.endDate) params.dateTo = `${filters.endDate}T23:59:59.999-05:00`;
  return params;
}

export const lastPage = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize));

export interface PageState { filtersKey: string; page: number }
export interface ListStatus { loading: boolean; failed: boolean; count: number; total: number }

// La pagina que corresponde a la tabla de Ventas. Devuelve el mismo objeto si no cambia, para que
// la pantalla no vuelva a renderizar.
// - Un filtro distinto lleva a la 1, y la 1 queda guardada con su clave: si solo se derivaba, la
//   pagina vieja seguia guardada y al limpiar el filtro volvia (auditoria de la paginacion).
// - Una pagina que quedo vacia con ventas en el filtro (se anulo la unica de la ultima) pasa a la
//   ultima que existe. Con total 0 no hay a donde ir: "Venta no encontrada" es correcto.
export function resolvePageState(state: PageState, filtersKey: string, list: ListStatus, pageSize: number): PageState {
  if (state.filtersKey !== filtersKey) return { filtersKey, page: 1 };
  const last = lastPage(list.total, pageSize);
  if (!list.loading && !list.failed && list.count === 0 && list.total > 0 && state.page > last) {
    return { filtersKey, page: last };
  }
  return state;
}

// Que muestra el panel de creditos. El esqueleto y el error de pagina entera, solo antes del primer
// resultado: despues el panel queda montado con las cifras anteriores, y conserva su busqueda,
// filtros y cliente elegido; si la recarga falla, con un aviso (decisiones del usuario).
export function creditPanelState(query: { lastSales: unknown[] | null; failed: boolean }) {
  if (query.lastSales === null) return query.failed ? 'error' : 'skeleton';
  return query.failed ? 'stale' : 'panel';
}

export interface DetailsCache<T> { version: number; byId: Record<number, T> }

// El detalle de una venta se guarda con el salesVersion en que se pidio. Antes no se invalidaba
// nunca: tras anular, pagar o marcar facturada, reabrir el detalle mostraba el estado anterior
// (auditoria de la paginacion). salesVersion sube con cada una de esas acciones.
export function storeSaleDetail<T>(cache: DetailsCache<T>, version: number, id: number, sale: T): DetailsCache<T> {
  // Una respuesta pedida antes de un cambio no pisa lo que ya se guardo despues.
  if (version < cache.version) return cache;
  const byId = version === cache.version ? cache.byId : {};
  return { version, byId: { ...byId, [id]: sale } };
}

export const currentDetails = <T,>(cache: DetailsCache<T>, version: number): Record<number, T> =>
  cache.version === version ? cache.byId : {};
