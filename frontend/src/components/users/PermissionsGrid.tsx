import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users as UsersGroup, Map, Settings, Coins, ShieldAlert, LayoutDashboard, UserCog } from 'lucide-react';
import { ModuloCatalogo, PermisosEfectivos, ValorPermiso } from '../../types';
import * as api from '../../api';
import { mensajeDeError } from '../../utils/errors';

interface PermissionsGridProps {
  permissions: PermisosEfectivos;
  onChange: (p: PermisosEfectivos) => void;
}

const ICONOS: Record<string, React.ReactNode> = {
  sales: <ShoppingBag size={18} />,
  clients: <UsersGroup size={18} />,
  responsables: <ShieldAlert size={18} />,
  itineraries: <Map size={18} />,
  commissions: <Coins size={18} />,
  dashboard: <LayoutDashboard size={18} />,
  users: <UserCog size={18} />,
  config: <Settings size={18} />,
};

// El panel se dibuja desde el catalogo del backend (GET /roles/catalogo): todos los modulos y
// todas las acciones que existen, con su etiqueta y su tipo. Antes tenia la lista de modulos
// escrita a mano y mostraba solo las acciones que ya trajeran valor, asi que "Anular" y el
// modulo de usuarios no aparecian y no se podian dar.
export default function PermissionsGrid({ permissions, onChange }: PermissionsGridProps) {
  const [catalogo, setCatalogo] = useState<ModuloCatalogo[] | null>(null);
  const [errorCatalogo, setErrorCatalogo] = useState('');

  useEffect(() => {
    let vigente = true;
    api.getPermisosCatalogo()
      .then((c: ModuloCatalogo[]) => { if (vigente) setCatalogo(c); })
      .catch((err: unknown) => { if (vigente) setErrorCatalogo(mensajeDeError(err, 'No se pudo cargar el catálogo de permisos')); });
    return () => { vigente = false; };
  }, []);

  // Sin copiar a mano: un objeto nuevo por modulo, para no escribir sobre el estado.
  const cambiar = (modulo: string, accion: string, valor: ValorPermiso) => {
    onChange({ ...permissions, [modulo]: { ...(permissions[modulo] || {}), [accion]: valor } });
  };

  if (errorCatalogo) return <p className="text-sm text-rose-600">{errorCatalogo}</p>;
  if (!catalogo) return <p className="text-sm text-gray-500">Cargando el catálogo de permisos…</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {catalogo.map(mod => (
        <div key={mod.modulo} className="p-5 border border-gray-border dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-slate-700">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-xl">{ICONOS[mod.modulo]}</div>
            <span className="font-bold text-base text-gray-800 dark:text-slate-100">{mod.etiqueta}</span>
          </div>
          <div className="flex flex-col gap-3">
            {mod.acciones.map(({ accion, etiqueta, tipo }) => {
              const val = permissions[mod.modulo]?.[accion];
              return (
                <div key={accion} className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-600">
                  <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{etiqueta}</span>
                  {tipo === 'sino' ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={val === true}
                      aria-label={`${mod.etiqueta}: ${etiqueta}`}
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${val === true ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                      onClick={() => cambiar(mod.modulo, accion, val !== true)}
                    >
                      <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-300 ${val === true ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  ) : (
                    <select
                      aria-label={`${mod.etiqueta}: ${etiqueta}`}
                      className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 text-primary dark:text-blue-400 cursor-pointer"
                      value={typeof val === 'string' ? val : 'none'}
                      onChange={(e) => cambiar(mod.modulo, accion, e.target.value as ValorPermiso)}
                    >
                      <option value="all">Todos</option>
                      <option value="own">Propios</option>
                      <option value="none">Ninguno</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
