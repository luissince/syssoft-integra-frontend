import ErrorResponse from '@/model/class/error-response';
import Resolve, { ResolveResponse } from '@/model/class/resolve';
import SuccessResponse from '@/model/class/response';
import { AssetMetricsInterface, AssetResponseInterface } from '@/model/ts/interface/asset';
import BranchInterface from '@/model/ts/interface/branch';
import { CreditNoteGetInterface, CreditNoteResponseInterface } from '@/model/ts/interface/credit-note';
import { CreditNotesReasonsOptionsInterface } from '@/model/ts/interface/credit-notes-reasons';
import DashboardInterface from '@/model/ts/interface/dashboard';
import { GestionListInterface } from '@/model/ts/interface/gestion';
import { InventoryDashboardInterface } from '@/model/ts/interface/inventory';
import { KardexResponseListDepreciacionInterface } from '@/model/ts/interface/kardex';
import { ProfileOptionsInterface } from '@/model/ts/interface/profile';
import { SaleFilterAllInterface, SaleGetIdInterface } from '@/model/ts/interface/sale';
import { AuthenticateInterface, UserGetInterface, UserResponseInterface } from '@/model/ts/interface/user';
import { WarehouseOptionsInterface } from '@/model/ts/interface/warehouse';
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

apiClient.interceptors.response.use((response) => {

  console.log(response.status);

  return response;
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

export async function optionsAlmacen(idSucursal: string, signal: AbortSignal): Promise<ResolveResponse<WarehouseOptionsInterface[]>> {
  return await Resolve.safe<WarehouseOptionsInterface[]>(
    apiClient.get(`/api/almacen/${idSucursal}/options`, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MOTIVO AJUSTE
|--------------------------------------------------------------------------
*/

export async function optionsMotivo(signal: AbortSignal): Promise<ResolveResponse<CreditNotesReasonsOptionsInterface[]>> {
  return await Resolve.safe<CreditNotesReasonsOptionsInterface[]>(
    apiClient.get(`/api/motivo/options`, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE VENTA
|--------------------------------------------------------------------------
*/

export async function filterAllVenta(params: Record<string, any>, signal: AbortSignal): Promise<SuccessResponse<SaleFilterAllInterface[]> | ErrorResponse> {
  return await Resolve.resolve<SaleFilterAllInterface[]>(
    apiClient.get('/api/venta/filter-all', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getByIdVenta(idVenta, signal): Promise<ResolveResponse<SaleGetIdInterface>> {
  return await Resolve.safe<SaleGetIdInterface>(
    apiClient.get(`/api/venta/${idVenta}`, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE KARDEX
|--------------------------------------------------------------------------
*/
export async function listKardex(params: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<any>> {
  return await Resolve.safe<any>(
    apiClient.get('/api/kardex', {
      params: params,
      signal: signal,
    }),
  );
}

export async function listarBienKardex(params: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<AssetResponseInterface>> {
  return await Resolve.safe<AssetResponseInterface>(
    apiClient.get('/api/kardex/asset/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function listarDepreciacionKardex(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<KardexResponseListDepreciacionInterface>> {
  return await Resolve.safe<KardexResponseListDepreciacionInterface>(
    apiClient.post('/api/kardex/depreciacion/list', body, {
      signal: signal,
    }),
  );
}

export async function listarDepreciacionDevolucion(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<KardexResponseListDepreciacionInterface>> {
  return await Resolve.safe<KardexResponseListDepreciacionInterface>(
    apiClient.post('/api/kardex/depreciacion/devolver', body, {
      signal: signal,
    }),
  );
}

export async function metricasDepreciacionKardex(params: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<AssetMetricsInterface>> {
  return await Resolve.safe<AssetMetricsInterface>(
    apiClient.get('/api/kardex/depreciacion/metrics', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detalleDepreciacionKardex(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<any>> {
  return await Resolve.safe<any>(
    apiClient.post('/api/kardex/depreciacion/detalle', body, {
      signal: signal,
    }),
  );
}

export async function createDepreciacionKardex(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.post('/api/kardex/depreciacion/create', body, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE NOTA DE CRÉDITO
|--------------------------------------------------------------------------
*/
export async function listNotaCredito(params: Record<string, any>, signal: AbortSignal): Promise<ResolveResponse<CreditNoteResponseInterface>> {
  return await Resolve.safe(
    apiClient.get('/api/notacredito/', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createNotaCredito(body: Record<string, any>) {
  return await Resolve.safe<string>(
    apiClient.post('/api/notacredito/', body),
  );
}

export async function getByIdNotaCredito(idNotaCredito: string, signal: AbortSignal): Promise<ResolveResponse<CreditNoteGetInterface>> {
  return await Resolve.safe<CreditNoteGetInterface>(
    apiClient.get(`/api/notacredito/${idNotaCredito}`, {
      signal: signal
    }),
  );
}

export function pdfNotaCredito(idNotaCredito: string, size: string, outputType: string = "pdf"): string {
  return `${import.meta.env.VITE_APP_BACK_END}/api/notacredito/${idNotaCredito}/pdf/${size}/${outputType}`;
}


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE GESTION
|--------------------------------------------------------------------------
*/

export async function listGestion(params: Record<string, any>, signal: AbortSignal): Promise<ResolveResponse<GestionListInterface>> {
  return await Resolve.safe(
    apiClient.get('/api/activo-gestion/', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createGestion(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.post('/api/activo-gestion/', body, {
      signal: signal,
    }),
  );
}

export async function devolverGestion(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.post('/api/activo-gestion/devolver', body, {
      signal: signal,
    }),
  );
}

export async function updateGestion(body: Record<string, any>, signal: AbortSignal = null): Promise<ResolveResponse<string>> {
  return await Resolve.safe<string>(
    apiClient.put('/api/activo-gestion/', body, {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE AREA
|--------------------------------------------------------------------------
*/

export async function listArea(params: Record<string, any>, signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get('/api/area', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createArea(data: Record<string, any>) {
  return await Resolve.resolve(
    apiClient.post('/api/area', data),
  );
}

export async function updateArea(data: Record<string, any>) {
  return await Resolve.resolve(
    apiClient.put('/api/area', data),
  );
}

export async function getIdArea(idArea: string, signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get(`/api/area/${idArea}/id`, {
      signal: signal,
    }),
  );
}

export async function removeArea(idArea: string) {
  return await Resolve.resolve(
    apiClient.delete(`/api/area/${idArea}`),
  );
}

export async function comboArea(signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get('/api/area/options', {
      signal: signal,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE CARGO
|--------------------------------------------------------------------------
*/

export async function listCargo(params: Record<string, any>, signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get('/api/cargo', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createCargo(data: Record<string, any>) {
  return await Resolve.resolve(
    apiClient.post('/api/cargo', data),
  );
}

export async function updateCargo(data: Record<string, any>) {
  return await Resolve.resolve(
    apiClient.put('/api/cargo', data),
  );
}

export async function getIdCargo(idCargo: string, signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get(`/api/cargo/${idCargo}/id`, {
      signal: signal,
    }),
  );
}

export async function removeCargo(idCargo: string) {
  return await Resolve.resolve(
    apiClient.delete(`/api/cargo/${idCargo}/id`),
  );
}

export async function comboCargo(signal: AbortSignal = null) {
  return await Resolve.resolve(
    apiClient.get('/api/cargo/options', {
      signal: signal,
    }),
  );
}