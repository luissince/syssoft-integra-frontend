// import React from 'react';
import ReactDOM from 'react-dom/client';
// import ReactDOM from 'react-dom';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import './resource/css/bootstrap.css';
import './resource/css/sweetalert.css';
import './resource/css/fontawesome.css';
import './resource/css/treeone.css';
import './resource/css/sidebar.css';
import './resource/css/footerbar.css';

import './resource/js/bootstrap.js';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import '../node_modules/react-notifications/lib/notifications.css';
import './network/rest/apisperu.network.js';
import './network/rest/principal.network.js';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  // <React.StrictMode>
  <Provider store={store}>
      <App />
  </Provider>
  // </React.StrictMode>
)

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <App />
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root'),
// );
