import React from 'react';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';
// import { io } from "socket.io-client";
// import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { addNotification, clearNoticacion } from '../../redux/noticacionSlice.js';
import { projectClose, signOut } from '../../redux/principalSlice.js';
import { clearListaVenta } from '../../redux/predeterminadoSlice.js';

import Bienvenido from './bienvenido/Bienvenido.jsx';
import NotFoundMain from '../../components/errors/NotFoundMain.jsx';

import Menu from '../../components/menu/Menu.jsx';
import Head from '../../components/head/Head.jsx';

import Notifications from './notificacion/Notifications.jsx';
import Dashboard from './dashboard/Dashboard.jsx';

import Ventas from './facturacion/venta/listar/Ventas.jsx';
import VentaCrear from './facturacion/venta/crear/VentaCrear.jsx';
import VentaCrearEscritorio from './facturacion/venta/crear-clasico/VentaCrearEscritorio.jsx';

import VentaDetalle from './facturacion/venta/detalle/VentaDetalle.jsx';

import Cobros from './facturacion/cobro/lista/Cobros';
import CobroCrear from './facturacion/cobro/crear/CobroCrear';
import CobroDetalle from './facturacion/cobro/detalle/CobroDetalle';

import Cotizaciones from './facturacion/cotizacion/lista/Cotizaciones.jsx';
import CotizacioneCrear from './facturacion/cotizacion/crear/CotizacionCrear.jsx';
import CotizacioneEditar from './facturacion/cotizacion/editar/CotizacionEditar.jsx';
import CotizacionDetalle from './facturacion/cotizacion/detalle/CotizacionDetalle.jsx';

import GuiaRemision from './facturacion/guiaremision/listar/GuiaRemision.jsx';
import GuiaRemisionCrear from './facturacion/guiaremision/crear/GuiaRemisionCrear.jsx';
import GuiaRemisionEditar from './facturacion/guiaremision/editar/GuiaRemisionEditar.jsx';
import GuiaRemisionDetalle from './facturacion/guiaremision/detalle/GuiaRemisionDetalle.jsx';

import NotaCredito from './facturacion/notacredito/NotaCredito';
import NotaCreditoProceso from './facturacion/notacredito/NotaCreditoProceso';
import NotaCreditoDetalle from './facturacion/notacredito/NotaCreditoDetalle';

import Ingresos from './facturacion/ingreso/lista/Ingresos.jsx';

import CuentasPorCobrar from './facturacion/cuenta-cobrar/lista/CuentasPorCobrar.jsx';
import CuentasPorCobrarAbonar from './facturacion/cuenta-cobrar/crear/CuentasPorCobrarAbonar.jsx';

import Monedas from './ajustes/moneda/Monedas.jsx';
import MonedaAgregar from './ajustes/moneda/MonedaAgregar.jsx';
import MonedaEditar from './ajustes/moneda/MonedaEditar.jsx';

import Comprobantes from './ajustes/comprobante/Comprobantes.jsx';
import ComprobanteAgregar from './ajustes/comprobante/ComprobanteAgregar.jsx';
import ComprobanteEditar from './ajustes/comprobante/ComprobanteEditar.jsx';

import Impuestos from './ajustes/impuesto/Impuestos.jsx';
import ImpuestoAgregar from './ajustes/impuesto/ImpuestoAgregar.jsx';
import ImpuestoEditar from './ajustes/impuesto/ImpuestoEditar.jsx';

import Vehiculos from './ajustes/vehiculo/Vehiculos.jsx';
import VehiculoAgregar from './ajustes/vehiculo/VehiculoAgregar.jsx';
import VehiculoEditar from './ajustes/vehiculo/VehiculoEditar.jsx';

import Bancos from './ajustes/banco/Bancos';
import BancoDetalle from './ajustes/banco/BancoDetalle';
import BancoAgregar from './ajustes/banco/BancoAgregar';
import BancoEditar from './ajustes/banco/BancoEditar';

import Empresa from './ajustes/empresa/Empresa.jsx';
import EmpresaEditar from './ajustes/empresa/EmpresaEditar.jsx';

import Sucursales from './ajustes/sucursal/Sucursales.jsx';
import SucursalAgregar from './ajustes/sucursal/SucursalAgregar.jsx';
import SucursalEditar from './ajustes/sucursal/SucursalEditar.jsx';

import Categorias from './logistica/categoria/Categorias';
import CategoriaAgregar from './logistica/categoria/CategoriaAgregar';
import CategoriaEditar from './logistica/categoria/CategoriaEditar';

import Medidas from './logistica/medida/Medidas.jsx';
import MedidaAgregar from './logistica/medida/MedidaAgregar.jsx';
import MedidaEditar from './logistica/medida/MedidaEditar.jsx';

import Productos from './logistica/producto/lista/Productos';
import ProductoAgregar from './logistica/producto/agregar/ProductoAgregar';
import ProductoEditar from './logistica/producto/editar/ProductoEditar';
import ProductoDetalle from './logistica/producto/detalle/ProductoDetalle';

import Almacenes from './logistica/almacen/Almacenes';
import AlmacenAgregar from './logistica/almacen/AlmacenAgregar';
import AlmacenEditar from './logistica/almacen/AlmacenEditar';

import Ajuste from './logistica/ajuste/lista/Ajuste.jsx';
import AjusteCrear from './logistica/ajuste/crear/AjusteCrear.jsx';
import AjusteDetalle from './logistica/ajuste/detalle/AjusteDetalle.jsx';

import Traslado from './logistica/traslado/listar/Traslado.jsx';
import TrasladoCrear from './logistica/traslado/crear/TrasladoCrear.jsx';
import TrasladoDetalle from './logistica/traslado/detalle/TrasladoDetalle.jsx';

import Inventario from './logistica/inventario/Inventario.jsx';

import Kardex from './logistica/kardex/Kardex.jsx';

import Conceptos from './tesoreria/concepto/Conceptos.jsx';
import ConceptoAgregar from './tesoreria/concepto/ConceptoAgregar.jsx';
import ConceptoEditar from './tesoreria/concepto/ConceptoEditar.jsx';

import Gastos from './tesoreria/gasto/lista/Gastos.jsx';
import GastoCrear from './tesoreria/gasto/crear/GastoCrear.jsx';
import GastoDetalle from './tesoreria/gasto/detalle/GastoDetalle.jsx';

import Compras from './tesoreria/compra/lista/Compras.jsx';
import CompraCrear from './tesoreria/compra/crear/CompraCrear.jsx';
import CompraDetalle from './tesoreria/compra/detalle/CompraDetalle.jsx';

import Salidas from './tesoreria/salida/lista/Salidas.jsx';

import CuentasPorPagar from './tesoreria/cuenta-pagar/lista/CuentasPorPagar.jsx';
import CuentasPorPagarAmortizar from './tesoreria/cuenta-pagar/crear/CuentasPorPagarAmortizar.jsx';

import Perfiles from './seguridad/perfil/Perfiles.jsx';
import PerfilAgregar from './seguridad/perfil/PerfilAgregar.jsx';
import PerfilEditar from './seguridad/perfil/PerfilEditar.jsx';

import Usuarios from './seguridad/usuario/Usuarios.jsx';
import UsuarioAgregar from './seguridad/usuario/UsuarioAgregar.jsx';
import UsuarioEditar from './seguridad/usuario/UsuarioEditar.jsx';
import UsuarioResetear from './seguridad/usuario/UsuarioResetear.jsx';

import Accesos from './seguridad/acceso/Accesos.jsx';

import RepVentas from './reporte/RepVentas';
import RepFinanciero from './reporte/RepFinanciero';
import RepProductos from './reporte/RepProductos';
import RepClientes from './reporte/RepClientes';
import RepCpeSunat from './reporte/RepCpeSunat';

import CpeElectronicos from './cpesunat/lista/CpeElectronicos.jsx';
import CpeConsultar from './cpesunat/consulta/CpeConsultar.jsx';

import Personas from './contacto/todo/Personas.jsx';
import PersonaAgregar from './contacto/agregar/PersonaAgregar.jsx';
import PersonaEditar from './contacto/editar/PersonaEditar.jsx';
import PersonaDetalle from './contacto/detalle/PersonaDetalle.jsx';
import Clientes from './contacto/cliente/Clientes.jsx';
import Proveedores from './contacto/proveedor/Proveedores.jsx';
import Conductores from './contacto/conductor/Conductores.jsx';

import { listNotificacion } from '../../network/rest/principal.network.js';
import SuccessReponse from '../../model/class/response.js';
import ErrorResponse from '../../model/class/error-response.js';
import { CANCELED } from '../../model/types/types.js';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Inicio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModal: false,
      notificaciones: [],
    };

    this.abortNotificacion = new AbortController();

    this.refSideBar = React.createRef();
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

  onEventFocused = () => {
    const userToken = window.localStorage.getItem('login');
    if (userToken === null) {
      this.props.signOut();
      return;
    }

    const tokenCurrent = JSON.parse(userToken);
    const tokenOld = this.props.token.userToken;
    if (tokenCurrent.token !== tokenOld.token) {
      window.location.href = '/';
      return;
    }

    const projectToken = window.localStorage.getItem('project');

    const projectCurrent = JSON.parse(projectToken);
    const projectOld = this.props.token.project;

    if (JSON.stringify(projectCurrent) !== JSON.stringify(projectOld)) {
      window.location.href = '/';
      return;
    }

    if (projectToken === null) {
      this.props.projectClose();
    }

  };

  onEventResize() {
    const { refSideBar } = this;

    if (!refSideBar || !refSideBar.current) return;

    if (
      window.innerWidth <= 768 &&
      refSideBar.current.classList.contains('active')
    ) {
      refSideBar.current.classList.remove('active');
    }
  }

  openAndClose = () => {
    const { refSideBar } = this;

    if (!refSideBar || !refSideBar.current) return;

    const sidebar = refSideBar.current;
    const windowWidth = window.innerWidth;

    if (windowWidth <= 768) {
      sidebar.classList.toggle('toggled');
    } else {
      sidebar.classList.toggle('active');
    }
  };

  loadSideBar() {
    const { refSideBar } = this;

    if (!refSideBar || !refSideBar.current) return;

    const collapsibleItems = refSideBar.current.querySelectorAll('ul li .pro-inner-item[data-bs-toggle="collapse"]',);

    collapsibleItems.forEach((element) => {
      element.parentNode
        .querySelector('ul')
        .addEventListener('shown.bs.collapse', function (event) {
          collapsibleItems.forEach((item) => {
            if (
              event.target.getAttribute('id') !==
              item.parentNode.querySelector('ul').getAttribute('id')
            ) {
              item.setAttribute('aria-expanded', 'false');
              item.parentNode.querySelector('ul').classList.remove('show');
            }
          });
        });
    });
  }

  async loadNotifications() {
    const response = await listNotificacion(this.abortNotificacion.signal);
    if (response instanceof SuccessReponse) {
      this.setState({ notificaciones: response.data });
    } else if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ notificaciones: [] });
    }
  }

  render() {
    if (this.props.token.userToken == null) {
      return <Redirect to="/login" />;
    }

    if (this.props.token.project === null) {
      return <Redirect to="/principal" />;
    }

    const { path, url } = this.props.match;

    const pathname = this.props.location.pathname;

    return (
      <div className="app">
        <Menu
          refSideBar={this.refSideBar}
          path={path}
          url={url}
          pathname={pathname}
          project={this.props.token.project}
          userToken={this.props.token.userToken}
          empresa={this.props.empresa}
        />

        <Head
          {...this.props}
          openAndClose={this.openAndClose}
          notificaciones={this.state.notificaciones}
        />

        <Switch>
          {/* 
          --------------------------------------------------------
          | DASBOARD
          --------------------------------------------------------
          */}
          <Route path="/inicio" exact={true}>
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

          {/* 
          --------------------------------------------------------
          | SEGURIDAD
          --------------------------------------------------------
          */}

          <Route
            path={`${path}/perfiles`}
            exact={true}
            render={(props) => <Perfiles {...props} />}
          />
          <Route
            path={`${path}/perfiles/agregar`}
            exact={true}
            render={(props) => <PerfilAgregar {...props} />}
          />
          <Route
            path={`${path}/perfiles/editar`}
            exact={true}
            render={(props) => <PerfilEditar {...props} />}
          />

          <Route
            path={`${path}/usuarios`}
            exact={true}
            render={(props) => <Usuarios {...props} />}
          />
          <Route
            path={`${path}/usuarios/agregar`}
            exact={true}
            render={(props) => <UsuarioAgregar {...props} />}
          />
          <Route
            path={`${path}/usuarios/editar`}
            exact={true}
            render={(props) => <UsuarioEditar {...props} />}
          />
          <Route
            path={`${path}/usuarios/resetear`}
            exact={true}
            render={(props) => <UsuarioResetear {...props} />}
          />

          <Route
            path={`${path}/accesos`}
            render={(props) => <Accesos {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | FACTURACIÓN
          --------------------------------------------------------
          */}

          <Route
            path={`${path}/ventas`}
            exact={true}
            render={(props) => <Ventas {...props} />}
          />
          <Route
            path={`${path}/ventas/crear`}
            exact={true}
            render={(props) => <VentaCrear {...props} />}
          />
          <Route
            path={`${path}/ventas/crear-clasico`}
            exact={true}
            render={(props) => <VentaCrearEscritorio {...props} />}
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
            path={`${path}/cobros/crear`}
            exact={true}
            render={(props) => <CobroCrear {...props} />}
          />
          <Route
            path={`${path}/cobros/detalle`}
            exact={true}
            render={(props) => <CobroDetalle {...props} />}
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
            path={`${path}/ingresos`}
            exact={true}
            render={(props) => <Ingresos {...props} />}
          />

          <Route
            path={`${path}/cuentacobrar`}
            exact={true}
            render={(props) => <CuentasPorCobrar {...props} />}
          />
          <Route
            path={`${path}/cuentacobrar/detalle`}
            exact={true}
            render={(props) => <CuentasPorCobrarAbonar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | LOGISTICA
          --------------------------------------------------------
          */}
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
            path={`${path}/ajuste/crear`}
            exact={true}
            render={(props) => <AjusteCrear {...props} />}
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
            path={`${path}/medida`}
            exact={true}
            render={(props) => <Medidas {...props} />}
          />
          <Route
            path={`${path}/medida/agregar`}
            exact={true}
            render={(props) => <MedidaAgregar {...props} />}
          />
          <Route
            path={`${path}/medida/editar`}
            exact={true}
            render={(props) => <MedidaEditar {...props} />}
          />

          <Route
            path={`${path}/traslado`}
            exact={true}
            render={(props) => <Traslado {...props} />}
          />
          <Route
            path={`${path}/traslado/crear`}
            exact={true}
            render={(props) => <TrasladoCrear {...props} />}
          />
          <Route
            path={`${path}/traslado/detalle`}
            exact={true}
            render={(props) => <TrasladoDetalle {...props} />}
          />


          {/* 
          --------------------------------------------------------
          | CLIENTE
          --------------------------------------------------------
          */}

          <Route
            path={`${path}/todos`}
            exact={true}
            render={(props) => <Personas {...props} />}
          />
          <Route
            path={`${path}/todos/agregar`}
            exact={true}
            render={(props) => <PersonaAgregar {...props} />}
          />
          <Route
            path={`${path}/todos/editar`}
            exact={true}
            render={(props) => <PersonaEditar {...props} />}
          />
          <Route
            path={`${path}/todos/detalle`}
            exact={true}
            render={(props) => <PersonaDetalle {...props} />}
          />

          <Route
            path={`${path}/clientes`}
            exact={true}
            render={(props) => <Clientes {...props} />}
          />
          <Route
            path={`${path}/proveedores`}
            render={(props) => <Proveedores {...props} />}
          />
          <Route
            path={`${path}/conductores`}
            render={(props) => <Conductores {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | TESORERIA
          --------------------------------------------------------
          */}

          <Route
            path={`${path}/gastos`}
            exact={true}
            render={(props) => <Gastos {...props} />}
          />
          <Route
            path={`${path}/gastos/crear`}
            exact={true}
            render={(props) => <GastoCrear {...props} />}
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
            path={`${path}/salidas`}
            exact={true}
            render={(props) => <Salidas {...props} />}
          />

          <Route
            path={`${path}/cuentapagar`}
            exact={true}
            render={(props) => <CuentasPorPagar {...props} />}
          />
          <Route
            path={`${path}/cuentapagar/detalle`}
            exact={true}
            render={(props) => <CuentasPorPagarAmortizar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | AJUSTE
          --------------------------------------------------------
          */}

          <Route
            path={`${path}/comprobantes`}
            exact={true}
            render={(props) => <Comprobantes {...props} />}
          />
          <Route
            path={`${path}/comprobantes/agregar`}
            exact={true}
            render={(props) => <ComprobanteAgregar {...props} />}
          />
          <Route
            path={`${path}/comprobantes/editar`}
            exact={true}
            render={(props) => <ComprobanteEditar {...props} />}
          />


          <Route
            path={`${path}/monedas`}
            exact={true}
            render={(props) => <Monedas {...props} />}
          />
          <Route
            path={`${path}/monedas/agregar`}
            exact={true}
            render={(props) => <MonedaAgregar {...props} />}
          />
          <Route
            path={`${path}/monedas/editar`}
            exact={true}
            render={(props) => <MonedaEditar {...props} />}
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
            render={(props) => <EmpresaEditar {...props} />}
          />
          <Route
            path={`${path}/sucursales`}
            exact={true}
            render={(props) => <Sucursales {...props} />}
          />
          <Route
            path={`${path}/sucursales/agregar`}
            exact={true}
            render={(props) => <SucursalAgregar {...props} />}
          />
          <Route
            path={`${path}/sucursales/editar`}
            exact={true}
            render={(props) => <SucursalEditar {...props} />}
          />

          <Route
            path={`${path}/impuestos`}
            exact={true}
            render={(props) => <Impuestos {...props} />}
          />
          <Route
            path={`${path}/impuestos/agregar`}
            exact={true}
            render={(props) => <ImpuestoAgregar {...props} />}
          />
          <Route
            path={`${path}/impuestos/editar`}
            exact={true}
            render={(props) => <ImpuestoEditar {...props} />}
          />

          <Route
            path={`${path}/vehiculo`}
            exact={true}
            render={(props) => <Vehiculos {...props} />}
          />
          <Route
            path={`${path}/vehiculo/agregar`}
            exact={true}
            render={(props) => <VehiculoAgregar {...props} />}
          />
          <Route
            path={`${path}/vehiculo/editar`}
            exact={true}
            render={(props) => <VehiculoEditar {...props} />}
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

          {/* 
          --------------------------------------------------------
          | REPORTE
          --------------------------------------------------------
          */}


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
            path={`${path}/repcepsunat`}
            render={(props) => <RepCpeSunat {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CPE SUNAT
          --------------------------------------------------------
          */}

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
        <Toaster
          position="top-right"
          reverseOrder={false}
        />

      </div>
    );
  }
}

Inicio.propTypes = {
  signOut: PropTypes.func,
  history: PropTypes.object,
  token: PropTypes.shape({
    userToken: PropTypes.object,
    project: PropTypes.object,
  }),
  empresa: PropTypes.object,
  projectClose: PropTypes.func,
  match: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  clearListaVenta: PropTypes.func,
  clearNoticacion: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    empresa: state.predeterminado.empresa,
    notification: state.notification,
  };
};

const mapDispatchToProps = { signOut, projectClose, addNotification, clearListaVenta, clearNoticacion }

const ConnectedInicio = connect(mapStateToProps, mapDispatchToProps)(Inicio);;

export default ConnectedInicio;
