import {
  rounded,
  numberFormat,
  formatTime,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import { detailCobro } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableResponsive } from '../../../../../components/Table';

class CobroDetalle extends CustomComponent {
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
      ingresos: [],

      loading: true,
      msgLoading: 'Cargando datos...',
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCobro = new URLSearchParams(url).get('idCobro');
    if (idCobro !== null) {
      this.loadDataId(idCobro);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadDataId(id) {
    const [cobro] = await Promise.all([
      this.fetchDetailCobro(id)
    ]);

    if (cobro === null) {
      this.props.history.goBack();
      return;
    }

    const suma = cobro.detalle.reduce((acumulador, item) => acumulador + item.precio * item.cantidad, 0);

    this.setState({
      comprobante: cobro.cabecera.comprobante + ' ' + cobro.cabecera.serie + '-' + cobro.cabecera.numeracion,
      cliente: cobro.cabecera.documento + ' ' + cobro.cabecera.informacion,
      fecha: cobro.cabecera.fecha + ' ' + cobro.cabecera.hora,
      estado: cobro.cabecera.estado,
      usuario: cobro.cabecera.nombres + ', ' + cobro.cabecera.apellidos,
      codiso: cobro.cabecera.codiso,

      detalle: cobro.detalle,
      ingresos: cobro.ingresos,

      total: suma,

      loading: false,
    });
  }

  async fetchDetailCobro(id) {
    const params = {
      idCobro: id,
    };

    const response = await detailCobro(params, this.abortControllerView.signal);

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
    const total = this.state.detalle.reduce((acumulador, item) => {
      return acumulador + item.precio * item.cantidad;
    }, 0);

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
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />


        <Title
          title='Cobro'
          subTitle='Detalle'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-lg-12 col-md-12 col-sm-12 col-12">
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
          </Column>
        </Row>

        <Row>
          <Column>
            <Table
              formGroup={true}
              tHead={
                <>
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
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              className={"table table-light table-striped"}
              title={"Detalle"}
              formGroup={true}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              }
              tBody={
                <>
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
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-md-8 col-sm-12 col-12"></Column>
          <Column className="col-lg-4 col-md-4 col-sm-12 col-12">
            <Table
              formGroup={true}
              tHead={this.renderTotal()}
            />
          </Column>
        </Row>


        <Row>
          <Column>
            <TableResponsive
              className={"table table-light table-striped"}
              title={"Ingresos"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Fecha y Hora</th>
                  <th>Metodo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              }

              tBody={
                <>
                  {this.state.ingresos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No hay ingresos para mostrar.
                      </td>
                    </tr>
                  ) : (
                    this.state.ingresos.map((item, index) => (
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
                </>
              }
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedCobroDetalle = connect(mapStateToProps, null)(CobroDetalle);

export default ConnectedCobroDetalle;
