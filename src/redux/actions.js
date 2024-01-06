import SuccessReponse from '../model/class/response';
import {
  establecerPreferidoProducto,
  preferidosProducto,
} from '../network/rest/principal.network';
import {
  RESTORE_TOKEN,
  SIGN_IN,
  SIGN_OUT,
  PROJECT_ACTIVE,
  PROJECT_CLOSE,
  CONFIG,
  CONFIG_SAVE,
  ADD_NOTIFICATION,
  STAR_PRODUCT,
  FAVORITE_PRODUCTS,
  MONEDA_NACIONAL,
} from './types';

export const restoreToken = (user, empresa) => ({
  type: RESTORE_TOKEN,
  token: user,
  empresa: empresa,
});

export const signIn = (user, project = null) => ({
  type: SIGN_IN,
  token: user,
  project: project,
});

export const signOut = () => ({
  type: SIGN_OUT,
});

export const selectProject = (project) => ({
  type: PROJECT_ACTIVE,
  project: project,
});

export const closeProject = () => ({
  type: PROJECT_CLOSE,
});

export const config = () => ({
  type: CONFIG,
  isConfig: true,
});

export const configSave = () => ({
  type: CONFIG_SAVE,
});

export const addNotification = (value) => ({
  type: ADD_NOTIFICATION,
  value: value,
});

export const starProduct = (producto) => async (dispatch) => {
  await establecerPreferidoProducto({
    preferido: producto.preferido,
    idProducto: producto.idProducto,
  });

  let productos = [];

  const response = await preferidosProducto();
  if (response instanceof SuccessReponse) {
    productos = response.data;
  }

  dispatch({
    type: STAR_PRODUCT,
    productos,
  });
};

export const favoriteProducts = (productos) => ({
  type: FAVORITE_PRODUCTS,
  productos: productos,
});

export const monedaNacional = (moneda) => ({
  type: MONEDA_NACIONAL,
  moneda: moneda,
});
