import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';

import Ventas from './venta/lista/Ventas.jsx';
import VentaCrear from './venta/formulario/crear/VentaCrear.jsx';
import VentaCrearEscritorio from './venta/formulario/crear-clasico/VentaCrearEscritorio.jsx';
import VentaDetalle from './venta/detalle/VentaDetalle.jsx';

import Cobros from './cobro/lista/Cobros';
import CobroCrear from './cobro/crear/CobroCrear';
import CobroDetalle from './cobro/detalle/CobroDetalle';

import Cotizaciones from './cotizacion/lista/Cotizaciones.jsx';
import CotizacioneCrear from './cotizacion/formularios/crear/CotizacionCrear.jsx';
import CotizacioneEditar from './cotizacion/formularios/editar/CotizacionEditar.jsx';
import CotizacionDetalle from './cotizacion/detalle/CotizacionDetalle.jsx';

import GuiaRemision from './guiaremision/lista/GuiaRemision.jsx';
import GuiaRemisionCrear from './guiaremision/formularios/crear/GuiaRemisionCrear.jsx';
import GuiaRemisionEditar from './guiaremision/formularios/editar/GuiaRemisionEditar.jsx';
import GuiaRemisionDetalle from './guiaremision/detalle/GuiaRemisionDetalle.jsx';

import NotaCredito from './notacredito/NotaCredito';
import NotaCreditoProceso from './notacredito/NotaCreditoProceso';
import NotaCreditoDetalle from './notacredito/NotaCreditoDetalle';

import CuentasPorCobrar from './cuenta-cobrar/lista/CuentasPorCobrar.jsx';
import CuentasPorCobrarAbonar from './cuenta-cobrar/crear/CuentasPorCobrarAbonar.jsx';

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
}

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Facturacion = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[2].subMenus}
            url={props.match.url}
        />
    );
}

Facturacion.propTypes = {
    token: PropTypes.shape({
        userToken: PropTypes.shape({
            menus: PropTypes.array.isRequired,
        }).isRequired,
    }).isRequired,
    match: PropTypes.shape({
        url: PropTypes.string
    })
}

const mapStateToProps = (state) => {
    return {
        token: state.principal,
    };
};

const ConnectedFacturacion = connect(mapStateToProps, null)(Facturacion);

export default ConnectedFacturacion;