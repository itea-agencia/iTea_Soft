// Mientras carga o si fallo, un historial de ventas no dice "sin ventas": no lo sabe (invariante 4).
export function SalesLoadStatus({ failed }: { failed: boolean }) {
  if (failed) {
    return <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">No se pudieron cargar las ventas. Cierra y vuelve a abrir para reintentar.</p>;
  }
  return (
    <div className="space-y-2 animate-pulse" aria-busy="true">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-8 rounded bg-gray-100 dark:bg-slate-700" />
      ))}
    </div>
  );
}
