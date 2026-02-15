import { ProjectInterface } from '@/model/ts/interface/project';
import { AuthenticateInterface } from '@/model/ts/interface/user';
import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
  isLoading: boolean;
  isSignOut: boolean;
  isSignIn: boolean;
  isConfig: boolean;
  userToken: AuthenticateInterface | null;
  project: ProjectInterface | null;
}

const initialState: InitialState = {
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
  restoreToken,
  signIn,
  signOut,
  projectActive,
  projectClose,
  config,
  configSave
} = principalSlice.actions;
export default principalSlice.reducer;
