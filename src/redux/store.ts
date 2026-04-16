import { configureStore } from '@reduxjs/toolkit';
import principalReduce from './principalSlice';
import noticacionReducer from './noticacionSlice';
import predeterminadoReducer from './predeterminadoSlice';
import downloadReducer from './downloadSlice';
import printerReducer from './printerSlice';

import activoBienRedurcer from './activo/bienSlice';
import activoDepreciacionReduce from './activo/depreciacionSlice';
import activoGestionReduce from './activo/gestionSlice';

import finanzasBancoReducer from './finanza/bancoSlice';

import { combineReducers } from '@reduxjs/toolkit';

const reducer = combineReducers({
  notification: noticacionReducer,
  predeterminado: predeterminadoReducer,
  principal: principalReduce,
  download: downloadReducer,
  printer: printerReducer,

  activoBien: activoBienRedurcer,
  activoDepreciacion: activoDepreciacionReduce,
  activoGestion: activoGestionReduce,

  finanzasBanco: finanzasBancoReducer,
});

const store = configureStore({
  reducer: reducer,
  devTools: import.meta.env.VITE_APP_ENV === 'development',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
