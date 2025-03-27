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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
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

    this.refSearch = React.createRef();

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

      this.refSearch.current.initialize(this.props.cotizacionLista.data.buscar);
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

  handleEditar = (idCotizacion) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idCotizacion=' + idCotizacion,
    });
  }

  handleDetalle = (idCotizacion) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCotizacion=' + idCotizacion,
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
        <TableRow>
          <TableCell className="text-center" colSpan="10">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {

      const estado = item.estado === 1 ? <span className="text-success">ACTIVO</span> : <span className="text-danger">ANULADO</span>;

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>{item.fecha}<br />{formatTime(item.hora)}</TableCell>
          <TableCell>{item.tipoDocumento} - {item.documento}<br />{item.informacion}</TableCell>
          <TableCell>{item.comprobante}<br />{item.serie}-{formatNumberWithZeros(item.numeracion)}</TableCell>
          <TableCell className='text-center'>{estado}</TableCell>
          <TableCell className='text-center'>
            <span className={item.ligado == 0 ? 'badge badge-secondary' : 'badge badge-success'}>{item.ligado}</span>
          </TableCell>
          <TableCell className='text-center'>{numberFormat(item.total, item.codiso)} </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idCotizacion)}>
              <i className="fa fa-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleEditar(item.idCotizacion)}>
              <i className="fa fa-edit"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleAnular(item.idCotizacion)}>
              <i className="fa fa-remove"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Cotización'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleCrear}>
              <i className="bi bi-file-plus"></i> Crear Cotización
            </Button>
            {' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}>
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
              label={"Ligado:"}
              value={this.state.ligado}
              onChange={this.handleSelectLigado}
            >
              <option value='-1'>TODOS</option>
              <option value='1'>LIGADO</option>
              <option value='0'>LIBRE</option>
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Estados:"}
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
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered "}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="20%">Cliente</TableHead>
                    <TableHead width="15%">Comprobante</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="10%" className="text-center">Ligado</TableHead>
                    <TableHead width="10%" className="text-center">Total</TableHead>
                    <TableHead width="5%" className="text-center">Detalle</TableHead>
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