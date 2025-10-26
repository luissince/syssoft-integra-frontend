import PropTypes from 'prop-types';
import Loader from './view/loader/Loader';
import Configurar from './view/empresa/Configurar';
import Login from './view/login/Login';
import Principal from './view/principal/Principal';
import Inicio from './view/inicio/Inicio';
import NotFoundInitial from './components/errors/NotFoundInitial';
import { connect } from 'react-redux';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import PrinterPlugin from './model/ts/plugins/printer-escpos';
import { toastKit, ToastStyle } from 'toast-kit';

const App = (props) => {
  const { token: { isLoading, isConfig } } = props;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#ffffff' });
      StatusBar.setStyle({ style: Style.Light });
    }
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = PrinterPlugin.addListener('onPrintJobUpdate', (event) => {        
        // Notificación rápida
        if (event.status === 'printing') {
          toastKit.info({
            title: 'En proceso...',
            message: event.message,
            duration: 5000,
            style: ToastStyle.light,
          });
        } else if (event.status === 'success') {
          toastKit.success({
            title: 'Excelente!',
            message: event.message,
            duration: 5000,
            style: ToastStyle.light,
          });
        } else if (event.status === 'error') {
          toastKit.warning({
            title: 'Que mal!',
            message: event.message,
            duration: 5000,
            style: ToastStyle.light,
          });
        }
      });

      return () => {
        listener.then(l => l.remove());
      };
    }
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (isConfig) {
    return <Configurar />;
  }

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact={true}>
          <Redirect to={'/login'} />
        </Route>

        <Route
          path="/login"
          exact={true}
          render={(props) => <Login {...props} />}
        />

        <Route
          path="/principal"
          exact={true}
          render={(props) => <Principal {...props} />}
        />

        <Route path="/inicio" render={(props) => <Inicio {...props} />} />

        <Route component={NotFoundInitial} />
      </Switch>
    </BrowserRouter>
  );
}

App.propTypes = {
  token: PropTypes.shape({
    isLoading: PropTypes.bool,
    isConfig: PropTypes.bool,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedApp = connect(mapStateToProps, null)(App);

export default ConnectedApp;
