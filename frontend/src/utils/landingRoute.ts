// En el orden del menu. Una ruta que redirige sin saber si el destino esta permitido entra en un
// bucle, asi que el destino siempre sale de esta lista.
const ROUTES_BY_MENU_ORDER: [string, string][] = [
  ['/', 'dashboard'],
  ['/sales', 'sales'],
  ['/clients', 'clients'],
  ['/itineraries', 'itineraries'],
  ['/commissions', 'commissions'],
  ['/users', 'users'],
  ['/responsables', 'responsables'],
  ['/config', 'config'],
];

export const firstAllowedRoute = (canView: (module: string) => boolean) =>
  ROUTES_BY_MENU_ORDER.find(([, module]) => canView(module))?.[0] ?? null;
