import React from 'react';
import PropTypes from 'prop-types';
import Loader from './view/loader/Loader';
import Configurar from './view/empresa/Configurar';
import Login from './view/login/Login';
import Principal from './view/principal/Principal';
import Inicio from './view/inicio/Inicio';
import NotFoundInitial from './components/errors/NotFoundInitial';
import { connect } from 'react-redux';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.menuRef = React.createRef();
  }

  render() {
    if (this.props.token.isLoading) {
      return <Loader />;
    }

    if (this.props.token.isConfig) {
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
