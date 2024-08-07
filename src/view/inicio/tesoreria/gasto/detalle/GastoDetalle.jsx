import {
  rounded,
  formatTime,
  numberFormat,
  spinnerLoading,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailGasto } from '../../../../../network/rest/principal.network';

class GastoDetalle extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idCobro: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      metodoPago: '',
      estado: '',
      usuario: '',
      total: '',
      codiso: '',
      simbolo: '',

      detalle: [],
      salidas: [],

      loading: true,
      msgLoading: 'Cargando datos...',
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idGasto = new URLSearchParams(url).get('idGasto');
    if (idGasto !== null) {
      this.loadDataId(idGasto);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadDataId(id) {
    const [gasto] = await Promise.all([
      this.fetchDetailGasto(id)
    ]);

    if (gasto === null) {
      this.props.history.goBack();
      return;
    }

    const suma = gasto.detalle.reduce((acumulador, item) => acumulador + item.precio * item.cantidad, 0);

    this.setState({
      comprobante: gasto.cabecera.comprobante + ' ' + gasto.cabecera.serie + '-' + gasto.cabecera.numeracion,
      cliente: gasto.cabecera.documento + ' ' + gasto.cabecera.informacion,
      fecha: gasto.cabecera.fecha + ' ' + gasto.cabecera.hora,
      estado: gasto.cabecera.estado,
      usuario: gasto.cabecera.nombres + ', ' + gasto.cabecera.apellidos,
      codiso: gasto.cabecera.codiso,

      detalle: gasto.detalle,
      salidas: gasto.salidas,

      total: suma,
      loading: false,
    });
  }

  async fetchDetailGasto(id) {
    const params = {
      idGasto: id,
    };

    const response = await detailGasto(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  onEventImprimir() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idCobro: this.state.idCobro,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/cobro/repcomprobante?' + params, '_blank');
  }

  onEventMatricial() {
    // const data = {
    //   idEmpresa: 'EM0001',
    //   idCobro: this.state.idCobro,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/cobro/repcomprobantematricial?' + params, '_blank');
  }

  renderTotal() {
    const total = this.state.detalle.reduce((acumulador, item) => acumulador + item.precio * item.cantidad, 0);

    return (
      <tr>
        <th className="text-right h5">Total:</th>
        <th className="text-right h5">
          {numberFormat(total, this.state.codiso)}
        </th>
      </tr>
    );
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Gasto
                <small className="text-secondary"> detalle</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => this.onEventImprimir()}
              >
                <i className="fa fa-print"></i> Imprimir A4
              </button>{' '}
              <button
                type="button"
                className="btn btn-light"
                onClick={() => this.onEventMatricial()}
              >
                <i className="fa fa-print"></i> Imprimir Matricial
              </button>{' '}
              <button type="button" className="btn btn-light">
                <i className="fa fa-file-archive-o"></i> Adjuntar
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Comprobante:</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.comprobante}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Cliente:
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.cliente}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Fecha:
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.fecha}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Estado:
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.estado === 1 ? (
                          <span className="text-success font-weight-bold">
                            Cobrado
                          </span>
                        ) : (
                          <span className="text-danger font-weight-bold">
                            Anulado
                          </span>
                        )}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Usuario:
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.usuario}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Total:
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {numberFormat(this.state.total, this.state.codiso)}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <p className="lead">Detalle</p>
              <div className="table-responsive">
                <table className="table table-light table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Concepto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.detalle.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{++index}</td>
                          <td>{item.nombre}</td>
                          <td>{rounded(item.cantidad)}</td>
                          <td>
                            {numberFormat(item.precio, this.state.codiso)}
                          </td>
                          <td>
                            {numberFormat(
                              item.cantidad * item.precio,
                              this.state.codiso,
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8 col-md-8 col-sm-12 col-12"></div>
          <div className="col-lg-4 col-md-4 col-sm-12 col-12">
            <table width="100%">
              <thead>{this.renderTotal()}</thead>
            </table>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <p className="lead">Ingresos</p>
              <div className="table-responsive">
                <table className="table table-light table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha y Hora</th>
                      <th>Metodo</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.salidas.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No hay salidas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      this.state.salidas.map((item, index) => (
                        <tr key={index}>
                          <td>{++index}</td>
                          <td>
                            <span>{item.fecha}</span>
                            <br />
                            <span>{formatTime(item.hora)}</span>
                          </td>
                          <td>{item.nombre}</td>
                          <td>{item.descripcion}</td>
                          <td>{numberFormat(item.monto, this.state.codiso)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedGastoDetalle = connect(mapStateToProps, null)(GastoDetalle);

export default ConnectedGastoDetalle;
