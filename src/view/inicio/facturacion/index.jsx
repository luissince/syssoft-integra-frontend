import { ContainerMenu } from '../../../components/Container';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Ventas from './venta/lista/Ventas';
import VentaCrear from './venta/formulario/crear/VentaCrear';
import VentaCrearEscritorio from './venta/formulario/crear-clasico/VentaCrearEscritorio';
import VentaDetalle from './venta/detalle/VentaDetalle';

import Cobros from './cobro/lista/Cobros';
import CobroCrear from './cobro/crear/CobroCrear';
import CobroDetalle from './cobro/detalle/CobroDetalle';

import Cotizaciones from './cotizacion/lista/Cotizaciones';
import CotizacioneCrear from './cotizacion/formularios/crear/CotizacionCrear';
import CotizacioneEditar from './cotizacion/formularios/editar/CotizacionEditar';
import CotizacionDetalle from './cotizacion/detalle/CotizacionDetalle';

import GuiaRemision from './guiaremision/lista/GuiaRemision';
import GuiaRemisionCrear from './guiaremision/formularios/crear/GuiaRemisionCrear';
import GuiaRemisionEditar from './guiaremision/formularios/editar/GuiaRemisionEditar';
import GuiaRemisionDetalle from './guiaremision/detalle/GuiaRemisionDetalle';

import NotaCredito from './nota-credito/lista/NotaCredito';
import NotaCreditoProceso from './nota-credito/formulario/NotaCreditoProceso';
import NotaCreditoDetalle from './nota-credito/detalle/NotaCreditoDetalle';

import CuentasPorCobrar from './cuenta-cobrar/lista/CuentasPorCobrar';
import CuentasPorCobrarAbonar from './cuenta-cobrar/crear/CuentasPorCobrarAbonar';

import Pedidos from './pedido/lista/Pedidos';
import PedidoCrear from './pedido/formularios/crear/PedidoCrear';
import PedidoEditar from './pedido/formularios/editar/PedidoEditar';
import PedidoDetalle from './pedido/detalle/PedidoDetalle';

export {
  Ventas,
  VentaCrear,
  VentaCrearEscritorio,
  VentaDetalle,
  Cobros,
  CobroCrear,
  CobroDetalle,
  Cotizaciones,
  CotizacioneCrear,
  CotizacioneEditar,
  CotizacionDetalle,
  GuiaRemision,
  GuiaRemisionCrear,
  GuiaRemisionEditar,
  GuiaRemisionDetalle,
  NotaCredito,
  NotaCreditoProceso,
  NotaCreditoDetalle,
  CuentasPorCobrar,
  CuentasPorCobrarAbonar,
  Pedidos,
  PedidoCrear,
  PedidoEditar,
  PedidoDetalle,
};

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Facturacion = (props) => {
  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={props.token.userToken.menus[2].subMenus}
      url={props.match.url}
    />
  );
};

Facturacion.propTypes = {
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

const ConnectedFacturacion = connect(mapStateToProps, null)(Facturacion);

export default ConnectedFacturacion;
