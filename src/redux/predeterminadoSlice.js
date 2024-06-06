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
  }
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
    clearPredeterminado: (state) => {
      state.moneda = null;
      state.empresa = null;
      state.productos = [];
      state.listaVenta = {
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

export const { setMonedaNacional, setProductosFavoritos, setEmpresa, setListaVentaData, setListaVentaPaginacion, clearListaVenta, clearPredeterminado } = predeterminadoSlice.actions;
export default predeterminadoSlice.reducer;
