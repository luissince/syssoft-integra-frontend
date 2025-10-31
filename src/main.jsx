import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import './index.css';
import './resource/css/bootstrap.css';
import './resource/css/sweetalert.css';
import './resource/css/fontawesome.css';
import './resource/css/treeone.css';
import './resource/css/sidebar.css';
import './resource/css/footerbar.css';

import './resource/js/bootstrap.js';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import './network/rest/apisperu.network.js';
import './network/rest/principal.network.js';
import AlertKit from 'alert-kit';

AlertKit.setGlobalDefaults({
  headerTitle: 'SysSoft Integra',
  primaryButtonClassName: 'btn btn-primary',
  cancelButtonClassName: 'btn btn-outline-danger',
  acceptButtonClassName: 'btn btn-success',
  defaultTexts: {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    question: 'Confirmación',
    accept: 'Aceptar',
    cancel: 'Cancelar',
    ok: 'Aceptar',
  },
});

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>,
  // </React.StrictMode>
);
