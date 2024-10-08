import React from 'react';
import {
  rounded,
  numberFormat,
  keyNumberFloat,
  isNumeric,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isText,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import {
  createCobro,
  filtrarPersona,
  filtrarCobroConcepto,
  comboComprobante,
  comboMoneda,
  comboBanco,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import CustomComponent from '../../../../../model/class/custom-component';
import SearchInput from '../../../../../components/SearchInput';
import { CANCELED } from '../../../../../model/types/types';
import { COMPROBANTE_DE_INGRESO } from '../../../../../model/types/tipo-comprobante';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Button from '../../../../../components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CobroCrear extends CustomComponent {
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
      idConcepto: '',
      observacion: '',
      precio: '',

      // Detalle del cobro
      detalle: [],

      // Lista de datos
      comprobantes: [],
      monedas: [],

      // Filtrar concepto
      concepto: null,
      conceptos: [],

      // Filtrar cliente
      cliente: null,
      clientes: [],

      // Atributos libres
      codISO: '',
      total: 0,

      // Atributos del modal
      isOpenSale: false,
      loadingModal: false,
      bancos: [],
      bancosAgregados: [],

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state }

    // Referencia principales
    this.refMonto = React.createRef();
    this.refComprobante = React.createRef();
    this.refMoneda = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar concepto
    this.refConcepto = React.createRef();
    this.refValueConcepto = React.createRef();

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.refValueCliente = React.createRef();

    // Referencia para el modal
    this.refCustomModalSale = React.createRef();
    this.refMetodoContado = React.createRef();

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
    await this.loadData();
  }

  componentWillUnmount() {
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
    const [comprobantes, monedas, bancos] = await Promise.all([
      this.fetchComprobante(COMPROBANTE_DE_INGRESO),
      this.fetchMoneda(),
      this.fetchComboBanco(),
    ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);

    this.setState({
      comprobantes,
      monedas,
      bancos,
      idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
      idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
      codISO: isEmpty(moneda) ? '' : moneda.codiso,
      loading: false,
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarCobroConcepto(params) {
    const response = await filtrarCobroConcepto(params);

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

  async fetchComboBanco() {
    const response = await comboBanco(this.state.idSucursal, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  //------------------------------------------------------------------------------------------
  // Funciones para agregar y quitar el detalle
  //------------------------------------------------------------------------------------------

  agregarCobro = async () => {
    const { concepto, precio, detalle } = this.state;

    if (!concepto) return;

    if (!isNumeric(precio)) return;

    const newDetalle = [...detalle];
    const existeDetalle = newDetalle.find(
      (item) => item.idConcepto === concepto.idConcepto,
    );

    if (existeDetalle) {
      existeDetalle.cantidad += 1;
    } else {
      const data = {
        idConcepto: concepto.idConcepto,
        nombre: concepto.nombre,
        comentario: '',
        cantidad: 1,
        precio: parseFloat(precio),
      };

      newDetalle.push(data);
    }

    const total = newDetalle.reduce(
      (accumulate, item) => (accumulate += item.cantidad * item.precio),
      0,
    );

    this.setState({
      detalle: newDetalle,
      total,
      precio: '',
    });

    await this.handleClearInputConcepto();

    this.refValueConcepto.current.focus();
  };

  removerCobro = (idConcepto) => {
    const detalle = this.state.detalle.filter(
      (item) => item.idConcepto !== idConcepto,
    );
    this.setState({ detalle });
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

  handleInputPrecio = (event) => {
    this.setState({ precio: event.target.value });
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value });
  };

  handleSelectMoneda = (event) => {
    this.setState({ idMoneda: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputComentarioDetalle = (event, idConcepto) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      detalle: prevState.detalle.map((item) => {
        if (item.idConcepto === idConcepto) {
          return { ...item, comentario: value };
        } else {
          return item;
        }
      }),
    }));
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal
  //------------------------------------------------------------------------------------------
  handleOpenModalSale = () => {
    this.setState({ loadingModal: true, isOpenSale: true })
  }

  handleCloseModalSale = () => {
    this.setState({ isOpenSale: false })
  }

  handleOnOpenModalSale = () => {
    const metodo = this.state.bancos.find((item) => item.preferido === 1);

    this.refMetodoContado.current.value = metodo ? metodo.idBanco : '';

    if (metodo) {
      const item = {
        idBanco: metodo.idBanco,
        nombre: metodo.nombre,
        monto: '',
        vuelto: metodo.vuelto,
        descripcion: '',
      };

      this.setState((prevState) => ({
        bancosAgregados: [...prevState.bancosAgregados, item],
      }));
    }

    this.setState({ loadingModal: false });
  }

  handleHiddenModalSale = () => {
    this.setState({
      bancosAgregados: [],
    });
  }

  handleAddBancosAgregados = () => {
    const listAdd = this.state.bancosAgregados.find((item) => item.idBanco === this.refMetodoContado.current.value);

    if (listAdd) {
      return;
    }

    const metodo = this.state.bancos.find((item) => item.idBanco === this.refMetodoContado.current.value,);

    const item = {
      idBanco: metodo.idBanco,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      descripcion: '',
    };

    this.setState((prevState) => ({
      bancosAgregados: [...prevState.bancosAgregados, item],
    }));
  };

  handleInputMontoBancosAgregados = (event, idBanco) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      bancosAgregados: prevState.bancosAgregados.map((item) => {
        if (item.idBanco === idBanco) {
          return { ...item, monto: value ? value : '' };
        } else {
          return item;
        }
      }),
    }));
  };

  handleRemoveItemBancosAgregados = (idBanco) => {
    const bancosAgregados = this.state.bancosAgregados.filter((item) => item.idBanco !== idBanco);
    this.setState({ bancosAgregados });
  };

  handleSaveSale = () => {
    const {
      cliente,
      idUsuario,
      idMoneda,
      idSucursal,
      idComprobante,
      observacion,
      detalle,
      total,
      bancosAgregados,
    } = this.state;

    let metodoPagoLista = bancosAgregados.map(item => ({ ...item }));

    if (isEmpty(metodoPagoLista)) {
      alertWarning('Cobro', 'Tiene que agregar método de cobro para continuar.');
      return;
    }

    if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
      alertWarning('Cobro', 'Hay montos del metodo de cobro que no tiene valor.');
      return;
    }

    const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => (accumulator += parseFloat(item.monto)), 0);

    if (metodoPagoLista.length > 1) {
      if (metodoCobroTotal !== total) {
        alertWarning('Cobro', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.');
        return;
      }
    } else {
      const metodo = metodoPagoLista[0];
      if (metodo.vuelto === 1) {
        if (metodoCobroTotal < total) {
          alertWarning('Cobro', 'El monto a cobrar es menor que el total.');
          return;
        }

        metodoPagoLista.forEach(item => {
          item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - total)}`;
          item.monto = total;
        });
      } else {
        if (metodoCobroTotal !== total) {
          alertWarning('Cobro', 'El monto a cobrar debe ser igual al total.');
          return;
        }
      }
    }

    alertDialog('Cobro', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idPersona: cliente.idPersona,
          idUsuario: idUsuario,
          idMoneda: idMoneda,
          idSucursal: idSucursal,
          idComprobante: idComprobante,
          estado: 1,
          observacion: observacion,
          detalle: detalle,
          bancosAgregados: metodoPagoLista,
        };

        this.handleCloseModalSale();
        alertInfo('Cobro', 'Procesando información...');

        const response = await createCobro(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Cobro', response.data, () => {
            this.handleLimpiar();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Cobro', response.getMessage());
        }
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar concepto
  //------------------------------------------------------------------------------------------

  handleClearInputConcepto = async () => {
    this.setState({
      conceptos: [],
      concepto: null,
    });
  };

  handleFilterConcepto = async (text) => {
    const searchWord = text;
    this.setState({ concepto: null });

    if (isEmpty(searchWord)) {
      this.setState({ conceptos: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const conceptos = await this.fetchFiltrarCobroConcepto(params);

    this.setState({ conceptos });
  };

  handleSelectItemConcepto = (value) => {
    this.setState({
      concepto: value,
      conceptos: [],
    }, () => {
      this.refMonto.current.focus();
    });
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
      cliente: true,
    };

    const clientes = await this.fetchFiltrarCliente(params);

    this.setState({ clientes });
  };

  handleSelectItemCliente = (value) => {
    this.setState({
      cliente: value,
      clientes: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------

  handleGuardar = async () => {
    const { idComprobante, cliente, idMoneda, detalle } = this.state;

    if (!isText(idComprobante)) {
      alertWarning('Cobro', 'Seleccione su comprobante.', () => this.refComprobante.current.focus());
      return;
    }

    if (isEmpty(cliente)) {
      alertWarning('Cobro', 'Seleccione un cliente.', () => this.refValueCliente.current.focus());
      return;
    }

    if (!isText(idMoneda)) {
      alertWarning('Cobro', 'Seleccione su moneda.', () => this.refMoneda.current.focus());
      return;
    }

    if (isEmpty(detalle)) {
      alertWarning('Cobro', 'Agregar algún concepto a la lista.', () => this.refValueConcepto.current.focus());
      return;
    }

    this.handleOpenModalSale();
  };

  handleLimpiar = async () => {
    this.setState(this.initial, async () => {
      await this.refConcepto.current.restart();
      await this.refCliente.current.restart();
      await this.loadData();
    });
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
          <td colSpan="7"> Agregar datos a la tabla </td>
        </tr>
      );
    }

    return detalle.map((item, index) => (
      <tr key={index}>
        <td className="text-center">{++index}</td>
        <td>{item.nombre}</td>
        <td>
          <input
            className="form-control"
            value={item.detalle}
            onChange={(event) =>
              this.handleInputComentarioDetalle(event, item.idConcepto)
            }
          />
        </td>
        <td>{rounded(item.cantidad)}</td>
        <td>{numberFormat(item.precio, this.state.codISO)}</td>
        <td>{numberFormat(item.cantidad * item.precio, this.state.codISO)}</td>
        <td>
          <button
            className="btn btn-outline-danger btn-sm"
            title="Eliminar"
            onClick={() => this.removerCobro(item.idConcepto)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    ));
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        {/* <ModalSale
          refModal={this.refCustomModalSale}
          isOpen={this.state.isOpenSale}
          onOpen={this.handleOnOpenModalSale}
          onHidden={this.handleHiddenModalSale}
          onClose={this.handleCloseModalSale}

          loading={this.state.loadingModal}
          refMetodoContado={this.refMetodoContado}
          importeTotal={this.state.total}

          bancos={this.state.bancos}
          codISO={this.state.codISO}
          bancosAgregados={this.state.bancosAgregados}
          handleAddBancosAgregados={this.handleAddBancosAgregados}
          handleInputMontoBancosAgregados={this.handleInputMontoBancosAgregados}
          handleRemoveItemBancosAgregados={this.handleRemoveItemBancosAgregados}

          handleSaveSale={this.handleSaveSale}
        /> */}

        <Title
          title='Cobro'
          subTitle='Crear'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
            {/* Filtrar y agregar concepto */}
            <Row>
              {/* Filtrar */}
              <Column className="col-md-6">
                <SearchInput
                  ref={this.refConcepto}
                  autoFocus={true}
                  placeholder="Filtrar conceptos..."
                  refValue={this.refValueConcepto}
                  data={this.state.conceptos}
                  handleClearInput={this.handleClearInputConcepto}
                  handleFilter={this.handleFilterConcepto}
                  handleSelectItem={this.handleSelectItemConcepto}
                  renderItem={(value) => <>{value.nombre}</>}
                  renderIconLeft={<i className="bi bi-cart4"></i>}
                />
              </Column>
              {/* Precio */}
              <div className="form-group col-md-6">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                      <i className="bi bi-cash-coin"></i>
                    </div>
                  </div>
                  <input
                    title="Valor a cobrar"
                    type="text"
                    className="form-control"
                    ref={this.refMonto}
                    value={this.state.precio}
                    onChange={this.handleInputPrecio}
                    placeholder="Ingrese el monto"
                    onKeyUp={(event) => {
                      if (event.code === 'Enter') {
                        this.agregarCobro();
                      }
                    }}
                    onKeyDown={keyNumberFloat}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      title="Agregar"
                      onClick={() => this.agregarCobro()}
                    >
                      <i className="bi bi-plus-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
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
                        <th width="15%">Categoría</th>
                        <th width="25%">Descripción</th>
                        <th width="5%">Precio</th>
                        <th width="5%">Quitar</th>
                      </tr>
                    </thead>
                    <tbody>{this.generarBody()}</tbody>
                  </table>
                </div>
              </Column>
            </Row>

            <Row>
              <div className="form-group">
                <Button
                  className="btn-success"
                  onClick={this.handleGuardar}
                >
                  <i className="fa fa-save"></i> Guardar
                </Button>{' '}
                <Button
                  className="btn-outline-info"
                  onClick={this.handleLimpiar}
                >
                  <i className="fa fa-trash"></i> Limpiar
                </Button>{' '}
                <Button
                  className="btn-outline-danger"
                  onClick={this.handleCerrar}
                >
                  <i className="fa fa-close"></i> Cerrar
                </Button>
              </div>
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
                ref={this.refCliente}
                placeholder="Filtrar clientes..."
                refValue={this.refValueCliente}
                data={this.state.clientes}
                handleClearInput={this.handleClearInputCliente}
                handleFilter={this.handleFilterCliente}
                handleSelectItem={this.handleSelectItemCliente}
                renderItem={(value) => <>{value.documento + ' - ' + value.informacion}</>}
                renderIconLeft={<i className="bi bi-person-circle"></i>}
              />
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
              <table width="100%">
                <tbody>
                  <tr>
                    <td className="text-left h4">Total:</td>
                    <td className="text-right h4">
                      {numberFormat(this.state.total, this.state.codISO)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CobroCrear.propTypes = {
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


const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCobroCrear = connect(mapStateToProps, null)(CobroCrear);

export default ConnectedCobroCrear;
