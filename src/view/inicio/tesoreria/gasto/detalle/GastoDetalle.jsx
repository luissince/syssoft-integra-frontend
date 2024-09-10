import {
  rounded,
  formatTime,
  numberFormat,
  isEmpty,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailGasto } from '../../../../../network/rest/principal.network';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Button from '../../../../../components/Button';
import { Table, TableResponsive } from '../../../../../components/Table';
import React from 'react';

class GastoDetalle extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idGasto: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      observacion: '',
      estado: '',
      usuario: '',
      total: '',
      codiso: '',
      simbolo: '',

      detalles: [],
      transaccion: [],

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

    const suma = gasto.detalles.reduce((acumulador, item) => acumulador + item.monto * item.cantidad, 0);

    this.setState({
      comprobante: gasto.cabecera.comprobante + ' ' + gasto.cabecera.serie + '-' + gasto.cabecera.numeracion,
      cliente: gasto.cabecera.documento + ' ' + gasto.cabecera.informacion,
      fecha: gasto.cabecera.fecha + ' ' + formatTime(gasto.cabecera.hora),
      observacion: gasto.cabecera.observacion,
      estado: gasto.cabecera.estado,
      usuario: gasto.cabecera.nombres + ', ' + gasto.cabecera.apellidos,
      codiso: gasto.cabecera.codiso,

      detalles: gasto.detalles,
      transaccion: gasto.transaccion,

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

  renderDetalles() {
    return (
      this.state.detalles.map((item, index) => {
        return (
          <tr key={index}>
            <td>{++index}</td>
            <td>{item.nombre}</td>
            <td>{rounded(item.cantidad)}</td>
            <td>
              {numberFormat(item.monto, this.state.codiso)}
            </td>
            <td>
              {numberFormat(
                item.cantidad * item.monto,
                this.state.codiso,
              )}
            </td>
          </tr>
        );
      })
    );
  }

  renderTotal() {
    const total = this.state.detalles.reduce((acumulador, item) => acumulador + item.monto * item.cantidad, 0);

    return (
      <tr>
        <th className="text-right h5">Total:</th>
        <th className="text-right h5">
          {numberFormat(total, this.state.codiso)}
        </th>
      </tr>
    );
  }

  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <tr>
          <td colSpan="5" className="text-center">
            No hay transacciones para mostrar.
          </td>
        </tr>
      );
    }

    return (
      this.state.transaccion.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <tr className="table-success">
              <td>{index + 1}</td>
              <td>
                <span>{item.fecha}</span>
                <br />
                <span>{formatTime(item.hora)}</span>
              </td>
              <td>{item.concepto}</td>
              <td>{item.nota}</td>
              <td colSpan={2}>{item.usuario}</td>
            </tr>

            <tr>
              <td className="text-center">#</td>
              <td>Banco</td>
              <td>Monto</td>
              <td>Observación</td>
            </tr>
            {
              item.detalles.map((detalle, index) => {
                return (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td>{detalle.nombre}</td>
                    <td>{numberFormat(detalle.monto, this.state.codiso)}</td>
                    <td colSpan={2}>{detalle.observacion}</td>
                  </tr>
                );
              })
            }
            <tr>
              <td colSpan="5">
                <hr />
              </td>
            </tr>
          </React.Fragment>
        );
      })
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
          title='Gasto'
          subTitle='Detalle'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> A4
            </Button>
            {' '}
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> Ticket
            </Button>
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
                      Proveedor:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.cliente}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha - Hora:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fecha}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado:
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado === 1 ? (
                        <span className="text-success font-weight-bold">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-danger font-weight-bold">
                          ANULADO
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
              tBody={this.renderDetalles()}
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
              title={"Transacciones"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Fecha y Hora</th>
                  <th>Concepto</th>
                  <th>Nota</th>
                  <th>Usuario</th>
                </tr>
              }

              tBody={this.renderTransaciones()}
            />
          </Column>
        </Row>
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
