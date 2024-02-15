import React from 'react';
// import axios from 'axios';
import {
  numberFormat,
  formatTime,
  spinnerLoading,
  alertDialog,
  statePrivilegio,
  keyUpSearch,
  isEmpty,
  formatNumberWithZeros,
  alertWarning,
  alertSuccess,
  alertInfo,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import {
  cancelCobro,
  listCobro,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';

class Cobros extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      add: statePrivilegio(this.props.token.userToken.menus[2].submenu[1].privilegio[0].estado),
      view: statePrivilegio(this.props.token.userToken.menus[2].submenu[1].privilegio[1].estado),
      remove: statePrivilegio(this.props.token.userToken.menus[2].submenu[1].privilegio[2].estado),

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

  componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
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
      default:
        this.fillTable(0, '');
    }
  };

  fillTable = async (opcion, buscar) => {
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCobro(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      await this.setStateAsync({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  };

  handleCrear = () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/crear`,
    });
  };

  handleDetalle = (idCobro) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idCobro=' + idCobro,
    });
  };

  handleAnular = (idCobro) => {
    alertDialog(
      'Cobro',
      '¿Está seguro de que desea eliminar el cobro? Esta operación no se puede deshacer.',
      async (value) => {
        if (value) {
          const params = {
            idCobro: idCobro,
            idUsuario: this.state.idUsuario,
          };

          alertInfo('Cobro', 'Procesando información...');

          const response = await cancelCobro(params);

          if (response instanceof SuccessReponse) {
            alertSuccess('Cobro', response.data, () => {
              this.loadInit();
            });
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertWarning('Cobro', response.getMessage());
          }
        }
      },
    );
  };

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="8">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="8">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>
            {item.fecha}
            {<br />}
            {formatTime(item.hora)}
          </td>
          <td>
            {item.comprobante}
            {<br />}
            {item.serie + '-' + formatNumberWithZeros(item.numeracion)}
          </td>
          <td>
            {item.documento}
            {<br />}
            {item.informacion}
          </td>
          <td className="text-center">
            {item.estado === 1 ? (
              <span className="text-success">COBRADO</span>
            ) : (
              <span className="text-danger">ANULADO</span>
            )}
          </td>
          <td className="text-right">
            {numberFormat(item.monto, item.codiso)}
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-info btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idCobro)}
              disabled={!this.state.view}
            >
              <i className="fa fa-eye"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Eliminar"
              onClick={() => this.handleAnular(item.idCobro)}
              disabled={!this.state.remove}
            >
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
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Cobros <small className="text-secondary">LISTA</small>
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
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchText(event.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleCrear}
                disabled={!this.state.add}
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
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="10%">Fecha</th>
                    <th width="10%">Comprobante</th>
                    <th width="20%">Cliente</th>
                    <th width="10%">Estado</th>
                    <th width="10%">Monto</th>
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

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(Cobros);
