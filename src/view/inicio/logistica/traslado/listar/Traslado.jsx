import React from 'react';
import {
  spinnerLoading,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  formatTime,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import Paginacion from '../../../../../components/Paginacion';
import { currentDate } from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  cancelAjuste,
  cancelTraslado,
  comboTipoTraslado,
  listTraslado,
} from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';

class Ajuste extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      idTipoTraslado: '',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      tipoTraslado: [],

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    const [tipoTraslado] = await Promise.all([await this.fetchComboTipoTraslado()]);

    await this.setStateAsync({
      tipoTraslado,
      initialLoad: false,
    });
    this.loadInit();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  };

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
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
        this.fillTable(0, '');
        break;
      case 1:
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      case 2:
        this.fillTable(2, this.refTxtSearch.current.value);
        break;
      case 3:
        this.fillTable(3, this.refTxtSearch.current.value);
        break;
      default:
        this.fillTable(0, '');
    }
  };

  fillTable = async (opcion, buscar) => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      opcion: opcion,
      idSucursal: this.state.idSucursal,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idTipoTraslado: this.state.idTipoTraslado,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listTraslado(data, this.abortControllerTable.signal);

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
  };

  async fetchComboTipoTraslado() {
    const response = await comboTipoTraslado(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleSelectTipoTraslado = (event) => {
    this.setState({ idTipoTraslado: event.target.value });
  };

  handleInputFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value });
  };

  handleAgregar = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idAjuste) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idTraslado=' + idAjuste,
    });
  };

  handleCancelar = (idTraslado) => {
    alertDialog('Traslado', '¿Estás seguro de anular el traslado?', async (acccept) => {
      if (acccept) {
        alertInfo('Traslado', 'Procesando información...');

        const params = {
          idTraslado: idTraslado,
          idUsuario: this.state.idUsuario,
        };

        const response = await cancelTraslado(params);

        if (response instanceof SuccessReponse) {
          alertSuccess('Ajuste', response.data, () => {
            this.loadInit();
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
        <tr>
          <td className="text-center" colSpan="9">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="9">
            ¡No hay datos registrados!
          </td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">Activo</span>
        ) : (
          <span className="badge badge-danger">Anulado</span>
        );


      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>
            {item.fecha} <br />
            {formatTime(item.hora)}
          </td>
          <td>
            {item.tipo}
            <br />
            {item.motivo}
          </td>
          <td>{item.almacenOrigen}</td>
          <td>{item.almacenDestino}</td>
          <td>{item.observacion}</td>
          <td>{estado}</td>
          <td className='text-center'>
            <button
              className="btn btn-outline-info btn-sm"
              title="Editar"
              onClick={() => this.handleDetalle(item.idTraslado)}
            >
              <i className="bi bi-eye"></i>
            </button>
          </td>
          <td className='text-center'>
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleCancelar(item.idTraslado)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.initialLoad && spinnerLoading(this.state.initialMessage)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Traslado <small className="text-secondary">REALIZADOS</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>

                <input
                  autoFocus
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                />
              </div>
            </div>
          </div>

          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleAgregar}
              >
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadInit}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="form-group">
              <label>Tipo:</label>
              <div className="input-group">
                <select
                  className="form-control"
                  value={this.state.idTipoTraslado}
                  onChange={this.handleSelectTipoTraslado}
                >
                  <option value="0">-- Selecciona --</option>
                  {this.state.tipoTraslado.map((item, index) => (
                    <option key={index} value={item.idTipoTraslado}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <label>Fecha Inicio:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaInicio}
                onChange={this.handleInputFechaInicio}
              />
            </div>
          </div>

          <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <label>Fecha Final:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaFinal}
                onChange={this.handleInputFechaFinal}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="15%">Fecha y Hora</th>
                    <th width="15%">Tipo / Motivo</th>
                    <th width="15%">Almacen Origen</th>
                    <th width="15%">Almacen Destino</th>
                    <th width="20%">Observación</th>
                    <th width="10%">Estado</th>
                    <th width="5%" className="text-center">
                      Detalle
                    </th>
                    <th width="5%" className="text-center">
                      Anular
                    </th>
                  </tr>
                </thead>
                <tbody>{this.generarBody()}</tbody>
              </table>
            </div>
          </div>
        </div>

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
export default connect(mapStateToProps, null)(Ajuste);
