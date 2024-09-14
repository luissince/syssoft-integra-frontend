import PropTypes from 'prop-types';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
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
          <TableRow key={index}>
            <TableCell>{++index}</TableCell>
            <TableCell>{item.nombre}</TableCell>
            <TableCell>{rounded(item.cantidad)}</TableCell>
            <TableCell>
              {numberFormat(item.monto, this.state.codiso)}
            </TableCell>
            <TableCell>
              {numberFormat(
                item.cantidad * item.monto,
                this.state.codiso,
              )}
            </TableCell>
          </TableRow>
        );
      })
    );
  }

  renderTotal() {
    const total = this.state.detalles.reduce((acumulador, item) => acumulador + item.monto * item.cantidad, 0);

    return (
      <TableRow>
        <TableHead className="text-right h5">Total:</TableHead>
        <TableHead className="text-right h5">
          {numberFormat(total, this.state.codiso)}
        </TableHead>
      </TableRow>
    );
  }

  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <TableRow>
          <TableCell colSpan="5" className="text-center">
            No hay transacciones para mostrar.
          </TableCell>
        </TableRow>
      );
    }

    return (
      this.state.transaccion.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <TableRow className="table-success">
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <span>{item.fecha}</span>
                <br />
                <span>{formatTime(item.hora)}</span>
              </TableCell>
              <TableCell>{item.concepto}</TableCell>
              <TableCell>{item.nota}</TableCell>
              <TableCell colSpan={2}>{item.usuario}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="text-center">#</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
            {
              item.detalles.map((detalle, index) => {
                return (
                  <tr key={index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{detalle.nombre}</TableCell>
                    <TableCell>{numberFormat(detalle.monto, this.state.codiso)}</TableCell>
                    <TableCell colSpan={2}>{detalle.observacion}</TableCell>
                  </tr>
                );
              })
            }
            <TableRow>
              <TableCell colSpan="5">
                <hr />
              </TableCell>
            </TableRow>
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
          <Column formGroup={true}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Comprobante:</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.comprobante}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Proveedor:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.cliente}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Fecha - Hora:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.fecha}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Observación:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.observacion}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Estado:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.estado === 1 ? (
                      <span className="text-success font-weight-bold">
                        ACTIVO
                      </span>
                    ) : (
                      <span className="text-danger font-weight-bold">
                        ANULADO
                      </span>
                    )}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Usuario:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.usuario}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    Total:
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {numberFormat(this.state.total, this.state.codiso)}
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Detalle</TableTitle>
              <Table className={"able-light table-striped"}>
                <TableHeader className="thead-dark">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.renderDetalles()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-8 col-md-8 col-sm-12 col-12"></Column>
          <Column className="col-lg-4 col-md-4 col-sm-12 col-12">
            <Table>
              <TableHeader>
                {this.renderTotal()}
              </TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Transacciones</TableTitle>
              <Table className={"able-light table-striped"}>
                <TableHeader className="thead-dark">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.renderTransaciones()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

GastoDetalle.propTypes = {
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};


const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedGastoDetalle = connect(mapStateToProps, null)(GastoDetalle);

export default ConnectedGastoDetalle;
