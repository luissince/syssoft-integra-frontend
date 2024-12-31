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

import OrdenCompras from './orden-compra/lista/OrdenCompra.jsx';
import OrdenCompraCrear from './orden-compra/formularios/crear/OrdenCompraCrear.jsx';
import OrdenCompraEditar from './orden-compra/formularios/editar/OrdenCompraEditar.jsx';
import OrdenCompraDetalle from './orden-compra/detalle/OrdenCompraDetalle.jsx';

export {
    Gastos,
    GastoCrear,
    GastoDetalle,

    Compras,
    CompraCrear,
    CompraDetalle,

    CuentasPorPagar,
    CuentasPorPagarAmortizar,

    OrdenCompras,
    OrdenCompraCrear,
    OrdenCompraEditar,    
    OrdenCompraDetalle,
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