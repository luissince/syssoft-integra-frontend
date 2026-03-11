import { createSlice } from '@reduxjs/toolkit';
import { closeProject, signOut } from './principalSlice';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notificacion',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    extraReducers: (builder) => {
      builder.addCase(signOut, () => initialState);
      builder.addCase(closeProject, () => initialState);
    },
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
