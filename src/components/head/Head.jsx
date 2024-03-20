import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut, closeProject, addNotification } from '../../redux/actions';
import { images } from '../../helper';
import PropTypes from 'prop-types';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleCrearVenta = () => {
    this.props.history.push('/inicio/ventas/crear');
  };

  handleSignIn = () => {
    try {
      window.localStorage.removeItem('login');
      window.localStorage.removeItem('project');
      this.props.restore();
      this.props.history.push('login');
    } catch (e) {
      this.props.restore();
      this.props.history.push('login');
    }
  };

  handleoCloseSucursal() {
    window.localStorage.removeItem('project');
    this.props.close();
  }

  render() {
    return (
      <header className="app-header">
        <div className="app-sidebar__title">
          <img src={images.logo} alt="logo" />
          <p>SYSSOFT INTEGRA</p>
        </div>
        <span
          className="app-sidebar__toggle"
          onClick={this.props.openAndClose}
        ></span>

        <ul className="app-nav">
          <div className="dropdown">
            <a
              className="app-nav__item"
              href=""
              onClick={this.handleCrearVenta}
              aria-label="Abrir Perfil"
              aria-expanded={false}
            >
              <i className="fast-sale fa fa-shopping-cart fa-lg"></i> Nueva venta {/* Icono de Font Awesome */}
            </a>


          </div>
          <div className="dropdown">
            <a
              className="app-nav__item"
              href=""
              data-bs-toggle="dropdown"
              aria-label="Abrir Notificaciones"
              aria-expanded={false}
            >
              <i className="fa fa-bell-o fa-sm  fa-sm"></i>
              <span className="pl-1 pr-1 badge-warning rounded h7 icon-absolute ">
                {this.props.notificaciones.length}
              </span>
            </a>
            <ul className="app-notification dropdown-menu dropdown-menu-right">
              <div className="app-notification__content">
                {this.props.notificaciones.length !== 0
                  ? this.props.notificaciones.map((item, index) => (
                    <li key={index}>
                      <div className="app-notification__item">
                        <span className="app-notification__icon">
                          <span className="fa-stack fa-lg">
                            <i className="fa fa-circle fa-stack-2x text-primary"></i>
                            <i className="fa fa-warning fa-stack-1x fa-inverse"></i>
                          </span>
                        </span>
                        <div>
                          <p className="app-notification__message">
                            {item.cantidad} {item.nombre}
                          </p>
                          <p className="app-notification__meta">
                            {item.estado}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                  : null}
              </div>
              {this.props.notificaciones.length == 0 ? (
                <li className="app-notification__footer">
                  No hay notificaciones para mostrar.
                </li>
              ) : (
                <li className="app-notification__footer">
                  <Link to={`${this.props.match.url}/notifications`}>
                    {' '}
                    Mostrar mas a detalle
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="dropdown">
            <a
              className="app-nav__item"
              href=""
              data-bs-toggle="dropdown"
              aria-label="Abrir Perfil"
              aria-expanded={false}
            >
              <img src={images.usuario} className="user-image" alt="Usuario" />
            </a>
            <ul className="dropdown-menu settings-menu dropdown-menu-right">
              <li className="user-header">
                <img
                  src={images.usuario}
                  className="img-circle"
                  alt="Usuario"
                />
                <p>
                  <span>
                    {this.props.token.userToken.nombres +
                      ' ' +
                      this.props.token.userToken.apellidos}
                  </span>
                  <small>
                    {' '}
                    <i>{this.props.token.userToken.rol}</i>{' '}
                  </small>
                </p>
              </li>
              <li className="user-footer">
                <button
                  className="btn btn-secondary"
                  onClick={this.handleoCloseSucursal}
                >
                  <i className="fa fa-sign-out fa-sm"></i> Cerrar sucursal
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={this.handleSignIn}
                >
                  <i className="fa fa-window-close fa-sm"></i> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </ul>
      </header>
    );
  }
}

Menu.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  restore: PropTypes.func,
  close: PropTypes.func,
  openAndClose: PropTypes.func,
  notificaciones: PropTypes.array,
  match: PropTypes.shape({
    url: PropTypes.string
  }),
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      nombres: PropTypes.string,
      apellidos: PropTypes.string,
      rol: PropTypes.string,
    })
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
    notification: state.notiReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    restore: () => dispatch(signOut()),
    close: () => dispatch(closeProject()),
    addNotification: (value) => dispatch(addNotification(value)),
  };
};

const ConnectedMenu = connect(mapStateToProps, mapDispatchToProps)(Menu);

export default ConnectedMenu;
