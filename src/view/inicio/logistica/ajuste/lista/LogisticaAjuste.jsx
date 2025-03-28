import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  formatTime,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../../components/Container';
import Paginacion from '../../../../../components/Paginacion';
import { currentDate } from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  cancelAjuste,
  comboTipoAjuste,
  listAjuste,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import Search from '../../../../../components/Search';
import { setListaAjusteData, setListaAjustePaginacion } from '../../../../../redux/predeterminadoSlice';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class LogisticaAjuste extends CustomComponent {

  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      idTipoAjuste: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      tipoAjuste: [],

      loading: false,
      lista: [],
      restart: false,

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
    // if (this.props.token.userToken.menus[3].subMenus[1].estado === 0) {
    //   this.props.history.goBack();
    // };
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    if (this.props.ajusteLista && this.props.ajusteLista.data && this.props.ajusteLista.paginacion) {
      this.setState(this.props.ajusteLista.data)
      this.refPaginacion.current.upperPageBound = this.props.ajusteLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.ajusteLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.ajusteLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.ajusteLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.ajusteLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.ajusteLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.ajusteLista.data.buscar);
    } else {
      const [tipoAjuste] = await Promise.all([
        this.fetchComboTipoAjuste()
      ]);

      this.setState({
        tipoAjuste,
        initialLoad: false,
      }, async () => {
        await this.loadingInit();
        this.updateReduxState();
      });
    }
  }

  updateReduxState() {
    this.props.setListaAjusteData(this.state)
    this.props.setListaAjustePaginacion({
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
      case 3:
        this.fillTable(3);
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

    const data = {
      opcion: opcion,
      buscar: buscar.trim(),
      idSucursal: this.state.idSucursal,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idTipoAjuste: this.state.idTipoAjuste,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listAjuste(data, this.abortControllerTable.signal);

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

  async fetchComboTipoAjuste() {
    const response = await comboTipoAjuste(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleSelectTipoAjuste = (event) => {
    this.setState({ idTipoAjuste: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.updateReduxState();
    });
  };

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idAjuste) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idAjuste=' + idAjuste,
    });
  };

  handleCancelar = (idAjuste) => {
    alertDialog(
      'Ajuste',
      '¿Estás seguro de anular el ajuste?',
      async (acccept) => {
        if (acccept) {
          alertInfo('Ajuste', 'Procesando información...');

          const params = {
            idAjuste: idAjuste,
            idUsuario: this.state.idUsuario,
          };

          const response = await cancelAjuste(params);

          if (response instanceof SuccessReponse) {
            alertSuccess('Ajuste', response.data, () => {
              this.loadingInit();
            });
          }

          if (response instanceof ErrorResponse) {
            alertWarning('Ajuste', response.getMessage());
          }
        }
      },
    );
  };

  generarBody = () => {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='8'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="8">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">Activo</span>
        ) : (
          <span className="badge badge-danger">Anulado</span>
        );

      const iconTipoAjuste =
        item.ajuste === 'INCREMENTO' ? (
          <i className="bi bi-plus-circle-fill text-success"></i>
        ) : (
          <i className="bi bi-dash-circle-fill text-danger"></i>
        );

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{item.fecha} <br />{formatTime(item.hora)}</TableCell>
          <TableCell>{iconTipoAjuste} {item.ajuste}<br />{item.motivo}</TableCell>
          <TableCell>{item.observacion}</TableCell>
          <TableCell>{item.almacen}</TableCell>
          <TableCell>{estado}</TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-info btn-sm"
              onClick={() => this.handleDetalle(item.idAjuste)}
            >
              <i className="bi bi-eye"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              onClick={() => this.handleCancelar(item.idAjuste)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Ajustes"
          subTitle="REALIZADOS"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-3" formGroup={true}>
            <Select
              label={"Tipo:"}
              value={this.state.idTipoAjuste}
              onChange={this.handleSelectTipoAjuste}
            >
              <option value="0">-- Selecciona --</option>
              {this.state.tipoAjuste.map((item, index) => (
                <option key={index} value={item.idTipoAjuste}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>

          <Column className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha Inicio:"}
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInicio}
            />
          </Column>

          <Column className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha Final:"}
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
            />
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
              <Table className={"table-bordered"}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="15%">Fecha y Hora</TableHead>
                    <TableHead width="15%">Tipo de Movimiento</TableHead>
                    <TableHead width="20%">Observación</TableHead>
                    <TableHead width="15%">Almacen</TableHead>
                    <TableHead width="10%">Estado</TableHead>
                    <TableHead width="5%" className="text-center">Detalle</TableHead>
                    <TableHead width="5%" className="text-center">Anular</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generarBody()}
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

LogisticaAjuste.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  ajusteLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaAjusteData: PropTypes.func,
  setListaAjustePaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    ajusteLista: state.predeterminado.ajusteLista
  };
};

const mapDispatchToProps = { setListaAjusteData, setListaAjustePaginacion }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedAjuste = connect(mapStateToProps, mapDispatchToProps)(LogisticaAjuste);

export default ConnectedAjuste;