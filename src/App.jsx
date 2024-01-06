import React from 'react';
import Loader from './view/loader/Loader';
import Configurar from './view/empresa/Configurar';
import Login from './view/login/Login';
import Principal from './view/principal/Principal';
import Inicio from './view/inicio/Inicio';
import NotFoundInitial from './components/errors/NotFoundInitial';
import { connect } from 'react-redux';
import { config, restoreToken } from './redux/actions';
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

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    config: () => dispatch(config()),
    restore: (user) => dispatch(restoreToken(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
