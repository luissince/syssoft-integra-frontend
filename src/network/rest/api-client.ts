import ErrorResponse from '@/model/class/error-response';
import Resolve, { ResolveResponse } from '@/model/class/resolve';
import SuccessResponse from '@/model/class/response';
import AlmacenInterface from '@/model/ts/interface/AlmacenInterface';
import SucursalInterface from '@/model/ts/interface/sucursal.interface';
import DashboardInterface from '@/model/ts/interface/dashboard.interface';
import axios from 'axios';
import WebInterface from '@/model/ts/interface/WebInterface';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACK_END,
  timeout: 50000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-App': 'admin-react',
    // 'X-Version': import.meta.env.VITE_APP_VERSION,
  },
});

apiClient.interceptors.request.use((config) => {
  const data = JSON.parse(window.localStorage.getItem('login'));
  if (data !== null) {
    config.headers.Authorization = 'Bearer ' + data.token;
  }
  return config;
});

export async function dashboardInit(params: Record<string, any>, signal: AbortSignal): Promise<SuccessResponse | ErrorResponse> {
  return await Resolve.create<DashboardInterface>(
    apiClient.get('/api/dashboard/init', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboSucursal(signal: AbortSignal): Promise<ResolveResponse<SucursalInterface[]>> {
  return await Resolve.safe<SucursalInterface[]>(
    apiClient.get('/api/sucursal/combo', {
      signal: signal,
    }),
  );
}

export async function comboAlmacen(params, signal: AbortSignal): Promise<ResolveResponse<AlmacenInterface[]>> {
  return await Resolve.safe(
    apiClient.get('/api/almacen/combo', {
      params: params,
      signal: signal,
    }),
  );
}

export async function processWeb(body, signal: AbortSignal): Promise<ResolveResponse<string>> {
  return await Resolve.safe(
    apiClient.post('/api/web/', body, {
      signal
    }),
  );
}

export async function getIdWeb(signal: AbortSignal): Promise<ResolveResponse<WebInterface>> {
  return await Resolve.safe(
    apiClient.get(`/api/web`, {
      signal
    }),
  );
}