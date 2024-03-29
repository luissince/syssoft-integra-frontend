import React from 'react';
import {
  numberFormat,
  formatTime,
  alertDialog,
  alertSuccess,
  alertWarning,
  statePrivilegio,
  keyUpSearch,
  isEmpty,
  formatNumberWithZeros,
  alertInfo,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  cancelVenta,
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
import { SpinnerTable } from '../../../../../components/Spinner';

class Ventas extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      lista: [],
      restart: false,

      add: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[0].estado,),
      view: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[1].estado,),
      remove: statePrivilegio(this.props.token.userToken.menus[2].submenu[0].privilegio[2].estado,),

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
  }

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
  }

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
  }

  fillTable = async (opcion, buscar) => {
    this.setState({
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

  handleCrear = () => {
    this.props.history.push(`${this.props.location.pathname}/crear`);
  };

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
            this.loadInit();
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
          <td> {numberFormat(item.total, item.codiso)} </td>
          <td className="text-center">
            <button
              className="btn btn-outline-primary btn-sm"
              title="Detalle"
              onClick={() => this.handleDetalle(item.idVenta)}
              disabled={!this.state.view}>
              <i className="fa fa-eye"></i>
            </button>
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-danger btn-sm"
              title="Anular"
              onClick={() => this.handleCancelar(item.idVenta)}
              disabled={!this.state.remove}>
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
          title='Ventas'
          subTitle='LISTA'
        />

        <Row>
          <Column className="col-md-6 col-sm-12">
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
          </Column>

          <Column className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={this.handleCrear}
                disabled={!this.state.add}>
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={this.loadInit}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
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
                  <th width="10%">Cliente</th>
                  <th width="10%">Comprobante</th>
                  <th width="10%">Forma de Cobro</th>
                  <th width="10%" className="text-center">Estado</th>
                  <th width="10%">Total</th>
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

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedVentas = connect(mapStateToProps, null)(Ventas);

export default ConnectedVentas;
