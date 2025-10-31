import PropTypes from 'prop-types';
import {
  formatCurrency,
  isEmpty,
  getPathNavigation,
  formatNumberWithZeros,
  currentDate,
  formatTime,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import {
  comboSucursal,
  comboUsuario,
  listTransaccion,
} from '../../../../../network/rest/principal.network';
import ErrorResponse from '../../../../../model/class/error-response';
import SuccessReponse from '../../../../../model/class/response';
import { CANCELED } from '../../../../../model/types/types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  TIPO_CONCEPTO_EGRESO,
  TIPO_CONCEPTO_INGRESO,
} from '../../../../../model/types/tipo-concepto';
import {
  setListaFinanzasData,
  setListaFinanzasPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Transacciones extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lista: [],
      restart: false,

      buscar: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      idTipoConcepto: '',

      idUsuario: '',
      usuarios: [],

      idSucursal: '',
      sucursales: [],

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.abortControllerView = new AbortController();
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

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
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
    if (
      this.props.finanzasLista &&
      this.props.finanzasLista.data &&
      this.props.finanzasLista.paginacion
    ) {
      this.setState(this.props.finanzasLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.finanzasLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.finanzasLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.finanzasLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.finanzasLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.finanzasLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.finanzasLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.finanzasLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  };

  updateReduxState() {
    this.props.setListaFinanzasData(this.state);
    this.props.setListaFinanzasPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  loadingInit = async () => {
    await this.setStateAsync({
      buscar: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    });

    const sucursalResponse = await comboSucursal(
      this.abortControllerView.signal,
    );

    if (sucursalResponse instanceof ErrorResponse) {
      if (sucursalResponse.getType() === CANCELED) return;

      alertKit.warning({
        title: 'Transacciones',
        message: sucursalResponse.getMessage(),
      }, async () => {
        await this.loadingInit();
      });
      return;
    }

    const usuarioResponse = await comboUsuario(this.abortControllerView.signal);

    if (usuarioResponse instanceof ErrorResponse) {
      if (usuarioResponse.getType() === CANCELED) return;
      alertKit.warning({
        title: 'Transacciones',
        message: usuarioResponse.getMessage(),
      }, async () => {
        await this.loadingInit();
      });
      return;
    }

    await this.setStateAsync({
      sucursales: sucursalResponse.data,
      usuarios: usuarioResponse.data,
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    });

    await this.searchOpciones();
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  searchOpciones = async () => {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

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
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      opcion: opcion,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idTipoConcepto: this.state.idTipoConcepto,
      idSucursal: this.state.idSucursal,
      idUsuario: this.state.idUsuario,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listTransaccion(
      data,
      this.abortControllerTable.signal,
    );

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

  handleDateFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value }, async () => {
      await this.searchOpciones();
    });
  };

  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, async () => {
      await this.searchOpciones();
    });
  };

  handleSelectIdTipoConcepto = (event) => {
    this.setState({ idTipoConcepto: event.target.value }, async () => {
      await this.searchOpciones();
    });
  };

  handleSelectIdSucursal = (event) => {
    this.setState({ idSucursal: event.target.value }, async () => {
      await this.searchOpciones();
    });
  };

  handleSelectIdUsuario = (event) => {
    this.setState({ idUsuario: event.target.value }, async () => {
      await this.searchOpciones();
    });
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

  renderTableBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan="7"
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="7">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">ACTIVO</span>
        ) : (
          <span className="badge badge-danger">ANULADO</span>
        );

      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>
            {item.fecha} <br /> {formatTime(item.hora)}
          </TableCell>
          <TableCell>{item.concepto}</TableCell>
          <TableCell>
            <Link
              to={getPathNavigation(item.tipo, item.idComprobante)}
              className="btn-link"
            >
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}{' '}
              <ExternalLink width={18} height={18} />
            </Link>
          </TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-right">
            {item.ingreso == 0 ? (
              ''
            ) : (
              <span className="text-base">
                <i className="fa fa-plus text-success"></i>{' '}
                {formatCurrency(item.ingreso, item.codiso)}
              </span>
            )}
            {item.ingreso != 0 &&
              item.detalles.map((detalle, index) => (
                <div key={index}>
                  <span className="text-xs">
                    {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                  </span>
                </div>
              ))}
          </TableCell>
          <TableCell className="text-right">
            {item.egreso == 0 ? (
              ''
            ) : (
              <span className="text-base">
                <i className="fa fa-minus text-danger"></i>{' '}
                {formatCurrency(item.egreso, item.codiso)}
              </span>
            )}
            {item.egreso != 0 &&
              item.detalles.map((detalle, index) => (
                <div key={index}>
                  <span className="text-xs">
                    {detalle.nombre}: {formatCurrency(detalle.monto, item.codiso)}
                  </span>
                </div>
              ))}
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Transacciones"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input
              label={'Fecha de Inicio:'}
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleDateFechaInicio}
            />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input
              label={'Fecha de Final:'}
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleDateFechaFinal}
            />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select
              label={'Tipo de Concepto:'}
              value={this.state.idTipoConcepto}
              onChange={this.handleSelectIdTipoConcepto}
            >
              <option value="">TODOS</option>
              <option value={TIPO_CONCEPTO_INGRESO}>INGRESO</option>
              <option value={TIPO_CONCEPTO_EGRESO}>EGRESO</option>
            </Select>
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select
              label={'Usuario:'}
              value={this.state.idUsuario}
              onChange={this.handleSelectIdUsuario}
            >
              <option value="">TODOS</option>
              {this.state.usuarios.map((item, index) => (
                <option key={index} value={item.idUsuario}>
                  {item.nombres + ' ' + item.apellidos}
                </option>
              ))}
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
              placeholder="Buscar por nombre..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={'table-bordered'}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="15%">Concepto</TableHead>
                    <TableHead width="15%">Referencia</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="10%">Ingreso <i className="fa fa-arrow-down"></i></TableHead>
                    <TableHead width="10%"> Egreso <i className="fa fa-arrow-up"></i></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.renderTableBody()}
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
        />
      </ContainerWrapper>
    );
  }
}

Transacciones.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  finanzasLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaFinanzasData: PropTypes.func,
  setListaFinanzasPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    finanzasLista: state.predeterminado.finanzasLista,
  };
};

const mapDispatchToProps = { setListaFinanzasData, setListaFinanzasPaginacion };

const ConnectedTransacciones = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Transacciones);

export default ConnectedTransacciones;
