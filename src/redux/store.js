import { configureStore } from '@reduxjs/toolkit';
import principalReduce from './principalSlice';
import noticacionReducer from './noticacionSlice';
import predeterminadoReducer from './predeterminadoSlice';
import { combineReducers } from '@reduxjs/toolkit';

const reducer = combineReducers({
  notification: noticacionReducer,
  predeterminado: predeterminadoReducer,
  principal: principalReduce
})

const store = configureStore({
  reducer: reducer,
  devTools: import.meta.env.VITE_APP_ENV === "development"
});


export default store;
