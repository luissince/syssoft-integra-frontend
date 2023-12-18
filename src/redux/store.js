import { createStore, combineReducers, applyMiddleware } from 'redux';
import reducer from './reducer-principal';
import notiReducer from './reducer-notifications';
import predeterminadoReducer from './reducer-predeterminado';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
  reducer,
  notiReducer,
  predeterminadoReducer,
});

export default createStore(rootReducer, applyMiddleware(thunk));
