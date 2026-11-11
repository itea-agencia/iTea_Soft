import { Component, ReactNode } from 'react';
import { LoadFailed } from './LoadFailed';

// Si una pantalla no se puede descargar ni despues de recargar (utils/lazyReload.ts), la
// aplicacion no queda en blanco: el menu sigue y se puede reintentar.
export class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="py-24">
        <LoadFailed message="No se pudo cargar esta pantalla." retryLabel="Recargar" onRetry={() => window.location.reload()} />
      </div>
    );
  }
}
