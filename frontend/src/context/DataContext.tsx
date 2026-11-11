import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { AppData, User, Client, Sale, Flight, PermisosEfectivos } from '../types';
import * as api from '../api';
import { useAuth } from './AuthContext';
import { getCurrentMonth } from '../utils/formatters';
import {
  saveClientsCache,
  loadClientsCache,
  invalidateClientsCache,
} from '../utils/clientsCache';
import {
  saveUsersCache,
  loadUsersCache,
  invalidateUsersCache,
} from '../utils/usersCache';
import {
  saveDashboardCache,
  loadDashboardCache,
  invalidateDashboardCache,
} from '../utils/dashboardCache';
import {
  saveConfigCache,
  loadConfigCache,
  invalidateConfigCache,
} from '../utils/configCache';
import { isAccessDenied, loadErrorMessage, withLoadFailure, withoutLoadFailure } from '../utils/loadFailures';
import { createLatestRequests } from '../utils/latestRequests';

// Limpiar caché de permisos de rol si quedó de versiones anteriores
try { localStorage.removeItem('itea_role_permissions_cache'); } catch {}

type ConfigSection = 'cards' | 'paymentMethods' | 'documentTypes' | 'airlines' | 'suppliers' | 'airports' | 'baggage' | 'packages';

interface RecentSale {
  id: number;
  clientName: string;
  asesorName: string;
  date: string;
  total: number;
  status: string;
}

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  monthlyRevenue: number;
  totalOperations?: number;
  pendingBalance: number;
  pendingCount: number;
  suppliersTotal: number;
  totalClients: number;
  activeClients: number;
  totalFlights: number;
  supplierCount: number;
  recentSales: RecentSale[];
  categoryDistribution: { name: string; value: number; percentage: number }[];
  carteraStatus: { name: string; value: number; color: string }[];
  monthlyTrend: { month: number; currentYear: number; previousYear: number }[];
  ivaTrend?: { month: number; currentYear: number; previousYear: number }[];
  categoryBreakdown: Record<string, { count: number; revenue: number }>;
  creditProveedores?: number;
  creditTa?: number;
  topResponsables?: any[];
  topComisionistas?: any[];
}

interface DataContextType {
  data: AppData;
  dashboardData: DashboardData | null;
  dashboardRefreshCount: number;
  salesVersion: number;
  loadError: string | null;
  dashboardFailed: boolean;
  fetchDashboard: (params?: Record<string, unknown>, isBackgroundRefresh?: boolean) => Promise<void>;
  refreshSales: () => void;
  fetchClients: () => Promise<void>;
  fetchResponsables: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  // Los permisos de rol de la BD, solo para el admin (es el panel). `rolePermissionsReady` es
  // false hasta que llegan: sin ellos el panel no muestra ni guarda nada.
  fetchRolePermissions: () => Promise<void>;
  rolePermissionsReady: boolean;
  fetchFlights: () => Promise<void>;
  fetchCommissionAgents: () => Promise<void>;
  fetchCommissionAgentsForSale: () => Promise<void>;
  fetchSettlements: () => Promise<void>;
  refreshData: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  toggleClientStatus: (id: number) => Promise<'active' | 'inactive'>;
  addResponsable: (responsable: any) => Promise<any>;
  updateResponsable: (id: number, responsable: any) => Promise<void>;
  deleteResponsable: (id: number) => Promise<void>;
  toggleResponsableStatus: (id: number, status: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => ReturnType<typeof api.createSale>;
  voidSale: (id: number, reason: string) => Promise<string[]>;
  updateReviewStatus: (id: number, isReviewed: boolean) => Promise<void>;
  registerCreditPayment: (saleId: number, amount: number, method?: string, isTotal?: boolean, reference?: string) => Promise<{ payment: any; status: string; creditPaidAmount: number }>;
  deleteSalePayment: (saleId: number, paymentId: string) => Promise<void>;
  updateFlight: (id: string, flight: Partial<Flight> | FormData) => Promise<void>;
  settleCommissions: (agentId: number, settlement: any, salesIds: number[]) => Promise<void>;
  refreshSettlements: () => Promise<void>;
  addConfigItem: (section: ConfigSection, item: Record<string, unknown>) => Promise<Record<string, unknown>>;
  updateConfigItem: (section: ConfigSection, id: number, item: Record<string, unknown>) => Promise<void>;
  deleteConfigItem: (section: ConfigSection, id: number) => Promise<void>;
  addCommissionAgent: (agent: any) => Promise<any>;
  updateCommissionAgent: (id: number, agent: any) => Promise<void>;
  toggleCommissionAgentStatus: (id: number) => Promise<'Activo' | 'Inactivo'>;
  updateRolePermissions: (role: 'asesor' | 'freelancer', permissions: PermisosEfectivos) => Promise<void>;
}

const emptyData: AppData = {
  users: [], clients: [], responsables: [], flights: [],
  commissionAgents: [], commissionAgentsForSale: [], commissionSettlements: [],
  config: {
    cards: [], paymentMethods: [], documentTypes: [],
    airlines: [], suppliers: [], airports: [],
    baggage: [], packages: [], cities: [],
    rolePermissions: {},
  },
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rolePermissionsReady, setRolePermissionsReady] = useState(false);
  const [data, setData] = useState<AppData>(() => {
    // ── Inicialización optimista desde caché ──────────────────────────────
    // Si hay datos cacheados válidos, pre-populamos el estado para que la
    // tabla de ventas/usuarios/catálogos se renderice en 0ms antes del primer fetch de red.
    const cachedClients = loadClientsCache();
    const cachedUsers = loadUsersCache();
    const cachedConfig = loadConfigCache();

    const initialConfig = {
      ...emptyData.config,
      ...(cachedConfig || {})
    };

    if (cachedClients || cachedUsers || cachedConfig) {
      return {
        ...emptyData,
        clients: (cachedClients as Client[]) || [],
        users: (cachedUsers as User[]) || [],
        config: initialConfig,
      };
    }
    return emptyData;
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(() => loadDashboardCache());
  const [dashboardRefreshCount, setDashboardRefreshCount] = useState(0);
  // Sube con cada cambio en las ventas: las consultas de useSalesQuery se repiten.
  const [salesVersion, setSalesVersion] = useState(0);
  const refreshSales = useCallback(() => setSalesVersion((v) => v + 1), []);
  // Un listado que no carga se mostraba como vacío (`.catch(() => ({ data: [] }))`): sin
  // conexión, la pantalla decía "no hay ventas" en vez de "no se pudieron cargar". Ahora un
  // fallo deja los datos que había (la caché o la carga anterior) y lo dice. Un 401/403 no
  // es un fallo: es un listado que ese rol no tiene permitido, y vacío es lo correcto.
  const [loadFailures, setLoadFailures] = useState<string[]>([]);
  const loadError = loadErrorMessage(loadFailures);
  // Sin cifras que mostrar porque la carga fallo: el Dashboard muestra el error, no ceros.
  const [dashboardFailed, setDashboardFailed] = useState(false);
  const DASHBOARD_LOAD = 'los indicadores del panel';

  // Cada recurso sale del aviso cuando vuelve a cargar; antes el mensaje quedaba hasta recargar
  // la pagina. El resultado de una peticion de la sesion anterior no toca el aviso.
  const trackLoad = <T,>(resource: string, request: Promise<T>): Promise<T | null> => {
    const token = currentToken();
    return request.then(
      (result) => {
        if (currentToken() === token) setLoadFailures((f) => withoutLoadFailure(f, resource));
        return result;
      },
      (err) => {
        if (currentToken() === token && !isAccessDenied(err)) setLoadFailures((f) => withLoadFailure(f, resource));
        return null;
      },
    );
  };

  useEffect(() => {
    setLoadFailures([]);
    setDashboardFailed(false);
  }, [user?.id]);

  // Una carga que sale con una sesion y resuelve con otra se descarta: escribia ventas y
  // clientes del usuario anterior en el estado y en la cache del nuevo (hallazgo 1 de la
  // auditoria del frontend). La identidad es el token con el que salio la peticion: cambia en el
  // mismo tick del logout, sin esperar un render. Solo el login lo escribe.
  const currentToken = () => localStorage.getItem('itea_token');

  const backgroundLoadingRef = useRef(false);
  const dashboardRequests = useRef(createLatestRequests()).current;

  const fetchDashboard = useCallback(async (params: Record<string, unknown> = {}, isBackgroundRefresh = false) => {
    const isLatestRequest = dashboardRequests.begin();
    
    if (!isBackgroundRefresh) {
      // Sin datos y sin error es "cargando": se ve el esqueleto, no cifras de otro rango.
      setDashboardData(null);
      setDashboardFailed(false);
    }
    const token = currentToken();
    try {
      const result = await api.getDashboard(params);
      if (!isLatestRequest() || currentToken() !== token) return;
      setDashboardData(result as DashboardData);
      
      // Guardar en caché el dashboard consultado
      saveDashboardCache(result as DashboardData);
      setLoadFailures((f) => withoutLoadFailure(f, DASHBOARD_LOAD));
    } catch (err) {
      if (!isLatestRequest() || currentToken() !== token) return;
      if (isBackgroundRefresh && !isAccessDenied(err)) {
        // Falla solo la actualizacion: los datos guardados se conservan, con el aviso.
        setLoadFailures((f) => withLoadFailure(f, DASHBOARD_LOAD));
      } else {
        // Sin cifras: las del rango anterior bajo las fechas nuevas serian falsas.
        setDashboardData(null);
        // Tambien con un 403: sin datos ni error, la pantalla quedaria en esqueleto para siempre.
        setDashboardFailed(true);
        setLoadFailures((f) => withoutLoadFailure(f, DASHBOARD_LOAD));
      }
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los clientes', api.listClients({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      const freshClients = res.data || [];
      setData(prev => {
        if (currentToken() !== token) return prev;
        saveClientsCache(freshClients);
        return { ...prev, clients: freshClients };
      });
    } catch {}
  }, []);

  const fetchResponsables = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los responsables', api.listResponsables({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      const freshResponsables = res.data || [];
      setData(prev => ({ ...prev, responsables: freshResponsables }));
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los usuarios', api.listUsers({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      const freshUsers = res.data || [];
      saveUsersCache(freshUsers);
      setData(prev => ({ ...prev, users: freshUsers }));
    } catch {}
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const token = currentToken();
      // Si falla, se conserva lo que habia: antes los catalogos se reemplazaban por listas vacias.
      const configAll = await trackLoad('los catálogos de configuración', api.getAllConfig());
      if (!configAll || currentToken() !== token) return;
      if (configAll && Object.keys(configAll).length > 0) {
        saveConfigCache({
          cards: configAll.cards || [],
          paymentMethods: configAll['payment-methods'] || [],
          documentTypes: configAll['document-types'] || [],
          airlines: configAll.airlines || [],
          suppliers: configAll.suppliers || [],
          airports: configAll.airports || [],
          baggage: configAll.baggage || [],
          packages: configAll.packages || [],
          cities: configAll.cities || [],
        });
      }
      setData(prev => ({
        ...prev,
        config: {
          cards: configAll?.cards || [],
          paymentMethods: configAll?.['payment-methods'] || [],
          documentTypes: configAll?.['document-types'] || [],
          airlines: configAll?.airlines || [],
          suppliers: configAll?.suppliers || [],
          airports: configAll?.airports || [],
          baggage: configAll?.baggage || [],
          packages: configAll?.packages || [],
          cities: configAll?.cities || [],
          // Los permisos de rol no son de este fetch: si venian de otro (o de nada), se dejan.
          // Antes, si la peticion de permisos fallaba, aqui se ponian los defaults del codigo.
          rolePermissions: prev.config.rolePermissions,
        }
      }));
    } catch {}
  }, []);

  const fetchRolePermissions = useCallback(async () => {
    // Leer los permisos de un rol es solo del admin (requireAdmin en el backend).
    if (user?.role !== 'admin') return;
    const token = currentToken();
    try {
      const [asesorPerms, freelancerPerms] = await Promise.all([
        api.getRolePermissions('asesor'),
        api.getRolePermissions('freelancer'),
      ]);
      if (currentToken() !== token) return;
      setData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          rolePermissions: { asesor: asesorPerms, freelancer: freelancerPerms },
        },
      }));
      setRolePermissionsReady(true);
    } catch {
      // Sin respuesta del servidor NO se cae a los defaults: se queda "no listo", y la
      // pantalla de permisos se niega a guardar en vez de escribir el default sobre la BD.
      setRolePermissionsReady(false);
    }
  }, [user?.role]);

  const fetchFlights = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los itinerarios', api.listFlights({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      setData(prev => ({ ...prev, flights: res.data || [] }));
    } catch (err) {
      console.warn('[DataContext] Error fetching flights:', err);
    }
  }, []);

  const fetchCommissionAgents = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los comisionistas', api.listCommissionAgents({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      setData(prev => ({ ...prev, commissionAgents: res.data || [] }));
    } catch {}
  }, []);

  // El asistente de ventas elige entre todos los comisionistas aunque el modulo de comisiones
  // muestre solo los propios (decision 16 del diseno de permisos).
  const fetchCommissionAgentsForSale = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('los comisionistas del asistente de ventas', api.listCommissionAgents({ para: 'venta' }));
      if (!res || currentToken() !== token) return;
      setData(prev => ({ ...prev, commissionAgentsForSale: res.data || [] }));
    } catch {}
  }, []);

  const fetchSettlements = useCallback(async () => {
    try {
      const token = currentToken();
      const res = await trackLoad('las liquidaciones', api.listSettlements({ perPage: 5000 }));
      if (!res || currentToken() !== token) return;
      setData(prev => ({ ...prev, commissionSettlements: res.data || [] }));
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) {
      setData(emptyData);
      setDashboardData(null);
      setRolePermissionsReady(false);
      return;
    }

    // Al iniciar sesión o cambiar de usuario, cargar inmediatamente su caché específico
    // Esto evita mostrar datos del usuario anterior (ej: admin a asesor)
    const cachedConfig = loadConfigCache();
    setData(prev => ({
      ...emptyData,
      clients: (loadClientsCache() as Client[]) || [],
      users: (loadUsersCache() as User[]) || [],
      config: { ...emptyData.config, ...(cachedConfig || {}) },
    }));
    setDashboardData(loadDashboardCache());

    // Los permisos de rol se piden SIEMPRE. La cache de configuracion los excluye a
    // proposito (son de la BD y deben ser frescos), pero el fetch de permisos colgaba de
    // `!cachedConfig`: al cerrar sesion y volver a entrar, o recargar, dentro de los 15
    // minutos de esa cache, no se pedian nunca y la pantalla mostraba los defaults del
    // codigo. Guardar desde ahi los escribia sobre los permisos que el admin habia puesto.
    setRolePermissionsReady(false);
    fetchRolePermissions();

    if (!cachedConfig) {
       fetchConfig();
    }
  }, [user?.id, fetchConfig, fetchRolePermissions]);

  const refreshData = () => { 
    // El Dashboard y Estadisticas consultan con sus propios filtros: este contador se los pide.
    // Antes los datos quedaban en null sin volver a pedirse y la pantalla salia toda en $0.
    setDashboardRefreshCount((c) => c + 1);
    setDashboardData(null);
    invalidateDashboardCache();
    refreshSales();
    fetchClients();
    fetchFlights();
  };

  const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const created = await api.createUser(user as any);
    setData(prev => {
      const updated = [...prev.users, created];
      invalidateUsersCache();
      return { ...prev, users: updated };
    });
    return created;
  };

  const updateUser = async (id: number, userUpdate: Partial<User>) => {
    const updated = await api.updateUser(id, userUpdate);
    setData(prev => {
      const users = prev.users.map(u => u.id === id ? { ...u, ...updated } : u);
      invalidateUsersCache();
      return { ...prev, users };
    });
  };

  const deleteUser = async (id: number) => {
    await api.deleteUser(id);
    setData(prev => {
      invalidateUsersCache();
      return { ...prev, users: prev.users.filter(u => u.id !== id) };
    });
  };

  const addClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    const created = await api.createClient(client as any);
    setData(prev => ({ ...prev, clients: [...prev.clients, created] }));
    invalidateClientsCache();
    return created;
  };

  const updateClient = async (id: number, clientUpdate: Partial<Client>) => {
    await api.updateClient(id, clientUpdate);
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...clientUpdate } : c)
    }));
    invalidateClientsCache();
  };

  // Esto solo recargaba la lista y nunca llamaba a la API: desde junio el toast decia
  // "desactivado" y el cliente seguia activo. Devuelve el estado que quedo en el servidor,
  // que invierte el que tiene guardado: la pantalla no debe suponerlo.
  const toggleClientStatus = async (id: number) => {
    const { status } = await api.toggleClientStatus(id);
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, status } : c)
    }));
    invalidateClientsCache();
    return status;
  };

  const addResponsable = async (responsable: any) => {
    await api.createResponsable(responsable);
    await fetchResponsables();
  };

  const updateResponsable = async (id: number, responsable: any) => {
    await api.updateResponsable(id, responsable);
    await fetchResponsables();
  };

  const deleteResponsable = async (id: number) => {
    await api.deleteResponsable(id);
    await fetchResponsables();
  };

  const toggleResponsableStatus = async (id: number, status: string) => {
    await api.toggleResponsableStatus(id, status);
    await fetchResponsables();
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    const created = await api.createSale(sale);
    invalidateClientsCache();
    invalidateDashboardCache();
    refreshSales();
    setDashboardData(null);
    fetchFlights();
    return created;
  };

  // Devuelve los avisos del servidor: lo que anular no deshace (factura en Siigo, comisión pagada).
  const voidSale = async (id: number, reason: string): Promise<string[]> => {
    const result = await api.voidSale(id, reason);
    invalidateClientsCache();
    refreshSales();
    invalidateDashboardCache();
    setDashboardData(null);
    return result?.avisos || [];
  };

  const updateReviewStatus = async (id: number, isReviewed: boolean) => {
    await api.updateReviewStatus(id, isReviewed);
    invalidateClientsCache();
    refreshSales();
  };

  const registerCreditPayment = async (saleId: number, amount: number, method?: string, isTotal: boolean = false, reference?: string) => {
    const payload = { amount, method, isTotal, reference };
    const result = await api.registerPayment(saleId, payload);
    invalidateClientsCache();
    refreshSales();
    setDashboardData(null);
    invalidateDashboardCache();
    return result;
  };

  const deleteSalePayment = async (saleId: number, paymentId: string) => {
    await api.deletePayment(saleId, paymentId);
    invalidateClientsCache();
    refreshSales();
    setDashboardData(null);
    invalidateDashboardCache();
  };


  const updateFlight = async (id: string, flightUpdate: Partial<Flight> | FormData) => {
    const result = await api.updateCheckin(id, flightUpdate as any);
    setData(prev => ({
      ...prev,
      flights: prev.flights.map(f => f.id === id ? { ...f, checkin: result.checkinStatus } : f)
    }));
  };

  // Se liquidan las ventas que el servidor devolvio como pendientes al cargar la lista, las que
  // la persona vio en pantalla. Antes salian de data.sales, que la pantalla de comisiones no
  // carga. Una venta que entre mientras tanto queda para la siguiente liquidacion.
  const settleCommissions = async (agentId: number, settlement: any, salesIds: number[]) => {
    const created = await api.createSettlement({ ...settlement, agentId, salesIds });
    setData(prev => ({
      ...prev,
      commissionSettlements: [...(prev.commissionSettlements || []), created],
    }));
    // Sin esto, la lista mostraba el acumulado de antes de liquidar.
    refreshSales();
    await fetchCommissionAgents();
  };

  const refreshSettlements = async () => {
    const token = currentToken();
    const res = await trackLoad('las liquidaciones', api.listSettlements({ perPage: 100 }));
    if (!res || currentToken() !== token) return;
    setData(prev => ({ ...prev, commissionSettlements: res.data || [] }));
  };

  const addConfigItem = async (section: ConfigSection, item: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const list = (data.config as any)[section] || [];
    const maxId = list.reduce((max: number, i: any) => {
      const idNum = Number(i.id);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    const tempId = maxId + 1;

    const optimisticItem = { id: tempId, ...item };

    setData(prev => {
      const nextConfig = {
        ...prev.config,
        [section]: [...(prev.config as any)[section], optimisticItem]
      };
      saveConfigCache(nextConfig);
      return { ...prev, config: nextConfig };
    });

    try {
      const created = await api.createConfigItem(section, item);
      setData(prev => {
        const nextConfig = {
          ...prev.config,
          [section]: (prev.config as any)[section].map((i: any) => i.id === tempId ? created : i)
        };
        saveConfigCache(nextConfig);
        return { ...prev, config: nextConfig };
      });
      return created;
    } catch (err) {
      setData(prev => {
        const nextConfig = {
          ...prev.config,
          [section]: (prev.config as any)[section].filter((i: any) => i.id !== tempId)
        };
        saveConfigCache(nextConfig);
        return { ...prev, config: nextConfig };
      });
      throw err;
    }
  };

  const updateConfigItem = async (section: ConfigSection, id: number, itemUpdate: Record<string, unknown>) => {
    const originalItem = (data.config as any)[section].find((i: any) => i.id === id);

    setData(prev => {
      const nextConfig = {
        ...prev.config,
        [section]: (prev.config as any)[section].map((i: any) => i.id === id ? { ...i, ...itemUpdate } : i)
      };
      saveConfigCache(nextConfig);
      return { ...prev, config: nextConfig };
    });

    try {
      await api.updateConfigItem(section, id, itemUpdate);
    } catch (err) {
      setData(prev => {
        const nextConfig = {
          ...prev.config,
          [section]: (prev.config as any)[section].map((i: any) => i.id === id ? originalItem : i)
        };
        saveConfigCache(nextConfig);
        return { ...prev, config: nextConfig };
      });
      throw err;
    }
  };

  const deleteConfigItem = async (section: ConfigSection, id: number) => {
    const originalList = (data.config as any)[section];

    setData(prev => {
      const nextConfig = {
        ...prev.config,
        [section]: (prev.config as any)[section].filter((i: any) => i.id !== id)
      };
      saveConfigCache(nextConfig);
      return { ...prev, config: nextConfig };
    });

    try {
      await api.deleteConfigItem(section, id);
    } catch (err) {
      setData(prev => {
        const nextConfig = {
          ...prev.config,
          [section]: originalList
        };
        saveConfigCache(nextConfig);
        return { ...prev, config: nextConfig };
      });
      throw err;
    }
  };

  const addCommissionAgent = async (agent: any) => {
    const created = await api.createCommissionAgent(agent);
    // Se recarga la lista en vez de agregar la respuesta: crear puede reactivar a uno que ya
    // estaba (quedaba duplicado) y la respuesta no trae pendingSaleIds para liquidar.
    await fetchCommissionAgents();
    return created;
  };

  const updateCommissionAgent = async (id: number, agentUpdate: any) => {
    await api.updateCommissionAgent(id, agentUpdate);
    setData(prev => ({
      ...prev,
      commissionAgents: prev.commissionAgents.map(a => a.id === id ? { ...a, ...agentUpdate } : a)
    }));
  };

  // Un comisionista no se borra, se desactiva. El estado se actualiza tambien en la lista del
  // asistente de ventas, que solo ofrece a los activos.
  const toggleCommissionAgentStatus = async (id: number) => {
    const status = await api.toggleCommissionAgentStatus(id);
    setData(prev => ({
      ...prev,
      commissionAgents: prev.commissionAgents.map(a => a.id === id ? { ...a, status } : a),
      commissionAgentsForSale: (prev.commissionAgentsForSale || []).map((a: any) => a.id === id ? { ...a, status } : a),
    }));
    return status;
  };

  const updateRolePermissions = async (role: 'asesor' | 'freelancer', permissions: PermisosEfectivos) => {
    await api.updateRolePermissions(role, permissions);
    setData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        rolePermissions: { ...prev.config.rolePermissions, [role]: permissions }
      }
    }));
  };

  return (
    <DataContext.Provider value={{
      data,
      dashboardData,
      dashboardRefreshCount,
      salesVersion,
      loadError,
      dashboardFailed,
      fetchDashboard,
      refreshSales,
      fetchClients,
      fetchUsers,
      fetchConfig,
      fetchRolePermissions,
      rolePermissionsReady,
      fetchFlights,
      fetchResponsables,
      fetchCommissionAgents,
      fetchCommissionAgentsForSale,
      fetchSettlements,
      refreshData,
      addUser,
      updateUser,
      deleteUser,
      addClient,
      updateClient,
      toggleClientStatus,
      addResponsable,
      updateResponsable,
      deleteResponsable,
      toggleResponsableStatus,
      addSale,
      voidSale,
      updateReviewStatus,
      settleCommissions,
      refreshSettlements,
      registerCreditPayment,
      deleteSalePayment,
      updateFlight,
      addConfigItem,
      updateConfigItem,
      deleteConfigItem,
      addCommissionAgent,
      updateCommissionAgent,
      toggleCommissionAgentStatus,
      updateRolePermissions,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
