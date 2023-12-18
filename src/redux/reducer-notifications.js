import { ADD_NOTIFICATION } from './types';

const initialState = {
  notification: [],
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notification: [...state.notification, action.value],
      };
    default:
      return state;
  }
};

export default notificationReducer;
