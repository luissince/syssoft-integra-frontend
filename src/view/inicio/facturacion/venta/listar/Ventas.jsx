import React from 'react';
import {
  numberFormat,
  formatTime,
  alertDialog,
  alertSuccess,
  alertWarning,
  keyUpSearch,
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
import { TableResponsive } from '../../../../../components/Table';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';
import { VENTA } from '../../../../../model/types/tipo-comprobante';
import ModalElegirInterfaz from './component/ModalElejirInterfaz';

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

    this.refTxtSearch = React.createRef();

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
    const [
      comprobantes
    ] = await Promise.all([
      this.fetchComprobante(VENTA),
    ]);

    this.setState({
      comprobantes: comprobantes,
      initialLoad: false,
    }, () => {
      this.loadingInit()
    })
  }


  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
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

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  async searchOpciones() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(
      2,
      '',
      this.state.fechaInicio,
      this.state.fechaFinal,
      this.state.idComprobante,
      this.state.estado);
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
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      case 2:
        this.fillTable(2, '', this.state.fechaInicio, this.state.fechaFinal, this.state.idComprobante, this.state.estado);
        break;
      default:
        this.fillTable(0);
    }
  }

  fillTable = async (opcion, buscar = '', fechaInicio = '', fechaFinal = '', idComprobante = '', estado = '0') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion,
      buscar,
      fechaInicio: fechaInicio,
      fechaFinal: fechaFinal,
      idComprobante: idComprobante,
      estado: estado,
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
        <tr>
          <td className="text-center" colSpan="10">
            <SpinnerTable
              message='Cargando información de la tabla...'
            />
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="10">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">COBRADO</span> : item.estado === 2 ? <span className="text-warning">POR COBRAR</span> : item.estado === 3 ? <span className="text-danger">ANULADO</span> : <span className="text-primary">POR LLEVAR</span>;

      const tipo = item.idFormaPago === CONTADO ? "CONTADO" : item.idFormaPago === CREDITO_FIJO ? "CREDITO FIJO" : item.idFormaPago === CREDITO_VARIABLE ? "CRÉDITO VARIABLE" : "PAGO ADELTANDO";

      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>{item.fecha}<br />{formatTime(item.hora)}
          </td>
          <td>{item.documento}<br />{item.informacion}
          </td>
          <td>{item.comprobante}<br />{item.serie + '-' + formatNumberWithZeros(item.numeracion)}
          </td>
          <td>{tipo}</td>
          <td className="text-center">{estado}</td>
          <td className="text-center"> {numberFormat(item.total, item.codiso)} </td>
          <td className="text-center">
            <button
              className="btn btn-outline-primary btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idVenta)}
            // disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleCancelar(item.idVenta)}
            // disabled={!this.state.remove}
            >
              <i className="fa fa-remove"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

    //------------------------------------------------------------------------------------------
  // Procesos Elegir Interfaz
  //------------------------------------------------------------------------------------------

  handleOpenElegirInterfaz = () => {
    this.setState({ isOpenElegirInterfaz: true})
  }

  handleCloseElegirInterfaz = () => {
    this.setState({ isOpenElegirInterfaz: false });

    /*
    this.setState({ ElegirInterfaz: false }, () => {
      this.clearView();
    });
    */
  }

  handleInterfazClasico = () => {
    //console.log("CLASICA")
    this.props.history.push(`${this.props.location.pathname}/crear-clasico`);
  }

  handleInterfazModerno = () => {
    //console.log("MODERNO")
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
        />


        <ModalElegirInterfaz
          refModal={this.refModalElegirInterfaz }
          isOpen={this.state.isOpenElegirInterfaz}
          handleClose={this.handleCloseElegirInterfaz}

          handleInterfazClasico={this.handleInterfazClasico}
          handleInterfazModerno={this.handleInterfazModerno}

        />

        <Row>
          <Column>
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleOpenElegirInterfaz}
              // disabled={!this.state.add}
              >
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>

              {' '}
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadingInit}>
                <i className="bi bi-arrow-clockwise"></i> Recargar Vista
              </button>
            </div>
          </Column>
        </Row>


        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12">
            <div className="form-group">
              <label>Fecha de Inicio:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaInicio}
                onChange={this.handleInputFechaInico}
              />
            </div>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12">
            <div className="form-group">
              <label>Fecha de Final:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaFinal}
                onChange={this.handleInputFechaFinal}
              />
            </div>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12">
            <div className="form-group">
              <label>Comprobantes:</label>
              <select
                className="form-control"
                value={this.state.idComprobante}
                onChange={this.handleSelectComprobante}
              >
                <option value="">TODOS</option>
                {
                  this.state.comprobantes.map((item, index) => (
                    <option key={index} value={item.idComprobante}>{item.nombre}</option>
                  ))
                }
              </select>
            </div>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12">
            <div className="form-group">
              <label>Estados:</label>
              <select
                className="form-control"
                value={this.state.estado}
                onChange={this.handleSelectEstado}
              >
                <option value='0'>TODOS</option>
                <option value='1'>COBRADO</option>
                <option value='2'>POR COBRAR</option>
                <option value='3'>ANULADO</option>
              </select>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12">
            <div className="form-group">
              <label>Buscar:</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por comprobante o cliente..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchText(event.target.value),
                    )
                  }
                />
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">#</th>
                  <th width="10%">Fecha</th>
                  <th width="15%">Cliente</th>
                  <th width="10%">Comprobante</th>
                  <th width="10%">Forma de Cobro</th>
                  <th width="10%" className="text-center">Estado</th>
                  <th width="10%" className="text-center">Total</th>
                  <th width="5%" className="text-center">
                    Detalle
                  </th>
                  <th width="5%" className="text-center">
                    Anular
                  </th>
                </tr>
              }
              tBody={this.generateBody()}
            />
          </Column>
        </Row>

        <Paginacion
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
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
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
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
const ConnectedVentas = connect(mapStateToProps, null)(Ventas);

export default ConnectedVentas;
