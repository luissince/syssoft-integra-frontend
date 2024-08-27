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

export async function loginApi(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/login/createsession', {
      params: params,
      signal: signal,
    }),
  );
}

export async function validTokenApi() {
  return await Resolve.create(
    instancePrincipal.get('/api/login/validtoken'),
  );
}

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

export async function initSucursales(params,signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/sucursal/inicio', {
      params: params,
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

export async function getIdPersona(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/id', {
      signal: signal,
      params: params,
    }),
  );
}

export async function getPersonaPredeterminado(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/persona/predeterminado', {
      signal: signal,
    }),
  );
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
  return await Resolve.create(instancePrincipal.post('/api/producto', data));
}

export async function updateProducto(data) {
  return await Resolve.create(instancePrincipal.put('/api/producto', data));
}

export async function deleteProducto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/producto', {
      params: params,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA PRODUCTO
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

export async function listCpeSunat(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/list/cpesunat', {
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
    instancePrincipal.post('/api/factura/create', data));
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

export async function colletAccountsReceivableVenta(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/factura/collet/accounts/receivable', data, {
      signal: signal,
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

// ------------------------------------------------------------------------
// FIN PARA VENTA
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
export async function configEmpresa() {
  return await Resolve.create(instancePrincipal.get('/api/empresa/config'));
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
| ENDPOINTS DE INGRESO
|--------------------------------------------------------------------------
*/
export async function listIngreso(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/ingreso/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function cancelIngreso(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/ingreso/cancel', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA INGRESO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SALIDA
|--------------------------------------------------------------------------
*/
export async function listSalida(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/salida/list', {
      params: params,
      signal: signal,
    }),
  );
}

export async function cancelSalida(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/salida/cancel', {
      params: params,
      signal: signal,
    }),
  );
}
// ------------------------------------------------------------------------
// FIN PARA SALIDA
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

export async function accountsPayableCompra(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/compra/accounts/payable', {
      params: params,
      signal: signal,
    }),
  );
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

export async function detailCotizacionVenta(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cotizacion/detail/venta', {
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
// ------------------------------------------------------------------------
// FIN PARA COTIZACION
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

export async function sendEmailBoleta(params) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/email', {
      params: params,
    }),
  );
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
// ------------------------------------------------------------------------
// FIN PARA USUARIO
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE ACCESO
|--------------------------------------------------------------------------
*/
export async function getAccesos(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/acceso/accesos', {
      params: params,
      signal: signal,
    }),
  );
}

export async function saveAcceso(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/acceso/save', data, {
      signal: signal,
    }),
  );
}

export async function updateAcceso(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/acceso/update', data, {
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
| ENDPOINTS DE DECLARAR COMPROBANTES
|--------------------------------------------------------------------------
*/

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


// ------------------------------------------------------------------------
// FIN PARA REPORTES PDF, EXCEL
// ------------------------------------------------------------------------

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE REPORTES PDF, EXCEL
|--------------------------------------------------------------------------
*/

// Funciones relacionadas con la generación de PDF de documentos de facturación

export function obtenerVentaPdf(idVenta, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/venta/pdf/${tipo}/${idVenta}`
}

export async function obtenerPreVentaPdf(data, tipo, signal) {
  return await Resolve.create(
    instancePrincipal.post(`/api/reporte/facturacion/venta/pre/pdf/${tipo}`, data, {
      responseType: 'blob',
      signal: signal,
    })
  );
}

export function obtenerCotizacionPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/cotizacion/pdf/${tipo}/${idCotizacion}`
}

export async function obtenerPreCotizacionPdf(data, tipo, signal) {
  return await Resolve.create(
    instancePrincipal.post(`/api/reporte/facturacion/cotizacion/pre/pdf/${tipo}`, data, {
      responseType: 'blob',
      signal: signal,
    })
  );
}

export function obtenerPedidoCotizacionPdf(idCotizacion) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/cotizacion/pedido/pdf/a4/${idCotizacion}`
}

export function obtenerGuiaRemisionPdf(idGuiaRemision, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/guiaremision/pdf/${tipo}/${idGuiaRemision}`
}

export function obtenerCompraPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/compra/pdf/${tipo}/${idCotizacion}`
}

export function obtenerPreCompraPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/compra/pdf/${tipo}/${idCotizacion}`
}

export function obtenerCobroPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/cobro/pdf/${tipo}/${idCotizacion}`
}

export function obtenerPreCobroPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/cobro/pdf/${tipo}/${idCotizacion}`
}

export function obtenerGastoPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/gasto/pdf/${tipo}/${idCotizacion}`
}

export function obtenerPreGastoPdf(idCotizacion, tipo) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/facturacion/gasto/pdf/${tipo}/${idCotizacion}`
}

// Funciones relacionadas con la generación y descarga de reportes financieros

export function obtenerReporteVentaPdf(idSucursalGenerado, fechaInicio, fechaFinal, idComprobante, idSucursal, idUsuario) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/venta/pdf/${idSucursalGenerado}/${fechaInicio}/${fechaFinal}/${idComprobante}/${idSucursal}/${idUsuario}`
}

export function obtenerReporteVentaExcel(idSucursalGenerado, fechaInicio, fechaFinal, idComprobante, idSucursal, idUsuario) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/venta/excel/${idSucursalGenerado}/${fechaInicio}/${fechaFinal}/${idComprobante}/${idSucursal}/${idUsuario}`
}

export function obtenerReporteFinanzaPdf(idSucursalGenerado, fechaInicio, fechaFinal, idSucursal, idUsuario) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/financiero/pdf/${idSucursalGenerado}/${fechaInicio}/${fechaFinal}/${idSucursal}/${idUsuario}`
}

export function obtenerReporteFinanzaExcel(idSucursalGenerado, fechaInicio, fechaFinal, idSucursal, idUsuario) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/financiero/excel/${idSucursalGenerado}/${fechaInicio}/${fechaFinal}/${idSucursal}/${idUsuario}`
}

export function obtenerReporteCpeSunatExcel(idSucursalGenerado, fechaInicio, fechaFinal, idSucursal) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/cpesunat/excel/${idSucursalGenerado}/${fechaInicio}/${fechaFinal}/${idSucursal}`
}

export function obtenerXmlSunat(idComprobante) {
  return `${import.meta.env.VITE_APP_BACK_END}/api/reporte/cpesunat/xml/${idComprobante}`
}
// ------------------------------------------------------------------------
// FIN PARA REPORTES PDF, EXCEL
// ------------------------------------------------------------------------
