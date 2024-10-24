import { ContainerMenu } from "../../../components/Container";
import { connect } from "react-redux";
import PropTypes from 'prop-types';


import Almacenes from './almacen/Almacenes.jsx';
import AlmacenAgregar from './almacen/AlmacenAgregar.jsx';
import AlmacenEditar from './almacen/AlmacenEditar.jsx';

import Categorias from './categoria/Categorias';
import CategoriaAgregar from './categoria/CategoriaAgregar';
import CategoriaEditar from './categoria/CategoriaEditar';

import Medidas from './medida/Medidas.jsx';
import MedidaAgregar from './medida/MedidaAgregar.jsx';
import MedidaEditar from './medida/MedidaEditar.jsx';

import Monedas from './moneda/Monedas.jsx';
import MonedaAgregar from './moneda/MonedaAgregar.jsx';
import MonedaEditar from './moneda/MonedaEditar.jsx';

import Comprobantes from './comprobante/Comprobantes.jsx';
import ComprobanteAgregar from './comprobante/ComprobanteAgregar.jsx';
import ComprobanteEditar from './comprobante/ComprobanteEditar.jsx';

import Impuestos from './impuesto/Impuestos.jsx';
import ImpuestoAgregar from './impuesto/ImpuestoAgregar.jsx';
import ImpuestoEditar from './impuesto/ImpuestoEditar.jsx';

import Vehiculos from './vehiculo/Vehiculos.jsx';
import VehiculoAgregar from './vehiculo/VehiculoAgregar.jsx';
import VehiculoEditar from './vehiculo/VehiculoEditar.jsx';

import Bancos from './banco/Bancos.jsx';
import BancoDetalle from './banco/BancoDetalle.jsx';
import BancoAgregar from './banco/BancoAgregar.jsx';
import BancoEditar from './banco/BancoEditar.jsx';

import Empresa from './empresa/Empresa.jsx';
import EmpresaEditar from './empresa/EmpresaEditar.jsx';

import Sucursales from './sucursal/Sucursales.jsx';
import SucursalAgregar from './sucursal/SucursalAgregar.jsx';
import SucursalEditar from './sucursal/SucursalEditar.jsx';

import Conceptos from './concepto/Conceptos.jsx';
import ConceptoAgregar from './concepto/ConceptoAgregar.jsx';
import ConceptoEditar from './concepto/ConceptoEditar.jsx';

import Marcas from './marca/Marcas.jsx';
import MarcaAgregar from './marca/MarcaAgregar.jsx';
import MarcaEditar from './marca/MarcaEditar.jsx';

import Atributos from './atributo/Atributos.jsx';
import AtributosAgregar from './atributo/AtributosAgregar.jsx';
import AtributosEditar from './atributo/AtributosEditar.jsx';

export {
    Almacenes,
    AlmacenAgregar,
    AlmacenEditar,

    Categorias,
    CategoriaAgregar,
    CategoriaEditar,

    Medidas,
    MedidaAgregar,
    MedidaEditar,

    Monedas,
    MonedaAgregar,
    MonedaEditar,

    Comprobantes,
    ComprobanteAgregar,
    ComprobanteEditar,

    Impuestos,
    ImpuestoAgregar,
    ImpuestoEditar,

    Vehiculos,
    VehiculoAgregar,
    VehiculoEditar,

    Bancos,
    BancoDetalle,
    BancoAgregar,
    BancoEditar,

    Empresa,
    EmpresaEditar,

    Sucursales,
    SucursalAgregar,
    SucursalEditar,

    Conceptos,
    ConceptoAgregar,
    ConceptoEditar,

    Marcas,
    MarcaAgregar,
    MarcaEditar,

    Atributos,
    AtributosAgregar,
    AtributosEditar,
}

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Configuracion = (props) => {
    return (
        <ContainerMenu
            title={"Seleccione el módulo correspondiente"}
            subMenus={props.token.userToken.menus[6].subMenus}
            url={props.match.url}
        />
    );
}

Configuracion.propTypes = {
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

const ConnectedConfiguracion = connect(mapStateToProps, null)(Configuracion);

export default ConnectedConfiguracion;