import axios from "axios";
import Resolve from "../../model/class/resolve";

const instancePrincipal = axios.create({
  baseURL: process.env.REACT_APP_END_POINT,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

instancePrincipal.interceptors.request.use((config) => {
  const data = JSON.parse(window.localStorage.getItem("login"));
  if (data !== null) {
    config.headers.Authorization = "Bearer " + data.token;
  }
  return config;
});

export async function loginApi(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/login/createsession", {
      params: params,
      signal: signal,
    })
  );
}

/*
|--------------------------------------------------------------------------
| ENDPOINTS DE SUCURSAL
|--------------------------------------------------------------------------
*/
export async function listSucursales(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/sucursal/inicio", {
      signal: signal,
    })
  );
}

export async function comboSucursales(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/sucursal/combo", {
      signal: signal,
    })
  );
}

export async function borrarSucursal(idSucursal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/sucursal', {
      params: {
        "idSucursal": idSucursal
      }
    })
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
export async function listClientes(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cliente/list', {
      signal: signal,
      params: params
    })
  );
}

export async function comboCliente(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/combo", {
      signal: signal,
    })
  );
}

export async function filtrarCliente(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/filtrar", {
      params: params,
    })
  );
}

export async function addCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cliente/add', params)
  );
}

export async function editCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cliente/update', params)
  );
}

export async function deleteCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/cliente', {
      params: params
    })
  );
}

export async function getClienteId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/id", {
      signal: signal,
      params: params
    })
  );
}

export async function getPredeterminado(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/predeterminado", {
      signal: signal,
    })
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
    instancePrincipal.get("/api/inventario/list", {
      params: params,
      signal: signal,
    })
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
export async function getIdProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/id", {
      signal: signal,
      params: params,
    })
  );
}

export async function productoDetalle(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/detalle", {
      signal: signal,
      params: params,
    })
  );
}

export async function comboProductos() {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/listcombo")
  );
}

export async function listarProductosFilter(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/listfilter", {
      params: params,
    })
  );
}

export async function listProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/list', {
      signal: signal,
      params: params
    })
  );
}

export async function addProducto(data) {
  return await Resolve.create(
    instancePrincipal.post("/api/producto", data)
  );
}

export async function updateProducto(data) {
  return await Resolve.create(
    instancePrincipal.put("/api/producto", data)
  );
}

export async function deleteProducto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/producto', {
      params: params
    })
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
      params: params
    })
  );
}

export async function getIdAlmacen(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/almacen/id", {
      params: params,
      signal: signal
    })
  );
}

export async function addAlmacen(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/almacen/add', data)
  );
}

export async function updateAlmacen(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/almacen/update', data)
  );
}

export async function deleteAlmacen(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/almacen/delete', {
      data: params
    })
  );
}

export async function comboAlmacen(signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/combo', {
      signal: signal,
    })
  );
}
// ------------------------------------------------------------------------
// FIN PARA ALMACEN
// ------------------------------------------------------------------------


export async function empresaConfig() {
  return await Resolve.create(
    instancePrincipal.get("/api/empresa/config")
  );
}

export async function getIdEmpresa(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/empresa/id", {
      params: params,
      signal: signal
    })
  );
}

export async function updateEmpresa(data, signal) {
  return await Resolve.create(
    instancePrincipal.post("/api/empresa/update", data, {
      signal: signal
    })
  );
}


export async function validToken() {
  return await Resolve.create(
    instancePrincipal.get("/api/login/validtoken")
  );
}

export async function addBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post("/api/banco/", data, {
      signal: signal
    }
    )
  );
}

export async function getBancoId(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/id", {
      signal: signal,
      params: params,
    })
  );
}

export async function updateBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.put("/api/banco/", data, {
      signal: signal
    }
    )
  );
}

export async function deleteBanco(params) {
  return await Resolve.create(
    instancePrincipal.delete("/api/banco/", {
      params: params
    })
  );
}

export async function listarBancos(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/list", {
      signal: signal,
      params: params,
    })
  );
}

export async function listarCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/categoria/list", {
      signal: signal,
      params: params,
    })
  );
}

export async function listComboCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/categoria/listcombo', {
      signal: signal,
      params: params
    })
  );
}

export async function loadEmpresa(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/empresa/load")
  );
}

export async function getIdCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/categoria/id", {
      signal: signal,
      params: params,
    })
  );
}

export async function addCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.post("/api/categoria/", data)
  );
}

export async function updateCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.put("/api/categoria", data)
  );
}

export async function removeCategoria(params) {
  return await Resolve.create(
    instancePrincipal.delete("/api/categoria", {
      params: params,
    })
  );
}

export async function listCpeSunat(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/cpesunat', {
      signal: signal,
      params: params
    })
  );
}

export async function sendEmailBoleta(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/cobro/email", {
      params: params
    })
  );
}

export async function sendEmailNotaCredito(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/notacredito/email", {
      params: params
    })
  );
}

export async function getNotifications(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cobro/notificaciones", {
      signal: signal
    })
  );
}



export async function createFactura(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/factura/add', data),
  );
}

export async function listMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/moneda/list", {
      params: params,
      signal: signal
    })
  );
}

export async function getIdMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/moneda/id", {
      params: params,
      signal: signal
    })
  );
}

export async function listMonedaCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/moneda/listcombo", {
      signal: signal
    })
  );
}

export async function addMoneda(data, signal) {
  return await Resolve.create(
    instancePrincipal.post("/api/moneda/add", data, {
      signal: signal
    })
  );
}

export async function editMoneda(data, signal) {
  return await Resolve.create(
    instancePrincipal.post("/api/moneda/update", data, {
      signal: signal
    })
  );
}

export async function deleteMoneda(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete("/api/moneda", {
      params: params,
      signal: signal
    })
  );
}

export async function listImpuestCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/impuesto/listcombo", {
      signal: signal,
    })
  );
}

export async function listBancoCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/listcombo", {
      signal: signal,
    })
  );
}

export async function listComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/comprobante/list", {
      signal: signal,
      params: params
    })
  );
}

export async function listComprobanteCombo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/comprobante/listcombo", {
      signal: signal,
      params: params
    })
  );
}

export async function comboTipoComprobante(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/comprobante/combo/tipo-comprobante", {
      signal: signal,
    })
  );
}

export async function getIdComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/comprobante/id", {
      params: params,
      signal: signal,
    })
  );
}

export async function addComprobante(data, signal) {
  return await Resolve.create(
    instancePrincipal.post("/api/comprobante/add", data, {
      signal: signal,
    })
  );
}

export async function editComprobante(data, signal) {
  return await Resolve.create(
    instancePrincipal.post("/api/comprobante/edit", data, {
      signal: signal,
    })
  );
}

export async function deleteComprobante(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete("/api/comprobante", {
      params: params,
      signal: signal,
    })
  );
}

export async function getFacturaId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/factura/id", {
      signal: signal,
      params: params
    })
  );
}

export async function getCobroVentaId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/factura/venta/cobro", {
      signal: signal,
      params: params
    })
  );
}

export async function getIdConcepto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/id', {
      signal: signal,
      params: params
    })
  );
}

export async function listConceptos(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/list', {
      signal: signal,
      params: params
    })
  );
}

export async function addConcepto(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/concepto/add', data, {
      signal: signal,
    })
  );
}

export async function editConcepto(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post('/api/concepto/update', data, {
      signal: signal,
    })
  );
}

export async function removeConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.delete('/api/concepto', {
      params: params,
      signal: signal,
    })
  );
}

export async function filtrarCobroConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/filtrar/cobro', {
      params: params,
      signal: signal,
    })
  );
}

export async function filtrarGastoConcepto(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/filtrar/gasto', {
      params: params,
      signal: signal,
    })
  );
}

export async function listCobro(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/list', {
      signal: signal,
      params: params
    })
  );
}

export async function addCobro(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cobro/add', data, {
      signal: signal,
    })
  );
}

export async function editCobro(data, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cobro/edit', data, {
      signal: signal,
    })
  );
}

export async function getCobroId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/id', {
      signal: signal,
      params: params
    })
  );
}

export async function getUbigeo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/ubigeo/", {
      params: params,
    })
  );
}

export async function listComboTipoDocumento(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/tipodocumento/listcombo", {
      signal: signal,
    })
  );
}



export async function listImpuesto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/impuesto/list', {
      signal: signal,
      params: params
    })
  );
}

export async function getImpuestoId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/impuesto/id", {
      signal: signal,
      params: params
    })
  );
}

export async function addImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/add', data)
  );
}

export async function editImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/edit', data)
  );
}

export async function deleteImpuesto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/impuesto', {
      params: params
    })
  );
}

export async function comboMedida(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/medida/listcombo', {
      signal: signal,
    })
  );
}

export async function comboMetodoPago(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/metodopago/combo', {
      signal: signal,
    })
  );
}


export async function listKardex(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/kardex/list', {
      params: params,
      signal: signal,
    })
  );
}
