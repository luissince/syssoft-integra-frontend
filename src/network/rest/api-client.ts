import ErrorResponse from '@/model/class/error-response';
import Resolve from '@/model/class/resolve';
import SuccessResponse from '@/model/class/response';
import BranchInterface from '@/model/ts/interface/branch.interface';
import DashboardInterface from '@/model/ts/interface/dashboard.interface';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACK_END,
  timeout: 50000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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

export async function comboSucursal(signal: AbortSignal): Promise<SuccessResponse | ErrorResponse> {
  return await Resolve.create<BranchInterface[]>(
    apiClient.get('/api/sucursal/combo', {
      signal: signal,
    }),
  );
}