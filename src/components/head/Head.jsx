import { Link } from 'react-router-dom';
import { images } from '../../helper';
import PropTypes from 'prop-types';

const Menu = (props) => {
  const handleSignIn = () => {
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('project');
    window.location.href = '/';
  };

  const handleCloseSucursal = () => {
    window.localStorage.removeItem('project');
    props.clearSucursal();
    props.clearNoticacion();
    props.projectClose();
  }

  return (
    <header className="app-header">
      <div className="app-sidebar__title">
        <img src={images.logo} alt="logo" />
        <p>SYSSOFT INTEGRA</p>
      </div>
      <span
        className="app-sidebar__toggle"
        onClick={props.openAndClose}
      ></span>

      <ul className="app-nav">
        {/* Navegar al menú de navegación */}
        <div className="dropdown">
          <Link
            className="app-nav__item"
            to={`${props.match.url}/facturacion/ventas/crear`}>
            {' '}
            <i className="fast-sale fa fa-shopping-cart fa-lg"></i> Nueva venta
          </Link>
        </div>

        {/* Lista de notificaciones */}
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
              {props.notificaciones.length}
            </span>
          </a>
          <ul className="app-notification dropdown-menu dropdown-menu-right">
            <div className="app-notification__content">
              {props.notificaciones.length !== 0
                ? props.notificaciones.map((item, index) => (
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
            {props.notificaciones.length == 0 ? (
              <li className="app-notification__footer">
                No hay notificaciones para mostrar.
              </li>
            ) : (
              <li className="app-notification__footer">
                <Link to={`${props.match.url}/notifications`}>
                  {' '}
                  Mostrar mas a detalle
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Opcion de menus */}
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
                  {props.token.userToken.nombres +
                    ' ' +
                    props.token.userToken.apellidos}
                </span>
                <small>
                  {' '}
                  <i>{props.token.userToken.rol}</i>{' '}
                </small>
              </p>
            </li>
            <li className="user-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseSucursal}
              >
                <i className="fa fa-sign-out fa-sm"></i> Cerrar Sucursal
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleSignIn}
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

Menu.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  signOut: PropTypes.func,

  clearSucursal: PropTypes.func,
  clearNoticacion: PropTypes.func,

  projectClose: PropTypes.func,
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

export default Menu;
