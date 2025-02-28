import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { establecerPreferidoProducto, preferidosProducto } from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';

export const starProduct = createAsyncThunk('productos/starProduct', async (data) => {
  await establecerPreferidoProducto({
    preferido: data.producto.preferido,
    idProducto: data.producto.idProducto,
  });

  const response = await preferidosProducto(data.params);
  if (response instanceof SuccessReponse) {
    return response.data;
  }

  throw new Error('Hubo un error al obtener los productos preferidos');
});

const initialState = {
  moneda: null,
  empresa: null,
  productos: [],
  ventaLista: {
    data: null,
    paginacion: null
  },
  cotizacionLista: {
    data: null,
    paginacion: null
  },
  cotizacionCrear: {
    state: null,
    local: null
  },
  guiaRemisionLista: {
    data: null,
    paginacion: null
  },
  productoLista: {
    data: null,
    paginacion: null
  },
  ajusteLista: {
    data: null,
    paginacion: null
  },
  inventarioLista: {
    data: null,
    paginacion: null
  },
  kardex: {
    data: null,
    paginacion: null
  },
  trasladoLista: {
    data: null,
    paginacion: null
  },
  compraLista: {
    data: null,
    paginacion: null
  },
  compraCrear: {
    state: null,
    local: null
  },
  ordenCompraLista: {
    data: null,
    paginacion: null
  },
  ordenCompraCrear: {
    state: null,
    local: null
  },
  pedidoLista: {
    data: null,
    paginacion: null
  },
  pedidoCrear: {
    state: null,
    local: null
  },
  catalogoLista: {
    data: null,
    paginacion: null
  },
  catalogoCrear: {
    state: null,
    local: null
  },
  cpeSunatLista: {
    data: null,
    paginacion: null
  },
};

const predeterminadoSlice = createSlice({
  name: 'predeterminado',
  initialState,
  reducers: {
    setMonedaNacional: (state, action) => {
      state.moneda = action.payload;
    },
    setEmpresa: (state, action) => {
      state.empresa = action.payload;
    },
    setProductosFavoritos: (state, action) => {
      state.productos = action.payload;
    },

    setListaVentaData: (state, action) => {
      state.ventaLista.data = action.payload;
    },
    setListaVentaPaginacion: (state, action) => {
      state.ventaLista.paginacion = action.payload;
    },
    clearListaVenta: (state) => {
      state.ventaLista = {
        data: null,
        paginacion: null
      };
    },

    setListaCotizacionData: (state, action) => {
      state.cotizacionLista.data = action.payload;
    },
    setListaCotizacionPaginacion: (state, action) => {
      state.cotizacionLista.paginacion = action.payload;
    },
    clearListaCotizacion: (state) => {
      state.cotizacionLista = {
        data: null,
        paginacion: null
      };
    },

    setCrearCotizacionState: (state, action) => {
      state.cotizacionCrear.state = action.payload;
    },
    setCrearCotizacionLocal: (state, action) => {
      state.cotizacionCrear.local = action.payload;
    },
    clearCrearCotizacion: (state) => {
      state.cotizacionCrear = {
        state: null,
        local: null
      };
    },

    setListaGuiaRemisionData: (state, action) => {
      state.guiaRemisionLista.data = action.payload;
    },
    setListaGuiaRemisionPaginacion: (state, action) => {
      state.guiaRemisionLista.paginacion = action.payload;
    },
    clearListaGuiaRemision: (state) => {
      state.guiaRemisionLista = {
        data: null,
        paginacion: null
      };
    },

    setListaAjusteData: (state, action) => {
      state.ajusteLista.data = action.payload;
    },
    setListaAjustePaginacion: (state, action) => {
      state.ajusteLista.paginacion = action.payload;
    },
    clearListaAjuste: (state) => {
      state.ajusteLista = {
        data: null,
        paginacion: null
      };
    },

    setListaProductoData: (state, action) => {
      state.productoLista.data = action.payload;
    },
    setListaProductoPaginacion: (state, action) => {
      state.productoLista.paginacion = action.payload;
    },
    clearListaProducto: (state) => {
      state.productoLista = {
        data: null,
        paginacion: null
      };
    },

    setListaInventarioData: (state, action) => {
      state.inventarioLista.data = action.payload;
    },
    setListaInventarioPaginacion: (state, action) => {
      state.inventarioLista.paginacion = action.payload;
    },
    clearListaInventario: (state) => {
      state.inventarioLista = {
        data: null,
        paginacion: null
      };
    },

    setKardexData: (state, action) => {
      state.kardex.data = action.payload;
    },
    setKardexPaginacion: (state, action) => {
      state.kardex.paginacion = action.payload;
    },
    clearKardex: (state) => {
      state.kardex = {
        data: null,
        paginacion: null
      };
    },

    setListaTrasladoData: (state, action) => {
      state.trasladoLista.data = action.payload;
    },
    setListaTrasladoPaginacion: (state, action) => {
      state.trasladoLista.paginacion = action.payload;
    },
    clearListaTraslado: (state) => {
      state.trasladoLista = {
        data: null,
        paginacion: null
      };
    },

    setListaCompraData: (state, action) => {
      state.compraLista.data = action.payload;
    },
    setListaCompraPaginacion: (state, action) => {
      state.compraLista.paginacion = action.payload;
    },
    clearListaCompra: (state) => {
      state.compraLista = {
        data: null,
        paginacion: null
      };
    },

    setCrearCompraState: (state, action) => {
      state.compraCrear.state = action.payload;
    },
    setCrearCompraLocal: (state, action) => {
      state.compraCrear.local = action.payload;
    },
    clearCrearCompra: (state) => {
      state.compraCrear = {
        state: null,
        local: null
      };
    },

    setListaOrdenCompraData: (state, action) => {
      state.ordenCompraLista.data = action.payload;
    },
    setListaOrdenCompraPaginacion: (state, action) => {
      state.ordenCompraLista.paginacion = action.payload;
    },
    clearListaOrdenCompra: (state) => {
      state.ordenCompraLista = {
        data: null,
        paginacion: null
      };
    },

    setCrearOrdenCompraState: (state, action) => {
      state.ordenCompraCrear.state = action.payload;
    },
    setCrearOrdenCompraLocal: (state, action) => {
      state.ordenCompraCrear.local = action.payload;
    },
    clearCrearOrdenCompra: (state) => {
      state.ordenCompraCrear = {
        state: null,
        local: null
      };
    },

    setListaPedidoData: (state, action) => {
      state.pedidoLista.data = action.payload;
    },
    setListaPedidoPaginacion: (state, action) => {
      state.pedidoLista.paginacion = action.payload;
    },
    clearListaPedido: (state) => {
      state.pedidoLista = {
        data: null,
        paginacion: null
      };
    },

    setCrearPedidoState: (state, action) => {
      state.pedidoCrear.state = action.payload;
    },
    setCrearPedidoLocal: (state, action) => {
      state.pedidoCrear.local = action.payload;
    },
    clearCrearPedido: (state) => {
      state.pedidoCrear = {
        state: null,
        local: null
      };
    },

    setListaCatalogoData: (state, action) => {
      state.catalogoLista.data = action.payload;
    },
    setListaCatalogoPaginacion: (state, action) => {
      state.catalogoLista.paginacion = action.payload;
    },
    clearListaCatalogo: (state) => {
      state.catalogoLista = {
        data: null,
        paginacion: null
      };
    },

    setCrearCatalogoState: (state, action) => {
      state.catalogoCrear.state = action.payload;
    },
    setCrearCatalogoLocal: (state, action) => {
      state.catalogoCrear.local = action.payload;
    },
    clearCrearCatalogo: (state) => {
      state.catalogoCrear = {
        state: null,
        local: null
      };
    },

    setListaCpeSunatData: (state, action) => {
      state.cpeSunatLista.data = action.payload;
    },
    setListaCpeSunatPaginacion: (state, action) => {
      state.cpeSunatLista.paginacion = action.payload;
    },
    clearListaCpeSunat: (state) => {
      state.cpeSunatLista = {
        data: null,
        paginacion: null
      };
    },
    

    clearSucursal: (state) => {
      state.ventaLista = {
        data: null,
        paginacion: null
      };
      state.cotizacionLista = {
        data: null,
        paginacion: null
      };
      state.cotizacionCrear = {
        state: null,
        local: null
      };
      state.guiaRemisionLista = {
        data: null,
        paginacion: null
      };
      state.productoLista = {
        data: null,
        paginacion: null
      };
      state.ajusteLista = {
        data: null,
        paginacion: null
      };
      state.inventarioLista = {
        data: null,
        paginacion: null
      };
      state.kardex = {
        data: null,
        paginacion: null
      };
      state.trasladoLista = {
        data: null,
        paginacion: null
      };
      state.compraLista = {
        data: null,
        paginacion: null
      };
      state.compraCrear = {
        state: null,
        local: null
      };
      state.ordenCompraLista = {
        data: null,
        paginacion: null
      };
      state.ordenCompraCrear = {
        state: null,
        local: null
      };
      state.pedidoLista = {
        data: null,
        paginacion: null
      };
      state.pedidoCrear = {
        state: null,
        local: null
      };
      state.catalogoLista = {
        data: null,
        paginacion: null
      };
      state.catalogoCrear = {
        state: null,
        local: null
      };
      state.cpeSunatLista = {
        data: null,
        paginacion: null
      };
    },

    clearPredeterminado: (state) => {
      state.moneda = null;
      state.empresa = null;
      state.productos = [];
      state.ventaLista = {
        data: null,
        paginacion: null
      };
      state.cotizacionLista = {
        data: null,
        paginacion: null
      };
      state.cotizacionCrear = {
        state: null,
        local: null
      };
      state.guiaRemisionLista = {
        data: null,
        paginacion: null
      };
      state.productoLista = {
        data: null,
        paginacion: null
      };
      state.ajusteLista = {
        data: null,
        paginacion: null
      };
      state.inventarioLista = {
        data: null,
        paginacion: null
      };
      state.kardex = {
        data: null,
        paginacion: null
      };
      state.trasladoLista = {
        data: null,
        paginacion: null
      };
      state.compraLista = {
        data: null,
        paginacion: null
      };
      state.compraCrear = {
        state: null,
        local: null
      };
      state.ordenCompraLista = {
        data: null,
        paginacion: null
      };
      state.ordenCompraCrear = {
        state: null,
        local: null
      };
      state.pedidoLista = {
        data: null,
        paginacion: null
      };
      state.pedidoCrear = {
        state: null,
        local: null
      };
      state.catalogoLista = {
        data: null,
        paginacion: null
      };
      state.catalogoCrear = {
        state: null,
        local: null
      };
      state.cpeSunatLista = {
        data: null,
        paginacion: null
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(starProduct.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      .addCase(starProduct.fulfilled, (state, action) => {
        state.productos = action.payload;
      })
    // .addCase(starProduct.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.error.message;
    // });
  },
});

export const {
  setMonedaNacional,
  setProductosFavoritos,
  setEmpresa,

  setListaVentaData,
  setListaVentaPaginacion,
  clearListaVenta,

  setListaCotizacionData,
  setListaCotizacionPaginacion,
  clearListaCotizacion,

  setCrearCotizacionState,
  setCrearCotizacionLocal,
  clearCrearCotizacion,

  setListaGuiaRemisionData,
  setListaGuiaRemisionPaginacion,
  clearListaGuiaRemision,

  setListaProductoData,
  setListaProductoPaginacion,
  clearListaProducto,

  setListaAjusteData,
  setListaAjustePaginacion,
  clearListaAjuste,

  setListaInventarioData,
  setListaInventarioPaginacion,
  clearListaInventario,

  setKardexData,
  setKardexPaginacion,
  clearKardex,

  setListaTrasladoData,
  setListaTrasladoPaginacion,
  clearListaTraslado,

  setListaCompraData,
  setListaCompraPaginacion,
  clearListaCompra,

  setListaCpeSunatData,
  setListaCpeSunatPaginacion,
  clearListaCpeSunat,

  setCrearCompraState,
  setCrearCompraLocal,
  clearCrearCompra,

  setListaOrdenCompraData,
  setListaOrdenCompraPaginacion,
  clearListaOrdenCompra,

  setCrearOrdenCompraState,
  setCrearOrdenCompraLocal,
  clearCrearOrdenCompra,

  setListaPedidoData,
  setListaPedidoPaginacion,
  clearListaPedido,

  setCrearPedidoState,
  setCrearPedidoLocal,
  clearCrearPedido,

  setListaCatalogoData,
  setListaCatalogoPaginacion,
  clearListaCatalogo,

  setCrearCatalogoState,
  setCrearCatalogoLocal,
  clearCrearCatalogo,

  clearSucursal,
  clearPredeterminado
} = predeterminadoSlice.actions;

export default predeterminadoSlice.reducer;
