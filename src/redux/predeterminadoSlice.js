import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { establecerPreferidoProducto, preferidosProducto } from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';

const initialState = {
  moneda: null,
  empresa: null,
  productos: [],
  listaVenta: {
    data: null,
    paginacion: null
  },
  cotizacionLista: {
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
  productoLista: {
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
};

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
      state.listaVenta.data = action.payload;
    },
    setListaVentaPaginacion: (state, action) => {
      state.listaVenta.paginacion = action.payload;
    },
    clearListaVenta: (state) => {
      state.listaVenta = {
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

    clearPredeterminado: (state) => {
      state.moneda = null;
      state.empresa = null;
      state.productos = [];
      state.listaVenta = {
        data: null,
        paginacion: null
      };
      state.cotizacionLista = {
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
      state.productoLista = {
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
    }
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

export const { setMonedaNacional,
  setProductosFavoritos,
  setEmpresa,

  setListaVentaData,
  setListaVentaPaginacion,
  clearListaVenta,

  setListaCotizacionData,
  setListaCotizacionPaginacion,
  clearListaCotizacion,

  setListaAjusteData,
  setListaAjustePaginacion,
  clearListaAjuste,

  setListaProductoData,
  setListaProductoPaginacion,
  clearListaProducto,

  setListaInventarioData,
  setListaInventarioPaginacion,
  clearListaInventario,

  setKardexData,
  setKardexPaginacion,
  clearKardex,

  setListaTrasladoData,
  setListaTrasladoPaginacion,
  clearListaTraslado,

  clearPredeterminado
} = predeterminadoSlice.actions;
export default predeterminadoSlice.reducer;
