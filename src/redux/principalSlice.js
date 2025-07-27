import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: true,
  isSignOut: true,
  isSignIn: false,
  isConfig: true,
  userToken: null,
  project: null,
};

const principalSlice = createSlice({
  name: 'principal',
  initialState,
  reducers: {
    restoreToken: (state, action) => {
      state.userToken = action.payload.token;
      state.project = action.payload.project;
      state.isLoading = false;
      state.isVisible = true;
      state.isConfig = false;
    },
    signIn: (state, action) => {
      state.userToken = action.payload.token;
      state.project = action.payload.project;
      state.isSignOut = false;
      state.isSignIn = true;
      state.isConfig = false;
    },
    signOut: (state) => {
      state.isSignOut = true;
      state.isVisible = false;
      state.isConfig = false;
      state.userToken = null;
      state.project = null;
    },
    projectActive: (state, action) => {
      state.project = action.payload.project;
    },
    projectClose: (state) => {
      state.project = null;
    },
    config: (state, action) => {
      state.isLoading = false;
      state.isSignIn = false;
      state.isConfig = action.payload.isConfig;
    },
    configSave: (state) => {
      state.isLoading = true;
      state.isSignOut = true;
      state.isSignIn = false;
      state.isConfig = false;
      state.userToken = null;
      state.project = null;
    },
  },
});

export const {
  initSession,
  restoreToken,
  signIn,
  signOut,
  projectActive,
  projectClose,
  config,
  configSave,
  updatePrincipal,
} = principalSlice.actions;
export default principalSlice.reducer;
