import ErrorResponse from '@/model/class/error-response';
import Resolve, { ResolveResponse } from '@/model/class/resolve';
import SuccessResponse from '@/model/class/response';
import BranchInterface from '@/model/ts/interface/branch';
import DashboardInterface from '@/model/ts/interface/dashboard';
import { InventoryDashboardInterface } from '@/model/ts/interface/inventory';
import { ProfileOptionsInterface } from '@/model/ts/interface/profile';
import { StoreOptionsInterface } from '@/model/ts/interface/store';
import { AuthenticateInterface, UserGetInterface, UserResponseInterface } from '@/model/ts/interface/user';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACK_END,
  timeout: 50000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const data = JSON.parse(window.localStorage.getItem("login"));
  if (data !== null) {
    config.headers.Authorization = 'Bearer ' + data.token;
  }

  return config;
});

export async function initDashboard(params: Record<string, any>, signal: AbortSignal): Promise<ResolveResponse<DashboardInterface>> {
  return await Resolve.safe<DashboardInterface>(
    apiClient.get("/api/dashboard/init", {
      params: params,
      signal: signal,
    }),
  );
}
/*
|--------------------------------------------------------------------------
| ENDPOINTS DE INVENTARIO
|--------------------------------------------------------------------------
*/

export async function inventarioDashboard(body: Record<string, any>, signal: AbortSignal): Promise<ResolveResponse<InventoryDashboardInterface>> {
  return await Resolve.safe<InventoryDashboardInterface>(
    apiClient.post("/api/inventario/dashboard", body, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SUCURSAL
|--------------------------------------------------------------------------
*/

export async function optionsSucursal(signal: AbortSignal): Promise<ResolveResponse<BranchInterface[]>> {
  return await Resolve.safe<BranchInterface[]>(
    apiClient.get("/api/sucursal/options", {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PLAZO
|--------------------------------------------------------------------------
*/

export async function comboPlazo(signal: AbortSignal): Promise<SuccessResponse<any> | ErrorResponse> {
  return await Resolve.resolve<any>(
    apiClient.get("/api/plazo/combo", {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE USUARIO
|--------------------------------------------------------------------------
*/
export async function listUsuario(params: Record<string, any>, signal: AbortSignal): Promise<ResolveResponse<UserResponseInterface>> {
  return await Resolve.safe<UserResponseInterface>(
    apiClient.get('/api/usuario/', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createUsuario(data: Record<string, any>): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.post('/api/usuario/', data),
  );
}

export async function getUsuario(idUsuario: string, signal: AbortSignal): Promise<ResolveResponse<UserGetInterface>> {
  return await Resolve.safe<UserGetInterface>(
    apiClient.get(`/api/usuario/${idUsuario}`, {
      signal: signal,
    }),
  );
}

export async function updateUsuario(idUsuario: string, body: Record<string, any>): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.put(`/api/usuario/${idUsuario}`, body),
  );
}

export async function removeUsuario(idUsuario: string): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.delete(`/api/usuario/${idUsuario}`),
  );
}


export async function authenticateUsuario(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<AuthenticateInterface>> {
  return await Resolve.safe<AuthenticateInterface>(
    apiClient.post("/api/usuario/authenticate", body, {
      signal: signal,
    }),
  );
}

export async function refreshTokenUsuario(): Promise<ResolveResponse<AuthenticateInterface>> {
  return await Resolve.safe<AuthenticateInterface>(
    apiClient.get("/api/usuario/refresh-token"),
  );
}

export async function resetUsuario(body: Record<string, any>): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.post('/api/usuario/reset-password', body),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PERFIL
|--------------------------------------------------------------------------
*/

export async function optionsPerfil(signal: AbortSignal): Promise<ResolveResponse<ProfileOptionsInterface[]>> {
  return await Resolve.safe<ProfileOptionsInterface[]>(
    apiClient.get('/api/perfil/options', {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ALMACEN
|--------------------------------------------------------------------------
*/

export async function optionsAlmacen(idSucursal: string, signal: AbortSignal): Promise<ResolveResponse<StoreOptionsInterface[]>> {
  return await Resolve.safe<StoreOptionsInterface[]>(
    apiClient.get(`/api/almacen/${idSucursal}/options`, {
      signal: signal,
    }),
  );
}