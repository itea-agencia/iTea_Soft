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
  const [retryCount, setRetryCount] = useState(0);
  const requests = useRef(createLatestRequests()).current;

  const paramsKey = params ? JSON.stringify(params) : null;
  const requestKey = paramsKey === null ? null : `${paramsKey}|${salesVersion}|${retryCount}`;

  useEffect(() => {
    if (paramsKey === null || requestKey === null) return;
    const isLatest = requests.begin();
    api.listSales(JSON.parse(paramsKey)).then(
      (res) => {
        if (isLatest()) setResult({ key: requestKey, sales: res.data || [], total: res.meta?.total ?? 0, failed: false });
      },
      (err) => {
        // Un 403 es un listado que ese rol no tiene permitido: vacio es lo correcto.
        if (isLatest()) setResult({ key: requestKey, sales: [], total: 0, failed: !isAccessDenied(err) });
      },
    );
  }, [requestKey]);

  const current = result.key === requestKey ? result : EMPTY;
  return {
    sales: current.sales,
    total: current.total,
    failed: current.failed,
    loading: requestKey !== null && result.key !== requestKey,
    retry: () => setRetryCount((c) => c + 1),
  };
}
