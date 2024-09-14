import React from 'react';
import {
  numberFormat,
  formatTime,
  alertDialog,
  alertSuccess,
  alertWarning,
  isEmpty,
  formatNumberWithZeros,
  alertInfo,
  currentDate,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import PropTypes from 'prop-types';
import {
  cancelVenta,
  comboComprobante,
  listVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../model/types/forma-pago';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';
import { VENTA } from '../../../../../model/types/tipo-comprobante';
import ModalElegirInterfaz from './component/ModalElejirInterfaz';
import Button from '../../../../../components/Button';
import { setListaVentaData, setListaVentaPaginacion } from '../../../../../redux/predeterminadoSlice';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import Search from '../../../../../components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Ventas extends CustomComponent {

  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      // add: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[0].estado,),
      // view: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[1].estado,),
      // remove: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[2].estado,),

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      idComprobante: '',
      estado: '0',

      comprobantes: [],

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      loading: false,
      lista: [],
      restart: false,

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,

      // Atributos del modal Elegir Interfaz
      isOpenElegirInterfaz: false,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    // Referencia para el modal elegir interfaz
    this.refModalElegirInterfaz = React.createRef();

    this.abortControllerTable = new AbortController();
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

  /**
  * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
  */
  async componentDidMount() {
    await this.loadingData();
  }


  /**
  * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
  */
  componentWillUnmount() {
    this.abortControllerTable.abort();
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
    if (this.props.ventaLista && this.props.ventaLista.data && this.props.ventaLista.paginacion) {
      this.setState(this.props.ventaLista.data)
      this.refPaginacion.current.upperPageBound = this.props.ventaLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.ventaLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.ventaLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.ventaLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.ventaLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.ventaLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.ventaLista.data.buscar);
    } else {
      const [comprobantes] = await Promise.all([this.fetchComprobante(VENTA)]);

      this.setState({
        comprobantes,
        initialLoad: false,
      }, async () => {
        await this.loadingInit();
        this.updateReduxState();
      });
    }
  }

  updateReduxState() {
    this.props.setListaVentaData(this.state)
    this.props.setListaVentaPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  async fetchComprobante(tipo) {
    const params = {
      "tipo": tipo,
      "idSucursal": this.state.idSucursal
    };

    const response = await comboComprobante(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  loadingInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  }

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  async searchOpciones() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });

    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  }

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      case 2:
        this.fillTable(2);
        break;
      default:
        this.fillTable(0);
    }
  }

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idComprobante: this.state.idComprobante,
      estado: this.state.estado,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listVenta(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      }, () => {
        this.updateReduxState();
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
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

  handleCrearClasico = () => {
    this.props.history.push(`${this.props.location.pathname}/crear`);
  }

  handleInputFechaInico = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleDetalle = (idVenta) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idVenta=' + idVenta,
    });
  }

  handleCancelar(idVenta) {
    alertDialog('Venta', '¿Está seguro de que desea anular la venta? Esta operación no se puede deshacer.', async (accept) => {
      if (accept) {
        const params = {
          idVenta: idVenta,
          idUsuario: this.state.idUsuario,
        };

        alertInfo("Venta", "Procesando información...")

        const response = await cancelVenta(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data, () => {
            this.loadingInit();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Venta', response.getMessage());
        }
      }
    },
    );
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

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='10'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="10">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">COBRADO</span> : item.estado === 2 ? <span className="text-warning">POR COBRAR</span> : item.estado === 3 ? <span className="text-danger">ANULADO</span> : <span className="text-primary">POR LLEVAR</span>;

      const tipo = item.idFormaPago === CONTADO ? "CONTADO" : item.idFormaPago === CREDITO_FIJO ? "CREDITO FIJO" : item.idFormaPago === CREDITO_VARIABLE ? "CRÉDITO VARIABLE" : "PAGO ADELTANDO";

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>{item.fecha}<br />{formatTime(item.hora)}</TableCell>
          <TableCell>{item.documento}<br />{item.informacion}</TableCell>
          <TableCell>{item.comprobante}<br />{item.serie + '-' + formatNumberWithZeros(item.numeracion)}</TableCell>
          <TableCell>{tipo}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-center"> {numberFormat(item.total, item.codiso)} </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-primary btn-sm"
              onClick={() => this.handleDetalle(item.idVenta)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleCancelar(item.idVenta)}
            // disabled={!this.state.remove}
            >
              <i className="fa fa-remove"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  //------------------------------------------------------------------------------------------
  // Procesos Elegir Interfaz
  //------------------------------------------------------------------------------------------

  handleOpenElegirInterfaz = () => {
    this.setState({ isOpenElegirInterfaz: true })
  }

  handleCloseElegirInterfaz = () => {
    this.setState({ isOpenElegirInterfaz: false });
  }

  handleInterfazClasico = () => {
    this.props.history.push(`${this.props.location.pathname}/crear-clasico`);
  }

  handleInterfazModerno = () => {
    this.props.history.push(`${this.props.location.pathname}/crear`);
  }

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title='Ventas'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <ModalElegirInterfaz
          refModal={this.refModalElegirInterfaz}
          isOpen={this.state.isOpenElegirInterfaz}
          handleClose={this.handleCloseElegirInterfaz}

          handleInterfazClasico={this.handleInterfazClasico}
          handleInterfazModerno={this.handleInterfazModerno}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className='btn-outline-info'
              onClick={this.handleOpenElegirInterfaz}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>
            {' '}
            <Button
              className='btn-outline-secondary'
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Inicio:"}
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInico}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Final:"}
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Comprobantes:"}
              value={this.state.idComprobante}
              onChange={this.handleSelectComprobante}
            >
              <option value="">TODOS</option>
              {
                this.state.comprobantes.map((item, index) => (
                  <option key={index} value={item.idComprobante}>{item.nombre} - {item.serie}</option>
                ))
              }
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Estados:"}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value='0'>TODOS</option>
              <option value='1'>COBRADO</option>
              <option value='2'>POR COBRAR</option>
              <option value='3'>ANULADO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por comprobante o cliente..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="15%">Cliente</TableHead>
                    <TableHead width="10%">Comprobante</TableHead>
                    <TableHead width="10%">Forma de Cobro</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="10%" className="text-center">Total</TableHead>
                    <TableHead width="5%" className="text-center">Detalle</TableHead>
                    <TableHead width="5%" className="text-center">Anular</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Paginacion
          ref={this.refPaginacion}
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}

          setListaVentaPaginacion={this.props.setListaVentaPaginacion}
        />
      </ContainerWrapper>
    );
  }
}

Ventas.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  ventaLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaVentaData: PropTypes.func,
  setListaVentaPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    ventaLista: state.predeterminado.ventaLista
  };
};

const mapDispatchToProps = { setListaVentaData, setListaVentaPaginacion }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedVentas = connect(mapStateToProps, mapDispatchToProps)(Ventas);

export default ConnectedVentas;
