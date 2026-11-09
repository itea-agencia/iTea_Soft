import api from './client';
import { User } from '../types';

export async function listUsers(params: Record<string, unknown>) {
  const res = await api.get('/users', { params });
  return res.data;
}

// Opciones del campo "Asesor" de la venta. Solo id y nombre, y no exige users.view.
export async function listAsesores(): Promise<{ id: number; name: string }[]> {
  const res = await api.get('/users/asesores');
  return res.data.data;
}

export async function getUser(id: number) {
  const res = await api.get(`/users/${id}`);
  return res.data.data;
}

export async function createUser(data: Partial<User>) {
  const res = await api.post('/users', data);
  return res.data.data;
}

export async function updateUser(id: number, data: Partial<User>) {
  const res = await api.put(`/users/${id}`, data);
  return res.data.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}

export async function updateRolePermissions(role: string, permissions: Record<string, unknown>) {
  const res = await api.put(`/roles/${role}/permissions`, { permissions });
  return res.data.data;
}

export async function getRolePermissions(role: string) {
  const res = await api.get(`/roles/${role}/permissions`);
  return res.data.data;
}

// Que acciones existen (modulos, etiquetas y tipos), sin valores de ningun rol: el panel de
// permisos se dibuja desde aca.
export async function getPermisosCatalogo() {
  const res = await api.get('/roles/catalogo');
  return res.data.data;
}
