import React from 'react';
import { PosContainerWrapper } from '../../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  calculateTax,
  calculateTaxBruto,
  formatDecimal,
  isEmpty,
  isText,
  formatCurrency,
  readDataFile,
  rounded,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COTIZACION } from '../../../../../../model/types/tipo-comprobante';
import {
  comboAlmacen,
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  documentsPdfInvoicesCotizacion,
  filtrarAlmacenProducto,
  filtrarPersona,
  idCotizacion,
  obtenerPreCotizacionPdf,
  updateCotizacion,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
// import ModalSale from './component/ModalSale';
import PropTypes from 'prop-types';
import ModalProducto from '../component/ModalProducto';
import {
  SpinnerTransparent,
  SpinnerView,
} from '../../../../../../components/Spinner';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import SweetAlert from '../../../../../../model/class/sweet-alert';
import {
  ModalImpresion,
  ModalPersona,
} from '../../../../../../components/MultiModal';
import Image from '../../../../../../components/Image';
import { images } from '../../../../../../helper';
import SidebarConfiguration from '../../../../../../components/SidebarConfiguration';
import Search from '../../../../../../components/Search';
import { TIPO_PRODUCTO_SERVICIO } from '../../../../../../model/types/tipo-producto';
import { cn } from '@/lib/utils';
import { ArrowLeft, Pencil } from 'lucide-react';
import pdfVisualizer from 'pdf-visualizer';
import PanelIzquierdo from '../component/PanelIzquierdo';
import PanelDerecho from '../component/PanelDerecho';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CotizacionEditar extends CustomComponent {
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

      // Atributo principal
      idCotizacion: '',

      // Atributos principales
      idComprobante: '',
      idMoneda: '',
      idImpuesto: '',
      observacion: '',
      nota: '',
      cacheConfiguracion: null,

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],

      // Filtrar producto
      productos: [],
      loadingProducto: false,

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

      // Atributos del model pre impresión
      isOpenPreImpresion: false,
      loadingPreImpresion: false,
      messagePreImpresion: '',

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    this.alert = new SweetAlert();

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

    const url = this.props.location.search;
    const idCotizacion = new URLSearchParams(url).get('idCotizacion');

    if (isText(idCotizacion)) {
      this.loadingData(idCotizacion);
    } else {
      this.close();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);

    this.abortController.abort();
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

  loadingData = async (idCotizacion) => {
    const [cotizacion, comprobantes, monedas, impuestos, almacenes] =
      await Promise.all([
        this.fetchIdCotizacion({ idCotizacion: idCotizacion }),
        this.fetchComprobante(COTIZACION),
        this.fetchMoneda(),
        this.fetchImpuesto(),
        this.fetchAlmacen({ idSucursal: this.state.idSucursal }),
      ]);

    const { cabecera, detalles } = cotizacion;

    const moneda = monedas.find((item) => item.idMoneda === cabecera.idMoneda);
    const almacen = almacenes.find((item) => item.predefinido === 1);

    this.handleSelectItemCliente({
      celular: cabecera.celular,
      direccion: cabecera.direccion,
      email: cabecera.email,
      documento: cabecera.documento,
      informacion: cabecera.informacion,
      idPersona: cabecera.idPersona,
    });

    this.setState({
      idCotizacion,
      comprobantes,
      monedas,
      almacenes,

      impuestos,
      idImpuesto: isEmpty(cabecera.idImpuesto) ? '' : cabecera.idImpuesto,
      idComprobante: isEmpty(cabecera.idComprobante)
        ? ''
        : cabecera.idComprobante,
      idMoneda: isEmpty(cabecera.idMoneda) ? '' : cabecera.idMoneda,
      codiso: isEmpty(moneda) ? '' : moneda.codiso,
      idAlmacen: isEmpty(almacen) ? '' : almacen.idAlmacen,

      observacion: cabecera.observacion,
      nota: cabecera.nota,
      detalles: detalles,

      loading: false,
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchIdCotizacion(params) {
    const response = await idCotizacion(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return null;
    }
  }

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

  close = () => {
    this.props.history.goBack();
  };

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
      this.handleOpenPreImpresion();
    }
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value });
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
    this.setState({ detalles, total });
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = async (producto) => {
    const { idImpuesto } = this.state;

    if (isEmpty(idImpuesto)) {
      this.alert.warning(
        'Cotización',
        'Seleccione un impuesto para continuar.',
        () => {
          this.refImpuesto.current.focus();
        },
      );
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
    this.setState({ detalles, total });
    await callback();
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
    this.handleOpenModalProducto(value);
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------
  handleClearInputCliente = () => {
    this.setState({
      clientes: [],
      cliente: null,
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

  handleSelectItemCliente = (value) => {
    this.refCliente.current.initialize(
      value.documento + ' - ' + value.informacion,
    );

    this.setState({
      cliente: value,
      clientes: [],
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

  handleSaveOptions = () => {
    if (isEmpty(this.state.idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione un impuesto.', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      this.alert.warning('Cotización', 'Seleccione una moneda.', () =>
        this.refMoneda.current.focus(),
      );
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

    this.setState(
      {
        idMoneda: moneda.idMoneda,
        codiso: moneda.codiso,
        detalles,
      },
      async () => {

        const invoice = document.getElementById(this.idSidebarConfiguration);
        invoice.classList.remove('toggled');
      },
    );
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const {
      idCotizacion,
      idComprobante,
      cliente,
      idMoneda,
      idImpuesto,
      observacion,
      nota,
      detalles,
    } = this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      this.alert.warning('Cotización', 'Seleccione un cliente.', () =>
        this.refClienteValue.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Cotización', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione el impuesto', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning(
        'Cotización',
        'Agregar algún producto a la lista.',
        () => this.refProductoValue.current.focus(),
      );
      return;
    }

    this.alert.dialog(
      'Cotización',
      '¿Está seguro de continuar?',
      async (accept) => {
        if (accept) {
          const data = {
            idCotizacion: idCotizacion,
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

          this.alert.information('Cotización', 'Procesando información...');

          const response = await updateCotizacion(data);

          if (response instanceof SuccessReponse) {
            this.alert.close();
            this.handleOpenImpresion(response.data.idCotizacion);
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.alert.warning('Cotización', response.getMessage());
          }
        }
      },
    );
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCotizacion) => {
    this.setState({ isOpenImpresion: true, idCotizacion: idCotizacion });
  };

  handlePrinterImpresion = (size) => {
    pdfVisualizer.printer({
      printable: documentsPdfInvoicesCotizacion(this.state.idCotizacion, size),
      type: 'pdf',
      showModal: true,
      modalMessage: 'Recuperando documento...',
      onPrintDialogClose: () => {
        this.handleCloseImpresion();
      },
    });
  };

  handleCloseImpresion = () => {
    this.setState({ isOpenImpresion: false }, () => this.close());
  };

  //------------------------------------------------------------------------------------------
  // Opciones de pre impresión
  //------------------------------------------------------------------------------------------
  handleOpenPreImpresion = () => {
    const { idComprobante, cliente, idMoneda, idImpuesto, detalles } =
      this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      this.alert.warning('Cotización', 'Seleccione un cliente.', () =>
        this.refClienteValue.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Cotización', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione un impuesto', () =>
        this.refImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning(
        'Cotización',
        'Agregar algún producto a la lista.',
        () => this.refProductoValue.current.focus(),
      );
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

    const response = await obtenerPreCotizacionPdf(
      {
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

      this.alert.warning('Cotización', response.getMessage());
    }
  };

  handleClosePreImpresion = () => {
    this.setState({ isOpenPreImpresion: false });
  };
  //------------------------------------------------------------------------------------------
  // Procesos cerrar
  //------------------------------------------------------------------------------------------
  handleCerrar = () => {
    this.close();
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

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
      const cantidad = item.cantidad;
      const valor = item.precio;

      const porcentaje = item.porcentajeImpuesto;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(porcentaje, valorActual);
      const valorImpuesto = calculateTax(porcentaje, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = this.state.detalles.reduce((acc, item) => {
        const total = item.cantidad * item.precio;
        const subTotal = calculateTaxBruto(item.porcentajeImpuesto, total);
        const impuestoTotal = calculateTax(item.porcentajeImpuesto, subTotal);

        const existingImpuesto = acc.find(
          (imp) => imp.idImpuesto === item.idImpuesto,
        );

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: item.idImpuesto,
            nombre: item.nombreImpuesto,
            valor: impuestoTotal,
          });
        }

        return acc;
      }, []);

      return resultado.map((impuesto, index) => {
        return (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center"
          >
            <p>{impuesto.nombre}:</p>
            <p>
              {formatCurrency(impuesto.valor, this.state.codiso)}
            </p>
          </div>
        );
      });
    };

    return (
      <>
        <div className="d-flex justify-content-between align-items-center">
          <p>Sub Total:</p>
          <p>
            {formatCurrency(subTotal, this.state.codiso)}
          </p>
        </div>
        {impuestosGenerado()}
        <Button className="btn-success w-100" onClick={this.handleGuardar}>
          <div className="d-flex justify-content-between align-items-center py-1">
            <p className="text-xl">Total:</p>
            <p className="text-xl">
              {formatCurrency(total, this.state.codiso)}
            </p>
          </div>
        </Button>
      </>
    );
  }

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

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          clear={this.close}
          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
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
          handleSaveOptions={this.handleSaveOptions}
          handleCloseOptions={this.handleCloseOptions}
        />

        <div className="bg-white w-full h-full flex flex-col overflow-auto">
          <div className="flex w-full h-full">
            {/* PANEL LEFT */}
            <PanelIzquierdo
              loading={this.state.loading}
              title={
               <>
                <p className="h5">
                  Editar Cótización
                </p>
                <Pencil className="h3 w-3" />
                </>
              }

              productos={this.state.productos}
              refProducto={this.refProducto}
              refProductoValue={this.refProductoValue}
              codiso={this.state.codiso}

              handleCerrar={this.handleCerrar}
              handleFilterProducto={this.handleFilterProducto}
              handleSelectItemProducto={this.handleSelectItemProducto}
            />

            {/* PANEL RIGHT */}
            <PanelDerecho
              codiso={this.state.codiso}
              clientes={this.state.clientes}
              comprobantes={this.state.comprobantes}
              detalles={this.state.detalles}

              refComprobante={this.refComprobante}
              idComprobante={this.state.idComprobante}
              handleSelectComprobante={this.handleSelectComprobante}

              refCliente={this.refCliente}
              refClienteValue={this.refClienteValue}
              handleClearInputCliente={this.handleClearInputCliente}
              handleFilterCliente={this.handleFilterCliente}
              handleSelectItemCliente={this.handleSelectItemCliente}

              handleOpenModalPersona={this.handleOpenModalPersona}

              handleOpenOptions={this.handleOpenOptions}
              handleOpenModalProducto={this.handleOpenModalProducto}
              handleRemoverProducto={this.handleRemoverProducto}

              handleGuardar={this.handleGuardar}
            />
          </div>
        </div>
      </PosContainerWrapper>
    );
  }
}

CotizacionEditar.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
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
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCotizacionEditar = connect(
  mapStateToProps,
  null,
)(CotizacionEditar);

export default ConnectedCotizacionEditar;
