import React from 'react';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';
// import { io } from "socket.io-client";
// import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { addNotification, clearNoticacion } from '../../redux/noticacionSlice.js';
import { projectClose, signOut } from '../../redux/principalSlice.js';
import { clearSucursal } from '../../redux/predeterminadoSlice.js';

import Bienvenido from './bienvenido/Bienvenido.jsx';
import NotFoundMain from '../../components/errors/NotFoundMain.jsx';

import Menu from '../../components/menu/Menu.jsx';
import Head from '../../components/head/Head.jsx';

import Notifications from './notificacion/Notifications.jsx';
import Dashboard from './dashboard/Dashboard.jsx';

import Facturacion from './facturacion/index.jsx';

import Ventas from './facturacion/venta/listar/Ventas.jsx';
import VentaCrear from './facturacion/venta/crear/VentaCrear.jsx';
import VentaCrearEscritorio from './facturacion/venta/crear-clasico/VentaCrearEscritorio.jsx';

import VentaDetalle from './facturacion/venta/detalle/VentaDetalle.jsx';

import Cobros from './facturacion/cobro/lista/Cobros';
import CobroCrear from './facturacion/cobro/crear/CobroCrear';
import CobroDetalle from './facturacion/cobro/detalle/CobroDetalle';

import Cotizaciones from './facturacion/cotizacion/lista/Cotizaciones.jsx';
import CotizacioneCrear from './facturacion/cotizacion/formularios/crear/CotizacionCrear.jsx';
import CotizacioneEditar from './facturacion/cotizacion/formularios/editar/CotizacionEditar.jsx';
import CotizacionDetalle from './facturacion/cotizacion/detalle/CotizacionDetalle.jsx';

import GuiaRemision from './facturacion/guiaremision/listar/GuiaRemision.jsx';
import GuiaRemisionCrear from './facturacion/guiaremision/crear/GuiaRemisionCrear.jsx';
import GuiaRemisionEditar from './facturacion/guiaremision/editar/GuiaRemisionEditar.jsx';
import GuiaRemisionDetalle from './facturacion/guiaremision/detalle/GuiaRemisionDetalle.jsx';

import NotaCredito from './facturacion/notacredito/NotaCredito';
import NotaCreditoProceso from './facturacion/notacredito/NotaCreditoProceso';
import NotaCreditoDetalle from './facturacion/notacredito/NotaCreditoDetalle';

import CuentasPorCobrar from './facturacion/cuenta-cobrar/lista/CuentasPorCobrar.jsx';
import CuentasPorCobrarAbonar from './facturacion/cuenta-cobrar/crear/CuentasPorCobrarAbonar.jsx';

import Logistica from './logistica/index.jsx';

import Productos from './logistica/producto/lista/Productos';
import ProductoAgregar from './logistica/producto/formularios/agregar/ProductoAgregar';
import ProductoEditar from './logistica/producto/formularios/editar/ProductoEditar';
import ProductoDetalle from './logistica/producto/detalle/ProductoDetalle';

import LogisticaAjuste from './logistica/ajuste/lista/LogisticaAjuste.jsx';
import LogisticaAjusteCrear from './logistica/ajuste/crear/LogisticaAjusteCrear.jsx';
import LogisticaAjusteDetalle from './logistica/ajuste/detalle/LogisticaAjusteDetalle.jsx';

import Traslado from './logistica/traslado/listar/Traslado.jsx';
import TrasladoCrear from './logistica/traslado/crear/TrasladoCrear.jsx';
import TrasladoDetalle from './logistica/traslado/detalle/TrasladoDetalle.jsx';

import Inventario from './logistica/inventario/Inventario.jsx';

import Kardex from './logistica/kardex/Kardex.jsx';

import Tesoreria from './tesoreria/index.jsx';

import Gastos from './tesoreria/gasto/lista/Gastos.jsx';
import GastoCrear from './tesoreria/gasto/crear/GastoCrear.jsx';
import GastoDetalle from './tesoreria/gasto/detalle/GastoDetalle.jsx';

import Compras from './tesoreria/compra/lista/Compras.jsx';
import CompraCrear from './tesoreria/compra/crear/CompraCrear.jsx';
import CompraDetalle from './tesoreria/compra/detalle/CompraDetalle.jsx';

import CuentasPorPagar from './tesoreria/cuenta-pagar/lista/CuentasPorPagar.jsx';
import CuentasPorPagarAmortizar from './tesoreria/cuenta-pagar/crear/CuentasPorPagarAmortizar.jsx';

import Seguridad from './seguridad/index.jsx';

import Perfiles from './seguridad/perfil/Perfiles.jsx';
import PerfilAgregar from './seguridad/perfil/PerfilAgregar.jsx';
import PerfilEditar from './seguridad/perfil/PerfilEditar.jsx';

import Usuarios from './seguridad/usuario/Usuarios.jsx';
import UsuarioAgregar from './seguridad/usuario/UsuarioAgregar.jsx';
import UsuarioEditar from './seguridad/usuario/UsuarioEditar.jsx';
import UsuarioResetear from './seguridad/usuario/UsuarioResetear.jsx';

import Accesos from './seguridad/acceso/Accesos.jsx';

import Contacto from './contacto/index.jsx';

import Personas from './contacto/todo/Personas.jsx';
import PersonaAgregar from './contacto/agregar/PersonaAgregar.jsx';
import PersonaEditar from './contacto/editar/PersonaEditar.jsx';
import PersonaDetalle from './contacto/detalle/PersonaDetalle.jsx';
import Clientes from './contacto/cliente/Clientes.jsx';
import Proveedores from './contacto/proveedor/Proveedores.jsx';
import Conductores from './contacto/conductor/Conductores.jsx';

import Configuracion from './configuracion/index.jsx';

import Almacenes from './configuracion/almacen/Almacenes.jsx';
import AlmacenAgregar from './configuracion/almacen/AlmacenAgregar.jsx';
import AlmacenEditar from './configuracion/almacen/AlmacenEditar.jsx';

import Categorias from './configuracion/categoria/Categorias';
import CategoriaAgregar from './configuracion/categoria/CategoriaAgregar';
import CategoriaEditar from './configuracion/categoria/CategoriaEditar';

import Medidas from './configuracion/medida/Medidas.jsx';
import MedidaAgregar from './configuracion/medida/MedidaAgregar.jsx';
import MedidaEditar from './configuracion/medida/MedidaEditar.jsx';

import Monedas from './configuracion/moneda/Monedas.jsx';
import MonedaAgregar from './configuracion/moneda/MonedaAgregar.jsx';
import MonedaEditar from './configuracion/moneda/MonedaEditar.jsx';

import Comprobantes from './configuracion/comprobante/Comprobantes.jsx';
import ComprobanteAgregar from './configuracion/comprobante/ComprobanteAgregar.jsx';
import ComprobanteEditar from './configuracion/comprobante/ComprobanteEditar.jsx';

import Impuestos from './configuracion/impuesto/Impuestos.jsx';
import ImpuestoAgregar from './configuracion/impuesto/ImpuestoAgregar.jsx';
import ImpuestoEditar from './configuracion/impuesto/ImpuestoEditar.jsx';

import Vehiculos from './configuracion/vehiculo/Vehiculos.jsx';
import VehiculoAgregar from './configuracion/vehiculo/VehiculoAgregar.jsx';
import VehiculoEditar from './configuracion/vehiculo/VehiculoEditar.jsx';

import Bancos from './configuracion/banco/Bancos.jsx';
import BancoDetalle from './configuracion/banco/BancoDetalle.jsx';
import BancoAgregar from './configuracion/banco/BancoAgregar.jsx';
import BancoEditar from './configuracion/banco/BancoEditar.jsx';

import Empresa from './configuracion/empresa/Empresa.jsx';
import EmpresaEditar from './configuracion/empresa/EmpresaEditar.jsx';

import Sucursales from './configuracion/sucursal/Sucursales.jsx';
import SucursalAgregar from './configuracion/sucursal/SucursalAgregar.jsx';
import SucursalEditar from './configuracion/sucursal/SucursalEditar.jsx';

import Conceptos from './configuracion/concepto/Conceptos.jsx';
import ConceptoAgregar from './configuracion/concepto/ConceptoAgregar.jsx';
import ConceptoEditar from './configuracion/concepto/ConceptoEditar.jsx';

import Marcas from './configuracion/marca/Marcas.jsx';
import MarcaAgregar from './configuracion/marca/MarcaAgregar.jsx';
import MarcaEditar from './configuracion/marca/MarcaEditar.jsx';

import Atributos from './configuracion/atributo/Atributos.jsx';
import AtributosAgregar from './configuracion/atributo/AtributosAgregar.jsx';
import AtributosEditar from './configuracion/atributo/AtributosEditar.jsx';

import Reporte from './reporte/index.jsx';

import RepVentas from './reporte/RepVentas.jsx';
import RepCompras from './reporte/RepCompras.jsx';
import RepFinanciero from './reporte/RepFinanciero.jsx';
import RepProductos from './reporte/RepProductos.jsx';
import RepClientes from './reporte/RepClientes.jsx';
import RepCpeSunat from './reporte/RepCpeSunat.jsx';

import CpeSunat from './cpesunat/index.jsx';

import CpeElectronicos from './cpesunat/lista/CpeElectronicos.jsx';
import CpeConsultar from './cpesunat/consulta/CpeConsultar.jsx';

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
            path={`${path}/seguridad`}
            exact={true}
            render={(props) => <Seguridad {...props} />}
          />

          <Route
            path={`${path}/seguridad/perfiles`}
            exact={true}
            render={(props) => <Perfiles {...props} />}
          />
          <Route
            path={`${path}/seguridad/perfiles/agregar`}
            exact={true}
            render={(props) => <PerfilAgregar {...props} />}
          />
          <Route
            path={`${path}/seguridad/perfiles/editar`}
            exact={true}
            render={(props) => <PerfilEditar {...props} />}
          />

          <Route
            path={`${path}/seguridad/usuarios`}
            exact={true}
            render={(props) => <Usuarios {...props} />}
          />
          <Route
            path={`${path}/seguridad/usuarios/agregar`}
            exact={true}
            render={(props) => <UsuarioAgregar {...props} />}
          />
          <Route
            path={`${path}/seguridad/usuarios/editar`}
            exact={true}
            render={(props) => <UsuarioEditar {...props} />}
          />
          <Route
            path={`${path}/seguridad/usuarios/resetear`}
            exact={true}
            render={(props) => <UsuarioResetear {...props} />}
          />

          <Route
            path={`${path}/seguridad/accesos`}
            render={(props) => <Accesos {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | FACTURACIÓN
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/facturacion`}
            exact={true}
            render={(props) => <Facturacion {...props} />}
          />

          <Route
            path={`${path}/facturacion/ventas`}
            exact={true}
            render={(props) => <Ventas {...props} />}
          />
          <Route
            path={`${path}/facturacion/ventas/crear`}
            exact={true}
            render={(props) => <VentaCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/ventas/crear-clasico`}
            exact={true}
            render={(props) => <VentaCrearEscritorio {...props} />}
          />

          <Route
            path={`${path}/facturacion/ventas/detalle`}
            exact={true}
            render={(props) => <VentaDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cobros`}
            exact={true}
            render={(props) => <Cobros {...props} />}
          />
          <Route
            path={`${path}/facturacion/cobros/crear`}
            exact={true}
            render={(props) => <CobroCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/cobros/detalle`}
            exact={true}
            render={(props) => <CobroDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/notacredito`}
            exact={true}
            render={(props) => <NotaCredito {...props} />}
          />
          <Route
            path={`${path}/facturacion/notacredito/proceso`}
            exact={true}
            render={(props) => <NotaCreditoProceso {...props} />}
          />
          <Route
            path={`${path}/facturacion/notacredito/detalle`}
            exact={true}
            render={(props) => <NotaCreditoDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cotizaciones`}
            exact={true}
            render={(props) => <Cotizaciones {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/crear`}
            exact={true}
            render={(props) => <CotizacioneCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/editar`}
            exact={true}
            render={(props) => <CotizacioneEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/detalle`}
            exact={true}
            render={(props) => <CotizacionDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/guiaremision`}
            exact={true}
            render={(props) => <GuiaRemision {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/crear`}
            exact={true}
            render={(props) => <GuiaRemisionCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/editar`}
            exact={true}
            render={(props) => <GuiaRemisionEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/detalle`}
            exact={true}
            render={(props) => <GuiaRemisionDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cuentacobrar`}
            exact={true}
            render={(props) => <CuentasPorCobrar {...props} />}
          />
          <Route
            path={`${path}/facturacion/cuentacobrar/detalle`}
            exact={true}
            render={(props) => <CuentasPorCobrarAbonar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | LOGISTICA
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/logistica`}
            exact={true}
            render={(props) => <Logistica {...props} />}
          />

          <Route
            path={`${path}/logistica/productos`}
            exact={true}
            render={(props) => <Productos {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/detalle`}
            exact={true}
            render={(props) => <ProductoDetalle {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/agregar`}
            exact={true}
            render={(props) => <ProductoAgregar {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/editar`}
            exact={true}
            render={(props) => <ProductoEditar {...props} />}
          />

          <Route
            path={`${path}/logistica/ajuste`}
            exact={true}
            render={(props) => <LogisticaAjuste {...props} />}
          />
          <Route
            path={`${path}/logistica/ajuste/crear`}
            exact={true}
            render={(props) => <LogisticaAjusteCrear {...props} />}
          />
          <Route
            path={`${path}/logistica/ajuste/detalle`}
            exact={true}
            render={(props) => <LogisticaAjusteDetalle {...props} />}
          />

          <Route
            path={`${path}/logistica/inventario`}
            exact={true}
            render={(props) => <Inventario {...props} />}
          />

          <Route
            path={`${path}/logistica/kardex`}
            exact={true}
            render={(props) => <Kardex {...props} />}
          />

          <Route
            path={`${path}/logistica/traslado`}
            exact={true}
            render={(props) => <Traslado {...props} />}
          />
          <Route
            path={`${path}/logistica/traslado/crear`}
            exact={true}
            render={(props) => <TrasladoCrear {...props} />}
          />
          <Route
            path={`${path}/logistica/traslado/detalle`}
            exact={true}
            render={(props) => <TrasladoDetalle {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | TESORERIA
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/tesoreria`}
            exact={true}
            render={(props) => <Tesoreria {...props} />}
          />

          <Route
            path={`${path}/tesoreria/gastos`}
            exact={true}
            render={(props) => <Gastos {...props} />}
          />
          <Route
            path={`${path}/tesoreria/gastos/crear`}
            exact={true}
            render={(props) => <GastoCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/gastos/detalle`}
            exact={true}
            render={(props) => <GastoDetalle {...props} />}
          />

          <Route
            path={`${path}/tesoreria/compras`}
            exact={true}
            render={(props) => <Compras {...props} />}
          />
          <Route
            path={`${path}/tesoreria/compras/crear`}
            exact={true}
            render={(props) => <CompraCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/compras/detalle`}
            exact={true}
            render={(props) => <CompraDetalle {...props} />}
          />

          <Route
            path={`${path}/tesoreria/cuentapagar`}
            exact={true}
            render={(props) => <CuentasPorPagar {...props} />}
          />
          <Route
            path={`${path}/tesoreria/cuentapagar/detalle`}
            exact={true}
            render={(props) => <CuentasPorPagarAmortizar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CONTACTOS
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/contactos`}
            exact={true}
            render={(props) => <Contacto {...props} />}
          />

          <Route
            path={`${path}/contactos/todos`}
            exact={true}
            render={(props) => <Personas {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/agregar`}
            exact={true}
            render={(props) => <PersonaAgregar {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/editar`}
            exact={true}
            render={(props) => <PersonaEditar {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/detalle`}
            exact={true}
            render={(props) => <PersonaDetalle {...props} />}
          />

          <Route
            path={`${path}/contactos/clientes`}
            exact={true}
            render={(props) => <Clientes {...props} />}
          />
          <Route
            path={`${path}/contactos/proveedores`}
            render={(props) => <Proveedores {...props} />}
          />
          <Route
            path={`${path}/contactos/conductores`}
            render={(props) => <Conductores {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CONFIGURACIÓN
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/configuracion`}
            exact={true}
            render={(props) => <Configuracion {...props} />}
          />

          <Route
            path={`${path}/configuracion/categorias`}
            exact={true}
            render={(props) => <Categorias {...props} />}
          />
          <Route
            path={`${path}/configuracion/categorias/agregar`}
            exact={true}
            render={(props) => <CategoriaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/categorias/editar`}
            exact={true}
            render={(props) => <CategoriaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/almacenes`}
            exact={true}
            render={(props) => <Almacenes {...props} />}
          />
          <Route
            path={`${path}/configuracion/almacenes/agregar`}
            exact={true}
            render={(props) => <AlmacenAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/almacenes/editar`}
            exact={true}
            render={(props) => <AlmacenEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/medida`}
            exact={true}
            render={(props) => <Medidas {...props} />}
          />
          <Route
            path={`${path}/configuracion/medida/agregar`}
            exact={true}
            render={(props) => <MedidaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/medida/editar`}
            exact={true}
            render={(props) => <MedidaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/comprobantes`}
            exact={true}
            render={(props) => <Comprobantes {...props} />}
          />
          <Route
            path={`${path}/configuracion/comprobantes/agregar`}
            exact={true}
            render={(props) => <ComprobanteAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/comprobantes/editar`}
            exact={true}
            render={(props) => <ComprobanteEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/monedas`}
            exact={true}
            render={(props) => <Monedas {...props} />}
          />
          <Route
            path={`${path}/configuracion/monedas/agregar`}
            exact={true}
            render={(props) => <MonedaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/monedas/editar`}
            exact={true}
            render={(props) => <MonedaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/bancos`}
            exact={true}
            render={(props) => <Bancos {...props} />}
          />
          <Route
            path={`${path}/configuracion/bancos/detalle`}
            exact={true}
            render={(props) => <BancoDetalle {...props} />}
          />
          <Route
            path={`${path}/configuracion/bancos/agregar`}
            exact={true}
            render={(props) => <BancoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/bancos/editar`}
            exact={true}
            render={(props) => <BancoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/empresa`}
            exact={true}
            render={(props) => <Empresa {...props} />}
          />
          <Route
            path={`${path}/configuracion/empresa/proceso`}
            exact={true}
            render={(props) => <EmpresaEditar {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales`}
            exact={true}
            render={(props) => <Sucursales {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales/agregar`}
            exact={true}
            render={(props) => <SucursalAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales/editar`}
            exact={true}
            render={(props) => <SucursalEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/impuestos`}
            exact={true}
            render={(props) => <Impuestos {...props} />}
          />
          <Route
            path={`${path}/configuracion/impuestos/agregar`}
            exact={true}
            render={(props) => <ImpuestoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/impuestos/editar`}
            exact={true}
            render={(props) => <ImpuestoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/vehiculo`}
            exact={true}
            render={(props) => <Vehiculos {...props} />}
          />
          <Route
            path={`${path}/configuracion/vehiculo/agregar`}
            exact={true}
            render={(props) => <VehiculoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/vehiculo/editar`}
            exact={true}
            render={(props) => <VehiculoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/conceptos`}
            exact={true}
            render={(props) => <Conceptos {...props} />}
          />
          <Route
            path={`${path}/configuracion/conceptos/agregar`}
            exact={true}
            render={(props) => <ConceptoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/conceptos/editar`}
            exact={true}
            render={(props) => <ConceptoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/marcas`}
            exact={true}
            render={(props) => <Marcas {...props} />}
          />
          <Route
            path={`${path}/configuracion/marcas/agregar`}
            exact={true}
            render={(props) => <MarcaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/marcas/editar`}
            exact={true}
            render={(props) => <MarcaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/atributos`}
            exact={true}
            render={(props) => <Atributos {...props} />}
          />
          <Route
            path={`${path}/configuracion/atributos/agregar`}
            exact={true}
            render={(props) => <AtributosAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/atributos/editar`}
            exact={true}
            render={(props) => <AtributosEditar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | REPORTE
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/reportes`}
            exact={true}
            render={(props) => <Reporte {...props} />}
          />

          <Route
            path={`${path}/reportes/repventas`}
            render={(props) => <RepVentas {...props} />}
          />

          <Route
            path={`${path}/reportes/repcompras`}
            render={(props) => <RepCompras {...props} />}
          />

          <Route
            path={`${path}/reportes/repfinanciero`}
            render={(props) => <RepFinanciero {...props} />}
          />

          <Route
            path={`${path}/reportes/repproductos`}
            render={(props) => <RepProductos {...props} />}
          />

          <Route
            path={`${path}/reportes/repclientes`}
            render={(props) => <RepClientes {...props} />}
          />

          <Route
            path={`${path}/reportes/repcepsunat`}
            render={(props) => <RepCpeSunat {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CPE SUNAT
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/cpesunat`}
            exact={true}
            render={(props) => <CpeSunat {...props} />}
          />

          <Route
            path={`${path}/cpesunat/cpeelectronicos`}
            render={(props) => <CpeElectronicos {...props} />}
          />
          <Route
            path={`${path}/cpesunat/cpeconsultar`}
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
  clearSucursal: PropTypes.func,
  clearNoticacion: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    empresa: state.predeterminado.empresa,
    notification: state.notification,
  };
};

const mapDispatchToProps = {
  signOut,
  projectClose,
  addNotification,
  clearSucursal,
  clearNoticacion
}

const ConnectedInicio = connect(mapStateToProps, mapDispatchToProps)(Inicio);;

export default ConnectedInicio;
