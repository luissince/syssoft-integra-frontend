import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RepVentas from './RepVentas';
import RepCompras from './RepCompras';
import RepFinanciero from './RepFinanciero';
import RepProductos from './RepProductos';
// import RepClientes from './RepClientes';
// import RepProveedores from './RepProveedores';
import RepCpeSunat from './RepCpeSunat';
import RepInventario from './RepInventario';

export {
  RepFinanciero,
  RepVentas,
  RepCompras,
  RepProductos,
  // RepClientes,
  // RepProveedores,
  RepCpeSunat,
  RepInventario,
};

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Reporte = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[7].subMenus}
      url={props.match.url}
    />
  );
};

Reporte.propTypes = {
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

const ConnectedReporte = connect(mapStateToProps, null)(Reporte);

export default ConnectedReporte;
