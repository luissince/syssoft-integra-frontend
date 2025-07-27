import { createSlice } from '@reduxjs/toolkit';

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
    clearNoticacion: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, clearNoticacion } = notificationSlice.actions;
export default notificationSlice.reducer;
