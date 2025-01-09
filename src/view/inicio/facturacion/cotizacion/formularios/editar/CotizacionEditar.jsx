import React from 'react';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '../../../../../../model/class/custom-component';
import {
  calculateTax,
  calculateTaxBruto,
  getRowCellIndex,
  isEmpty,
  isText,
  numberFormat,
  readDataFile,
  rounded,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COTIZACION } from '../../../../../../model/types/tipo-comprobante';
import {
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  documentsPdfInvoicesCotizacion,
  filtrarPersona,
  filtrarProducto,
  idCotizacion,
  obtenerPreCotizacionPdf,
  updateCotizacion,
} from '../../../../../../network/rest/principal.network';
import Title from '../../../../../../components/Title';
import Row from '../../../../../../components/Row';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
// import ModalSale from './component/ModalSale';
import PropTypes from 'prop-types';
import ModalProducto from '../component/ModalProducto';
import Column from '../../../../../../components/Column';
import { SpinnerView } from '../../../../../../components/Spinner';
import printJS from 'print-js';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import TextArea from '../../../../../../components/TextArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../../components/Table';
import SweetAlert from '../../../../../../model/class/sweet-alert';
import { ModalImpresion, ModalPersona, ModalPreImpresion } from '../../../../../../components/MultiModal';
import Image from '../../../../../../components/Image';
import { images } from '../../../../../../helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
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

      // Detalle del gasto
      detalles: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],

      // Filtrar producto
      productos: [],

      // Filtrar cliente
      cliente: null,
      clientes: [],

      // Atributos libres
      codISO: '',
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
    this.refIdMoneda = React.createRef();
    this.refIdImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.refValueCliente = React.createRef();

    // Referencia para el modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    // Referencia para el modal pre impresión
    this.refModalPreImpresion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();

    this.refTable = React.createRef();
    this.refTableBody = React.createRef();
    this.index = -1;
    this.cells = [];
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
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    const url = this.props.location.search;
    const idCotizacion = new URLSearchParams(url).get('idCotizacion');

    if (isText(idCotizacion)) {
      this.loadingData(idCotizacion);
    } else {
      this.close();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)

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
    const [cotizacion, comprobantes, monedas, impuestos] =
      await Promise.all([
        this.fetchIdCotizacion({ idCotizacion: idCotizacion }),
        this.fetchComprobante(COTIZACION),
        this.fetchMoneda(),
        this.fetchImpuesto(),
      ]);

    const { cabecera, detalle } = cotizacion;

    const moneda = monedas.find((item) => item.idMoneda === cabecera.idMoneda);

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
      impuestos,
      idImpuesto: isEmpty(cabecera.idImpuesto) ? '' : cabecera.idImpuesto,
      idComprobante: isEmpty(cabecera.idComprobante) ? '' : cabecera.idComprobante,
      idMoneda: isEmpty(cabecera.idMoneda) ? '' : cabecera.idMoneda,
      codISO: isEmpty(moneda) ? '' : moneda.codiso,
      observacion: cabecera.observacion,
      nota: cabecera.nota,
      detalles: detalle,
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
    const response = await filtrarProducto(params);

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
      "tipo": tipo,
      "idSucursal": this.state.idSucursal
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

  close = () => {
    this.props.history.goBack();
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
      this.handleGuardar();
    }
    if (event.key === 'F2') {
      this.handleOpenPreImpresion();
    }
  }

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value });
  };

  handleSelectMoneda = (event) => {
    this.setState({ idMoneda: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  handleSelectImpuesto = (event) => {
    const idImpuesto = event.target.value;

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === idImpuesto);

    this.setState({ idImpuesto: event.target.value });

    if (idImpuesto !== "") {
      const newDetalle = [...this.state.detalles].map((item) => (
        {
          ...item,
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        }
      ));
      this.setState({
        detalles: newDetalle,
      })
    }
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto).map((item, index) => ({
      ...item,
      id: ++index
    }), () => {
      if (isEmpty(this.state.detalles)) {
        this.index = -1;
      }
    });

    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.precio), 0);
    this.setState({ detalles, total });
  };

  //------------------------------------------------------------------------------------------
  // Acciones de la tabla
  //------------------------------------------------------------------------------------------
  handleKeyDownTable = (event) => {
    const table = this.refTable.current;
    if (!table) return;

    const children = Array.from(table.tBodies[0].children);
    if (children.length === 0) return;

    if (event.key === 'ArrowUp') {
      this.index = (this.index - 1 + children.length) % children.length;
      this.updateSelection(children);
      event.preventDefault();
    }

    if (event.key === 'ArrowDown') {
      this.index = (this.index + 1) % children.length;
      this.updateSelection(children);
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      if (this.index >= 0) {
        this.handleOpenModalProducto()
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  handleOnClickTable = async (event) => {
    const { rowIndex, children } = getRowCellIndex(event);

    if (rowIndex === -1) return;

    this.index = rowIndex;
    this.updateSelection(children);
  }

  handleOnDbClickTable = async (event) => {
    const { rowIndex, children } = getRowCellIndex(event);

    if (rowIndex === -1) return;

    this.index = rowIndex;
    this.updateSelection(children);
    this.handleOpenModalProducto();
  }

  updateSelection = (children) => {
    children.forEach(row => row.classList.remove("table-active"));

    const selectedChild = children[this.index];
    selectedChild.classList.add("table-active");
    selectedChild.scrollIntoView({ block: 'center' });
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal producto
  //------------------------------------------------------------------------------------------
  handleOpenModalProducto = (producto) => {
    const { idImpuesto, detalles } = this.state;

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione un impuesto para continuar.', () => {
        this.refIdImpuesto.current.focus();
      });
      return;
    }

    const item = producto ?? detalles[this.index];
    if (item) {
      this.setState({ isOpenProducto: true })
      this.refModalProducto.current.loadDatos(item);
    }
  }

  handleCloseProducto = async () => {
    this.setState({ isOpenProducto: false });
  }

  handleSaveProducto = (detalles) => {
    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.precio), 0);
    this.setState({ detalles, total });
    this.refValueProducto.current.focus();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal cliente
  //------------------------------------------------------------------------------------------
  handleOpenModalPersona = () => {
    this.setState({ isOpenPersona: true });
  }

  handleCloseModalPersona = async () => {
    this.setState({ isOpenPersona: false });
  }

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------
  handleClearInputProducto = () => {
    this.setState({
      productos: [],
    });
  };

  handleFilterProducto = async (text) => {
    const searchWord = text;

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    this.setState({
      productos: productos,
    });
  };

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState({
      productos: [],
    });

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
    this.refCliente.current.initialize(value.documento + ' - ' + value.informacion);

    this.setState({
      cliente: value,
      clientes: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const { idCotizacion, idComprobante, cliente, idMoneda, idImpuesto, observacion, nota, detalles } = this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      this.alert.warning('Cotización', 'Seleccione un cliente.', () =>
        this.refValueCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Cotización', 'Seleccione su moneda.', () =>
        this.refIdMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione el impuesto', () =>
        this.refIdImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning('Cotización', 'Agregar algún producto a la lista.', () =>
        this.refValueProducto.current.focus(),
      );
      return;
    }

    this.alert.dialog('Cotización', '¿Está seguro de continuar?', async (accept) => {
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
          detalle: detalles
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
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCotizacion) => {
    this.setState({ isOpenImpresion: true, idCotizacion: idCotizacion })
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesCotizacion(this.state.idCotizacion, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.handleCloseImpresion();
      }
    })
  }

  handleCloseImpresion = () => {
    this.setState({ isOpenImpresion: false }, this.close());
  }

  //------------------------------------------------------------------------------------------
  // Opciones de pre impresión
  //------------------------------------------------------------------------------------------
  handleOpenPreImpresion = () => {
    const { idComprobante, cliente, idMoneda, idImpuesto, detalles } = this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      this.alert.warning('Cotización', 'Seleccione un cliente.', () =>
        this.refValueCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Cotización', 'Seleccione su moneda.', () =>
        this.refIdMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Cotización', 'Seleccione un impuesto', () =>
        this.refIdImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning('Cotización', 'Agregar algún producto a la lista.', () =>
        this.refValueProducto.current.focus(),
      );
      return;
    }

    this.setState({ isOpenPreImpresion: true })
  }

  handleProcessPreImpresion = async (type, abort, success, error) => {
    const { idComprobante, cliente: { idPersona }, idMoneda, idUsuario, idSucursal, nota, detalles } = this.state;

    const response = await obtenerPreCotizacionPdf({
      idComprobante: idComprobante,
      idCliente: idPersona,

      idMoneda: idMoneda,
      idUsuario: idUsuario,
      idSucursal: idSucursal,
      nota: nota,

      detalle: detalles
    }, type, abort.signal);

    if (response instanceof SuccessReponse) {
      const base64 = await readDataFile(response.data);

      success();

      printJS({
        printable: base64,
        type: 'pdf',
        base64: true,
        onPrintDialogClose: this.handleClosePreImpresion
      })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      error();

      this.alert.warning("Cotización", response.getMessage())
    }
  }

  handleClosePreImpresion = () => {
    this.setState({ isOpenPreImpresion: false })
  }
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

  generateBody() {
    const { detalles } = this.state;

    if (isEmpty(detalles)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="7"> Agregar datos a la tabla </TableCell>
        </TableRow>
      );
    }

    return detalles.map((item, index) => (
      <TableRow
        key={index}
        className='bg-white'
        tabIndex="0">
        <TableCell className="text-center">{item.id}</TableCell>
        <TableCell>
          {item.codigo}
          <br />
          {item.nombre}
        </TableCell>
        <TableCell>{rounded(item.cantidad)}</TableCell>
        <TableCell>{item.nombreMedida}</TableCell>
        <TableCell>{numberFormat(item.precio, this.state.codISO)}</TableCell>
        <TableCell>{numberFormat(item.cantidad * item.precio, this.state.codISO)}</TableCell>
        <TableCell className="text-center">
          <Button
            className="btn-outline-danger btn-sm"
            onClick={() => this.handleRemoverProducto(item.idProducto)}>
            <i className="bi bi-trash"></i>
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

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

        const existingImpuesto = acc.find((imp) => imp.idImpuesto === item.idImpuesto);

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
          <TableRow key={index}>
            <TableHead className="text-right mb-2">{impuesto.nombre} :</TableHead>
            <TableHead className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codISO)}
            </TableHead>
          </TableRow>
        );
      });
    };

    return (
      <>
        <TableRow>
          <TableHead className="text-right mb-2">SUB TOTAL :</TableHead>
          <TableHead className="text-right mb-2">
            {numberFormat(subTotal, this.state.codISO)}
          </TableHead>
        </TableRow>
        {impuestosGenerado()}
        <TableRow className="border-bottom"></TableRow>
        <TableRow>
          <TableHead className="text-right h5">TOTAL :</TableHead>
          <TableHead className="text-right h5">
            {numberFormat(total, this.state.codISO)}
          </TableHead>
        </TableRow>
      </>
    );
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Cotización'
          subTitle='EDITAR'
          icon={<i className='fa fa-edit'></i>}
          handleGoBack={this.handleCerrar}
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
          isOpen={this.state.isOpenPersona}
          onClose={this.handleCloseModalPersona}

          idUsuario={this.state.idUsuario}
        />

        <ModalImpresion
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}

          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <ModalPreImpresion
          isOpen={this.state.isOpenPreImpresion}

          idComprobante={this.state.idComprobante}
          idCliente={this.state.cliente === null ? '' : this.state.cliente.idPersona}
          idMoneda={this.state.idMoneda}
          idUsuario={this.state.idUsuario}
          idSucursal={this.state.idSucursal}
          nota={this.state.nota}
          detalles={this.state.detalles}

          handleClose={this.handleClosePreImpresion}
          handleProcess={this.handleProcessPreImpresion}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            <Row>
              <Column formGroup={true}>
                <SearchInput
                  ref={this.refProducto}
                  autoFocus={true}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  // renderItem={(value) => <>{value.codigo} / {value.nombre}</>}
                  renderItem={(value) =>
                    <div className="d-flex align-items-center">
                      <Image
                        default={images.noImage}
                        src={value.imagen}
                        alt={value.nombre}
                        width={60}
                      />

                      <div className='ml-2'>
                        {value.codigo}
                        <br />
                        {value.nombre}
                      </div>
                    </div>}
                  renderIconLeft={<i className="bi bi-cart4"></i>}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <TableResponsive onKeyDown={this.handleKeyDownTable}>
                  <Table
                    ref={this.refTable}
                    tabIndex="0"
                    onClick={this.handleOnClickTable}
                    onDoubleClick={this.handleOnDbClickTable}
                    className={"table-bordered table-hover table-sticky"}>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="5%" className="text-center">#</TableHead>
                        <TableHead width="15%">Producto</TableHead>
                        <TableHead width="5%">Cantidad</TableHead>
                        <TableHead width="5%">Medida</TableHead>
                        <TableHead width="5%">Precio</TableHead>
                        <TableHead width="5%">Total</TableHead>
                        <TableHead width="5%" className="text-center">Quitar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {this.generateBody()}
                    </TableBody>
                  </Table>
                </TableResponsive>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Button
                  className='btn-warning'
                  onClick={this.handleGuardar}>
                  <i className="fa fa-edit"></i> Editar (F1)
                </Button>
                {' '}
                {/* <Button
                    className=" btn-outline-primary"
                    onClick={this.handleOpenPreImpresion}>
                    <i className="bi bi-printer"></i> Pre Impresión (F3)
                  </Button>
                  {' '} */}
                <Button
                  className=" btn-outline-danger"
                  onClick={this.handleCerrar}>
                  <i className="fa fa-close"></i> Cerrar
                </Button>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <p><span className='text-danger'>*</span> <i className="bi bi-chat-dots-fill text-danger"></i> Observación, se utiliza para agregar información importante. No son visible en la impresión.</p>
                <p><span className='text-danger'>*</span> <i className="bi bi-card-text text-danger"></i> Nota, visible en la impresión del documento.</p>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-receipt"></i>}
                refSelect={this.refComprobante}
                value={this.state.idComprobante}
                disabled={true}
                onChange={this.handleSelectComprobante}
              >
                <option value="">-- Comprobantes --</option>
                {this.state.comprobantes.map((item, index) => (
                  <option key={index} value={item.idComprobante}>
                    {item.nombre + ' (' + item.serie + ')'}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <SearchInput
                ref={this.refCliente}
                placeholder="Filtrar clientes..."
                refValue={this.refValueCliente}
                data={this.state.clientes}
                handleClearInput={this.handleClearInputCliente}
                handleFilter={this.handleFilterCliente}
                handleSelectItem={this.handleSelectItemCliente}
                renderItem={(value) => <>{value.documento + ' - ' + value.informacion}</>}
                renderIconLeft={<i className="bi bi-person-circle"></i>}
                customButton={
                  <Button
                    className="btn-outline-success d-flex align-items-center"
                    onClick={this.handleOpenModalPersona}>
                    <i className='fa fa-plus'></i>
                    <span className="ml-2">Nuevo</span>
                  </Button>
                }
              />
            </div>

            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-percent"></i>}
                refSelect={this.refIdImpuesto}
                value={this.state.idImpuesto}
                onChange={this.handleSelectImpuesto}
              >
                <option value={''}>-- Impuesto --</option>
                {this.state.impuestos.map((item, index) => (
                  <option key={index} value={item.idImpuesto}>
                    {item.nombre}
                  </option>
                )
                )}
              </Select>
            </div>

            <div className="form-group">
              <Select
                group={true}
                iconLeft={<i className="bi bi-cash"></i>}
                refSelect={this.refIdMoneda}
                value={this.state.idMoneda}
                onChange={this.handleSelectMoneda}
              >
                <option value="">-- Moneda --</option>
                {this.state.monedas.map((item, index) => (
                  <option key={index} value={item.idMoneda}>
                    {item.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <TextArea
                group={true}
                iconLeft={<i className="bi bi-chat-dots-fill"></i>}
                refInput={this.refObservacion}
                value={this.state.observacion}
                onChange={this.handleInputObservacion}
                placeholder="Ingrese alguna observación"
              />
            </div>

            <div className="form-group">
              <TextArea
                group={true}
                iconLeft={<i className="bi bi-card-text"></i>}
                value={this.state.nota}
                onChange={this.handleInputNota}
                placeholder="Ingrese alguna nota"
              />
            </div>

            <div className="form-group">
              <Table classNameContent='w-100'>
                <TableHeader>{this.renderTotal()}</TableHeader>
              </Table>
            </div>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CotizacionEditar.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
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

const ConnectedCotizacionEditar = connect(mapStateToProps, null)(CotizacionEditar);

export default ConnectedCotizacionEditar;
