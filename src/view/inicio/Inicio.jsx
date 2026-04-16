import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
// import { io } from "socket.io-client";
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  addNotification,
} from '../../redux/noticacionSlice';
import { closeProject, signOut } from '../../redux/principalSlice';
import {
  setEmpresa,
  setMonedaNacional,
} from '../../redux/predeterminadoSlice';

import Bienvenido from './bienvenido/Bienvenido';
import NotFoundMain from '../../components/errors/NotFoundMain';

import Menu from '../../components/menu/Menu';
import Head from '../../components/head/Head';

import Notifications from './notificacion/Notifications';
// import Dashboard from './dashboard/Dashboard';

const Dashboard = React.lazy(() => import('./dashboard/Dashboard'));

import Seguridad, {
  Perfiles,
  PerfilAgregar,
  PerfilEditar,
  Usuarios,
  UsuarioAgregar,
  UsuarioEditar,
  UsuarioResetear,
  Accesos,
} from './seguridad/index';

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
  NotaCreditoCrear,
  NotaCreditoDetalle,
  CuentasPorCobrar,
  CuentasPorCobrarAbonar,
  Pedidos,
  PedidoCrear,
  PedidoEditar,
  PedidoDetalle,
} from './facturacion/index';

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
  Catalogos,
  CatalogoCrear,
  CatalogoEditar,
  CatalogoDetalle
} from './logistica/index';

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
} from './tesoreria/index';

import Contacto, {
  Personas,
  PersonaAgregar,
  PersonaEditar,
  PersonaDetalle,
  Clientes,
  Proveedores,
  Conductores,
  Personales,
} from './contacto/index';

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
  Ubicaciones,
  UbicacionAgregar,
  UbicacionEditar,
  Areas,
  AreaAgregar,
  AreaEditar,
  Cargos,
  CargoAgregar,
  CargoEditar,
} from './configuracion/index';

import Reporte, {
  RepVentas,
  RepCompras,
  RepFinanciero,
  RepProductos,
  RepCpeSunat,
  RepInventario,
} from './reporte/index';

import CpeSunat, { CpeElectronicos, CpeConsultar } from './cpesunat/index';

import FinanzasRoutes from './finanzas/index';

import CrmRoutes from './crm/index';

import {
  configEmpresa,
  listNotificacion,
  nacionalMoneda,
} from '../../network/rest/principal.network.js';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import FileDownloader from '../../components/FileDownloader';
import { images } from '../../helper/index';
import { SpinnerView } from '../../components/Spinner';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import ContainerWrapper from '@/components/ui/container-wrapper';
import ActivoRoutes from './activo/index';

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
      loading: true,
      loadingMessage: 'Cargando modulos...',
      isModal: false,
      notificaciones: [],
      rutaLogo: images.noImage,
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
    this.loadingData();
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
  // Carga los datos de la empresa y moneda
  // ------------------------------------------------------------------------

  loadingData = async () => {
    const empresa = await configEmpresa(this.abortNotificacion.signal);

    if (empresa instanceof ErrorResponse) {
      if (empresa.type === CANCELED) return;
      this.props.signOut();
      return;
    }

    const moneda = await nacionalMoneda(this.abortNotificacion.signal);

    if (moneda instanceof ErrorResponse) {
      if (moneda.type === CANCELED) return;
      this.props.signOut();
      return;
    }

    this.props.setEmpresa(empresa.data);
    this.props.setMonedaNacional(moneda.data);

    this.setState({
      rutaLogo: empresa.data.rutaLogo,
      loading: false,
    });
  };

  // ------------------------------------------------------------------------
  // Carga los datos del sidebar
  // ------------------------------------------------------------------------
  loadSideBar() {
    const { refSideBar } = this;

    if (!refSideBar || !refSideBar.current) return;

    const collapsibleItems = refSideBar.current.querySelectorAll(
      'ul li .pro-inner-item[data-bs-toggle="collapse"]',
    );

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
    const localStorage = window.localStorage;
    const userToken = localStorage.getItem('login');
    if (userToken === null) {
      this.props.signOut();
      return;
    }

    const tokenCurrent = JSON.parse(userToken);
    const tokenOld = this.props.token.userToken;
    if (tokenCurrent.token !== tokenOld.token) {
      location.href = '/';
      return;
    }

    const projectToken = localStorage.getItem('project');

    const projectCurrent = JSON.parse(projectToken);
    const projectOld = this.props.token.project;

    if (JSON.stringify(projectCurrent) !== JSON.stringify(projectOld)) {
      location.href = '/';
      return;
    }

    if (projectToken === null) {
      this.props.closeProject();
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

    if (this.state.loading) {
      return (
        <div className="container pt-5">
          <SpinnerView
            loading={this.state.loading}
            message={this.state.loadingMessage}
          />
        </div>
      );
    }

    const { path, url } = this.props.match;

    return (
      <div className="app">
        <Menu
          refSideBar={this.refSideBar}
          rutaLogo={this.state.rutaLogo}
        />

        <Head
          onToggleSidebar={this.onToggleSidebar}
          notificaciones={this.state.notificaciones}
        />

        <Switch>
          {/* 
          --------------------------------------------------------
          | DASBOARD
          --------------------------------------------------------
          */}
          <Route path="/inicio" exact>
            <Redirect to={`${path}/main`} />
          </Route>

          <Route
            path={`${path}/main`}
          >
            <Bienvenido />
          </Route>

          <Route
            path={`${path}/dashboard`}
          >
            <Suspense fallback={<ContainerWrapper><DashboardSkeleton /></ContainerWrapper>}>
              <Dashboard />
            </Suspense>
          </Route>

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
            exact
            render={(props) => <Seguridad {...props} />}
          />

          <Route
            path={`${path}/seguridad/perfiles`}
            exact
            render={(props) => <Perfiles {...props} />}
          />
          <Route
            path={`${path}/seguridad/perfiles/agregar`}
            exact
            render={(props) => <PerfilAgregar {...props} />}
          />
          <Route
            path={`${path}/seguridad/perfiles/editar`}
            exact
            render={(props) => <PerfilEditar {...props} />}
          />

          <Route
            path={`${path}/seguridad/usuarios`}
            exact
          >
            <Usuarios />
          </Route>

          <Route
            path={`${path}/seguridad/usuarios/agregar`}
            exact
          >
            <UsuarioAgregar />
          </Route>

          <Route
            path={`${path}/seguridad/usuarios/editar`}
            exact
          >
            <UsuarioEditar />
          </Route>

          <Route
            path={`${path}/seguridad/usuarios/resetear`}
            exact
          >
            <UsuarioResetear />
          </Route>

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
            exact
            render={(props) => <Facturacion {...props} />}
          />

          <Route
            path={`${path}/facturacion/ventas`}
            exact
            render={(props) => <Ventas {...props} />}
          />
          <Route
            path={`${path}/facturacion/ventas/crear`}
            exact
            render={(props) => <VentaCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/ventas/crear-clasico`}
            exact
            render={(props) => <VentaCrearEscritorio {...props} />}
          />

          <Route
            path={`${path}/facturacion/ventas/detalle`}
            exact
            render={(props) => <VentaDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cobros`}
            exact
            render={(props) => <Cobros {...props} />}
          />
          <Route
            path={`${path}/facturacion/cobros/crear`}
            exact
            render={(props) => <CobroCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/cobros/detalle`}
            exact
            render={(props) => <CobroDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/notacredito`}
            exact
            render={(props) => <NotaCredito {...props} />}
          />
          <Route
            path={`${path}/facturacion/notacredito/crear`}
            exact
          >
            <NotaCreditoCrear />
          </Route>
          <Route
            path={`${path}/facturacion/notacredito/detalle`}
            exact
            render={(props) => <NotaCreditoDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cotizaciones`}
            exact
            render={(props) => <Cotizaciones {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/crear`}
            exact
            render={(props) => <CotizacioneCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/editar`}
            exact
            render={(props) => <CotizacioneEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/cotizaciones/detalle`}
            exact
            render={(props) => <CotizacionDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/guiaremision`}
            exact
            render={(props) => <GuiaRemision {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/crear`}
            exact
            render={(props) => <GuiaRemisionCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/editar`}
            exact
            render={(props) => <GuiaRemisionEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/guiaremision/detalle`}
            exact
            render={(props) => <GuiaRemisionDetalle {...props} />}
          />

          <Route
            path={`${path}/facturacion/cuentacobrar`}
            exact
            render={(props) => <CuentasPorCobrar {...props} />}
          />
          <Route
            path={`${path}/facturacion/cuentacobrar/detalle`}
            exact
            render={(props) => <CuentasPorCobrarAbonar {...props} />}
          />

          <Route
            path={`${path}/facturacion/pedidos`}
            exact
            render={(props) => <Pedidos {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/crear`}
            exact
            render={(props) => <PedidoCrear {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/editar`}
            exact
            render={(props) => <PedidoEditar {...props} />}
          />
          <Route
            path={`${path}/facturacion/pedidos/detalle`}
            exact
            render={(props) => <PedidoDetalle {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | LOGISTICA
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/logistica`}
            exact
          >
            <Logistica />
          </Route>

          <Route
            path={`${path}/logistica/productos`}
            exact
            render={(props) => <Productos {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/detalle`}
            exact
            render={(props) => <ProductoDetalle {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/agregar`}
            exact
            render={(props) => <ProductoAgregar {...props} />}
          />
          <Route
            path={`${path}/logistica/productos/editar`}
            exact
            render={(props) => <ProductoEditar {...props} />}
          />

          <Route
            path={`${path}/logistica/ajuste`}
            exact
            render={(props) => <LogisticaAjuste {...props} />}
          />
          <Route
            path={`${path}/logistica/ajuste/crear`}
            exact
            render={(props) => <LogisticaAjusteCrear {...props} />}
          />
          <Route
            path={`${path}/logistica/ajuste/detalle`}
            exact
            render={(props) => <LogisticaAjusteDetalle {...props} />}
          />

          <Route
            path={`${path}/logistica/inventario`}
            exact
            render={(props) => <Inventario {...props} />}
          />

          <Route
            path={`${path}/logistica/kardex`}
            exact
            render={(props) => <Kardex {...props} />}
          />

          <Route
            path={`${path}/logistica/traslado`}
            exact
            render={(props) => <Traslado {...props} />}
          />
          <Route
            path={`${path}/logistica/traslado/crear`}
            exact
            render={(props) => <TrasladoCrear {...props} />}
          />
          <Route
            path={`${path}/logistica/traslado/detalle`}
            exact
            render={(props) => <TrasladoDetalle {...props} />}
          />

          <Route
            path={`${path}/logistica/catalogo`}
            exact
            render={(props) => <Catalogos {...props} />}
          />
          <Route
            path={`${path}/logistica/catalogo/crear`}
            exact
            render={(props) => <CatalogoCrear {...props} />}
          />
          <Route
            path={`${path}/logistica/catalogo/editar`}
            exact
            render={(props) => <CatalogoEditar {...props} />}
          />
          <Route
            path={`${path}/logistica/catalogo/detalle`}
            exact
            render={(props) => <CatalogoDetalle {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | TESORERIA
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/tesoreria`}
            exact
            render={(props) => <Tesoreria {...props} />}
          />

          <Route
            path={`${path}/tesoreria/gastos`}
            exact
            render={(props) => <Gastos {...props} />}
          />
          <Route
            path={`${path}/tesoreria/gastos/crear`}
            exact
            render={(props) => <GastoCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/gastos/detalle`}
            exact
            render={(props) => <GastoDetalle {...props} />}
          />

          <Route
            path={`${path}/tesoreria/compras`}
            exact
            render={(props) => <Compras {...props} />}
          />
          <Route
            path={`${path}/tesoreria/compras/crear`}
            exact
            render={(props) => <CompraCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/compras/detalle`}
            exact
            render={(props) => <CompraDetalle {...props} />}
          />

          <Route
            path={`${path}/tesoreria/cuentapagar`}
            exact
            render={(props) => <CuentasPorPagar {...props} />}
          />
          <Route
            path={`${path}/tesoreria/cuentapagar/detalle`}
            exact
            render={(props) => <CuentasPorPagarAmortizar {...props} />}
          />

          <Route
            path={`${path}/tesoreria/ordencompras`}
            exact
            render={(props) => <OrdenCompras {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/crear`}
            exact
            render={(props) => <OrdenCompraCrear {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/editar`}
            exact
            render={(props) => <OrdenCompraEditar {...props} />}
          />
          <Route
            path={`${path}/tesoreria/ordencompras/detalle`}
            exact
            render={(props) => <OrdenCompraDetalle {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CONTACTOS
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/contactos`}
            exact
            render={(props) => <Contacto {...props} />}
          />

          <Route
            path={`${path}/contactos/todos`}
            exact
            render={(props) => <Personas {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/agregar`}
            exact
            render={(props) => <PersonaAgregar {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/editar`}
            exact
            render={(props) => <PersonaEditar {...props} />}
          />
          <Route
            path={`${path}/contactos/todos/detalle`}
            exact
            render={(props) => <PersonaDetalle {...props} />}
          />

          <Route
            path={`${path}/contactos/clientes`}
            exact
            render={(props) => <Clientes {...props} />}
          />
          <Route
            path={`${path}/contactos/clientes/editar`}
            exact
            render={(props) => <PersonaEditar {...props} />}
          />

          <Route
            path={`${path}/contactos/proveedores`}
            exact
            render={(props) => <Proveedores {...props} />}
          />
          <Route
            path={`${path}/contactos/proveedores/editar`}
            exact
            render={(props) => <PersonaEditar {...props} />}
          />

          <Route
            path={`${path}/contactos/conductores`}
            exact
            render={(props) => <Conductores {...props} />}
          />

          <Route
            path={`${path}/contactos/conductores/editar`}
            exact
            render={(props) => <PersonaEditar {...props} />}
          />

          <Route
            path={`${path}/contactos/personales`}
            exact
            render={(props) => <Personales {...props} />}
          />

          <Route
            path={`${path}/contactos/personales/editar`}
            exact
            render={(props) => <PersonaEditar {...props} />}
          />

          {/* 
          --------------------------------------------------------
          | CONFIGURACIÓN
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/configuracion`}
            exact
          >
            <Configuracion />
          </Route>

          <Route
            path={`${path}/configuracion/categorias`}
            exact
            render={(props) => <Categorias {...props} />}
          />
          <Route
            path={`${path}/configuracion/categorias/agregar`}
            exact
            render={(props) => <CategoriaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/categorias/editar`}
            exact
            render={(props) => <CategoriaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/almacenes`}
            exact
            render={(props) => <Almacenes {...props} />}
          />
          <Route
            path={`${path}/configuracion/almacenes/agregar`}
            exact
            render={(props) => <AlmacenAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/almacenes/editar`}
            exact
            render={(props) => <AlmacenEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/medida`}
            exact
            render={(props) => <Medidas {...props} />}
          />
          <Route
            path={`${path}/configuracion/medida/agregar`}
            exact
            render={(props) => <MedidaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/medida/editar`}
            exact
            render={(props) => <MedidaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/comprobantes`}
            exact
            render={(props) => <Comprobantes {...props} />}
          />
          <Route
            path={`${path}/configuracion/comprobantes/agregar`}
            exact
            render={(props) => <ComprobanteAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/comprobantes/editar`}
            exact
            render={(props) => <ComprobanteEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/monedas`}
            exact
            render={(props) => <Monedas {...props} />}
          />
          <Route
            path={`${path}/configuracion/monedas/agregar`}
            exact
            render={(props) => <MonedaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/monedas/editar`}
            exact
            render={(props) => <MonedaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/empresa`}
            exact
            render={(props) => <Empresa {...props} />}
          />
          <Route
            path={`${path}/configuracion/empresa/proceso`}
            exact
            render={(props) => <EmpresaEditar {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales`}
            exact
            render={(props) => <Sucursales {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales/agregar`}
            exact
            render={(props) => <SucursalAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/sucursales/editar`}
            exact
            render={(props) => <SucursalEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/impuestos`}
            exact
            render={(props) => <Impuestos {...props} />}
          />
          <Route
            path={`${path}/configuracion/impuestos/agregar`}
            exact
            render={(props) => <ImpuestoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/impuestos/editar`}
            exact
            render={(props) => <ImpuestoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/vehiculo`}
            exact
            render={(props) => <Vehiculos {...props} />}
          />
          <Route
            path={`${path}/configuracion/vehiculo/agregar`}
            exact
            render={(props) => <VehiculoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/vehiculo/editar`}
            exact
            render={(props) => <VehiculoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/conceptos`}
            exact
            render={(props) => <Conceptos {...props} />}
          />
          <Route
            path={`${path}/configuracion/conceptos/agregar`}
            exact
            render={(props) => <ConceptoAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/conceptos/editar`}
            exact
            render={(props) => <ConceptoEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/marcas`}
            exact
            render={(props) => <Marcas {...props} />}
          />
          <Route
            path={`${path}/configuracion/marcas/agregar`}
            exact
            render={(props) => <MarcaAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/marcas/editar`}
            exact
            render={(props) => <MarcaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/atributos`}
            exact
            render={(props) => <Atributos {...props} />}
          />
          <Route
            path={`${path}/configuracion/atributos/agregar`}
            exact
            render={(props) => <AtributosAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/atributos/editar`}
            exact
            render={(props) => <AtributosEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/ubicaciones`}
            exact
            render={(props) => <Ubicaciones {...props} />}
          />
          <Route
            path={`${path}/configuracion/ubicaciones/agregar`}
            exact
            render={(props) => <UbicacionAgregar {...props} />}
          />
          <Route
            path={`${path}/configuracion/ubicaciones/editar`}
            exact
            render={(props) => <UbicacionEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/areas`}
            exact
            render={(props) => <Areas {...props} />}
          />

          <Route
            path={`${path}/configuracion/areas/agregar`}
            exact
            render={(props) => <AreaAgregar {...props} />}
          />

          <Route
            path={`${path}/configuracion/areas/editar`}
            exact
            render={(props) => <AreaEditar {...props} />}
          />

          <Route
            path={`${path}/configuracion/cargos`}
            exact
            render={(props) => <Cargos {...props} />}
          />

          <Route
            path={`${path}/configuracion/cargos/agregar`}
            exact
            render={(props) => <CargoAgregar {...props} />}
          />

          <Route
            path={`${path}/configuracion/cargos/editar`}
            exact
            render={(props) => <CargoEditar {...props} />}
          />
          {/* 
          --------------------------------------------------------
          | REPORTE
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/reportes`}
            exact
            render={(props) => <Reporte {...props} />}
          />

          <Route
            path={`${path}/reportes/repfinanciero`}
            exact
            render={(props) => <RepFinanciero {...props} />}
          />

          <Route
            path={`${path}/reportes/repventas`}
            exact
            render={(props) => <RepVentas {...props} />}
          />

          <Route
            path={`${path}/reportes/repcompras`}
            exact
            render={(props) => <RepCompras {...props} />}
          />

          <Route
            path={`${path}/reportes/repproductos`}
            exact
            render={(props) => <RepProductos {...props} />}
          />

          <Route
            path={`${path}/reportes/repcepsunat`}
            exact
            render={(props) => <RepCpeSunat {...props} />}
          />

          <Route path={`${path}/reportes/repinventario`}>
            <RepInventario />
          </Route>

          {/* 
          --------------------------------------------------------
          | CPE SUNAT
          --------------------------------------------------------
          */}
          <Route
            path={`${path}/cpesunat`}
            exact
            render={(props) => <CpeSunat {...props} />}
          />

          <Route
            path={`${path}/cpesunat/cpeelectronicos`}
            exact
            render={(props) => <CpeElectronicos {...props} />}
          />
          <Route
            path={`${path}/cpesunat/cpeconsultar`}
            exact
            render={(props) => <CpeConsultar {...props} />}
          />

          {/*
          ----------------------------------------------------------
          | FINANZAS
          ----------------------------------------------------------
          */}
          <Route
            path={`${path}/finanzas`}
          >
            <FinanzasRoutes />
          </Route>

          {/*
          ----------------------------------------------------------
          | CRM
          ----------------------------------------------------------
          */}
          <Route path={`${path}/crm`}>
            <CrmRoutes />
          </Route>

          {/*
          ----------------------------------------------------------
          | ACTIVOS
          ----------------------------------------------------------
          */}

          <Route path={`${path}/activo`}>
            <ActivoRoutes />
          </Route>

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
  closeProject: PropTypes.func,
  match: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),

  setMonedaNacional: PropTypes.func,
  setEmpresa: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    notification: state.notification,
  };
};

const mapDispatchToProps = {
  signOut,
  closeProject,
  addNotification,
  setMonedaNacional,
  setEmpresa,
};

const ConnectedInicio = connect(mapStateToProps, mapDispatchToProps)(Inicio);

export default ConnectedInicio;
