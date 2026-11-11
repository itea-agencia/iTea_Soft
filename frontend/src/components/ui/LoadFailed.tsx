import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

// Un fallo de carga no se muestra como "no hay datos": la pantalla afirmaria algo que no sabe
// (invariante 4, hallazgo 9 de la auditoria del frontend).
export function LoadFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="h-full flex flex-col items-center justify-center gap-3 text-center text-gray-500 dark:text-slate-400">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-full">
        <AlertCircle className="w-6 h-6 text-amber-500" />
      </div>
      <span className="text-sm font-semibold">{message}</span>
      <Button variant="outline" size="sm" onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
