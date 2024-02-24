import React from 'react';
import {
  formatNumberWithZeros,
  isEmpty,
  keyUpSearch,
  numberFormat,
  spinnerLoading,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import {
  listAccountsReceivableVenta,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';

class CuentasPorCobrar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lista: [],
      restart: false,

      tipo: 'only',

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
    await this.loadInit();
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
    this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });


    const params = {
      opcion: opcion,
      tipo: this.state.tipo,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listAccountsReceivableVenta(params, this.abortControllerTable.signal);

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


  handleCobrar = (idVenta) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idVenta=' + idVenta,
    });
  }

  handleSelecTipo = (event) => {
    this.setState({ tipo: event.target.value }, () => {
      this.loadInit()
    })
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="7">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td className="text-center" colSpan="7">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      return (
        <tr key={index}>
          <td className={`text-center`}>{item.id}</td>
          <td>{item.comprobante} <br /> {item.serie}-{formatNumberWithZeros(item.numeracion)} </td>
          <td>{item.documento}<br />{item.informacion}</td>
          <td>{numberFormat(item.total, item.codiso)}</td>
          <td className='text-success'>{numberFormat(item.pagado, item.codiso)}</td>
          <td className='text-danger'>{numberFormat(item.total - item.pagado, item.codiso)}</td>
          <td className='text-center'>
            <button
              className="btn btn-outline-info btn-sm"
              title="Detalle"
              onClick={() => this.handleCobrar(item.idVenta)}>
              <i className="fa fa-calendar-check-o"></i>
            </button>
          </td>
        </tr>
      );
    })
  }

  render() {
    return (
      <ContainerWrapper>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Cuentas por Cobrar <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12">
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
                  placeholder="Ingrese datos del comprobante de referencia..."
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

          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="form-group">
              <label>Tipo:</label>
              <select
                className="form-control"
                value={this.state.tipo}
                onChange={this.handleSelecTipo}>
                <option value="only">Mostrar ventas por cobrar</option>
                <option value="all">Mostrar todas las ventas al crédito</option>
              </select>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12">
            <label>Opciones:</label>
            <div className="form-group">
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadInit}
              >
                <i className="bi bi-arrow-clockwise"></i> Recargar
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
                    <th width="5%" className="text-center">#</th>
                    <th width="10%">Comprobante</th>
                    <th width="20%">Cliente</th>
                    <th width="10%">Total</th>
                    <th width="10%">Cobrado</th>
                    <th width="10%">Por Cobrar</th>
                    <th width="5%" className="text-center">Cobrar</th>
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

export default connect(mapStateToProps, null)(CuentasPorCobrar);
