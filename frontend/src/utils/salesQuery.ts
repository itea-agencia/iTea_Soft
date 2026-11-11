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
