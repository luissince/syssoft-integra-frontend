import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Productos from './producto/lista/Productos';
import ProductoAgregar from './producto/formularios/agregar/ProductoAgregar';
import ProductoEditar from './producto/formularios/editar/ProductoEditar';
import ProductoDetalle from './producto/detalle/ProductoDetalle';

import LogisticaAjuste from './ajuste/lista/LogisticaAjuste.jsx';
import LogisticaAjusteCrear from './ajuste/crear/LogisticaAjusteCrear.jsx';
import LogisticaAjusteDetalle from './ajuste/detalle/LogisticaAjusteDetalle.jsx';

import Traslado from './traslado/listar/Traslado.jsx';
import TrasladoCrear from './traslado/crear/TrasladoCrear.jsx';
import TrasladoDetalle from './traslado/detalle/TrasladoDetalle.jsx';

import Inventario from './inventario/Inventario.jsx';

import Kardex from './kardex/Kardex.jsx';

import Catalogos from './catalogo/lista/Catalogos.jsx';
import CatalogoCrear from './catalogo/formularios/crear/CatalogoCrear.jsx';
import CatalogoEditar from './catalogo/formularios/editar/CatalogoEditar.jsx';
import CatalogoDetalle from './catalogo/detalle/CatalogoDetalle.jsx';

export {
  Productos,
  ProductoAgregar,
  ProductoEditar,
  ProductoDetalle,
  LogisticaAjuste,
  LogisticaAjusteCrear,
  LogisticaAjusteDetalle,
  Traslado,
  TrasladoCrear,
  TrasladoDetalle,
  Inventario,
  Kardex,
  Catalogos,
  CatalogoCrear,
  CatalogoEditar,
  CatalogoDetalle,
};

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Logistica = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[3].subMenus}
      url={props.match.url}
    />
  );
};

Logistica.propTypes = {
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

const ConnectedLogistica = connect(mapStateToProps, null)(Logistica);

export default ConnectedLogistica;
