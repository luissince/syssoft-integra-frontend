import axios from 'axios';
import Resolve from '../../model/class/resolve';

const instancePrincipal = axios.create({
  baseURL: import.meta.env.VITE_APP_BACK_END,
  timeout: 50000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

instancePrincipal.interceptors.request.use((config) => {
  const data = JSON.parse(window.localStorage.getItem('login'));
  if (data !== null) {
    config.headers.Authorization = 'Bearer ' + data.token;
  }
  return config;
});

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE DASHBOARD
|--------------------------------------------------------------------------
*/

export async function dashboardInit(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/dashboard/init', {
      params: params,
      signal: signal,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA DASHBOARD
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SUCURSAL
|--------------------------------------------------------------------------
*/
export async function listSucursales(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sucursal/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function initSucursales(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sucursal/inicio', {
      signal: signal,
    }),
  );
}

export async function getIdSucursal(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sucursal/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboSucursal(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sucursal/combo', {
      signal: signal,
    }),
  );
}

export async function addSucursal(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/sucursal', data, {
      signal: signal,
    }),
  );
}

export async function updateSucursal(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/sucursal', data, {
      signal: signal,
    }),
  );
}

export async function deleteSucursal(idSucursal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/sucursal', {
      params: {
        idSucursal: idSucursal,
      },
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA SUCURSAL
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE CLIENTE
|--------------------------------------------------------------------------
*/
export async function listPersonas(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function listPersonasCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/list/clientes', {
      signal: signal,
      params: params,
    }),
  );
}

export async function listPersonasProveedor(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/list/proveedores', {
      signal: signal,
      params: params,
    }),
  );
}

export async function listPersonasConductor(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/list/conductores', {
      signal: signal,
      params: params,
    }),
  );
}

export async function comboPersona(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/combo', {
      signal: signal,
    }),
  );
}

export async function filtrarPersona(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/filtrar', {
      params: params,
      signal: signal
    }),
  );
}

export async function createPersona(params) {
  return await Resolve.create(
    instancePrincipal.post('/api/persona/create', params),
  );
}

export async function editPersona(params) {
  return await Resolve.create(
    instancePrincipal.post('/api/persona/update', params),
  );
}

export async function deletePersona(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/persona', {
      params: params,
    }),
  );
}

export async function preferredPersona(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/preferred', {
      params: params,
    }),
  );
}

export async function getIdPersona(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getPreferidoPersona(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/predeterminado', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfReportsPersonaCliente() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/persona/cliente/documents/pdf/reports`
}

export function documentsExcelPersonaCliente() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/persona/cliente/documents/excel`
}

export function documentsPdfReportsPersonaProveedor() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/persona/proveedor/documents/pdf/reports`
}

export function documentsExcelPersonaProveedor() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/persona/proveedor/documents/excel`
}
// ------------------------------------------------------------------------
// FIN PARA CLIENTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE INVENTARIO
|--------------------------------------------------------------------------
*/
export async function listInventario(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/inventario/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function obtenerStockInventario(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/inventario/obtener/stock', {
      params: params,
      signal: signal,
    }),
  );
}

export async function actualizarStockInventario(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/inventario/actualizar/stock', data, {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA INVENTARIO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PRODUCTO
|--------------------------------------------------------------------------
*/
export function filtrarStreamProductoVenta(params) {
  return `${instancePrincipal.defaults.baseURL}/api/producto/filtrar/venta?${params.toString()}`
}

export async function listProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function productoDetalle(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/detalle', {
      signal: signal,
      params: params,
    }),
  );
}

export async function comboProductos(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/combo', {
      signal: signal,
    }),
  );
}

export async function filtrarProductoVenta(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/filtrar/venta', {
      params: params,
    }),
  );
}

export async function filtrarProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/filter', {
      params: params,
      signal: signal
    }),
  );
}

export async function filtrarAlmacenProducto(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/filter/almacen', {
      params: params,
    }),
  );
}

export async function preferidosProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/preferidos', {
      params: params,
      signal: signal,
    }),
  );
}

export async function obtenerListaPrecioProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/lista/precios', {
      params: params,
      signal: signal
    }),
  );
}

export async function establecerPreferidoProducto(data) {
  return await Resolve.create(
    instancePrincipal.put('/api/producto/establecer/preferido', data),
  );
}

export async function addProducto(data) {
  return await Resolve.create(instancePrincipal.post('/api/producto', data),);
}

export async function updateProducto(data) {
  return await Resolve.create(instancePrincipal.put('/api/producto', data),);
}

export async function deleteProducto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/producto', {
      params: params,
    }),
  );
}


export function documentsPdfReportsProducto() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/producto/documents/pdf/reports`
}

export function documentsExcelProducto() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/producto/documents/excel`
}

export function documentsPdfCodbarProducto() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/producto/documents/pdf/codbar`
}

// ------------------------------------------------------------------------
// FIN PARA PRODUCTO
// ------------------------------------------------------------------------


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE CATÁLOGO
|--------------------------------------------------------------------------
*/

export async function listCatalogo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/catalogo/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdCatalogo(idCatalogo, signal) {
  return await Resolve.create(
    instancePrincipal.get(`/api/catalogo/id/${idCatalogo}`, {
      signal: signal,
    }),
  );
}

export async function detailCatalogo(idCatalogo, signal) {
  return await Resolve.create(
    instancePrincipal.get(`/api/catalogo/detail/${idCatalogo}`, {
      signal: signal,
    }),
  );
}

export async function createCatalogo(data) {
  return await Resolve.create(instancePrincipal.post('/api/catalogo/create', data),);
}

export async function updateCatalogo(data) {
  return await Resolve.create(instancePrincipal.post('/api/catalogo/update', data),);
}

export function documentsPdfCatalogo(idCatalogo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/catalogo/documents/pdf/${idCatalogo}`
}

// ------------------------------------------------------------------------
// FIN PARA CATÁLOGO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ALMACEN
|--------------------------------------------------------------------------
*/
export async function listAlmacen(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdAlmacen(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function addAlmacen(data) {
  return await Resolve.create(instancePrincipal.post('/api/almacen/add', data));
}

export async function updateAlmacen(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/almacen/update', data),
  );
}

export async function deleteAlmacen(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/almacen/delete', {
      data: params,
    }),
  );
}

export async function comboAlmacen(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/combo', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA ALMACEN
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE VENTA
|--------------------------------------------------------------------------
*/
export async function listVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/list', {
      signal: signal,
      params: params,
    }),
  );
}


export async function listFiltrarVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/filtrar', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createVenta(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/factura/create', data)
  );
}

export async function detailVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/detail', {
      signal: signal,
      params: params,
    }),
  );
}

export async function detailOnlyVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/detail/only', {
      signal: signal,
      params: params,
    }),
  );
}

export async function detailOnlyVentaVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/detail/venta', {
      signal: signal,
      params: params,
    }),
  );
}

export async function cancelVenta(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/factura/cancel', {
      params: params,
    }),
  );
}

export async function listAccountsReceivableVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/list/accounts/receivable', {
      signal: signal,
      params: params,
    }),
  );
}

export async function detailAccountsReceivableVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/detail/accounts/receivable', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createAccountsReceivableVenta(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/factura/create/accounts/receivable', data, {
      signal: signal,
    }),
  );
}

export async function cancelAccountsReceivableVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/factura/cancel/accounts/receivable', {
      params: params,
      signal: signal,
    }),
  );
}

export async function dashboardVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/dashboard', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesVenta(idVenta, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/factura/documents/pdf/invoices/${idVenta}/${size}`
}

export function documentsPdfAccountReceivableVenta(idCuota, idVenta, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/factura/documents/pdf/account/receivable/${idCuota}/${idVenta}/${size}`
}

export function documentsPdfReportsVenta() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/factura/documents/pdf/reports`
}

export function documentsExcelVenta() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/factura/documents/excel`
}

// ------------------------------------------------------------------------
// FIN PARA VENTA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TRANSACCION
|--------------------------------------------------------------------------
*/

export async function listTransaccion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/transaccion/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function dashboardTransaccion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/transaccion/dashboard', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfReportsTransaccion(params) {
  const baseUrl = `${import.meta.env.VITE_APP_BACK_END}/api/transaccion/documents/pdf/reports`;

  // Crear una instancia de URLSearchParams para manejar los parámetros
  const queryParams = new URLSearchParams();

  // Agregar cada parámetro a URLSearchParams
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      queryParams.append(key, params[key]);
    }
  }

  // Construir la URL completa con los parámetros
  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

  return fullUrl;
}

// ------------------------------------------------------------------------
// FIN PARA TRANSACCION
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MONEDA
|--------------------------------------------------------------------------
*/
export async function listMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/moneda/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function getIdMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/moneda/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboMoneda(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/moneda/combo', {
      signal: signal,
    }),
  );
}

export async function nacionalMoneda(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/moneda/nacional', {
      signal: signal,
    }),
  );
}

export async function addMoneda(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/moneda/add', data),
  );
}

export async function editMoneda(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/moneda/update', data, {
      signal: signal,
    }),
  );
}

export async function deleteMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/moneda', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA MONEDA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE EMPRESA
|--------------------------------------------------------------------------
*/
export async function configEmpresa(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/empresa/config', {
      signal: signal
    }),
  );
}

export async function getIdEmpresa(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/empresa/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function updateEmpresa(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/empresa/update', data, {
      signal: signal,
    }),
  );
}

export async function loadEmpresa(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/empresa/load', {
      signal: signal,
    }),
  );
}

export async function comboEmpresa(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/empresa/combo', {
      signal: signal,
    }),
  );
}

export async function saveEmpresa(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/empresa/save', data, {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA EMPRESA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE AJUSTE
|--------------------------------------------------------------------------
*/
export async function listAjuste(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ajuste/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailAjuste(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ajuste/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createAjuste(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/ajuste/create', data, {
      signal: signal,
    }),
  );
}

export async function cancelAjuste(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/ajuste/cancel', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA AJUSTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TRASLADO
|--------------------------------------------------------------------------
*/
export async function listTraslado(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/traslado/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailTraslado(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/traslado/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createTraslado(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/traslado/create', data, {
      signal: signal,
    }),
  );
}

export async function cancelTraslado(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/traslado/cancel', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TRASLADO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TIPO TRASLADO
|--------------------------------------------------------------------------
*/
export async function comboTipoTraslado(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipotraslado/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO TRASLADO
// ------------------------------------------------------------------------


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MOTIVO AJUSTE
|--------------------------------------------------------------------------
*/
export async function comboMotivoAjuste(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/motivoajuste/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA MOTIVO AJUSTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TIPO AJUSTE
|--------------------------------------------------------------------------
*/
export async function comboTipoAjuste(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipoajuste/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO AJUSTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TIPO ATRIBUTO
|--------------------------------------------------------------------------
*/
export async function comboTipoAtributo(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipoatributo/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO ATRIBUTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE COMPRA
|--------------------------------------------------------------------------
*/
export async function listCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/compra/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/compra/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createCompra(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/compra/create', data, {
      signal: signal,
    }),
  );
}

export async function cancelCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/compra/cancel', {
      params: params,
      signal: signal,
    }),
  );
}

export async function listAccountsPayableCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/compra/list/accounts/payable', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailAccountsPayableCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/compra/detail/accounts/payable', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createAccountsPayableCompra(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/compra/create/accounts/payable', data, {
      signal: signal,
    }),
  );
}

export async function cancelAccountsPayableCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/compra/cancel/accounts/payable', {
      params: params,
      signal: signal,
    }),
  );
}

export async function dashboardCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/compra/dashboard', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesCompra(idCompra, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/compra/documents/pdf/invoices/${idCompra}/${size}`
}

export function documentsPdfAccountPayableCompra(idPlazo, idCompra, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/compra/documents/pdf/account/payable/${idPlazo}/${idCompra}/${size}`
}

export function documentsPdfReportsCompra() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/compra/documents/pdf/reports`
}

export function documentsExcelCompra() {
  return `${import.meta.env.VITE_APP_BACK_END}/api/compra/documents/excel`
}
// ------------------------------------------------------------------------
// FIN PARA COMPRA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE GUÍA DE REMISIÓN
|--------------------------------------------------------------------------
*/
export async function listGuiaRemision(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/guiaremision/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function idGuiaRemision(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/guiaremision/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailGuiaRemision(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/guiaremision/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailUpdateGuiaRemision(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/guiaremision/detail/update', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createGuiaRemision(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/guiaremision/create', data, {
      signal: signal,
    }),
  );
}

export async function updateGuiaRemision(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/guiaremision/update', data, {
      signal: signal,
    }),
  );
}

export async function cancelGuiaRemision(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/guiaremision/cancel', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesGuiaRemision(idGuiaRemision, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/guiaremision/documents/pdf/invoices/${idGuiaRemision}/${size}`
}
// ------------------------------------------------------------------------
// FIN PARA GUÍA DE REMISIÓN
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE COTIZACION
|--------------------------------------------------------------------------
*/
export async function listCotizacion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cotizacion/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function idCotizacion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cotizacion/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailCotizacion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cotizacion/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function forSaleCotizacion(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cotizacion/for-sale', {
      params: params,
      signal: signal,
    }),
  );
}

export async function createCotizacion(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cotizacion/create', data, {
      signal: signal,
    }),
  );
}

export async function updateCotizacion(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/cotizacion/update', data, {
      signal: signal,
    }),
  );
}

export async function cancelCotizacion(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/cotizacion/cancel', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesCotizacion(idCotizacion, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/cotizacion/documents/pdf/invoices/${idCotizacion}/${size}`
}

export function documentsPdfListsCotizacion(idCotizacion) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/cotizacion/documents/pdf/lists/${idCotizacion}`
}
// ------------------------------------------------------------------------
// FIN PARA COTIZACION
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ORDEN DE COMPRA
|--------------------------------------------------------------------------
*/
export async function listOrdenCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ordencompra/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function idOrdenCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ordencompra/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailOrdenCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ordencompra/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function forPurchaseOrdenCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ordencompra/for-purchase', {
      params: params,
      signal: signal,
    }),
  );
}


export async function createOrdenCompra(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/ordencompra/create', data, {
      signal: signal,
    }),
  );
}

export async function updateOrdenCompra(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/ordencompra/update', data, {
      signal: signal,
    }),
  );
}

export async function cancelOrdenCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/ordencompra/cancel', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesOrdenCompra(idOrdenCompra, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/ordencompra/documents/pdf/invoices/${idOrdenCompra}/${size}`
}

export function documentsPdfListsOrdenCompra(idOrdenCompra) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/ordencompra/documents/pdf/lists/${idOrdenCompra}`
}
// ------------------------------------------------------------------------
// FIN PARA ORDEN DE COMPRA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PEDIDO
|--------------------------------------------------------------------------
*/
export async function listPedido(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/pedido/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function idPedido(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/pedido/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailPedido(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/pedido/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function forSalePedido(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/pedido/for-sale', {
      params: params,
      signal: signal,
    }),
  );
}


export async function createPedido(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/pedido/create', data, {
      signal: signal,
    }),
  );
}

export async function updatePedido(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/pedido/update', data, {
      signal: signal,
    }),
  );
}

export async function cancelPedido(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/pedido/cancel', {
      params: params,
      signal: signal,
    }),
  );
}

export function documentsPdfInvoicesPedido(idOrdenCompra, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/pedido/documents/pdf/invoices/${idOrdenCompra}/${size}`
}

export function documentsPdfListsPedido(idOrdenCompra) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/pedido/documents/pdf/lists/${idOrdenCompra}`
}
// ------------------------------------------------------------------------
// FIN PARA PEDIDO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE COBRO
|--------------------------------------------------------------------------
*/
export async function listCobro(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createCobro(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cobro/create', data, {
      signal: signal,
    }),
  );
}

export async function detailCobro(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/detail', {
      signal: signal,
      params: params,
    }),
  );
}

export async function cancelCobro(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/cobro/cancel', {
      signal: signal,
      params: params,
    }),
  );
}

export function documentsPdfInvoicesCobro(idCobro, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/cobro/documents/pdf/invoices/${idCobro}/${size}`
}

// ------------------------------------------------------------------------
// FIN PARA COBRO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE GASTO
|--------------------------------------------------------------------------
*/
export async function listGasto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/gasto/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function createGasto(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/gasto/create', data, {
      signal: signal,
    }),
  );
}

export async function detailGasto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/gasto/detail', {
      signal: signal,
      params: params,
    }),
  );
}

export async function cancelGasto(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/gasto/cancel', {
      signal: signal,
      params: params,
    }),
  );
}

export function documentsPdfInvoicesGasto(idGasto, size) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/gasto/documents/pdf/invoices/${idGasto}/${size}`
}
// ------------------------------------------------------------------------
// FIN PARA GASTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE CONCEPTO
|--------------------------------------------------------------------------
*/
export async function getIdConcepto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function listConceptos(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addConcepto(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/concepto/add', data, {
      signal: signal,
    }),
  );
}

export async function editConcepto(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/concepto/update', data, {
      signal: signal,
    }),
  );
}

export async function removeConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.delete('/api/concepto', {
      params: params,
      signal: signal,
    }),
  );
}

export async function filtrarCobroConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/filtrar/cobro', {
      params: params,
      signal: signal,
    }),
  );
}

export async function filtrarGastoConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/filtrar/gasto', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA CONCEPTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE IMPUESTO
|--------------------------------------------------------------------------
*/
export async function listImpuesto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/impuesto/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function geIdImpuesto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/impuesto/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function comboImpuesto(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/impuesto/combo', {
      signal: signal,
    }),
  );
}

export async function addImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/add', data),
  );
}

export async function editImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/edit', data),
  );
}

export async function deleteImpuesto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/impuesto', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA IMPUESTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE IMPUESTO
|--------------------------------------------------------------------------
*/
export async function listVehiculo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/vehiculo/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdVehiculo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/vehiculo/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function filtrarVehiculo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/vehiculo/filter', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addVehiculo(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/vehiculo/add', data),
  );
}

export async function editVehiculo(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/vehiculo/edit', data),
  );
}

export async function getDefaultVehiculo(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/vehiculo/default', {
      params: params,
    }),
  );
}

export async function deleteVehiculo(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/vehiculo', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA IMPUESTO
// ------------------------------------------------------------------------


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE COMPROBANTE
|--------------------------------------------------------------------------
*/
export async function listComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/comprobante/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function comboComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/comprobante/combo', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/comprobante/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function addComprobante(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/comprobante/add', data, {
      signal: signal,
    }),
  );
}

export async function editComprobante(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/comprobante/edit', data, {
      signal: signal,
    }),
  );
}

export async function deleteComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/comprobante', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA COMPROBANTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE CATEGORIA
|--------------------------------------------------------------------------
*/
export async function listCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/categoria/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/categoria/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.post('/api/categoria/', data),
  );
}

export async function updateCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.put('/api/categoria', data),
  );
}

export async function removeCategoria(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/categoria', {
      params: params,
    }),
  );
}

export async function comboCategoria(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/categoria/combo', {
      signal: signal,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA CATEGORIA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MARCA
|--------------------------------------------------------------------------
*/
export async function listMarca(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/marca/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdMarca(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/marca/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addMarca(data) {
  return await Resolve.create(
    await instancePrincipal.post('/api/marca/', data),
  );
}

export async function updateMarca(data) {
  return await Resolve.create(
    await instancePrincipal.put('/api/marca', data),
  );
}

export async function removeMarca(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/marca', {
      params: params,
    }),
  );
}

export async function comboMarca(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/marca/combo', {
      signal: signal,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA MARCA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ATRIBUTO
|--------------------------------------------------------------------------
*/
export async function listAtributo(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/atributo/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdAtributo(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/atributo/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addAtributo(data) {
  return await Resolve.create(
    await instancePrincipal.post('/api/atributo/', data),
  );
}

export async function updateAtributo(data) {
  return await Resolve.create(
    await instancePrincipal.put('/api/atributo', data),
  );
}

export async function removeAtributo(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/atributo', {
      params: params,
    }),
  );
}

export async function comboAtributo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/atributo/combo', {
      signal: signal,
      params: params,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA ATRIBUTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE BANCO
|--------------------------------------------------------------------------
*/
export async function listBancos(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/banco/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function detailtBanco(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/banco/detail', {
      params: params,
      signal: signal,
    }),
  );
}

export async function detailtListBanco(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/banco/detail/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboBanco(idSucursal, signal) {
  return await Resolve.create(
    instancePrincipal.get(`/api/banco/combo/${idSucursal}`, {
      signal: signal,
    }),
  );
}

export async function addBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/banco/', data, {
      signal: signal,
    }),
  );
}

export async function getIdBando(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/banco/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function updateBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.put('/api/banco/', data, {
      signal: signal,
    }),
  );
}

export async function deleteBanco(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/banco/', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA BANCO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE UBIGEO
|--------------------------------------------------------------------------
*/
export async function getUbigeo(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/ubigeo/', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA UBIGEO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TIPO DE DOCUMENTO
|--------------------------------------------------------------------------
*/
export async function comboTipoDocumento(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipodocumento/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO DE DOCUMENTO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MEDIDA
|--------------------------------------------------------------------------
*/
export async function listarMedida(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/medida/list', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getIdMedida(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/medida/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function addMedida(data) {
  return await Resolve.create(
    await instancePrincipal.post('/api/medida/', data),
  );
}

export async function updateMedida(data) {
  return await Resolve.create(
    await instancePrincipal.put('/api/medida', data)
  );
}

export async function removeMedida(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/medida', {
      params: params,
    }),
  );
}

export async function comboMedida(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/medida/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA MEDIDA
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE NOTA DE CRÉDITO
|--------------------------------------------------------------------------
*/
export async function sendEmailNotaCredito(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/notacredito/email', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA NOTA DE CRÉDITO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE KARDEX
|--------------------------------------------------------------------------
*/
export async function listKardex(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/kardex/list', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA KARDEX
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE TIPO DE COMPROBANTE
|--------------------------------------------------------------------------
*/
export async function comboTipoComprobante(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipocomprobante/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO DE COMPROBANTE
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MODALIDAD TRASLADO
|--------------------------------------------------------------------------
*/
export async function comboModalidadTraslado(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/modalidadtraslado/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA MODALIDAD TRASLADO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MODALIDAD TRASLADO
|--------------------------------------------------------------------------
*/
export async function comboTipoPeso(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/tipopeso/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA MODALIDAD TRASLADO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE MOTIVO TRASLADO
|--------------------------------------------------------------------------
*/
export async function comboMotivoTraslado(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/motivotraslado/combo', {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA TIPO DE MOTIVO TRASLADO
// ------------------------------------------------------------------------


/*
|--------------------------------------------------------------------------
| ENDPOINTS DE PERFIL
|--------------------------------------------------------------------------
*/
export async function listPerfil(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/perfil/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function getIdPerfil(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/perfil/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function addPerfil(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/perfil/add', data, {
      signal: signal,
    }),
  );
}

export async function updatePerfil(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/perfil/update', data, {
      signal: signal,
    }),
  );
}

export async function removePerfil(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/perfil', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboPerfil(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/perfil/combo', {
      signal: signal,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA PERFIL
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE USUARIO
|--------------------------------------------------------------------------
*/
export async function listUsuario(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/usuario/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function getIdUsuario(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/usuario/id', {
      params: params,
      signal: signal,
    }),
  );
}

export async function comboUsuario(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/usuario/combo', {
      signal: signal,
    }),
  );
}

export async function addUsuario(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/usuario/', data, {
      signal: signal,
    }),
  );
}

export async function updateUsuario(data, signal) {
  return await Resolve.create(
    instancePrincipal.put('/api/usuario/', data, {
      signal: signal,
    }),
  );
}

export async function resetUsuario(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/usuario/reset', data, {
      signal: signal,
    }),
  );
}

export async function removeUsuario(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/usuario', {
      params: params,
      signal: signal,
    }),
  );
}

export async function loginApi(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/usuario/login', data, {
      signal: signal,
    }),
  );
}

export async function validToken() {
  return await Resolve.create(
    instancePrincipal.get('/api/usuario/valid/token'),
  );
}
// ------------------------------------------------------------------------
// FIN PARA USUARIO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ACCESO
|--------------------------------------------------------------------------
*/
export async function findOneAcceso(idPerfil, signal) {
  return await Resolve.create(
    instancePrincipal.get(`/api/acceso/${idPerfil}`, {
      signal: signal,
    }),
  );
}

export async function saveAcceso(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/acceso', data, {
      signal: signal,
    }),
  );
}

export async function updateAcceso(data, signal) {
  return await Resolve.create(
    instancePrincipal.patch('/api/acceso', data, {
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA ACCESO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE NOTIFICACION
|--------------------------------------------------------------------------
*/
export async function listNotificacion(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/notificacion/list', {
      signal: signal,
    }),
  );
}

export async function detailNotifications(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/notificacion/detailt', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA NOTIFICACION
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SUNAT
|--------------------------------------------------------------------------
*/

export async function listCpeSunat(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sunat/list/cpesunat', {
      signal: signal,
      params: params,
    }),
  );
}

export async function facturarCpeSunat(idVenta) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/facturar/${idVenta}`),
  );
}

export async function anularBoletaCpeSunat(idVenta) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/anular/boleta/${idVenta}`),
  );
}

export async function anularFacturaCpeSunat(idVenta) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/anular/factura/${idVenta}`),
  );
}

export async function guiaRemisionCpeSunat(idGuiaRemision) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/guia/remision/${idGuiaRemision}`),
  );
}

export async function consultarCpeSunat(ruc, usuario, clave, tipoComprobante, serie, numeracion) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/consultar/${ruc}/${usuario}/${clave}/${tipoComprobante}/${serie}/${numeracion}`),
  );
}

export async function cdrCpeSunat(ruc, usuario, clave, tipoComprobante, serie, numeracion) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/cdr/${ruc}/${usuario}/${clave}/${tipoComprobante}/${serie}/${numeracion}`),
  );
}

export async function enviarEmail(idComprobante, tipo) {
  return await Resolve.create(
    instancePrincipal.get(`/api/sunat/email/${idComprobante}/${tipo}`),
  );
}

export function obtenerXmlSunat(idComprobante) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/sunat/xml/${idComprobante}`
}

export async function dashboardSunat(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sunat/dashboard', {
      params: params,
      signal: signal,
    }),
  );
}

// ------------------------------------------------------------------------
// FIN PARA SUNAT
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE REPORTES PDF, EXCEL
|--------------------------------------------------------------------------
*/


export async function obtenerPreVentaPdf(data, tipo, signal) {
  return await Resolve.create(
    instancePrincipal.post(`/api/reporte/facturacion/venta/pre/pdf/${tipo}`, data, {
      responseType: 'blob',
      signal: signal,
    })
  );
}

export async function obtenerPreCotizacionPdf(data, tipo, signal) {
  return await Resolve.create(
    instancePrincipal.post(`/api/reporte/facturacion/cotizacion/pre/pdf/${tipo}`, data, {
      responseType: 'blob',
      signal: signal,
    })
  );
}

// ------------------------------------------------------------------------
// FIN PARA REPORTES PDF, EXCEL
// ------------------------------------------------------------------------
