import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Personas from './todo/Personas';
import PersonaAgregar from './formularios/crear/PersonaAgregar';
import PersonaEditar from './formularios/editar/PersonaEditar';
import PersonaDetalle from './formularios/detalle/PersonaDetalle';
import Clientes from './cliente/Clientes';
import Proveedores from './proveedor/Proveedores';
import Conductores from './conductor/Conductores';
import Personales from './personal/Personales';

export {
  Personas,
  PersonaAgregar,
  PersonaEditar,
  PersonaDetalle,
  Clientes,
  Proveedores,
  Conductores,
  Personales,
};

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Contacto = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[5].subMenus}
      url={props.match.url}
    />
  );
};

Contacto.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      menus: PropTypes.array.isRequired,
    }).isRequired,
  }).isRequired,
  match: PropTypes.shape({
    url: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedContacto = connect(mapStateToProps, null)(Contacto);

export default ConnectedContacto;
