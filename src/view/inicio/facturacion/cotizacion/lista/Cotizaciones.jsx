import ContainerWrapper from '../../../../../components/Container';
import { alertDialog, alertInfo, alertSuccess, alertWarning, currentDate, formatNumberWithZeros, formatTime, isEmpty, numberFormat } from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import { cancelCotizacion, listCotizacion } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { TableResponsive } from '../../../../../components/Table';
import { SpinnerTable } from '../../../../../components/Spinner';
import Paginacion from '../../../../../components/Paginacion';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';
import PropTypes from 'prop-types';
import { setListaCotizacionData, setListaCotizacionPaginacion } from '../../../../../redux/predeterminadoSlice';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Cotizaciones extends CustomComponent {

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
      ligado: '-1',
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

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData()
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (this.props.cotizacionLista && this.props.cotizacionLista.data && this.props.cotizacionLista.paginacion) {
      this.setState(this.props.cotizacionLista.data)
      this.refPaginacion.current.upperPageBound = this.props.cotizacionLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.cotizacionLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.cotizacionLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.cotizacionLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.cotizacionLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.cotizacionLista.paginacion.messagePaginacion;
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaCotizacionData(this.state)
    this.props.setListaCotizacionPaginacion({
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
  };

  async searchText(text) {
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
        this.fillTable(2, this.state.buscar);
        break;
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

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      ligado: this.state.ligado,
      estado: this.state.estado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCotizacion(params, this.abortControllerTable.signal);

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

  handleEditar = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idCotizacion=' + idCompra,
    });
  }

  handleDetalle = (idCompra) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCotizacion=' + idCompra,
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

  handleSelectLigado = (event) => {
    this.setState({ ligado: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    })
  }

  handleAnular = (id) => {
    alertDialog('Cotización', '¿Estás seguro de anular la cotización?', async (accept) => {
      if (accept) {
        const params = {
          idCotizacion: id,
          idUsuario: this.state.idUsuario
        }

        alertInfo("Cotización", "Procesando petición...")

        const response = await cancelCotizacion(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Cotización", response.data, async () => {
            await this.loadingInit()
          })
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Cotización", response.getMessage())
        }
      }
    });
  };

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
        <tr>
          <td className="text-center" colSpan="10">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">ACTIVO</span> : <span className="text-danger">ANULADO</span>;

      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>{item.fecha}<br />{formatTime(item.hora)}</td>
          <td>{item.documento}<br />{item.informacion}</td>
          <td>{item.comprobante}<br />{item.serie}-{formatNumberWithZeros(item.numeracion)}</td>
          <td className='text-center'>{estado}</td>
          <td className='text-center'>
            <span className={item.ligado == 0 ? 'badge badge-secondary' : 'badge badge-success'}>{item.ligado}</span>
          </td>
          <td className='text-center'>{numberFormat(item.total, item.codiso)} </td>
          <td className="text-center">
            <button
              className="btn btn-outline-primary btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idCotizacion)}>
              <i className="fa fa-eye"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idCotizacion)}>
              <i className="fa fa-edit"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleAnular(item.idCotizacion)}>
              <i className="fa fa-remove"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Cotización'
          subTitle='Lista'
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleCrear}>
              <i className="bi bi-file-plus"></i> Crear cotización
            </Button>
            {' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}>
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <label>Fecha de Inicio:</label>
            <Input
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInico}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <label>Fecha de Final:</label>
            <Input
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <label>Ligado:</label>
            <Select
              value={this.state.ligado}
              onChange={this.handleSelectLigado}
            >
              <option value='-1'>TODOS</option>
              <option value='1'>LIGADO</option>
              <option value='0'>LIBRE</option>
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <label>Estados:</label>
            <Select
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value='-1'>TODOS</option>
              <option value='1'>COBRADO</option>
              <option value='0'>ANULADO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              onSearch={this.searchText}
              placeholder="Buscar..."
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
                  <th width="20%">Cliente</th>
                  <th width="15%">Comprobante</th>
                  <th width="10%" className="text-center">Estado</th>
                  <th width="10%" className="text-center">Ligado</th>
                  <th width="10%" className="text-center">Total</th>
                  <th width="5%" className="text-center">
                    Detalle
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
        />
      </ContainerWrapper>
    );
  }
}

Cotizaciones.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  cotizacionLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaCotizacionData: PropTypes.func,
  setListaCotizacionPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    cotizacionLista: state.predeterminado.cotizacionLista
  };
};

const mapDispatchToProps = { setListaCotizacionData, setListaCotizacionPaginacion }

const ConnectedCotizaciones = connect(mapStateToProps, mapDispatchToProps)(Cotizaciones);

export default ConnectedCotizaciones;