import { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

// Que puede hacer el usuario, con los permisos que manda el backend ya leidos
// (`permisosEfectivos`, la misma lectura que aplica authorize.js). Antes este archivo tenia su
// propia estructura y su propia lectura de las filas, que no coincidian con las del backend:
// la pantalla ofrecia acciones que el servidor rechazaba y escondia otras que permitia.
//
// Lo que no se puede hacer no se muestra (decision 24 del diseno de permisos). El backend
// rechaza igual: esto es solo presentacion.

interface PermissionsContextType {
  /**
   * Si puede hacer la accion. Sin `duenoId` responde si la tiene con algun alcance (para el
   * menu o un boton de "Crear"); con `duenoId` aplica tambien "Propios": el registro tiene que
   * ser suyo. `duenoId` es quien hizo la venta o quien creo el registro (`createdBy`).
   */
  puede: (modulo: string, accion: string, duenoId?: number | null) => boolean;
  /** 'all' | 'own' | false, para filtrar listados como los filtra el backend. */
  alcance: (modulo: string, accion: string) => 'all' | 'own' | false;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const alcance = (modulo: string, accion: string): 'all' | 'own' | false => {
    if (user?.role === 'admin') return 'all';
    const v = user?.permisosEfectivos?.[modulo]?.[accion];
    if (v === true || v === 'all') return 'all';
    if (v === 'own') return 'own';
    return false;
  };

  const puede = (modulo: string, accion: string, duenoId?: number | null): boolean => {
    const a = alcance(modulo, accion);
    if (a === 'own' && duenoId !== undefined) return duenoId === user?.id;
    return a !== false;
  };

  return (
    <PermissionsContext.Provider value={{ puede, alcance }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used within PermissionsProvider');
  return context;
}
