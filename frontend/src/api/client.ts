import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itea_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 con estos codigos es la sesion, no una contrasena mala (el login fallido no lleva
    // codigo). Al desactivar o eliminar a alguien, o cerrar su sesion en otro sitio, el
    // servidor la revoca; sin avisar al contexto, la pantalla seguia abierta y cada accion
    // fallaba hasta que el usuario recargaba.
    const CODIGOS_DE_SESION = ['NO_TOKEN', 'INVALID_TOKEN', 'SESSION_REVOKED', 'USER_INACTIVE'];
    if (error.response?.status === 401) {
      localStorage.removeItem('itea_token');
      localStorage.removeItem('itea_user');
      localStorage.removeItem('itea_session_expiry');
      if (CODIGOS_DE_SESION.includes(error.response?.data?.error?.code)) {
        window.dispatchEvent(new Event('itea:sesion-expirada'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
