export interface SalesFilters {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const SALES_PAGE_SIZE = 10;

// Las fechas se arman como las comparaba la pantalla cuando filtraba la lista completa.
export function buildSalesParams(filters: SalesFilters, page: number, perPage = SALES_PAGE_SIZE) {
  const params: Record<string, string | number> = { page, perPage, sortBy: 'id', sortOrder: 'desc' };
  const search = filters.search.trim();
  if (search) params.search = search;
  if (filters.status !== 'all') params.status = filters.status;
  if (filters.startDate) params.dateFrom = new Date(filters.startDate).toISOString();
  if (filters.endDate) params.dateTo = new Date(`${filters.endDate}T23:59:59`).toISOString();
  return params;
}
