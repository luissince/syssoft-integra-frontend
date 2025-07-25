import React from 'react';
import {
  keyNumberFloat,
  isNumeric,
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
  documentsPdfInvoicesCobro,
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
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import TextArea from '../../../../../components/TextArea';
import ModalTransaccion from '../../../../../components/ModalTransaccion';
import SweetAlert from '../../../../../model/class/sweet-alert';
import { ModalImpresion } from '../../../../../components/MultiModal';
import printJS from 'print-js';

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
      idCobro: '',
      idComprobante: '',
      idMoneda: '',
      idConcepto: '',
      observacion: '',
      nota: '',
      monto: '',

      // Atributos del modal cobrar
      isOpenTerminal: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

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
      codiso: '',

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.initial = { ...this.state };

    this.alert = new SweetAlert();

    // Filtrar concepto
    this.refConcepto = React.createRef();
    this.refValueConcepto = React.createRef();

    // Referencia principales
    this.refMonto = React.createRef();
    this.refComprobante = React.createRef();
    this.refMoneda = React.createRef();
    this.refObservacion = React.createRef();

    // Filtrar cliente
    this.refCliente = React.createRef();
    this.refValueCliente = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

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
    const [comprobantes, monedas] = await Promise.all([
      this.fetchComprobante(COMPROBANTE_DE_INGRESO),
      this.fetchMoneda(),
    ]);

    const comprobante = comprobantes.find((item) => item.preferida === 1);
    const moneda = monedas.find((item) => item.nacional === 1);

    this.setState({
      comprobantes,
      monedas,
      idComprobante: isEmpty(comprobante) ? '' : comprobante.idComprobante,
      idMoneda: isEmpty(moneda) ? '' : moneda.idMoneda,
      codiso: isEmpty(moneda) ? '' : moneda.codiso,
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

  clearView = async () => {
    this.setState(this.initial, async () => {
      await this.refCliente.current.restart();
      await this.refConcepto.current.restart();
      await this.loadData();
    });
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

  handleInputMonto = (event) => {
    this.setState({ monto: event.target.value });
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

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar concepto
  //------------------------------------------------------------------------------------------

  handleClearInputConcepto = () => {
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
    this.refConcepto.current.initialize(value.nombre);
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
    this.refCliente.current.initialize(value.documento + ' - ' + value.informacion);
    this.setState({
      cliente: value,
      clientes: [],
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar, limpiar y cerrar
  //------------------------------------------------------------------------------------------

  handleGuardar = async () => {
    const { concepto, idComprobante, monto, cliente, idMoneda } = this.state;

    if (isEmpty(concepto)) {
      this.alert.warning('Ingreso', 'Seleccione su concepto.', () => this.refValueConcepto.current.focus());
      return;
    }

    if (!isNumeric(monto)) {
      this.alert.warning('Ingreso', 'Ingrese el monto.', () => this.refMonto.current.focus());
      return;
    }

    if (!isText(idComprobante)) {
      this.alert.warning('Ingreso', 'Seleccione su comprobante.', () => this.refComprobante.current.focus());
      return;
    }

    if (isEmpty(cliente)) {
      this.alert.warning('Ingreso', 'Seleccione un cliente.', () => this.refValueCliente.current.focus());
      return;
    }

    if (!isText(idMoneda)) {
      this.alert.warning('Ingreso', 'Seleccione su moneda.', () => this.refMoneda.current.focus());
      return;
    }

    this.handleOpenModalTerminal();
  };

  handleLimpiar = async () => {
    this.alert.dialog("Ingreso", "¿Está seguro de limpiar el Ingreso?", (accept) => {
      if (accept) {
        this.clearView();
      }
    });
  };

  handleCerrar = () => {
    this.props.history.goBack();
  };

  //------------------------------------------------------------------------------------------
  // Acciones del modal terminal
  //------------------------------------------------------------------------------------------

  handleOpenModalTerminal = () => {
    this.setState({ isOpenTerminal: true })
  }

  handleProcessContado = (idFormaPago, metodoPagosLista, notaTransacion, callback = async function () { }) => {
    const {
      cliente,
      idUsuario,
      idMoneda,
      idSucursal,
      idComprobante,
      observacion,
      nota,
      concepto,
      monto
    } = this.state;

    this.alert.dialog('Ingreso', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idFormaPago: idFormaPago,
          idPersona: cliente.idPersona,
          idUsuario: idUsuario,
          idMoneda: idMoneda,
          idSucursal: idSucursal,
          idComprobante: idComprobante,
          idConcepto: concepto.idConcepto,
          monto: monto,
          estado: 1,
          observacion,
          nota,
          notaTransacion,
          bancosAgregados: metodoPagosLista,
        };

        await callback();
        this.alert.information('Ingreso', 'Procesando información...');

        const response = await createCobro(data);

        if (response instanceof SuccessReponse) {
          this.alert.close();
          this.handleOpenImpresion(response.data.idCobro);
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          this.alert.warning('Ingreso', response.getMessage());
        }
      }
    });
  }

  handleCloseModalTerminal = async () => {
    this.setState({ isOpenTerminal: false })
  }

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCobro) => {
    this.setState({ isOpenImpresion: true, idCobro: idCobro })
  }

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  }

  handlePrinterImpresion = (size) => {
    printJS({
      printable: documentsPdfInvoicesCobro(this.state.idCobro, size),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        this.clearView();
        this.handleCloseImpresion();
      }
    })
  }

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
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalTransaccion
          tipo={"Ingreso"}
          title={"Completar Ingreso"}
          isOpen={this.state.isOpenTerminal}

          idSucursal={this.state.idSucursal}
          disabledCreditoFijo={true}
          codiso={this.state.codiso}
          importeTotal={isNumeric(this.state.monto) ? Number(this.state.monto) : 0}

          onClose={this.handleCloseModalTerminal}
          handleProcessContado={this.handleProcessContado}
          handleProcessCredito={() => { }}
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

        <Title
          title='Ingreso'
          subTitle='AGREGAR'
          handleGoBack={() => this.handleCerrar()}
        />

        <Row>
          {/* Filtrar */}
          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <SearchInput
              group={true}
              label={"Concepto:"}
              ref={this.refConcepto}
              autoFocus={true}
              placeholder="Filtrar conceptos..."
              refValue={this.refValueConcepto}
              data={this.state.conceptos}
              handleClearInput={this.handleClearInputConcepto}
              handleFilter={this.handleFilterConcepto}
              handleSelectItem={this.handleSelectItemConcepto}
              renderItem={(value) => <>{value.nombre}</>}
              renderIconLeft={<i className="bi bi-list-ul"></i>}
            />
          </Column>

          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Select
              group={true}
              label={"Tipo de Moneda:"}
              iconLeft={<i className="bi bi-cash"></i>}
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
            </Select>
          </Column>
        </Row>

        <Row>
          {/* Precio */}
          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Input
              group={true}
              label={"Monto:"}
              iconLeft={<i className="bi bi-cash-coin"></i>}
              ref={this.refMonto}
              value={this.state.monto}
              onChange={this.handleInputMonto}
              placeholder="Ingrese el monto"
              onKeyDown={keyNumberFloat}
            />
          </Column>

          <Column className='col-lg-6 col-md-12 col-sm-12 col-12' formGroup={true}>
            <SearchInput
              group={true}
              label={"Cliente:"}
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
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Select
              group={true}
              label={"Comprobante:"}
              iconLeft={<i className="bi bi-receipt"></i>}
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
            </Select>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TextArea
              group={true}
              label={"Observación:"}
              iconLeft={<i className="bi bi-chat-dots-fill"></i>}
              ref={this.refObservacion}
              value={this.state.observacion}
              onChange={this.handleInputObservacion}
              placeholder="Ingrese alguna observación"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TextArea
              group={true}
              label={"Nota (Visible el los reportes):"}
              iconLeft={<i className="bi bi-card-text"></i>}
              ref={this.refONota}
              value={this.state.nota}
              onChange={this.handleInputNota}
              placeholder="Ingrese alguna nota"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
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