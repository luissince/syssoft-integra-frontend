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
import { TableResponsive } from '../../../../../components/Table';
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

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

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
        <tr>
          <td className="text-center" colSpan="9">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado = item.estado === 1 ? <span className="text-success">ACTIVO</span> : <span className="text-danger">ANULADO</span>;

      return (
        <tr key={index}>
          <td className={`text-center`}>
            {item.id}
          </td>
          <td>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </td>
          <td>
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </td>
          <td>
            {item.tipoDocumento}-{item.documento}
            <br />
            {item.informacion}
          </td>
          <td>
            {item.comprobanteRef}
            <br />
            {item.serieRef}-{formatNumberWithZeros(item.numeracionRef)}
          </td>
          <td className="text-center">
            {estado}
          </td>
          <td className='text-center'>
            <Button
              className="btn-outline-primary btn-sm"
              onClick={() => this.handleDetalle(item.idGuiaRemision)}
            >
              <i className="fa fa-eye"></i>
            </Button>
          </td>
          <td className='text-center'>
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEditar(item.idGuiaRemision)}
            >
              <i className="fa fa-pencil"></i>
            </Button>
          </td>
          <td className='text-center'>
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleAnular(item.idGuiaRemision)}
            >
              <i className="fa fa-remove"></i>
            </Button>
          </td>
        </tr>
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
              <option value='0'>ANULADO</option>
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
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">#</th>
                  <th width="10%">Fecha</th>
                  <th width="20%">Comprobante</th>
                  <th width="15%">Cliente</th>
                  <th width="15%">referencia</th>
                  <th width="10%" className="text-center">Estado</th>
                  <th width="5%" className="text-center">
                    Mostrar
                  </th>
                  <th width="5%" className="text-center">
                    Editar
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
