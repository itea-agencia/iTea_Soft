import { createContext, useContext, ReactNode, useMemo } from 'react';
import { User, RolePermissions, ADMIN_PERMISSIONS, DEFAULT_ASESOR_PERMISSIONS, DEFAULT_FREELANCER_PERMISSIONS, normalizeRolePermissions } from '../types';
import { useData } from './DataContext';

type ModulePermission = {
  [key: string]: unknown;
};

interface PermissionsContextType {
  permissions: RolePermissions;
  can: (module: keyof RolePermissions, action: string) => boolean;
  canEdit: (module: keyof RolePermissions) => boolean;
  canDelete: (module: keyof RolePermissions) => boolean;
  canCreate: (module: keyof RolePermissions) => boolean;
  canView: (module: keyof RolePermissions) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

function buildPermissionsFromApiPermisos(permisos: { modulo: string; accion: string; valor?: string }[]): RolePermissions {
  // Base structure MUST include ALL modules defined in RolePermissions
  // so that permissions saved to the DB are never silently ignored.
  const base: any = {
    dashboard: { view: 'none' },
    sales: { view: 'none', create: false, edit: 'none' },
    clients: { view: 'none', create: false, edit: 'none' },
    responsables: { view: 'none', create: false, edit: 'none', delete: false },
    itineraries: { view: 'none', edit: 'none' },
    commissions: { view: false, create: false, edit: false, delete: false },
    config: { view: false, create: false, edit: false },
  };

  const SCOPED_VIEW_MODULES = ['dashboard', 'sales', 'clients', 'responsables', 'itineraries'];
  const SCOPED_EDIT_MODULES = ['sales', 'clients', 'responsables', 'itineraries'];

  for (const { modulo, accion, valor } of permisos) {
    if (base[modulo] === undefined) continue;
    if (valor !== undefined && valor !== null) {
      if (valor === 'true') {
        if (SCOPED_VIEW_MODULES.includes(modulo) && accion === 'view') base[modulo][accion] = 'all';
        else if (SCOPED_EDIT_MODULES.includes(modulo) && accion === 'edit') base[modulo][accion] = 'all';
        else base[modulo][accion] = true;
      } else if (valor === 'false') {
        if (SCOPED_VIEW_MODULES.includes(modulo) && accion === 'view') base[modulo][accion] = 'none';
        else if (SCOPED_EDIT_MODULES.includes(modulo) && accion === 'edit') base[modulo][accion] = 'none';
        else base[modulo][accion] = false;
      } else {
        // valor es un string como 'all', 'own', 'none'
        base[modulo][accion] = valor;
      }
    } else {
      if (SCOPED_VIEW_MODULES.includes(modulo) && accion === 'view') base[modulo].view = 'all';
      else if (SCOPED_EDIT_MODULES.includes(modulo) && accion === 'edit') base[modulo].edit = 'all';
      else if (base[modulo][accion] !== undefined) base[modulo][accion] = true;
    }
  }

  // normalizeRolePermissions uses DEFAULT_ASESOR_PERMISSIONS as base template,
  // which now includes 'config', so nothing will be missing.
  return normalizeRolePermissions(base as RolePermissions);
}

export function PermissionsProvider({
  children,
  user
}: {
  children: ReactNode;
  user: User | null;
}) {
  const { data } = useData();

  const permissions = useMemo(() => {
    if (!user) return DEFAULT_ASESOR_PERMISSIONS;

    if (user.role === 'admin') return ADMIN_PERMISSIONS;

    // Check for API-style permisos (from login response)
    const apiPermisos = (user as any).permisos;
    if (apiPermisos && Array.isArray(apiPermisos) && apiPermisos.length > 0) {
      return buildPermissionsFromApiPermisos(apiPermisos);
    }

    const defaultPerms = user.role === 'freelancer' 
      ? (data.config.rolePermissions?.freelancer || DEFAULT_FREELANCER_PERMISSIONS)
      : (data.config.rolePermissions?.asesor || DEFAULT_ASESOR_PERMISSIONS);

    if (user.customPermissions) return normalizeRolePermissions(user.customPermissions, defaultPerms);

    return defaultPerms;
  }, [user, data.config.rolePermissions]);

  const can = (module: keyof RolePermissions, action: string): boolean => {
    const modulePerms = permissions[module] as ModulePermission;
    if (!modulePerms) return user?.role === 'admin';
    const actionValue = modulePerms[action];
    if (typeof actionValue === 'boolean') return actionValue;
    if (actionValue === 'all') return true;
    if (actionValue === 'own') return true;
    return false;
  };

  const canEdit = (module: keyof RolePermissions): boolean => {
    if (user?.role === 'admin') return true;
    const perm = permissions[module] as ModulePermission;
    if (!perm) return false;
    if ('edit' in perm) {
      const editVal = perm.edit;
      if (typeof editVal === 'boolean') return editVal;
      return editVal !== 'none';
    }
    return false;
  };

  const canDelete = (module: keyof RolePermissions): boolean => {
    if (user?.role === 'admin') return true;
    const perm = permissions[module] as ModulePermission;
    if (!perm) return false;
    if ('delete' in perm) return perm.delete === true;
    return false;
  };

  const canCreate = (module: keyof RolePermissions): boolean => {
    if (user?.role === 'admin') return true;
    const perm = permissions[module] as ModulePermission;
    if (!perm) return false;
    if ('create' in perm) return perm.create === true;
    return false;
  };

  const canView = (module: keyof RolePermissions): boolean => {
    if (user?.role === 'admin') return true;
    const perm = permissions[module] as ModulePermission;
    if (!perm) return true;
    if ('view' in perm) {
      const viewVal = perm.view;
      if (typeof viewVal === 'boolean') return viewVal;
      return viewVal === 'all' || viewVal === 'own';
    }
    return true;
  };

  return (
    <PermissionsContext.Provider value={{ permissions, can, canEdit, canDelete, canCreate, canView }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used within PermissionsProvider');
  return context;
}
