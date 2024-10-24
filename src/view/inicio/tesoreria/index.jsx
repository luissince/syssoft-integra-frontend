import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';

import Gastos from './gasto/lista/Gastos.jsx';
import GastoCrear from './gasto/crear/GastoCrear.jsx';
import GastoDetalle from './gasto/detalle/GastoDetalle.jsx';

import Compras from './compra/lista/Compras.jsx';
import CompraCrear from './compra/crear/CompraCrear.jsx';
import CompraDetalle from './compra/detalle/CompraDetalle.jsx';

import CuentasPorPagar from './cuenta-pagar/lista/CuentasPorPagar.jsx';
import CuentasPorPagarAmortizar from './cuenta-pagar/crear/CuentasPorPagarAmortizar.jsx';

import Pedidos from './pedido/lista/Pedidos.jsx';
import PedidoCrear from './pedido/formularios/crear/PedidoCrear.jsx';
import PedidoEditar from './pedido/formularios/editar/PedidoEditar.jsx';
import PedidoDetalle from './pedido/detalle/PedidoDetalle.jsx';

export {
    Gastos,
    GastoCrear,
    GastoDetalle,

    Compras,
    CompraCrear,
    CompraDetalle,

    CuentasPorPagar,
    CuentasPorPagarAmortizar,

    Pedidos,
    PedidoCrear,
    PedidoEditar,    
    PedidoDetalle,
}

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Tesoreria = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[4].subMenus}
            url={props.match.url}
        />
    );
}

Tesoreria.propTypes = {
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

const ConnectedTesoreria = connect(mapStateToProps, null)(Tesoreria);

export default ConnectedTesoreria;