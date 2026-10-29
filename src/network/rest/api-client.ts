import ErrorResponse from '@/model/class/error-response';
import Resolve, { ResolveResponse } from '@/model/class/resolve';
import SuccessResponse from '@/model/class/response';
import AlmacenInterface from '@/model/ts/interface/AlmacenInterface';
import SucursalInterface from '@/model/ts/interface/sucursal.interface';
import DashboardInterface from '@/model/ts/interface/dashboard.interface';
import axios, { AxiosRequestConfig } from 'axios';
import WebInterface from '@/model/ts/interface/web.interface';
import { DniInterface, RucInterface } from '@/model/ts/interface/dniruc.interface';
import PlazoInterface from '@/model/ts/interface/plazo.interface';

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


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PROGRESO DE DESCARGA
|--------------------------------------------------------------------------
*/

export async function downloadProgress(
  request: AxiosRequestConfig,
  signal: AbortSignal,
  onProgress?: (progress: {
    progress?: number;
    received: number;
    total: number;
  }) => void
) {

  const response = await apiClient.request({
    ...request,

    signal,
    responseType: 'blob',

    onDownloadProgress: (event) => {
      const total = event.total ?? 0;

      onProgress?.({
        progress: total
          ? Math.round((event.loaded / total) * 100)
          : undefined,
        received: event.loaded,
        total,
      });
    },
  });

  return response;
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE DASHBOARD
|--------------------------------------------------------------------------
*/

export async function dashboardInit(params: Record<string, any>, signal: AbortSignal): Promise<SuccessResponse | ErrorResponse> {
  return await Resolve.create<DashboardInterface>(
    apiClient.get('/api/dashboard/init', {
      params: params,
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SUCURSAL
|--------------------------------------------------------------------------
*/

export async function comboSucursal(signal: AbortSignal): Promise<ResolveResponse<SucursalInterface[]>> {
  return await Resolve.safe<SucursalInterface[]>(
    apiClient.get('/api/sucursal/combo', {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ALMACEN
|--------------------------------------------------------------------------
*/

export async function comboAlmacen(params, signal: AbortSignal): Promise<ResolveResponse<AlmacenInterface[]>> {
  return await Resolve.safe(
    apiClient.get('/api/almacen/combo', {
      params: params,
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE WEB
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE DNI/RUC
|--------------------------------------------------------------------------
*/
export async function getDni(documento: string, signal: AbortSignal = null): Promise<ResolveResponse<DniInterface>> {
  return await Resolve.safe(
    apiClient.get(`/api/dniruc/dni/${documento}`, {
      signal
    }),
  );
}

export async function getRuc(documento: string, signal: AbortSignal = null): Promise<ResolveResponse<RucInterface>> {
  return await Resolve.safe(
    apiClient.get(`/api/dniruc/ruc/${documento}`, {
      signal
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PLAZO
|--------------------------------------------------------------------------
*/
export async function comboPlazo(signal: AbortSignal): Promise<ResolveResponse<PlazoInterface[]>> {
  return await Resolve.safe<PlazoInterface[]>(
    apiClient.get("/api/plazo/combo", {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE WHATSAPP
|--------------------------------------------------------------------------
*/

export async function sendTextWhatsapp(body: { to: string, message: string }, signal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe(
    apiClient.post("/api/ycloud/text", body, {
      signal
    }),
  );
}

export async function sendDocumentWhatsapp(body: { to: string, url: string, filename: string, caption: string }, signal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe(
    apiClient.post("/api/ycloud/document", body, {
      signal
    }),
  );
}