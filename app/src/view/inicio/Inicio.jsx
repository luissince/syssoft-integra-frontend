import React from 'react';
// import { io } from "socket.io-client";
// import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut, closeProject } from '../../redux/actions';
import Menu from '../../components/menu/Menu';
import Head from '../../components/head/Head';

import Notifications from './notificacion/Notifications';
import Dashboard from './dashboard/Dashboard';

import Ventas from './facturacion/venta/Ventas';
import VentaProceso from './facturacion/venta/VentaProceso';
import VentaDetalle from './facturacion/venta/VentaDetalle';

import Cobros from './facturacion/cobro/Cobros';
import CobroProceso from './facturacion/cobro/CobroProceso';
import CobroDetalle from './facturacion/cobro/CobroDetalle';

import Creditos from './facturacion/credito/Creditos';
import CreditoProceso from './facturacion/credito/CreditoProceso';

import Cotizaciones from './facturacion/cotizacion/Cotizaciones.jsx';
import CotizacioneCrear from './facturacion/cotizacion/CotizacionCrear.jsx';
import CotizacioneEditar from './facturacion/cotizacion/CotizacionEditar.jsx';
import CotizacionDetalle from './facturacion/cotizacion/CotizacionDetalle.jsx';

import GuiaRemision from './facturacion/guiaremision/GuiaRemision.jsx';
import GuiaRemisionCrear from './facturacion/guiaremision/GuiaRemisionCrear.jsx';
import GuiaRemisionEditar from './facturacion/guiaremision/GuiaRemisionEditar.jsx';
import GuiaRemisionDetalle from './facturacion/guiaremision/GuiaRemisionDetalle.jsx';

import Reservas from './facturacion/reserva/Reservas';

import Socios from './facturacion/socio/Socios';

import Monedas from './ajustes/Monedas';
import Comprobantes from './ajustes/Comprobantes';

import Impuestos from './ajustes/impuesto/Impuestos';

import Bancos from './ajustes/banco/Bancos';
import BancoDetalle from './ajustes/banco/BancoDetalle';
import BancoAgregar from './ajustes/banco/BancoAgregar';
import BancoEditar from './ajustes/banco/BancoEditar';

import Empresa from './ajustes/Empresa';
import EmpresaProceso from './ajustes/registros/EmpresaProceso';
import Sucursales from './ajustes/Sucursales';
import ProcesoSucursal from './ajustes/sucursal/ProcesoSucursal';

import Categorias from './logistica/categoria/Categorias';
import CategoriaAgregar from './logistica/categoria/CategoriaAgregar';
import CategoriaEditar from './logistica/categoria/CategoriaEditar';

import Productos from './logistica/producto/Productos';
import ProductoAgregar from './logistica/producto/agregar/ProductoAgregar';
import ProductoEditar from './logistica/producto/editar/ProductoEditar';
import ProductoDetalle from './logistica/producto/detalle/ProductoDetalle';

import Almacenes from './logistica/almacen/Almacenes';
import AlmacenAgregar from './logistica/almacen/AlmacenAgregar';
import AlmacenEditar from './logistica/almacen/AlmacenEditar';

import Ajuste from './logistica/ajuste/Ajuste.jsx';
import AjusteAgregar from './logistica/ajuste/AjusteAgregar.jsx';
import AjusteDetalle from './logistica/ajuste/AjusteDetalle.jsx';

import Inventario from './logistica/inventario/Inventario.jsx';

import Kardex from './logistica/kardex/Kardex.jsx';

import Clientes from './facturacion/cliente/Clientes';
import ClienteAgregar from './facturacion/cliente/ClienteAgregar';
import ClienteEditar from './facturacion/cliente/ClienteEditar';
import ClienteDetalle from './facturacion/cliente/ClienteDetalle';

import NotaCredito from './facturacion/notacredito/NotaCredito';
import NotaCreditoProceso from './facturacion/notacredito/NotaCreditoProceso';
import NotaCreditoDetalle from './facturacion/notacredito/NotaCreditoDetalle';

import Conceptos from './tesoreria/concepto/Conceptos.jsx';
import ConceptoAgregar from './tesoreria/concepto/ConceptoAgregar.jsx';
import ConceptoEditar from './tesoreria/concepto/ConceptoEditar.jsx';

import Gastos from './tesoreria/gasto/Gastos';
import GastoProceso from './tesoreria/gasto/GastoProceso';
import GastoDetalle from './tesoreria/gasto/GastoDetalle';

import Compras from './tesoreria/compra/Compras.jsx';
import CompraCrear from './tesoreria/compra/CompraCrear.jsx';
import CompraDetalle from './tesoreria/compra/CompraDetalle.jsx';

import Perfiles from './seguridad/Perfiles';
import Usuarios from './seguridad/Usuarios';
import Accesos from './seguridad/Accesos';
import UsuarioProceso from './seguridad/registros/UsuarioProceso';

import RepVentas from './reporte/RepVentas';
import RepFinanciero from './reporte/RepFinanciero';
import RepProductos from './reporte/RepProductos';
import RepClientes from './reporte/RepClientes';
import CpeConsultar from './cpesunat/CpeConsultar';
import CpeElectronicos from './cpesunat/CpeElectronicos';
import Bienvenido from './bienvenido/Bienvenido';
import NotFoundMain from '../../components/errors/NotFoundMain';
import { getNotifications } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import { CANCELED } from '../../model/types/types';

class Inicio extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false,
            notificaciones: [],
        }

        this.abortNotificacion = new AbortController();
        // this.socket = io();
        // this.audio = new Audio(mixkit);
    }

    async componentDidMount() {
        window.addEventListener('focus', this.onEventFocused);
        window.addEventListener('resize', this.onEventResize);
        this.loadSideBar();
        this.loadNotifications();

        // this.socket.on('message', text => {
        //     NotificationManager.info(text, "Notificación");
        //     if(this.audio !== undefined) this.audio.play();
        // });
    }

    componentWillUnmount() {
        window.removeEventListener('focus', this.onEventFocused);
        window.removeEventListener('resize', this.onEventResize);

        this.abortNotificacion.abort();
        // this.socket.disconnect();
    }

    onEventFocused = (event) => {
        let userToken = window.localStorage.getItem('login');
        if (userToken === null) {
            this.props.restore();
            this.props.history.push("login");
        } else {
            let tokenCurrent = JSON.parse(userToken);
            let tokenOld = this.props.token.userToken;
            if (tokenCurrent.token !== tokenOld.token) {
                window.location.href = "/";
                return;
            }

            let projectToken = window.localStorage.getItem('project');

            let projectCurrent = JSON.parse(projectToken)
            let projectOld = this.props.token.project;

            if (JSON.stringify(projectCurrent) !== JSON.stringify(projectOld)) {
                window.location.href = "/";
                return;
            }

            if (projectToken === null) {
                this.props.restoreProject();
            }
        }
    }

    onEventResize(event) {
        if (event.target.innerWidth <= 768 && document.getElementById("sidebar").classList.contains("active")) {
            document.getElementById("sidebar").classList.remove("active");
        }
    }

    openAndClose = () => {
        let windowWidth = window.innerWidth;
        if (windowWidth <= 768) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar.classList.contains("toggled")) {
                sidebar.classList.remove("toggled")
            } else {
                sidebar.classList.add("toggled")
            }
        } else {
            document.getElementById("sidebar").classList.toggle("active");
        }
    }

    loadSideBar() {
        const value = document.querySelectorAll('#sidebar ul li .pro-inner-item[data-bs-toggle="collapse"]');
        value.forEach(element => {
            element.parentNode.querySelector('ul').addEventListener('shown.bs.collapse', function (event) {
                value.forEach(item => {
                    if (event.target.getAttribute('id') !== item.parentNode.querySelector('ul').getAttribute('id')) {
                        item.setAttribute("aria-expanded", "false");
                        item.parentNode.querySelector('ul').classList.remove("show");
                    }
                });
            });
        });
    }

    async loadNotifications() {
        const response = await getNotifications(this.abortNotificacion.signal);
        if (response instanceof SuccessReponse) {
            this.setState({ notificaciones: response.data });
        } else if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.setState({ notificaciones: [] });
        }
    }

    render() {
        if (this.props.token.userToken == null) {
            return <Redirect to="/login" />
        }

        if (this.props.token.project === null) {
            return <Redirect to="/principal" />
        }

        const { path, url } = this.props.match;

        return (

            <div className='app'>
                <Menu
                    {...this.props}
                    url={url}
                />

                <Head
                    {...this.props}
                    openAndClose={this.openAndClose}
                    notificaciones={this.state.notificaciones}
                />

                <Switch>
                    <Route
                        path="/inicio"
                        exact={true}>
                        <Redirect to={`${path}/main`} />
                    </Route>
                    <Route
                        path={`${path}/main`}
                        render={(props) => <Bienvenido {...props} />}
                    />
                    <Route
                        path={`${path}/dashboard`}
                        render={(props) => <Dashboard {...props} />}
                    />
                    <Route
                        path={`${path}/notifications`}
                        render={(props) => <Notifications {...props} />}
                    />
                    <Route
                        path={`${path}/perfiles`}
                        render={(props) => <Perfiles {...props} />}
                    />
                    <Route
                        path={`${path}/usuarios`}
                        exact={true}
                        render={(props) => <Usuarios {...props} />}
                    />
                    <Route
                        path={`${path}/usuarios/proceso`}
                        exact={true}
                        render={(props) => <UsuarioProceso {...props} />}
                    />

                    <Route
                        path={`${path}/accesos`}
                        render={(props) => <Accesos {...props} />}
                    />
                    <Route
                        path={`${path}/clientes`}
                        exact={true}
                        render={(props) => <Clientes {...props} />}
                    />
                    <Route
                        path={`${path}/clientes/agregar`}
                        exact={true}
                        render={(props) => <ClienteAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/clientes/editar`}
                        exact={true}
                        render={(props) => <ClienteEditar {...props} />}
                    />
                    <Route
                        path={`${path}/clientes/detalle`}
                        exact={true}
                        render={(props) => <ClienteDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/ventas`}
                        exact={true}
                        render={(props) => <Ventas {...props} />}
                    />
                    <Route
                        path={`${path}/ventas/proceso`}
                        exact={true}
                        render={(props) => <VentaProceso {...props} />}
                    />
                    <Route
                        path={`${path}/ventas/detalle`}
                        exact={true}
                        render={(props) => <VentaDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/cobros`}
                        exact={true}
                        render={(props) => <Cobros {...props} />}
                    />
                    <Route
                        path={`${path}/cobros/proceso`}
                        exact={true}
                        render={(props) => <CobroProceso {...props} />}
                    />
                    <Route
                        path={`${path}/cobros/detalle`}
                        exact={true}
                        render={(props) => <CobroDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/creditos`}
                        exact={true}
                        render={(props) => <Creditos {...props} />}
                    />
                    <Route
                        path={`${path}/creditos/proceso`}
                        exact={true}
                        render={(props) => <CreditoProceso {...props} />}
                    />
                    <Route
                        path={`${path}/socios`}
                        exact={true}
                        render={(props) => <Socios {...props} />}
                    />

                    <Route
                        path={`${path}/notacredito`}
                        exact={true}
                        render={(props) => <NotaCredito {...props} />}
                    />

                    <Route
                        path={`${path}/notacredito/proceso`}
                        exact={true}
                        render={(props) => <NotaCreditoProceso {...props} />}
                    />

                    <Route
                        path={`${path}/notacredito/detalle`}
                        exact={true}
                        render={(props) => <NotaCreditoDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/cotizaciones`}
                        exact={true}
                        render={(props) => <Cotizaciones {...props} />}
                    />
                    <Route
                        path={`${path}/cotizaciones/crear`}
                        exact={true}
                        render={(props) => <CotizacioneCrear {...props} />}
                    />
                    <Route
                        path={`${path}/cotizaciones/editar`}
                        exact={true}
                        render={(props) => <CotizacioneEditar {...props} />}
                    />
                    <Route
                        path={`${path}/cotizaciones/detalle`}
                        exact={true}
                        render={(props) => <CotizacionDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/guiaremision`}
                        exact={true}
                        render={(props) => <GuiaRemision {...props} />}
                    />
                    <Route
                        path={`${path}/guiaremision/crear`}
                        exact={true}
                        render={(props) => <GuiaRemisionCrear {...props} />}
                    />
                    <Route
                        path={`${path}/guiaremision/editar`}
                        exact={true}
                        render={(props) => <GuiaRemisionEditar {...props} />}
                    />
                    <Route
                        path={`${path}/guiaremision/detalle`}
                        exact={true}
                        render={(props) => <GuiaRemisionDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/reservas`}
                        render={(props) => <Reservas {...props} />}
                    />

                    <Route
                        path={`${path}/monedas`}
                        render={(props) => <Monedas {...props} />}
                    />

                    <Route
                        path={`${path}/comprobantes`}
                        render={(props) => <Comprobantes {...props} />}
                    />

                    <Route
                        path={`${path}/bancos`}
                        exact={true}
                        render={(props) => <Bancos {...props} />}
                    />
                    <Route
                        path={`${path}/bancos/detalle`}
                        exact={true}
                        render={(props) => <BancoDetalle {...props} />}
                    />
                    <Route
                        path={`${path}/bancos/agregar`}
                        exact={true}
                        render={(props) => <BancoAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/bancos/editar`}
                        exact={true}
                        render={(props) => <BancoEditar {...props} />}
                    />

                    <Route
                        path={`${path}/empresa`}
                        exact={true}
                        render={(props) => <Empresa {...props} />}
                    />
                    <Route
                        path={`${path}/empresa/proceso`}
                        exact={true}
                        render={(props) => <EmpresaProceso {...props} />}
                    />
                    <Route
                        path={`${path}/sucursales`}
                        exact={true}
                        render={(props) => <Sucursales {...props} />}
                    />
                    <Route
                        path={`${path}/sucursales/proceso`}
                        exact={true}
                        render={(props) => <ProcesoSucursal {...props} />}
                    />
                    <Route
                        path={`${path}/impuestos`}
                        render={(props) => <Impuestos {...props} />}
                    />

                    <Route
                        path={`${path}/categorias`}
                        exact={true}
                        render={(props) => <Categorias {...props} />}
                    />
                    <Route
                        path={`${path}/categorias/agregar`}
                        exact={true}
                        render={(props) => <CategoriaAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/categorias/editar`}
                        exact={true}
                        render={(props) => <CategoriaEditar {...props} />}
                    />

                    <Route
                        path={`${path}/productos`}
                        exact={true}
                        render={(props) => <Productos {...props} />}
                    />
                    <Route
                        path={`${path}/productos/detalle`}
                        exact={true}
                        render={(props) => <ProductoDetalle {...props} />}
                    />
                    <Route
                        path={`${path}/productos/agregar`}
                        exact={true}
                        render={(props) => <ProductoAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/productos/editar`}
                        exact={true}
                        render={(props) => <ProductoEditar {...props} />}
                    />

                    <Route
                        path={`${path}/almacenes`}
                        exact={true}
                        render={(props) => <Almacenes {...props} />}
                    />
                    <Route
                        path={`${path}/almacenes/agregar`}
                        exact={true}
                        render={(props) => <AlmacenAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/almacenes/editar`}
                        exact={true}
                        render={(props) => <AlmacenEditar {...props} />}
                    />

                    <Route
                        path={`${path}/ajuste`}
                        exact={true}
                        render={(props) => <Ajuste {...props} />}
                    />
                    <Route
                        path={`${path}/ajuste/agregar`}
                        exact={true}
                        render={(props) => <AjusteAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/ajuste/detalle`}
                        exact={true}
                        render={(props) => <AjusteDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/inventario`}
                        exact={true}
                        render={(props) => <Inventario {...props} />}
                    />

                    <Route
                        path={`${path}/kardex`}
                        exact={true}
                        render={(props) => <Kardex {...props} />}
                    />

                    <Route
                        path={`${path}/conceptos`}
                        exact={true}
                        render={(props) => <Conceptos {...props} />}
                    />
                    <Route
                        path={`${path}/conceptos/agregar`}
                        exact={true}
                        render={(props) => <ConceptoAgregar {...props} />}
                    />
                    <Route
                        path={`${path}/conceptos/editar`}
                        exact={true}
                        render={(props) => <ConceptoEditar {...props} />}
                    />

                    <Route
                        path={`${path}/gastos`}
                        exact={true}
                        render={(props) => <Gastos {...props} />}
                    />
                    <Route
                        path={`${path}/gastos/proceso`}
                        exact={true}
                        render={(props) => <GastoProceso {...props} />}
                    />
                    <Route
                        path={`${path}/gastos/detalle`}
                        exact={true}
                        render={(props) => <GastoDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/compras`}
                        exact={true}
                        render={(props) => <Compras {...props} />}
                    />
                    <Route
                        path={`${path}/compras/crear`}
                        exact={true}
                        render={(props) => <CompraCrear {...props} />}
                    />
                    <Route
                        path={`${path}/compras/detalle`}
                        exact={true}
                        render={(props) => <CompraDetalle {...props} />}
                    />

                    <Route
                        path={`${path}/repventas`}
                        render={(props) => <RepVentas {...props} />}
                    />
                    <Route
                        path={`${path}/repfinanciero`}
                        render={(props) => <RepFinanciero {...props} />}
                    />
                    <Route
                        path={`${path}/repproductos`}
                        render={(props) => <RepProductos {...props} />}
                    />
                    <Route
                        path={`${path}/repclientes`}
                        render={(props) => <RepClientes {...props} />}
                    />
                    <Route
                        path={`${path}/cpeelectronicos`}
                        render={(props) => <CpeElectronicos {...props} />}
                    />
                    <Route
                        path={`${path}/cpeconsultar`}
                        render={(props) => <CpeConsultar {...props} />}
                    />
                    <Route component={NotFoundMain} />
                </Switch>
                {/* <NotificationContainer /> */}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        restore: () => dispatch(signOut()),
        restoreProject: () => dispatch(closeProject())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Inicio);
