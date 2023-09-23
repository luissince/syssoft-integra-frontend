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

import Cotizaciones from './facturacion/cotizacion/Cotizaciones';

import Reservas from './facturacion/reserva/Reservas';

import Socios from './facturacion/socio/Socios';

import Monedas from './ajustes/Monedas';
import Comprobantes from './ajustes/Comprobantes';
import Impuestos from './ajustes/Impuestos';
import Bancos from './ajustes/Bancos';
import BancoDetalle from './ajustes/registros/BancoDetalle';
import Sedes from './ajustes/Sedes';
import SedeProceso from './ajustes/registros/SedeProceso';
import EmpresaProceso from './ajustes/registros/EmpresaProceso';
import Proyectos from './ajustes/Proyectos';
import ProcesoProyecto from './ajustes/proyecto/ProcesoProyecto';
import Manzanas from './logistica/Manzanas';
import Lotes from './logistica/Lotes';
import LoteDetalle from './logistica/registro/LoteDetalle';

import Clientes from './facturacion/cliente/Clientes';
import ClienteProceso from './facturacion/cliente/ClienteProceso';
import ClienteDetalle from './facturacion/cliente/ClienteDetalle';

import NotaCredito from './facturacion/notacredito/NotaCredito';
import NotaCreditoProceso from './facturacion/notacredito/NotaCreditoProceso';
import NotaCreditoDetalle from './facturacion/notacredito/NotaCreditoDetalle';

import Conceptos from './tesoreria/concepto/Conceptos';

import Gastos from './tesoreria/gasto/Gastos';
import GastoProceso from './tesoreria/gasto/GastoProceso';
import GastoDetalle from './tesoreria/gasto/GastoDetalle';


import Perfiles from './seguridad/Perfiles';
import Usuarios from './seguridad/Usuarios';
import Accesos from './seguridad/Accesos';
import UsuarioProceso from './seguridad/registros/UsuarioProceso';


import RepVentas from './reporte/RepVentas';
import RepFinanciero from './reporte/RepFinanciero';
import RepLotes from './reporte/RepLotes';
import RepClientes from './reporte/RepClientes';
import CpeConsultar from './cpesunat/CpeConsultar';
import CpeElectronicos from './cpesunat/CpeElectronicos';
import Bienvenido from './bienvenido/Bienvenido';
import NotFoundMain from '../../components/errors/NotFoundMain';
import { getNotifications } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error';

class Inicio extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false,
            notificaciones: [],
        }

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
        const response = await getNotifications();
        if (response instanceof SuccessReponse) {
            this.setState({ notificaciones: response.data });
        } else if (response instanceof ErrorResponse) {
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
                <Menu  {...this.props} url={url} />

                <Head {...this.props} openAndClose={this.openAndClose} notificaciones={this.state.notificaciones} />

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
                        path={`${path}/clientes/proceso`}
                        exact={true}
                        render={(props) => <ClienteProceso {...props} />}
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
                        render={(props) => <Cotizaciones {...props} />}
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
                        path={`${path}/sedes`}
                        exact={true}
                        render={(props) => <Sedes {...props} />}
                    />
                    <Route
                        path={`${path}/sedes/proceso`}
                        exact={true}
                        render={(props) => <SedeProceso {...props} />}
                    />
                    <Route
                        path={`${path}/sedes/empresa`}
                        exact={true}
                        render={(props) => <EmpresaProceso {...props} />}
                    />
                    <Route
                        path={`${path}/proyectos`}
                        exact={true}
                        render={(props) => <Proyectos {...props} />}
                    />
                    <Route
                        path={`${path}/proyectos/proceso`}
                        exact={true}
                        render={(props) => <ProcesoProyecto {...props} />}
                    />
                    <Route
                        path={`${path}/impuestos`}
                        render={(props) => <Impuestos {...props} />}
                    />
                    <Route
                        path={`${path}/manzanas`}
                        render={(props) => <Manzanas {...props} />}
                    />
                    <Route
                        path={`${path}/lotes`}
                        exact={true}
                        render={(props) => <Lotes {...props} />}
                    />
                    <Route
                        path={`${path}/lotes/detalle`}
                        exact={true}
                        render={(props) => <LoteDetalle {...props} />}
                    />
                    <Route
                        path={`${path}/conceptos`}
                        render={(props) => <Conceptos {...props} />}
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
                        path={`${path}/repventas`}
                        render={(props) => <RepVentas {...props} />}
                    />
                    <Route
                        path={`${path}/repfinanciero`}
                        render={(props) => <RepFinanciero {...props} />}
                    />
                    <Route
                        path={`${path}/replotes`}
                        render={(props) => <RepLotes {...props} />}
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
