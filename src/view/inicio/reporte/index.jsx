import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';

import RepVentas from './RepVentas.jsx';
import RepCompras from './RepCompras.jsx';
import RepFinanciero from './RepFinanciero.jsx';
import RepProductos from './RepProductos.jsx';
import RepClientes from './RepClientes.jsx';
import RepProveedores from './RepProveedores.jsx';
import RepCpeSunat from './RepCpeSunat.jsx';

export {
    RepFinanciero,
    RepVentas,
    RepCompras,
    RepProductos,
    RepClientes,
    RepProveedores,
    RepCpeSunat,
}


/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Reporte = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[7].subMenus}
            url={props.match.url}
        />
    );
}

Reporte.propTypes = {
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

const ConnectedReporte = connect(mapStateToProps, null)(Reporte);

export default ConnectedReporte;