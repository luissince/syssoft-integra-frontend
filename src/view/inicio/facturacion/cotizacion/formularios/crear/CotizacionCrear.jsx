import React from 'react';
import { PosContainerWrapper } from '@/components/ui/container-wrapper';
import {
  isEmpty,
  readDataFile,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import { COTIZACION } from '@/model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  createCotizacion,
  documentsPdfInvoicesCotizacion,
  filtrarAlmacenProducto,
  filtrarPersona,
  obtenerPreCotizacionPdf,
} from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import PropTypes from 'prop-types';
import {
  SpinnerView,
} from '@/components/Spinner';
import {
  clearCrearCotizacion,
  setCrearCotizacionLocal,
  setCrearCotizacionState,
} from '@/redux/predeterminadoSlice';
import {
  ModalImpresion,
  ModalPersona,
} from '@/components/MultiModal';
import SidebarConfiguration from '@/components/SidebarConfiguration';
import { alertKit } from 'alert-kit';
import CustomComponent from '@/components/CustomComponent';
import pdfVisualizer from 'pdf-visualizer';
import PanelIzquierdo from '../../../component/PanelIzquierdo';
import ModalProducto from '../../../component/ModalProducto';
import PanelDerecho from '../../../component/PanelDerecho';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CotizacionCrear extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: "Cargando datos...",

      // Atributos principales
      idCotizacion: "",
      idComprobante: "",
      idMoneda: "",
      idAlmacen: "",
      idImpuesto: "",
      observacion: "",
      nota: "",
      cacheConfiguracion: null,

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],
      almacenes: [],

      // Filtrar producto
      productos: [],
      loadingProducto: false,

      // Filtrar cliente
      cliente: null,
      clientes: [],

      // Atributos libres
      codiso: "",
      total: 0,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal cliente
      isOpenCliente: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Atributos del model pre impresión
      isOpenPreImpresion: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.initial = { ...this.state };

    // Referencia principales
    this.refComprobante = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refProductoValue = React.createRef();

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.refClienteValue = React.createRef();

    // Referencia para el modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia para el modal pre impresión
    this.refModalPreImpresion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();

    // Atributos para el modal configuración
    this.idSidebarConfiguration = 'idSidebarConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refObservacion = React.createRef();
    this.refNota = React.createRef();
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
    document.addEventListener('keydown', this.handleDocumentKeyDown);

    await this.loadingData();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);

    this.abortController.abort();

    alertKit.close();
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

  loadingData = async () => {
    if (
      this.props.cotizacionCrear &&
      this.props.cotizacionCrear.state &&
      this.props.cotizacionCrear.local
    ) {
      this.setState(this.props.cotizacionCrear.state, () => {
        if (this.props.cotizacionCrear.state.cliente) {
          this.handleSelectItemCliente(
            this.props.cotizacionCrear.state.cliente,
          );
        }
      });
      return;
    }

    const [comprobantes, monedas, impuestos, almacenes] = await Promise.all([
      this.fetchComprobante(COTIZACION),
      this.fetchMoneda(),
      this.fetchImpuesto(),
      this.fetchAlmacen({ idSucursal: this.state.idSucursal }),
    ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);
    const impuesto = impuestos.find((item) => item.preferido === 1);
    const almacen = almacenes.find((item) => item.predefinido === 1);

    this.setState({
      comprobantes,
      monedas,
      impuestos,
      almacenes,

      idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
      idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
      idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
      codiso: isEmpty(moneda) ? '' : moneda.codiso,
      idAlmacen: isEmpty(almacen) ? '' : almacen.idAlmacen,

      loading: false,
    }, () => {
      this.updateReduxState();
    });
  };

  updateReduxState() {
    this.props.setCrearCotizacionState(this.state);
    this.props.setCrearCotizacionLocal({});
  }

  clearView = async () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.refCliente.current.restart();
      await this.props.clearCrearCotizacion();
      await this.loadingData();

      this.refProductoValue.current.focus();

      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarProductos(params) {
    const response = await filtrarAlmacenProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchFiltrarCliente(params) {
    const response = await filtrarPersona(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
      idSucursal: this.state.idSucursal,
    };

    const response = await comboComprobante(
      params,
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchMoneda() {
    const response = await comboMoneda(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchImpuesto() {
    const response = await comboImpuesto();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchAlmacen(params) {
    const response = await comboAlmacen(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
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

  handleDocumentKeyDown = (event) => {
    if (event.key === 'F1' && !this.state.isOpenProducto) {
      this.handleGuardar();
    }

    if (event.key === 'F2' && !this.state.isOpenProducto) {
      this.handleLimpiar();
    }
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles
      .filter((item) => item.idProducto !== idProducto)
      .map((item, index) => ({
        ...item,
        id: ++index,
      }));

    const total = detalles.reduce(
      (accumulate, item) => (accumulate += item.cantidad * item.precio),
      0,
    );
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = async (producto) => {
    const { idImpuesto } = this.state;

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione un impuesto para continuar.",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    const item = producto;
    if (item) {
      this.setState({ isOpenProducto: true });
      await this.refModalProducto.current.loadDatos(item);
    }
  };

  handleCloseProducto = async () => {
    await this.setStateAsync({ isOpenProducto: false });
    this.refProductoValue.current.focus();
  };

  handleSaveProducto = async (detalles, callback = async function () { }) => {
    const total = detalles.reduce(
      (accumulate, item) => (accumulate += item.cantidad * item.precio),
      0,
    );
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
    await callback();
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal cliente
  //------------------------------------------------------------------------------------------
  handleOpenModalCliente = () => {
    this.setState({ isOpenCliente: true });
  };

  handleCloseModalCliente = async () => {
    this.setState({ isOpenCliente: false });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------
  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      loadingProducto: false,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProducto = async (text) => {
    const searchWord = text;

    if (isEmpty(searchWord)) {
      this.setState({ productos: [], loadingProducto: false });
      return;
    }

    const params = {
      idAlmacen: this.state.idAlmacen,
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    this.setState({
      productos,
      loadingProducto: false,
    });
  };

  handleSelectItemProducto = (value) => {
    this.updateReduxState();

    this.handleOpenModalProducto(value);
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------
  handleClearInputCliente = () => {
    this.setState({
      clientes: [],
      cliente: null,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterCliente = async (text) => {
    const searchWord = text;
    this.setState({ cliente: null });

    if (isEmpty(searchWord)) {
      this.setState({ clientes: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      cliente: 1,
    };

    const clientes = await this.fetchFiltrarCliente(params);

    this.setState({ clientes });
  };

  handleSelectItemCliente = async (value) => {
    this.refCliente.current.initialize(value.documento + ' - ' + value.informacion);

    this.setState({
      cliente: value,
      clientes: [],
    }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Opciones de configuración
  //------------------------------------------------------------------------------------------

  handleOpenOptions = () => {
    const invoice = document.getElementById(this.idSidebarConfiguration);
    invoice.classList.add('toggled');

    this.setState({
      cacheConfiguracion: {
        idImpuesto: this.state.idImpuesto,
        idMoneda: this.state.idMoneda,
        observacion: this.state.observacion,
        nota: this.state.nota,
      },
    });
  };

  handleCloseOptions = () => {
    const invoice = document.getElementById(this.idSidebarConfiguration);

    if (this.state.cacheConfiguracion) {
      this.setState({
        idImpuesto: this.state.cacheConfiguracion.idImpuesto,
        idMoneda: this.state.cacheConfiguracion.idMoneda,
        observacion: this.state.cacheConfiguracion.observacion,
        nota: this.state.cacheConfiguracion.nota,
      });
    }

    invoice.classList.remove('toggled');
  };

  handleSelectIdImpuesto = (event) => {
    this.setState({ idImpuesto: event.target.value });
  };

  handleSelectIdMoneda = (event) => {
    this.setState({ idMoneda: event.target.value });
  };

  handleSelectIdIdAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  handleSaveOptions = () => {
    if (isEmpty(this.state.idImpuesto)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione un impuesto.",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione una moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    const impuesto = this.state.impuestos.find(
      (item) => item.idImpuesto === this.state.idImpuesto,
    );

    const detalles = this.state.detalles.map((item) => ({
      ...item,
      idImpuesto: impuesto.idImpuesto,
      nombreImpuesto: impuesto.nombre,
      porcentajeImpuesto: impuesto.porcentaje,
    }));

    const moneda = this.state.monedas.find(
      (item) => item.idMoneda === this.state.idMoneda,
    );

    this.setState({
      idMoneda: moneda.idMoneda,
      codiso: moneda.codiso,
      detalles,
    }, () => {
      this.updateReduxState();

      const invoice = document.getElementById(this.idSidebarConfiguration);
      invoice.classList.remove('toggled');
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const {
      idComprobante,
      cliente,
      idMoneda,
      idImpuesto,
      observacion,
      nota,
      detalles,
    } = this.state;

    if (isEmpty(idComprobante)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione su comprobante.",
      }, () => {
        this.refComprobante.current.focus();
      });
      return;
    }

    if (isEmpty(cliente)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione un cliente.",
      }, () => {
        this.refClienteValue.current.focus();
      });
      return;
    }

    if (isEmpty(idMoneda)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione su moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione el impuesto",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: "Cotización",
        message: "Agregar algún producto a la lista.",
      }, () => {
        this.refProductoValue.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Cotización",
      message: "¿Está seguro de continuar?",
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      const data = {
        idComprobante: idComprobante,
        idCliente: cliente.idPersona,
        idMoneda: idMoneda,
        idSucursal: this.state.idSucursal,
        idUsuario: this.state.idUsuario,
        estado: 1,
        observacion: observacion,
        nota: nota,
        detalles: detalles,
      };

      alertKit.loading({ message: 'Procesando información...' });

      const response = await createCotizacion(data);

      if (response instanceof SuccessReponse) {
        alertKit.close();
        this.handleOpenImpresion(response.data.idCotizacion);
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Cotización',
          message: response.getMessage(),
        });
      }
    }
  };

  //------------------------------------------------------------------------------------------
  // Procesos limpiar
  //------------------------------------------------------------------------------------------
  handleLimpiar = async () => {
    const accept = await alertKit.question({
      title: "Cotización",
      message: "¿Está seguro de limpiar la cotización?",
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      this.clearView();
    }

  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCotizacion) => {
    this.setState({ isOpenImpresion: true, idCotizacion: idCotizacion });
  };

  handlePrinterImpresion = (size) => {
    const url = documentsPdfInvoicesCotizacion(this.state.idCotizacion, size);

    pdfVisualizer.printer({
      printable: url,
      type: 'pdf',
      showModal: true,
      modalMessage: 'Recuperando documento...',
      onPrintDialogClose: () => {
        this.clearView();
        this.handleCloseImpresion();
      },
    });
  };

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  };

  //------------------------------------------------------------------------------------------
  // Opciones de pre impresión
  //------------------------------------------------------------------------------------------
  handleOpenPreImpresion = () => {
    const { idComprobante, cliente, idMoneda, idImpuesto, detalles } =
      this.state;

    if (isEmpty(idComprobante)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione su comprobante.",
      }, () => {
        this.refComprobante.current.focus();
      });
      return;
    }

    if (isEmpty(cliente)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione un cliente.",
      }, () => {
        this.refClienteValue.current.focus();
      });
      return;
    }

    if (isEmpty(idMoneda)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione su moneda.",
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: "Cotización",
        message: "Seleccione el impuesto",
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: "Cotización",
        message: "Agregar algún producto a la lista.",
      }, () => {
        this.refProductoValue.current.focus();
      });
      return;
    }

    this.setState({ isOpenPreImpresion: true });
  };

  handleProcessPreImpresion = async (type, abort, success, error) => {
    const {
      idComprobante,
      cliente: { idPersona },
      idMoneda,
      idUsuario,
      idSucursal,
      nota,
      detalles,
    } = this.state;

    const response = await obtenerPreCotizacionPdf({
      idComprobante: idComprobante,
      idCliente: idPersona,

      idMoneda: idMoneda,
      idUsuario: idUsuario,
      idSucursal: idSucursal,
      nota: nota,

      detalle: detalles,
    },
      type,
      abort.signal,
    );

    if (response instanceof SuccessReponse) {
      const base64 = await readDataFile(response.data);

      success();

      pdfVisualizer.printer({
        printable: base64,
        type: 'pdf',
        base64: true,
        onPrintDialogClose: this.handleClosePreImpresion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      error();

      alertKit.warning({
        title: "Cotización",
        message: response.getMessage(),
      });
    }
  };

  handleClosePreImpresion = () => {
    this.setState({ isOpenPreImpresion: false });
  };

  //------------------------------------------------------------------------------------------
  // Procesos cerrar
  //------------------------------------------------------------------------------------------
  handleCerrar = () => {
    this.props.history.goBack();
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
    return (
      <PosContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalProducto
          title="Cotización"
          ref={this.refModalProducto}
          isOpen={this.state.isOpenProducto}
          onClose={this.handleCloseProducto}
          idImpuesto={this.state.idImpuesto}
          impuestos={this.state.impuestos}
          detalles={this.state.detalles}
          handleSave={this.handleSaveProducto}
        />

        <ModalPersona
          contentLabel="Modal Cliente"
          titleHeader="Agregar Cliente"
          isOpen={this.state.isOpenCliente}
          onClose={this.handleCloseModalCliente}
          idUsuario={this.state.idUsuario}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          clear={this.clearView}
          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <SidebarConfiguration
          menus={this.props.token.userToken.menus}
          idSidebarConfiguration={this.idSidebarConfiguration}

          impuestos={this.state.impuestos}
          refImpuesto={this.refImpuesto}
          idImpuesto={this.state.idImpuesto}
          handleSelectIdImpuesto={this.handleSelectIdImpuesto}

          monedas={this.state.monedas}
          refMoneda={this.refMoneda}
          idMoneda={this.state.idMoneda}
          handleSelectIdMoneda={this.handleSelectIdMoneda}

          almacenes={this.state.almacenes}
          refAlmacen={this.refAlmacen}
          idAlmacen={this.state.idAlmacen}
          handleSelectIdIdAlmacen={this.handleSelectIdIdAlmacen}

          refObservacion={this.refObservacion}
          observacion={this.state.observacion}
          handleInputObservacion={this.handleInputObservacion}

          refNota={this.refNota}
          nota={this.state.nota}
          handleInputNota={this.handleInputNota}

          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
        />

        <div className="bg-white w-full h-full flex flex-col overflow-auto">
          <div className="flex w-full h-full">
            {/* PANEL IZQUIERDO */}
            <PanelIzquierdo
              title="Cotización"
              subTitle="Crear"
              loadingProducto={this.state.loadingProducto}
              productos={this.state.productos}
              codiso={this.state.codiso}
              refProducto={this.refProducto}
              refProductoValue={this.refProductoValue}
              handleCerrar={this.handleCerrar}
              handleFilterProducto={this.handleFilterProducto}
              handleSelectItemProducto={this.handleSelectItemProducto}
            />

            {/* PANEL DERECHO  */}
            <PanelDerecho
              comprobantes={this.state.comprobantes}
              refComprobante={this.refComprobante}
              idComprobante={this.state.idComprobante}
              handleSelectComprobante={this.handleSelectComprobante}

              clientes={this.state.clientes}
              refCliente={this.refCliente}
              refClienteValue={this.refClienteValue}
              handleFilterCliente={this.handleFilterCliente}
              handleOpenModalCliente={this.handleOpenModalCliente}
              handleClearInputCliente={this.handleClearInputCliente}
              handleSelectItemCliente={this.handleSelectItemCliente}

              detalles={this.state.detalles}
              codiso={this.state.codiso}
              handleGuardar={this.handleGuardar}
              handleOpenOptions={this.handleOpenOptions}
              handleOpenModalProducto={this.handleOpenModalProducto}
              handleRemoverProducto={this.handleRemoverProducto}
            />
          </div>
        </div>
      </PosContainerWrapper>
    );
  }
}

CotizacionCrear.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      menus: PropTypes.array.isRequired,
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string.isRequired,
      }),
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  cotizacionCrear: PropTypes.shape({
    state: PropTypes.object,
    local: PropTypes.object,
  }),
  setCrearCotizacionState: PropTypes.func,
  setCrearCotizacionLocal: PropTypes.func,
  clearCrearCotizacion: PropTypes.func,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    cotizacionCrear: state.predeterminado.cotizacionCrear,
  };
};

const mapDispatchToProps = {
  setCrearCotizacionState,
  setCrearCotizacionLocal,
  clearCrearCotizacion,
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCotizacionCrear = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CotizacionCrear);

export default ConnectedCotizacionCrear;
