import React from 'react';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '../../../../../../model/class/custom-component';
import {
  calculateTax,
  calculateTaxBruto,
  getRowCellIndex,
  isEmpty,
  numberFormat,
  rounded,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { PEDIDO } from '../../../../../../model/types/tipo-comprobante';
import {
  comboComprobante,
  comboImpuesto,
  comboMoneda,
  createPedido,
  documentsPdfInvoicesPedido,
  filtrarPersona,
  filtrarProducto,
} from '../../../../../../network/rest/principal.network';
import Title from '../../../../../../components/Title';
import Row from '../../../../../../components/Row';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SearchInput from '../../../../../../components/SearchInput';
import PropTypes from 'prop-types';
import ModalProducto from '../component/ModalProducto';
import Column from '../../../../../../components/Column';
import { SpinnerView } from '../../../../../../components/Spinner';
import printJS from 'print-js';
import Button from '../../../../../../components/Button';
import Select from '../../../../../../components/Select';
import TextArea from '../../../../../../components/TextArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../../components/Table';
import { clearCrearPedido, setCrearPedidoLocal, setCrearPedidoState } from '../../../../../../redux/predeterminadoSlice';
import SweetAlert from '../../../../../../model/class/sweet-alert';
import { ModalImpresion, ModalPersona } from '../../../../../../components/MultiModal';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
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

      // Atributos principales
      idPedido: '',
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

      // Filtrar proveedor
      proveedor: null,
      proveedores: [],

      // Atributos libres
      codISO: '',
      total: 0,

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal proveedor
      isOpenPersona: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    this.initial = { ...this.state };

    this.alert = new SweetAlert();

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refIdMoneda = React.createRef();
    this.refIdImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    // Filtrar proveedor
    this.refProveedor = React.createRef();
    this.refValueProveedor = React.createRef();

    // Referencia para el modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    //Anular las peticiones
    this.abortController = new AbortController();

    this.refTable = React.createRef();
    this.index = -1;
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

    await this.loadingData();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)

    this.abortController.abort();

    this.alert.close();
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
    if (this.props.pedidoCrear && this.props.pedidoCrear.state && this.props.pedidoCrear.local) {
      this.setState(this.props.pedidoCrear.state, () => {
        if (this.props.pedidoCrear.state.proveedor) {
          this.handleSelectItemProveedor(this.props.pedidoCrear.state.proveedor);
        }
        this.index = this.props.pedidoCrear.local.index;
      });
    } else {
      const [comprobantes, monedas, impuestos] = await Promise.all([
        this.fetchComprobante(PEDIDO),
        this.fetchMoneda(),
        this.fetchImpuesto(),
      ]);

      const comprobante = comprobantes.find((item) => item.preferida === 1);
      const moneda = monedas.find((item) => item.nacional === 1);
      const impuesto = impuestos.find((item) => item.preferido === 1);

      this.setState({
        comprobantes,
        monedas,
        impuestos,
        idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
        idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
        idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
        codISO: isEmpty(moneda) ? '' : moneda.codiso,
        loading: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setCrearPedidoState(this.state)
    this.props.setCrearPedidoLocal({
      index: this.index,
    })
  }

  clearView = async () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.refProveedor.current.restart();
      await this.props.clearCrearPedido();
      await this.loadingData();

      this.refValueProducto.current.focus();
      this.index = -1;

      this.updateReduxState();
    });
  }

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarProductos(params) {
    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchFiltrarProveedor(params) {
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
      this.handleLimpiar();
    }
  }

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectMoneda = (event) => {
    this.setState({ idMoneda: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleSelectImpuesto = (event) => {
    const idImpuesto = event.target.value;

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === idImpuesto);

    this.setState({ idImpuesto: event.target.value }, () => {
      this.updateReduxState();
    });

    if (idImpuesto !== "") {
      this.setState(prevState => ({
        detalles: prevState.detalles.map(item => ({
          ...item,
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        }))
      }), () => {
        this.updateReduxState();
      });
    }
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter((item) => item.idProducto !== idProducto).map((item, index) => ({
      ...item,
      id: ++index
    }));

    if (isEmpty(this.state.detalles)) {
      this.index = -1;
    }

    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
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
      this.alert.warning('Pedido', 'Seleccione un impuesto para continuar.', () => {
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

  handleSaveProducto = async (detalles, callback = async function () { }) => {
    const total = detalles.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalles, total }, () => {
      this.updateReduxState();
    });
    await callback();
    this.refValueProducto.current.focus();
  }

  //------------------------------------------------------------------------------------------
  // Acciones del modal proveedor
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
    }, () => {
      this.updateReduxState();
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
    }, () => {
      this.updateReduxState();
    });

    this.handleOpenModalProducto(value);
  };

  //------------------------------------------------------------------------------------------
  // Filtrar proveedor
  //------------------------------------------------------------------------------------------
  handleClearInputProveedor = () => {
    this.setState({
      proveedores: [],
      proveedor: null,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProveedor = async (text) => {
    const searchWord = text;
    this.setState({ proveedor: null });

    if (isEmpty(searchWord)) {
      this.setState({ proveedores: [] });
      return;
    }

    const params = {
      opcion: 1,
      filter: searchWord,
      proveedor: 1,
    };

    const proveedores = await this.fetchFiltrarProveedor(params);

    this.setState({ proveedores });
  };

  handleSelectItemProveedor = async (value) => {
    this.refProveedor.current.initialize(value.documento + ' - ' + value.informacion);

    this.setState({
      proveedor: value,
      proveedores: [],
    }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const { idComprobante, proveedor, idMoneda, idImpuesto, observacion, nota, detalles } = this.state;

    if (isEmpty(idComprobante)) {
      this.alert.warning('Pedido', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(proveedor)) {
      this.alert.warning('Pedido', 'Seleccione un proveedor.', () =>
        this.refValueProveedor.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      this.alert.warning('Pedido', 'Seleccione su moneda.', () =>
        this.refIdMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      this.alert.warning('Pedido', 'Seleccione el impuesto', () =>
        this.refIdImpuesto.current.focus(),
      );
      return;
    }

    if (isEmpty(detalles)) {
      this.alert.warning('Pedido', 'Agregar algún producto a la lista.', () =>
        this.refValueProducto.current.focus(),
      );
      return;
    }

    this.alert.dialog('Pedido', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idComprobante: idComprobante,
          idProveedor: proveedor.idPersona,
          idMoneda: idMoneda,
          idSucursal: this.state.idSucursal,
          idUsuario: this.state.idUsuario,
          estado: 1,
          observacion: observacion,
          nota: nota,
          detalle: detalles
        };

        this.alert.information('Pedido', 'Procesando información...');

        const response = await createPedido(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idPedido);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Pedido', response.getMessage());
        }
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos limpiar
  //------------------------------------------------------------------------------------------
  handleLimpiar = async () => {
    this.alert.dialog("Pedido", "¿Está seguro de limpiar el pedido?", (accept) => {
      if (accept) {
        this.clearView();
      }
    })
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idPedido) => {
    this.setState({ isOpenImpresion: true, idPedido: idPedido })
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesPedido(this.state.idPedido, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.clearView();
        this.handleCloseImpresion();
      }
    })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  }

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
        className='bg-white'>
        <TableCell className="text-center">{item.id}</TableCell>
        <TableCell>
          {item.codigo}
          <br />
          {item.nombre}
        </TableCell>
        <TableCell>{rounded(item.cantidad)}</TableCell>
        <TableCell>{item.nombreMedida}</TableCell>
        <TableCell>{numberFormat(item.costo, this.state.codISO)}</TableCell>
        <TableCell>{numberFormat(item.cantidad * item.costo, this.state.codISO)}</TableCell>
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
      const valor = item.costo;

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
        const total = item.cantidad * item.costo;
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
          title='Pedido'
          subTitle='CREAR'
          icon={<i className='fa fa-plus'></i>}
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

          clear={this.clearView}

          handleClose={this.handleCloseImpresion}
          handlePrinterA4={this.handlePrinterImpresion.bind(this, 'A4')}
          handlePrinter80MM={this.handlePrinterImpresion.bind(this, '80mm')}
          handlePrinter58MM={this.handlePrinterImpresion.bind(this, '58mm')}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            <Row>
              <Column>
                <SearchInput
                  ref={this.refProducto}
                  autoFocus={true}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  renderItem={(value) => <>{value.codigo} / {value.nombre}</>}
                  renderIconLeft={<i className="bi bi-cart4"></i>}
                />
              </Column>
            </Row>

            <Row>
              <Column>
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
                        <TableHead width="5%">Costo</TableHead>
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
              <Column>
                <div className="form-group">
                  <Button
                    className='btn-success'
                    onClick={this.handleGuardar}>
                    <i className="fa fa-save"></i> Guardar (F1)
                  </Button>
                  {' '}
                  <Button
                    className='btn-outline-info'
                    onClick={this.handleLimpiar}>
                    <i className="fa fa-trash"></i> Limpiar (F2)
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
                </div>
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
                ref={this.refProveedor}
                placeholder="Filtrar proveedores..."
                refValue={this.refValueProveedor}
                data={this.state.proveedores}
                handleClearInput={this.handleClearInputProveedor}
                handleFilter={this.handleFilterProveedor}
                handleSelectItem={this.handleSelectItemProveedor}
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
    pedidoCrear: state.predeterminado.pedidoCrear
  };
};

const mapDispatchToProps = { clearCrearPedido, setCrearPedidoLocal, setCrearPedidoState }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedPedidoCrear = connect(mapStateToProps, mapDispatchToProps)(PedidoCrear);

export default ConnectedPedidoCrear;