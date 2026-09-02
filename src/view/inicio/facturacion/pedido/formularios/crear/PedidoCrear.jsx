import React from 'react';
import { PosContainerWrapper } from '../../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  currentDate,
  getRanurasDeTiempo,
  isEmpty,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PEDIDO } from '../../../../../../model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  comboTipoPedido,
  comboAgencia,
  createPedido,
  documentsPdfInvoicesPedido,
  filtrarAlmacenProducto,
  filtrarPersona,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import ModalProducto from '../component/ModalProducto';
import {
  SpinnerView,
} from '../../../../../../components/Spinner';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import {
  clearCrearPedido,
  setCrearPedidoLocal,
  setCrearPedidoState,
} from '../../../../../../redux/predeterminadoSlice';
import {
  ModalImpresion,
  ModalPersona,
} from '../../../../../../components/MultiModal';
import SidebarConfiguration from '../../../../../../components/SidebarConfiguration';
import Input from '@/components/Input';
import { alertKit } from 'alert-kit';
import pdfVisualizer from 'pdf-visualizer';
import { Plus } from 'lucide-react';
import { TIPO_PEDIDO_ENTREGA_PROGRAMADA, TIPO_PEDIDO_ENVIO_DOMICILIO, TIPO_PEDIDO_ENVIO_POR_AGENCIA, TIPO_PEDIDO_RECOJO_LOCAL } from '@/model/types/tipo-pedido';
import ProductSelectorPanel from '@/components/ProductSelectorPanel';
import ProductTransactionPanel from '@/components/ProductTransactionPanel';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class PedidoCrear extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      loadingProducto: false,
      loadingProductoMessage: 'Cargando productos...',
      emptyProductoMessage: 'Use la barra de busqueda para encontrar su producto.',


      // Atributos principales
      idPedido: '',
      idComprobante: '',
      idTipoPedido: TIPO_PEDIDO_ENVIO_DOMICILIO,
      idMoneda: '',
      idAlmacen: '',
      idImpuesto: '',
      observacion: '',
      nota: '',
      instruccion: '',
      cacheConfiguracion: null,

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],
      almacenes: [],
      tiposPedido: [],
      agencias: [],
      fechaEntrega: currentDate(),
      horaEntrega: '',
      ranurasDeTiempo: getRanurasDeTiempo(),

      // Filtrar producto
      productos: [],

      // Filtrar cliente
      cliente: null,
      clientes: [],

      // Atributos libres
      codiso: '',
      total: 0,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal cliente
      isOpenPersona: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
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

    // Filtrar tipo de entrega
    this.refTipoPedido = React.createRef();
    this.refFechaEntrega = React.createRef();
    this.refHoraEntrega = React.createRef();

    // Referencia para el modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Atributos para el modal configuración
    this.idSidebarConfiguration = 'idSidebarConfiguration';
    this.refImpuesto = React.createRef();
    this.refMoneda = React.createRef();
    this.refAlmacen = React.createRef();
    this.refObservacion = React.createRef();
    this.refNota = React.createRef();
    this.refInstruccion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();
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
      this.props.pedidoCrear &&
      this.props.pedidoCrear.state &&
      this.props.pedidoCrear.local
    ) {
      this.setState(this.props.pedidoCrear.state, () => {
        if (this.props.pedidoCrear.state.cliente) {
          this.handleSelectItemCliente(this.props.pedidoCrear.state.cliente);
        }
      });
    } else {
      const [comprobantes, monedas, impuestos, almacenes, tiposPedido, agencias] = await Promise.all([
        this.fetchComprobante(PEDIDO),
        this.fetchMoneda(),
        this.fetchImpuesto(),
        this.fetchAlmacen({ idSucursal: this.state.idSucursal }),
        this.fetchComboTipoPedido(),
        this.fetchComboAgencia(),
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
        tiposPedido,
        agencias,

        idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
        idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
        idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
        codiso: isEmpty(moneda) ? '' : moneda.codiso,
        idAlmacen: isEmpty(almacen) ? '' : almacen.idAlmacen,

        loading: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setCrearPedidoState(this.state);
    this.props.setCrearPedidoLocal({});
  }

  clearView = async () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.refCliente.current.restart();
      await this.props.clearCrearPedido();
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

  async fetchComboTipoPedido() {
    const response = await comboTipoPedido(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboAgencia() {
    const response = await comboAgencia(this.abortController.signal);

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
    if (event.key === 'F1') {
      this.handleRegister();
    }

    if (event.key === 'F2') {
      this.handleClean();
    }
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectTipoPedido = (event) => {
    this.setState({ idTipoPedido: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleFechaEntrega = (event) => {
    this.setState({ fechaEntrega: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectHoraEntrega = (event) => {
    this.setState({ horaEntrega: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------

  handleOpenModalProducto = (producto) => {
    const { idImpuesto } = this.state;

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione un impuesto para continuar.',
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    const item = producto;
    if (item) {
      this.setState({ isOpenProducto: true });
      this.refModalProducto.current.loadDatos(item);
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
  // Acciones del modal cliente
  //------------------------------------------------------------------------------------------

  handleOpenModalPersona = () => {
    this.setState({ isOpenPersona: true });
  };

  handleCloseModalPersona = async () => {
    this.setState({ isOpenPersona: false });
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

    this.setState({ loadingProducto: true });

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
    this.refCliente.current.initialize(
      value.documento + ' - ' + value.informacion,
    );

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

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  handleInputInstruccion = (event) => {
    this.setState({ instruccion: event.target.value });
  };

  handleSaveOptions = () => {
    if (isEmpty(this.state.idImpuesto)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione un impuesto.',
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione una moneda.',
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
    }, async () => {
      this.updateReduxState();

      const invoice = document.getElementById(this.idSidebarConfiguration);
      invoice.classList.remove('toggled');
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleRegister = async () => {
    const {
      idComprobante,
      cliente,
      idMoneda,
      idImpuesto,
      idTipoPedido,
      fechaEntrega,
      horaEntrega,
      observacion,
      nota,
      detalles,
    } = this.state;

    if (isEmpty(idComprobante)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione su comprobante.',
      }, () => {
        this.refComprobante.current.focus();
      });
      return;
    }

    if (isEmpty(cliente)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione un cliente.',
      }, () => {
        this.refClienteValue.current.focus();
      });
      return;
    }

    if (isEmpty(idMoneda)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione su moneda.',
      }, () => {
        this.refMoneda.current.focus();
      });
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione el impuesto',
      }, () => {
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (isEmpty(idTipoPedido)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Seleccione el tipo de entrega',
      }, () => {
        this.refTipoPedido.current.focus();
      });
      return;
    }

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: 'Pedido',
        message: 'Agregar algún producto a la lista.',
      }, () => {
        this.refProductoValue.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Pedido',
      message: '¿Está seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idComprobante: idComprobante,
        idCliente: cliente.idPersona,
        idMoneda: idMoneda,
        idTipoPedido: idTipoPedido,
        fechaEntrega: fechaEntrega,
        horaEntrega: horaEntrega,
        idSucursal: this.state.idSucursal,
        idUsuario: this.state.idUsuario,
        estado: 1,
        observacion: observacion,
        nota: nota,
        detalles: detalles,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await createPedido(data);

      if (response instanceof SuccessReponse) {
        alertKit.close(() => {
          this.handleOpenImpresion(response.data.idPedido);
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Pedido',
          message: response.getMessage(),
        });
      }
    }
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idPedido) => {
    this.setState({ isOpenImpresion: true, idPedido: idPedido });
  };

  handlePrinterImpresion = (size) => {
    pdfVisualizer.printer({
      printable: documentsPdfInvoicesPedido(this.state.idPedido, size),
      type: 'pdf',
      showModal: true,
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
  // Procesos cerrar y limpiar
  //------------------------------------------------------------------------------------------

  handleClean = async () => {
    const accept = await alertKit.question({
      title: 'Pedido',
      message: '¿Está seguro de limpiar el pedido?',
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      this.clearView();
    }
  };

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
      <PosContainerWrapper className={'flex-column bg-white'}>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalProducto
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
          isOpen={this.state.isOpenPersona}
          onClose={this.handleCloseModalPersona}
          idUsuario={this.state.idUsuario}
        />

        <SidebarConfiguration
          idSidebarConfiguration={this.idSidebarConfiguration}

          impuestos={this.state.impuestos}
          refImpuesto={this.refImpuesto}
          idImpuesto={this.state.idImpuesto}
          handleSelectIdImpuesto={this.handleSelectIdImpuesto}

          monedas={this.state.monedas}
          refMoneda={this.refMoneda}
          idMoneda={this.state.idMoneda}
          handleSelectIdMoneda={this.handleSelectIdMoneda}

          refObservacion={this.refObservacion}
          observacion={this.state.observacion}
          handleInputObservacion={this.handleInputObservacion}

          refNota={this.refNota}
          nota={this.state.nota}
          handleInputNota={this.handleInputNota}

          refInstruccion={this.refInstruccion}
          instruccion={this.state.instruccion}
          handleInputInstruccion={this.handleInputInstruccion}

          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
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

        <div className="bg-white w-full h-full flex flex-col overflow-auto">
          <div className="flex w-full h-full">
            {/* PANEL IZQUIERDO */}
            <ProductSelectorPanel
              type="precio"
              title="Pedido"
              icon={<Plus className="h-4 w-4" />}
              loadingProducto={this.state.loadingProducto}
              loadingMessage={this.state.loadingProductoMessage}
              emptyMessage={this.state.emptyProductoMessage}
              productos={this.state.productos}
              codiso={this.state.codiso}
              refProducto={this.refProducto}
              refProductoValue={this.refProductoValue}
              handleCerrar={this.handleCerrar}
              handleFilterProducto={this.handleFilterProducto}
              handleSelectItemProducto={this.handleSelectItemProducto}
            />


            {/* PANEL RIGHT */}
            <ProductTransactionPanel
              type="precio"
              emptyMessage="Aquí verás los productos que elijas en tu próximo pedido."

              comprobantes={this.state.comprobantes}
              refComprobante={this.refComprobante}
              idComprobante={this.state.idComprobante}
              handleSelectComprobante={this.handleSelectComprobante}

              components={[
                <SearchInput
                  ref={this.refCliente}
                  placeholder="Filtrar clientes..."
                  refValue={this.refClienteValue}
                  data={this.state.clientes}
                  handleClearInput={this.handleClearInputCliente}
                  handleFilter={this.handleFilterCliente}
                  handleSelectItem={this.handleSelectItemCliente}
                  customButton={
                    <Button
                      className="btn-outline-primary !flex items-center"
                      onClick={this.handleOpenModalPersona}
                    >
                      <i className="fa fa-user-plus"></i>
                      <div className="ml-2">Nuevo</div>
                    </Button>
                  }
                  renderItem={(value) => (
                    <>{value.documento + ' - ' + value.informacion}</>
                  )}
                />,
                <div className="form-group">
                  <Select
                    group={false}
                    ref={this.refTipoPedido}
                    value={this.state.idTipoPedido}
                    onChange={this.handleSelectTipoPedido}
                  >
                    <option value="">-- Tipo de entrega --</option>
                    {
                      this.state.tiposPedido.map((item, index) => (
                        <option key={index} value={item.idTipoPedido}>
                          {item.nombre}
                        </option>
                      ))
                    }
                  </Select>
                </div>,
                // ENVIO DOMICILIO
                (this.state.idTipoPedido === TIPO_PEDIDO_ENVIO_DOMICILIO) &&
                <>
                  <div className='w-full form-group'>
                    <Input
                      placeholder="Dirección"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />
                  </div>

                  <div className='w-full'>
                    <Input
                      placeholder="Referencia"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />
                  </div>
                </>,

                // RECOGER EN LOCAL
                (this.state.idTipoPedido === TIPO_PEDIDO_RECOJO_LOCAL) &&
                <Select

                  value={this.state.horaEntrega}
                  ref={this.refHoraEntrega}
                  onChange={this.handleSelectHoraEntrega}
                >
                  <option value="">-- Seleccionar Local --</option>
                  {
                    this.state.ranurasDeTiempo.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))
                  }
                </Select>,

                // ENTREGA PROGRAMADA
                (this.state.idTipoPedido === TIPO_PEDIDO_ENTREGA_PROGRAMADA) &&
                <>
                  <div className='flex flex-col gap-y-4'>

                    <div className="flex gap-4">
                      <Input
                        type="date"
                        value={this.state.fechaEntrega}
                        ref={this.refFechaEntrega}
                        onChange={this.handleFechaEntrega}
                      />

                      <Select
                        value={this.state.horaEntrega}
                        ref={this.refHoraEntrega}
                        onChange={this.handleSelectHoraEntrega}
                      >
                        <option value="">-- Seleccionar Hora --</option>
                        {
                          this.state.ranurasDeTiempo.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ))
                        }
                      </Select>
                    </div>

                    <Input
                      placeholder="Dirección"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />

                    <Input
                      placeholder="Referencia"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />
                  </div>
                </>,

                // ENVIO POR AGENCIA
                (this.state.idTipoPedido === TIPO_PEDIDO_ENVIO_POR_AGENCIA) &&
                <>
                  <div className='flex flex-col justify-between gap-y-4'>
                    <Select
                      value={this.state.horaEntrega}
                      ref={this.refHoraEntrega}
                      onChange={this.handleSelectHoraEntrega}
                    >
                      <option value="">-- Seleccionar Agencia --</option>
                      {
                        this.state.agencias.map((item, index) => (
                          <option key={index} value={item.idAgencia}>
                            {item.nombre}
                          </option>
                        ))
                      }
                    </Select>

                    <Input
                      placeholder="Destino"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />

                    <Input
                      placeholder="Persona que recibe"
                      value={this.state.fechaEntrega}
                      ref={this.refFechaEntrega}
                      onChange={this.handleFechaEntrega}
                    />
                  </div>
                </>
              ]}

              detalles={this.state.detalles}
              codiso={this.state.codiso}

              actions={[
                {
                  icon: <i className="bi bi-arrow-clockwise text-xl text-secondary" />,
                  onClick: this.handleClean,
                  title: "Limpiar",
                },
                {
                  icon: <i className="bi bi-three-dots-vertical text-xl text-secondary" />,
                  onClick: this.handleOpenOptions,
                  title: "Opciones",
                }
              ]}

              handleOpenModalProducto={this.handleOpenModalProducto}
              handleRemoverProducto={this.handleRemoverProducto}

              handleRegister={this.handleRegister}
            />
          </div>
        </div>
      </PosContainerWrapper>
    );
  }
}

PedidoCrear.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  pedidoCrear: PropTypes.shape({
    state: PropTypes.object,
    local: PropTypes.object,
  }),
  setCrearPedidoState: PropTypes.func,
  setCrearPedidoLocal: PropTypes.func,
  clearCrearPedido: PropTypes.func,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    pedidoCrear: state.predeterminado.pedidoCrear,
  };
};

const mapDispatchToProps = {
  clearCrearPedido,
  setCrearPedidoLocal,
  setCrearPedidoState,
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedPedidoCrear = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PedidoCrear);

export default ConnectedPedidoCrear;
