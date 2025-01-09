import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
// import { io } from "socket.io-client";
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
// import Dashboard from './dashboard/Dashboard.jsx';

const Dashboard = React.lazy(() => import('./dashboard/Dashboard.jsx'));

import
Seguridad, {
  Perfiles,
  PerfilAgregar,
  PerfilEditar,

  Usuarios,
  UsuarioAgregar,
  UsuarioEditar,
  UsuarioResetear,

  Accesos,
} from './seguridad/index.jsx';

import Facturacion, {
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

  Pedidos,
  PedidoCrear,
  PedidoEditar,
  PedidoDetalle,
} from './facturacion/index.jsx';

import Logistica, {
  Productos,
  ProductoAgregar,
  ProductoEditar,
  ProductoDetalle,

  LogisticaAjuste,
  LogisticaAjusteCrear,
  LogisticaAjusteDetalle,

  Traslado,
  TrasladoCrear,
  TrasladoDetalle,

  Inventario,

  Kardex,
} from './logistica/index.jsx';

import Tesoreria, {
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
} from './tesoreria/index.jsx';

import Contacto, {
  Personas,
  PersonaAgregar,
  PersonaEditar,
  PersonaDetalle,
  Clientes,
  Proveedores,
  Conductores,
} from './contacto/index.jsx';

import Configuracion, {
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
} from './configuracion/index.jsx';

import Reporte, {
  RepVentas,
  RepCompras,
  RepFinanciero,
  RepProductos,
  RepClientes,
  RepProveedores,
  RepCpeSunat,
} from './reporte/index.jsx';

import CpeSunat, {
  CpeElectronicos,
  CpeConsultar,
} from './cpesunat/index.jsx';

import { listNotificacion } from '../../network/rest/principal.network.js';
import SuccessReponse from '../../model/class/response.js';
import ErrorResponse from '../../model/class/error-response.js';
import { CANCELED } from '../../model/types/types.js';
import FileDownloader from '../../components/FileDownloader.jsx';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Inicio extends React.Component {

  /**
   *
   * Constructor
   */
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

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  async componentDidMount() {
    window.addEventListener('focus', this.onWindowFocused);
    window.addEventListener('resize', this.onWindowResize);
    this.loadSideBar();
    this.loadNotifications();

    // this.socket.on('message', text => {
    //     NotificationManager.info(text, "Notificación");
    //     if(this.audio !== undefined) this.audio.play();
    // });
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.onWindowFocused);
    window.removeEventListener('resize', this.onWindowResize);

    this.abortNotificacion.abort();
    // this.socket.disconnect();
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  // ------------------------------------------------------------------------
  // Carga los datos del sidebar
  // ------------------------------------------------------------------------
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

  // ------------------------------------------------------------------------
  // Carga los datos de las notificaciones
  // ------------------------------------------------------------------------
  async loadNotifications() {
    const response = await listNotificacion(this.abortNotificacion.signal);
    if (response instanceof SuccessReponse) {
      this.setState({ notificaciones: response.data });
    } else if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ notificaciones: [] });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  // ------------------------------------------------------------------------
  // Evento de foco en la ventana
  // ------------------------------------------------------------------------
  onWindowFocused = () => {
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

  // ------------------------------------------------------------------------
  // Evento de redimension de la ventana
  // ------------------------------------------------------------------------
  onWindowResize() {
    const { refSideBar } = this;

    if (!refSideBar || !refSideBar.current) return;

    if (
      window.innerWidth <= 768 &&
      refSideBar.current.classList.contains('active')
    ) {
      refSideBar.current.classList.remove('active');
    }
  }

  // ------------------------------------------------------------------------
  // Evento para abrir y cerrar el sidebar
  // ------------------------------------------------------------------------
  onToggleSidebar = () => {
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

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

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
          onToggleSidebar={this.onToggleSidebar}
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
            render={(props) => (
              <Suspense fallback={<div>Loading...</div>}>
                <Dashboard {...props} />
              </Suspense>
            )}
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

          <Route
            path={`${path}/facturacion/pedidos`}
            exact={true}
            render={(props) => <Pedidos {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/crear`}
            exact={true}
            render={(props) => <PedidoCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/editar`}
            exact={true}
            render={(props) => <PedidoEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/detalle`}
            exact={true}
            render={(props) => <PedidoDetalle {...props} />}
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

          <Route
            path={`${path}/tesoreria/ordencompras`}
            exact={true}
            render={(props) => <OrdenCompras {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/crear`}
            exact={true}
            render={(props) => <OrdenCompraCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/editar`}
            exact={true}
            render={(props) => <OrdenCompraEditar {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/detalle`}
            exact={true}
            render={(props) => <OrdenCompraDetalle {...props} />}
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
            path={`${path}/reportes/repproveedores`}
            render={(props) => <RepProveedores {...props} />}
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
        <FileDownloader />
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
