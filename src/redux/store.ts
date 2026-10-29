import { configureStore } from '@reduxjs/toolkit';
import principalReduce from './principalSlice';
import noticacionReducer from './noticacionSlice';
import predeterminadoReducer from './predeterminadoSlice';
import downloadReducer from './downloadSlice';
import printerReducer from './printer.slice';
import whatsappReducer from './whatsapp.slice';
import { combineReducers } from '@reduxjs/toolkit';

const reducer = combineReducers({
  notification: noticacionReducer,
  predeterminado: predeterminadoReducer,
  principal: principalReduce,
  download: downloadReducer,
  printer: printerReducer,
  whatsapp: whatsappReducer,
});

const store = configureStore({
  reducer: reducer,
  devTools: import.meta.env.VITE_APP_ENV === 'development',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
