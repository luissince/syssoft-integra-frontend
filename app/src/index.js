import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import './recursos/css/bootstrap.css';
import './recursos/js/bootstrap.js';
// import '../node_modules/bootstrap/dist/js/bootstrap';
import '../../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import './styles/App.scss';


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));


// import { createStore } from 'redux'


// const reducer = (state = 0, action) => {
//     switch (action.type) {
//         case '+': return state + 1
//         case '-': return state - 1
//         case '=': return 0
//         default: return state;
//     }
// }


// const actionIncremented = {
//     type: "+",

// }
// const actionDecremented = {
//     type: "-",

// }
// const actionReset = {
//     type: "=",

// }

// const store = createStore(reducer);



// store.subscribe(() => {
//     console.log(store.getState());
// });

// store.dispatch(actionIncremented);
// store.dispatch(actionDecremented);
// store.dispatch(actionReset);