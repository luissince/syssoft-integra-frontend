import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Bancos from './banco/lista/Bancos';
import BancoDetalle from './banco/detalle/BancoDetalle';
import BancoAgregar from './banco/formulario/crear/BancoAgregar';
import BancoEditar from './banco/formulario/editar/BancoEditar';

import Transacciones from './transaccion/lista/Transacciones';

export { Bancos, BancoDetalle, BancoAgregar, BancoEditar, Transacciones };

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Finanzas = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[9].subMenus}
      url={props.match.url}
    />
  );
};

Finanzas.propTypes = {
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

const ConnectedFinanzas = connect(mapStateToProps, null)(Finanzas);

export default ConnectedFinanzas;
