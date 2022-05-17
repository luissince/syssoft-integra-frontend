import React from 'react';
import { Switch, Route, Redirect, Link, NavLink} from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut, closeProject } from '../../redux/actions';
import Menu from '../layouts/menu/Menu';
import Head from '../layouts/head/Head';
import Footer from '../layouts/footer/Footer';
import Main from './Main';
import Dashboard from '../dashboard/Dashboard';
import Clientes from '../facturacion/Clientes';
import Ventas from '../facturacion/Ventas';
import Cobros from '../facturacion/Cobros';
import Creditos from '../facturacion/Creditos';
import Cotizaciones from '../facturacion/Cotizaciones';
import Reservas from '../facturacion/Reservas';
import Monedas from '../ajustes/Monedas';
import Comprobantes from '../ajustes/Comprobantes';
import Impuestos from '../ajustes/Impuestos';
import Bancos from '../ajustes/Bancos';
import BancoDetalle from '../ajustes/registros/BancoDetalle';
import Sedes from '../ajustes/Sedes';
import Proyectos from '../ajustes/Proyectos';
import ProcesoProyecto from '../ajustes/proyecto/ProcesoProyecto';
import Manzanas from '../logistica/Manzanas';
import Lotes from '../logistica/Lotes';
import LoteDetalle from '../logistica/registro/LoteDetalle';
import VentaProceso from '../facturacion/registros/VentaProceso';
import VentaDetalle from '../facturacion/registros/VentaDetalle';
import ClienteProceso from '../facturacion/registros/ClienteProceso';
import CobroProceso from '../facturacion/registros/CobroProceso';
import CobroDetalle from '../facturacion/registros/CobroDetalle';
import GastoProceso from '../tesoreria/registros/GastoProceso';
import GastoDetalle from '../tesoreria/registros/GastoDetalle';
import CreditoProceso from '../facturacion/registros/CreditoProceso';
import Perfiles from '../seguridad/Perfiles';
import Usuarios from '../seguridad/Usuarios';
import Accesos from '../seguridad/Accesos';
import UsuarioProceso from '../seguridad/registros/UsuarioProceso';
import Conceptos from '../tesoreria/Conceptos';
import Gastos from '../tesoreria/Gastos';
import RepVentas from '../reporte/RepVentas';
import RepFinanciero from '../reporte/RepFinanciero';
import RepLotes from '../reporte/RepLotes';
import RepClientes from '../reporte/RepClientes';

import logoEmpresa from '../../recursos/images/INMOBILIARIA.png';
import icono from '../../recursos/images/inmobiliarianav.png';

const Page404 = (props) => {
    return (
        <div className="px-4 py-5 my-5 text-center">
            <img className="d-block mx-auto mb-4" src={logoEmpresa} alt="Logo" width="150" />
            <h1 className="display-5 fw-bold">Error 404 página no encontrada</h1>
            <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">No se encuentra la página que ha solicitado.</p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <button type="button" onClick={() => props.history.goBack()} className="btn btn-outline-secondary btn-lg px-4"><i className="bi bi-arrow-left"></i> Regresar</button>
                </div>
            </div>
        </div>
    )
}


class Inicio extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false
        }
        this.menuRef = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('focus', this.onEventFocused)
    }

    componentWillUnmount() {
        window.removeEventListener('focus', this.onEventFocused)
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
            if (projectToken === null) {
                this.props.restoreProject();
            }
        }
    }

    setOpen = () => {
        // this.setState({ isModal: !this.state.isModal }, () => {
        //     this.menuRef.current.handleToggleSidebar(this.state.isModal);
        // });
        console.log("dd")
    }

    setMinimun = () => {
        document.getElementById("sidebar").classList.toggle("active");
    }

    render() {
        if (this.props.token.userToken == null) {
            return <Redirect to="/login" />
        }

        if (this.props.token.project === null) {
            return <Redirect to="/principal" />
        }

        const { path, url } = this.props.match;
        const { project, userToken } = this.props.token;
        return (
            <div className='app'>
                {/* <Menu  {...this.props} ref={this.menuRef} url={url} /> */}

                <nav id="sidebar">
                    <div className='pro-sidebar-inner'>
                        <div className='pro-sidebar-layout'>
                            <div className="sidebar-header">
                            <img className="d-block mx-auto mb-4" src={icono} alt="Logo" width="150" />
                                <h5>INMOBILIARIA GMYC</h5>
                            </div>

                            <ul className="list-unstyled components">
                                <p>{project.nombre}</p>
                                <div className="line"></div>
                                {
                                    userToken.menus.map((menu, index) => (
                                        menu.submenu.length === 0 && menu.estado === 1 ?
                                            <li key={index} className="">
                                                <NavLink to={`${url}/${menu.ruta}`}
                                                    className="pro-inner-item" 
                                                    activeClassName='active-link'
                                                    role="button">
                                                    <span className="pro-icon-wrapper">
                                                        <span className="pro-icon">
                                                            {<i className={menu.icon}></i>}
                                                        </span>
                                                    </span>
                                                    <span className="pro-item-content">
                                                        {menu.nombre}
                                                    </span>
                                                </NavLink>
                                            </li>
                                            :

                                            menu.submenu.filter(submenu => submenu.estado === 1).length !== 0 ?
                                                <li key={index}>
                                                    <a href={"#mn"+index}
                                                        data-bs-toggle="collapse"
                                                        aria-expanded="false"
                                                        className="pro-inner-item"
                                                        role="button">
                                                        <span className="pro-icon-wrapper">
                                                            <span className="pro-icon">
                                                                {<i className={menu.icon}></i>}
                                                            </span>
                                                        </span>
                                                        <span className="pro-item-content">
                                                            {menu.nombre}
                                                        </span>
                                                        <span className="suffix-wrapper">
                                                            <span className="badge yellow">{menu.submenu.filter(submenu => submenu.estado === 1).length}</span>
                                                        </span>
                                                        <span className="pro-arrow-wrapper">
                                                            <span className="pro-arrow"></span>
                                                        </span>
                                                    </a>

                                                    <ul className="collapse list-unstyled" id={"mn"+index}>
                                                        {
                                                            menu.submenu.map((submenu, indexm) => (
                                                                submenu.estado === 1 ?
                                                                    <li key={indexm}>
                                                                        <NavLink to={`${url}/${submenu.ruta}`} 
                                                                        className="pro-inner-item"
                                                                        activeClassName='active-link'
                                                                        role="button">
                                                                            <span className="pro-icon-wrapper">
                                                                                <span className="pro-icon">
                                                                                    <i className="fa fa-minus"></i>
                                                                                </span>
                                                                            </span>
                                                                            <span className="pro-item-content">
                                                                                {submenu.nombre}
                                                                            </span>
                                                                        </NavLink>
                                                                    </li>
                                                                    :
                                                                    null
                                                            ))
                                                        }
                                                    </ul>
                                                </li>

                                                :
                                                null
                                    ))
                                }
                                {/* <li className="active">
                                    <a className="pro-inner-item" role="button">
                                        <span className="pro-icon-wrapper">
                                            <span className="pro-icon">
                                                <i className="bi bi-apple"></i>
                                            </span>
                                        </span>
                                        <span className="pro-item-content">
                                            Dashboard
                                        </span>
                                    </a>
                                </li>

                                <li>
                                    <a href="#homeSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="pro-inner-item" role="button">
                                        <span className="pro-icon-wrapper">
                                            <span className="pro-icon">
                                                <i className="bi bi-apple"></i>
                                            </span>
                                        </span>
                                        <span className="pro-item-content">
                                            Seguridad
                                        </span>
                                        <span className="suffix-wrapper">
                                            <span className="badge yellow">3</span>
                                        </span>
                                        <span className="pro-arrow-wrapper">
                                            <span className="pro-arrow"></span>
                                        </span>
                                    </a>

                                    <ul className="collapse list-unstyled" id="homeSubmenu">
                                        <li >
                                            <a href="#" className="pro-inner-item">
                                                <span className="pro-icon-wrapper">
                                                    <span className="pro-icon">
                                                        <i className="fa fa-minus"></i>
                                                    </span>
                                                </span>
                                                <span className="pro-item-content">
                                                    Home 1
                                                </span>
                                            </a>
                                        </li>
                                    </ul>
                                </li> */}
                            </ul>

                            <ul className="list-unstyled CTAs">
                                {/* <li>
                                    <a href="https://bootstrapious.com/tutorial/files/sidebar.zip" className="download">
                                        Download source
                                    </a>
                                </li> */}
                                <li>
                                    <a href="https://bootstrapious.com/p/bootstrap-sidebar" className="article">
                                        {userToken.nombres + " " + userToken.apellidos}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <main className=' position-relative'>
                    <div className="container-fluid">
                        <Head {...this.props} setOpen={this.setOpen} setMinimun={this.setMinimun} />

                        <Switch>
                            <Route
                                path="/inicio"
                                exact={true}>
                                <Redirect to={`${path}/main`} />
                            </Route>
                            <Route
                                path={`${path}/main`}
                                render={(props) => <Main {...props} />}
                            />
                            <Route
                                path={`${path}/dashboard`}
                                render={(props) => <Dashboard {...props} />}
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
                                render={(props) => <Sedes {...props} />}
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
                                path={`${path}/RepClientes`}
                                render={(props) => <RepClientes {...props} />}
                            />
                            <Route component={Page404} />
                        </Switch>
                    </div>
                    <Footer />
                </main>

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
