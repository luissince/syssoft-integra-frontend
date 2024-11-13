import React from 'react';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { alertDialog, alertInfo, alertSuccess, alertWarning, currentDate, formatNumberWithZeros, formatTime, isEmpty } from '../../../../../helper/utils.helper';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SuccessReponse from '../../../../../model/class/response';
import { cancelGuiaRemision, listGuiaRemision } from '../../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import { SpinnerTable } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Search from '../../../../../components/Search';
import Button from '../../../../../components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import Paginacion from '../../../../../components/Paginacion';
import { setListaGuiaRemisionData, setListaGuiaRemisionPaginacion } from '../../../../../redux/predeterminadoSlice';
import Select from '../../../../../components/Select';
import Input from '../../../../../components/Input';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class GuiaRemision extends CustomComponent {

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

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      estado: '-1',

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refTxtSearch = React.createRef();

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
    if (this.props.guiaRemisionLista && this.props.guiaRemisionLista.data && this.props.guiaRemisionLista.paginacion) {
      this.setState(this.props.guiaRemisionLista.data)
      this.refPaginacion.current.upperPageBound = this.props.guiaRemisionLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.guiaRemisionLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.guiaRemisionLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.guiaRemisionLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.guiaRemisionLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.guiaRemisionLista.paginacion.messagePaginacion;
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaGuiaRemisionData(this.state)
    this.props.setListaGuiaRemisionPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
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
        this.fillTable(0,);
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
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      estado: this.state.estado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listGuiaRemision(params, this.abortControllerTable.signal);

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

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  }

  handleEditar = (idGuiaRemision) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idGuiaRemision=' + idGuiaRemision,
    });
  }

  handleDetalle = (idGuiaRemision) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idGuiaRemision=' + idGuiaRemision,
    });
  }

  handleAnular = (idGuiaRemision) => {
    alertDialog('Guia Remisión', '¿Estás seguro de anular la guía de remisión?', async (accept) => {
      if (accept) {
        const params = {
          idGuiaRemision: idGuiaRemision
        }

        alertInfo("Guia Remisión", "Procesando petición...")

        const response = await cancelGuiaRemision(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Guia Remisión", response.data, async () => {
            await this.loadingInit()
          })
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Guia Remisión", response.getMessage())
        }
      }
    });
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


  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
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

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='9'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="9">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado = item.estado === 1 ? <span className="text-success">ACTIVO</span> : <span className="text-danger">ANULADO</span>;

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </TableCell>
          <TableCell>
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </TableCell>
          <TableCell>
            {item.tipoDocumento}-{item.documento}
            <br />
            {item.informacion}
          </TableCell>
          <TableCell>
            {item.comprobanteRef}
            <br />
            {item.serieRef}-{formatNumberWithZeros(item.numeracionRef)}
          </TableCell>
          <TableCell className="text-center">
            {estado}
          </TableCell>
          <TableCell className='text-center'>
            <Button
              className="btn-outline-primary btn-sm"
              onClick={() => this.handleDetalle(item.idGuiaRemision)}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>
          <TableCell className='text-center'>
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idGuiaRemision)}
            >
              <i className="fa fa-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className='text-center'>
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleAnular(item.idGuiaRemision)}
            >
              <i className="fa fa-remove"></i>
            </Button>
          </TableCell>
        </TableRow>
      )
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Guía de Remisión'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className='btn-outline-info'
              onClick={this.handleCrear}
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
              label={"Estados:"}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value='-1'>TODOS</option>
              <option value='1'>ACTIVO</option>
              <option value='3'>ANULADO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
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
                    <TableHead width="20%">Comprobante</TableHead>
                    <TableHead width="15%">Cliente</TableHead>
                    <TableHead width="15%">referencia</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="5%" className="text-center">Mostrar</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
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

          setListaVentaPaginacion={this.props.setListaGuiaRemisionPaginacion}
        />
      </ContainerWrapper>
    );
  }
}

GuiaRemision.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  guiaRemisionLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaGuiaRemisionData: PropTypes.func,
  setListaGuiaRemisionPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    guiaRemisionLista: state.predeterminado.guiaRemisionLista
  };
};

const mapDispatchToProps = { setListaGuiaRemisionData, setListaGuiaRemisionPaginacion }

const ConnectedGuiaRemision = connect(mapStateToProps, mapDispatchToProps)(GuiaRemision);

export default ConnectedGuiaRemision;
