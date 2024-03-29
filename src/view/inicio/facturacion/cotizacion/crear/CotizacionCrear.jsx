import React from 'react';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  calculateTax,
  calculateTaxBruto,
  isEmpty,
  isNumeric,
  numberFormat,
  rounded,
  spinnerLoading,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { COTIZACION } from '../../../../../model/types/tipo-comprobante';
import {
  comboComprobante,
  comboImpuesto,
  comboMedida,
  comboMoneda,
  createCotizacion,
  filtrarPersona,
  filtrarProducto,
} from '../../../../../network/rest/principal.network';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SearchInput from '../../../../../components/SearchInput';
// import ModalSale from './component/ModalSale';
import PropTypes from 'prop-types';
import { CustomModalProduct } from './component/ModalProduct';
import Column from '../../../../../components/Column';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CotizaciónCrear extends CustomComponent {
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
      idComprobante: '',
      idMoneda: '',
      idImpuesto: '',
      observacion: '',
      nota: '',

      // Detalle del gasto
      detalle: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],
      impuestos: [],
      medidas: [],

      // Filtrar producto
      filtrarProducto: '',
      loadingProducto: false,
      producto: null,
      productos: [],

      // Filtrar cliente
      filtrarCliente: '',
      loadingCliente: false,
      cliente: null,
      clientes: [],

      // Atributos libres
      codISO: '',
      total: 0,

      // Atributos del modal producto
      isOpenProducto: false,
      loadingModalProducto: true,
      cantidadModalProducto: '',
      precioModalProducto: '',
      idMedidaMondalProducto: '',
      tipoProducto: '',

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    this.initial = { ...this.state };

    // Referencia principales
    this.refComprobante = React.createRef();
    this.refMoneda = React.createRef();
    this.refImpuesto = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.selectItemProducto = false;

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.selectItemCliente = false;

    // Referencia para el modal producto
    this.refCantidadModalProduct = React.createRef();
    this.refPrecioModalProduct = React.createRef();
    this.refMedidaModalProduct = React.createRef();

    // Referencia para el custom modal producto
    this.refModalProducto = React.createRef();

    // Referencia para el custom modal producto
    this.refCustomModalSale = React.createRef();

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
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    await this.loadData();
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

  loadData = async () => {
    const [comprobantes, monedas, impuestos, medidas] =
      await Promise.all([
        this.fetchComprobante(COTIZACION),
        this.fetchMoneda(),
        this.fetchImpuesto(),
        this.fetchMedida()
      ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);
    const impuesto = impuestos.find((item) => item.preferido === 1);

    this.setState({
      comprobantes,
      monedas,
      impuestos,
      medidas,
      idImpuesto: isEmpty(impuesto) ? '' : impuesto.idImpuesto,
      idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
      idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
      codISO: isEmpty(moneda) ? '' : moneda.codiso,
      loading: false,
    });
  };

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

  async fetchMedida() {
    const response = await comboMedida();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  clearView = () => {
    this.setState(this.initial, async () => {
      await this.loadData();
      this.refProducto.current.focus();
    });
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
      const newDetalle = [...this.state.detalle].map((item) => (
        {
          ...item,
          idImpuesto: impuesto.idImpuesto,
          nombreImpuesto: impuesto.nombre,
          porcentajeImpuesto: impuesto.porcentaje,
        }
      ));
      this.setState({
        detalle: newDetalle,
      })
    }
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal product
  //------------------------------------------------------------------------------------------

  handleOpenModalProducto = () => {
    this.setState({ loadingModalProducto: true, isOpenProducto: true })
  }

  handleOnOpenModalProducto = async () => {
    await this.setStateAsync({
      cantidadModalProducto: this.state.producto.tipoProducto === "SERVICIO" ? '1' : '',
      precioModalProducto: this.state.producto.precio,
      idMedidaMondalProducto: this.state.producto.idMedida,
      tipoProducto: this.state.producto.tipoProducto,
      loadingModalProducto: false,
    })

    if (this.state.producto.tipoProducto === "SERVICIO") {
      this.refPrecioModalProduct.current.focus();
    } else {
      this.refCantidadModalProduct.current.focus();
    }
  }

  handleOnHiddenModalProducto = async () => {
    await this.setStateAsync({
      productos: [],
      filtrarProducto: '',
      producto: null,
      cantidadModalProducto: '',
      precioModalProducto: '',
      tipoProducto: ''
    });
    this.selectItemProducto = false;
  }

  handleCloseProducto = async () => {
    return new Promise((resolve) => {
      const data = this.refModalProducto.current;
      data.classList.add("close-cm");
      data.addEventListener('animationend', async () => {
        this.setState({ isOpenProducto: false }, () => {
          resolve();
        });
      });
    });
  }


  handleInputCantidadModalProducto = (event) => {
    this.setState({ cantidadModalProducto: event.target.value });
  };

  handleInputPrecioModalProducto = (event) => {
    this.setState({ precioModalProducto: event.target.value });
  };

  handleSelectMedida = (event) => {
    this.setState({ idMedidaMondalProducto: event.target.value });
  }

  handleAddProduct = async () => {
    const { cantidadModalProducto, precioModalProducto, idMedidaMondalProducto, detalle, idImpuesto } = this.state;

    if (isEmpty(idImpuesto)) {
      alertWarning('Cotización', 'Seleccione un IGV para continuar.', async () => {
        await this.handleCloseProducto();
        this.refImpuesto.current.focus();
      });
      return;
    }

    if (!isNumeric(cantidadModalProducto)) {
      alertWarning('Cotización', 'Ingrese la cantidad.', () => {
        this.refCantidadModalProduct.current.focus();
      });
      return;
    }

    if (!isNumeric(precioModalProducto)) {
      alertWarning('Cotización', 'Ingrese el precio.', () => {
        this.refPrecioModalProduct.current.focus();
      });
      return;
    }

    if (isEmpty(idMedidaMondalProducto)) {
      alertWarning('Cotización', 'Ingrese la unidad de medida', () => {
        this.refMedidaModalProduct.current.focus();
      });
      return;
    }

    if (!this.state.producto) return;

    const { idProducto, nombre, tipoProducto } = this.state.producto;

    const newDetalle = detalle.map(item => ({ ...item }));

    const existeDetalle = newDetalle.find((item) => item.idProducto === idProducto);

    const impuesto = this.state.impuestos.find((item) => item.idImpuesto === this.state.idImpuesto);

    if (existeDetalle) {
      if (tipoProducto === "SERVICIO") {
        existeDetalle.precio = parseFloat(precioModalProducto);
      } else {
        existeDetalle.cantidad += parseFloat(cantidadModalProducto);
      }
    } else {
      const data = {
        idProducto: idProducto,
        nombre: nombre,
        cantidad: parseFloat(cantidadModalProducto),
        precio: parseFloat(precioModalProducto),
        idMedida: idMedidaMondalProducto,
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
      };

      newDetalle.push(data);
    }

    const total = newDetalle.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);

    this.setState({
      detalle: newDetalle,
      total,
    });

    this.handleCloseProducto();

    this.refProducto.current.focus();
  };

  handleRemoverProduct = (idProducto) => {
    const detalle = this.state.detalle.filter((item) => item.idProducto !== idProducto);

    const total = detalle.reduce((accumulate, item) => (accumulate += item.cantidad * item.costo), 0);
    this.setState({ detalle, total });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = async () => {
    await this.setStateAsync({
      productos: [],
      filtrarProducto: '',
      producto: null,
    });
    this.selectItemProducto = false;
  };

  handleFilterProducto = async (event) => {
    const searchWord = this.selectItemProducto ? '' : event.target.value;
    await this.setStateAsync({ producto: null, filtrarProducto: searchWord });

    this.selectItemProducto = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ productos: [] });
      return;
    }

    if (this.state.loadingProducto) return;

    await this.setStateAsync({ loadingProducto: true });

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    this.setState({
      productos: productos,
      loadingProducto: false,
    });
  };

  handleSelectItemProducto = async (value) => {
    console.log(value)
    await this.setStateAsync({
      producto: value,
      filtrarProducto: value.nombre,
      productos: [],
    });
    this.selectItemProducto = true;

    this.handleOpenModalProducto();
  };

  //------------------------------------------------------------------------------------------
  // Filtrar cliente
  //------------------------------------------------------------------------------------------

  handleClearInputCliente = async () => {
    await this.setStateAsync({
      clientes: [],
      filtrarCliente: '',
      cliente: null,
    });
    this.selectItemCliente = false;
  };

  handleFilterCliente = async (event) => {
    const searchWord = this.selectItemCliente ? '' : event.target.value;
    await this.setStateAsync({ cliente: null, filtrarCliente: searchWord });

    this.selectItemCliente = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ clientes: [] });
      return;
    }

    if (this.state.loadingCliente) return;

    await this.setStateAsync({ loadingCliente: true });

    const params = {
      opcion: 1,
      filter: searchWord,
      cliente: 1,
    };

    const clientes = await this.fetchFiltrarCliente(params);

    this.setState({ loadingCliente: false, clientes });
  };

  handleSelectItemCliente = async (value) => {
    await this.setStateAsync({
      cliente: value,
      filtrarCliente: value.documento + ' - ' + value.informacion,
      clientes: [],
    });
    this.selectItemCliente = true;
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------

  handleGuardar = async () => {
    const { idComprobante, cliente, idMoneda, idImpuesto, observacion, nota, detalle } = this.state;

    if (isEmpty(idComprobante)) {
      alertWarning('Cotización', 'Seleccione su comprobante.', () =>
        this.refComprobante.current.focus(),
      );
      return;
    }

    if (isEmpty(cliente)) {
      alertWarning('Cotización', 'Seleccione un cliente.', () =>
        this.refCliente.current.focus(),
      );
      return;
    }

    if (isEmpty(idMoneda)) {
      alertWarning('Cotización', 'Seleccione su moneda.', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(idImpuesto)) {
      alertWarning('Cotización', 'Seleccione el impuesto', () =>
        this.refMoneda.current.focus(),
      );
      return;
    }

    if (isEmpty(detalle)) {
      alertWarning('Cotización', 'Agregar algún producto a la lista.', () =>
        this.refProducto.current.focus(),
      );
      return;
    }

    alertDialog('Cotización', '¿Está seguro de continuar?', async (accept) => {
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
          detalle: detalle
        };

        alertInfo('Cotización', 'Procesando información...');

        const response = await createCotizacion(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cotización', response.data, () => {
            this.clearView();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Cotización', response.getMessage());
        }
      }
    });
  };

  handleLimpiar = async () => {
    alertDialog("Cotización", "¿Está seguro de limpiar la cotización?", (accept) => {
      if (accept) {
        this.clearView();
      }
    })
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

  generarBody() {
    const { detalle } = this.state;

    if (isEmpty(detalle)) {
      return (
        <tr className="text-center">
          <td colSpan="6"> Agregar datos a la tabla </td>
        </tr>
      );
    }

    return detalle.map((item, index) => (
      <tr key={index}>
        <td className="text-center">{++index}</td>
        <td>{item.nombre}</td>
        <td>{rounded(item.cantidad)}</td>
        <td>{numberFormat(item.precio, this.state.codISO)}</td>
        <td>{numberFormat(item.cantidad * item.precio, this.state.codISO)}</td>
        <td className="text-center">
          <button
            className="btn btn-outline-danger btn-sm"
            title="Eliminar"
            onClick={() => this.handleRemoverProduct(item.idProducto)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    ));
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalle) {
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
      const resultado = this.state.detalle.reduce((acc, item) => {
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
          <tr key={index}>
            <th className="text-right mb-2">{impuesto.nombre} :</th>
            <th className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codISO)}
            </th>
          </tr>
        );
      });
    };

    return (
      <thead>
        <tr>
          <th className="text-right mb-2">SUB TOTAL :</th>
          <th className="text-right mb-2">
            {numberFormat(subTotal, this.state.codISO)}
          </th>
        </tr>
        {impuestosGenerado()}
        <tr className="border-bottom"></tr>
        <tr>
          <th className="text-right h5">TOTAL :</th>
          <th className="text-right h5">
            {numberFormat(total, this.state.codISO)}
          </th>
        </tr>
      </thead>
    );
  }

  render() {
    return (
      <ContainerWrapper>
        <CustomModalProduct
          refModal={this.refModalProducto}
          isOpen={this.state.isOpenProducto}
          onOpen={this.handleOnOpenModalProducto}
          onHidden={this.handleOnHiddenModalProducto}
          onClose={this.handleCloseProducto}

          loading={this.state.loadingModalProducto}

          tipoProducto={this.state.tipoProducto}

          refCantidad={this.refCantidadModalProduct}
          cantidad={this.state.cantidadModalProducto}
          handleInputCantidad={this.handleInputCantidadModalProducto}

          refPrecio={this.refPrecioModalProduct}
          precio={this.state.precioModalProducto}
          handleInputPrecio={this.handleInputPrecioModalProducto}

          medidas={this.state.medidas}
          refMedida={this.refMedidaModalProduct}
          idMedida={this.state.idMedidaMondalProducto}
          handleSelectMedida={this.handleSelectMedida}

          handleAdd={this.handleAddProduct}
        />

        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        {/* Titulo */}
        <Title
          title='Cotización'
          subTitle='Crear'
          handleGoBack={this.handleCerrar}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            {/* Filtrar y agregar concepto */}
            <Row>
              {/* Filtrar */}
              <Column>
                <SearchInput
                  showLeftIcon={true}
                  autoFocus={true}
                  placeholder="Filtrar productos..."
                  refValue={this.refProducto}
                  value={this.state.filtrarProducto}
                  data={this.state.productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  renderItem={(value) => <>{value.nombre}</>}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered rounded">
                    <thead>
                      <tr>
                        <th width="5%" className="text-center">
                          #
                        </th>
                        <th width="15%">Producto</th>
                        <th width="5%">Cantidad</th>
                        <th width="5%">Precio</th>
                        <th width="5%">Total</th>
                        <th width="5%" className="text-center">
                          Quitar
                        </th>
                      </tr>
                    </thead>
                    <tbody>{this.generarBody()}</tbody>
                  </table>
                </div>
              </Column>
            </Row>

            <Row>
              <Column>
                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={this.handleGuardar}
                  >
                    <i className="fa fa-save"></i> Guardar (F1)
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={this.handleLimpiar}
                  >
                    <i className="fa fa-trash"></i> Limpiar (F2)
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={this.handleCerrar}
                  >
                    <i className="fa fa-close"></i> Cerrar
                  </button>
                </div>
              </Column>
            </Row>
          </Column>

          <Column className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-receipt"></i>
                  </div>
                </div>

                <select
                  title="Comprobantes de venta"
                  className="form-control"
                  ref={this.refComprobante}
                  value={this.state.idComprobante}
                  onChange={this.handleSelectComprobante}
                >
                  <option value="">-- Comprobantes --</option>
                  {this.state.comprobantes.map((item, index) => (
                    <option key={index} value={item.idComprobante}>
                      {item.nombre + ' (' + item.serie + ')'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <SearchInput
                showLeftIcon={true}
                placeholder="Filtrar clientes..."
                refValue={this.refCliente}
                value={this.state.filtrarCliente}
                data={this.state.clientes}
                handleClearInput={this.handleClearInputCliente}
                handleFilter={this.handleFilterCliente}
                handleSelectItem={this.handleSelectItemCliente}
                renderItem={(value) => (
                  <>{value.documento + ' - ' + value.informacion}</>
                )}
                renderIconLeft={() => <i className="bi bi-person-circle"></i>}
              />
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-percent"></i>
                  </div>
                </div>
                <select
                  className="form-control"
                  ref={this.refImpuesto}
                  value={this.state.idImpuesto}
                  onChange={this.handleSelectImpuesto}
                >
                  <option value={''}>-- Impuesto --</option>
                  {this.state.impuestos.map((item, index) => {
                    return (
                      <option key={index} value={item.idImpuesto}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-cash"></i>
                  </div>
                </div>
                <select
                  title="Lista metodo de pago"
                  className="form-control"
                  ref={this.refMoneda}
                  value={this.state.idMoneda}
                  onChange={this.handleSelectMoneda}
                >
                  <option value="">-- Moneda --</option>
                  {this.state.monedas.map((item, index) => (
                    <option key={index} value={item.idMoneda}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-chat-dots-fill"></i>
                  </div>
                </div>
                <textarea
                  title="Observaciones..."
                  className="form-control"
                  ref={this.refObservacion}
                  value={this.state.observacion}
                  onChange={this.handleInputObservacion}
                  placeholder="Ingrese alguna observación"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-card-text"></i>
                  </div>
                </div>
                <textarea
                  title="Observaciones..."
                  className="form-control"
                  value={this.state.nota}
                  onChange={this.handleInputNota}
                  placeholder="Ingrese alguna nota"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <table width="100%">{this.renderTotal()}</table>
            </div>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CotizaciónCrear.propTypes = {
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
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCotizaciónCrear = connect(mapStateToProps, null)(CotizaciónCrear);

export default ConnectedCotizaciónCrear;
