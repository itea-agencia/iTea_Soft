import { useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { useData } from '../context/DataContext';
import { Sale } from '../types';
import { createLatestRequests } from '../utils/latestRequests';
import { isAccessDenied } from '../utils/loadFailures';

interface QueryResult {
  key: string | null;
  sales: Sale[];
  total: number;
  failed: boolean;
}

const EMPTY: QueryResult = { key: null, sales: [], total: 0, failed: false };

// Pide al servidor las ventas que indican `params`; con null no pide nada. "Cargando" se deriva
// de que el resultado guardado no sea el de esta consulta: asi una pantalla nunca muestra, ni por
// un instante, filas de otro filtro o un "sin ventas" que todavia no sabe.
export function useSalesQuery(params: Record<string, unknown> | null) {
  const { salesVersion } = useData();
  const [result, setResult] = useState<QueryResult>(EMPTY);
  // El ultimo resultado que llego bien, de cualquier consulta: el panel de creditos lo sigue
  // mostrando mientras recarga, en vez de desmontarse y perder su estado.
  const [lastSales, setLastSales] = useState<Sale[] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requests = useRef(createLatestRequests()).current;

  const paramsKey = params ? JSON.stringify(params) : null;
  const requestKey = paramsKey === null ? null : `${paramsKey}|${salesVersion}|${retryCount}`;

  useEffect(() => {
    if (paramsKey === null || requestKey === null) return;
    const isLatest = requests.begin();
    api.listSales(JSON.parse(paramsKey)).then(
      (res) => {
        if (!isLatest()) return;
        setResult({ key: requestKey, sales: res.data || [], total: res.meta?.total ?? 0, failed: false });
        setLastSales(res.data || []);
      },
      (err) => {
        // Un 403 es un listado que ese rol no tiene permitido: vacio es lo correcto, y cuenta como
        // resultado (sin esto el panel de creditos quedaba en el esqueleto).
        if (!isLatest()) return;
        const denied = isAccessDenied(err);
        setResult({ key: requestKey, sales: [], total: 0, failed: !denied });
        if (denied) setLastSales([]);
      },
    );
  }, [requestKey]);

  const current = result.key === requestKey ? result : EMPTY;
  return {
    sales: current.sales,
    total: current.total,
    failed: current.failed,
    loading: requestKey !== null && result.key !== requestKey,
    lastSales,
    retry: () => setRetryCount((c) => c + 1),
  };
}
