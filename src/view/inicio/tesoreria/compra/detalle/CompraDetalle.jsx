import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { calculateTax, calculateTaxBruto, formatNumberWithZeros, formatTime, isEmpty, isText, numberFormat, rounded } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCompra } from '../../../../../network/rest/principal.network';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import Button from '../../../../../components/Button';
import React from 'react';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CompraDetalle extends CustomComponent {

  /**
    *
    * Constructor
    */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idCompra: '',
      fechaHora: '',

      proveedor: '',
      telefono: '',
      celular: '',
      email: '',
      direccion: '',

      almacen: '',

      comprobante: '',
      serieNumeracion: '',

      tipo: '',
      estado: '',

      observacion: '',
      notas: '',

      codiso: '',
      total: 0,

      detalles: [],
      transaccion: []
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCompra = new URLSearchParams(url).get('idCompra');

    if (isText(idCompra)) {
      this.loadingData(idCompra);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadingData(id) {
    const [compra] = await Promise.all([
      this.fetchDetailCompra(id)
    ]);

    if (!compra) {
      this.props.history.goBack();
      return;
    }

    const {
      fecha,
      hora,

      comprobante,
      serie,
      numeracion,

      documento,
      informacion,
      telefono,
      celular,
      email,
      direccion,

      almacen,

      tipo,
      estado,
      observacion,
      nota,
      codiso,

    } = compra.cabecera;

    const monto = compra.detalles.reduce((accumlate, item) => accumlate + (item.costo * item.cantidad), 0,);

    this.setState({
      idCompra: id,
      fechaHora: fecha + " " + formatTime(hora),

      comprobante: comprobante,
      serieNumeracion: serie + "-" + formatNumberWithZeros(numeracion),

      proveedor: documento + " - " + informacion,
      telefono: telefono,
      celular: celular,
      email: email,
      direccion: direccion,

      almacen: almacen,

      tipo: tipo,
      estado: estado === 1 ? <span className='text-success'>PAGADO</span> : estado === 2 ? <span className='text-warning'>POR PAGAR</span> : <span className='text-danger'>ANULADO</span>,
      observacion: observacion,
      notas: nota,
      codiso: codiso,
      total: monto,

      detalles: compra.detalles,
      transaccion: compra.transaccion,

      loading: false,
    });
  }

  async fetchDetailCompra(id) {
    const params = {
      idCompra: id,
    };

    const response = await detailCompra(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return false;
    }
  }

  renderDetalles() {
    return (
      this.state.detalles.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{++index}</TableCell>
          <TableCell>{item.producto}</TableCell>
          <TableCell className="text-right">{numberFormat(item.costo, this.state.codiso)}</TableCell>
          <TableCell>{item.categoria}</TableCell>
          <TableCell className="text-right">{item.impuesto}</TableCell>
          <TableCell className="text-right">{rounded(item.cantidad)}</TableCell>
          <TableCell>{item.medida}</TableCell>
          <TableCell className="text-right">
            {numberFormat(
              item.cantidad * item.costo,
              this.state.codiso,
            )}
          </TableCell>
        </TableRow>
      ))
    );
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalles) {
      const cantidad = item.cantidad;
      const valor = item.costo;

      const impuesto = item.porcentaje;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(impuesto, valorActual);
      const valorImpuesto = calculateTax(impuesto, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = this.state.detalles.reduce((acc, item) => {
        const total = item.cantidad * item.costo;
        const subTotal = calculateTaxBruto(item.porcentaje, total);
        const impuestoTotal = calculateTax(item.porcentaje, subTotal);

        const existingImpuesto = acc.find((imp) => imp.idImpuesto === item.idImpuesto,);

        if (existingImpuesto) {
          existingImpuesto.valor += impuestoTotal;
        } else {
          acc.push({
            idImpuesto: item.idImpuesto,
            nombre: item.impuesto,
            valor: impuestoTotal,
          });
        }

        return acc;
      }, []);

      return resultado.map((impuesto, index) => {
        return (
          <TableRow key={index}>
            <TableHead className="text-right mb-2">{impuesto.nombre} :</TableHead>
            <TableHead className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codiso)}
            </TableHead>
          </TableRow>
        );
      });
    }
    return (
      <>
        <TableRow>
          <TableHead className="text-right mb-2">SUB TOTAL :</TableHead>
          <TableHead className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </TableHead>
        </TableRow>
        {impuestosGenerado()}
        <TableRow className="border-bottom"></TableRow>
        <TableRow>
          <TableHead className="text-right h5">TOTAL :</TableHead>
          <TableHead className="text-right h5">
            {numberFormat(total, this.state.codiso)}
          </TableHead>
        </TableRow>
      </>
    );
  }

  renderTransaciones() {
    if (isEmpty(this.state.transaccion)) {
      return (
        <TableRow>
          <TableCell colSpan="6" className="text-center">
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
              <TableCell>{item.usuario}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="text-center">#</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell colSpan={2}>Observación</TableCell>
            </TableRow>
            {
              item.detalles.map((detalle, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{detalle.nombre}</TableCell>
                    <TableCell>{numberFormat(detalle.monto, this.state.codiso)}</TableCell>
                    <TableCell colSpan={2}>{detalle.observacion}</TableCell>
                  </TableRow>
                );
              })
            }
            <TableRow>
              <TableCell colSpan="6">
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
          title='Compra'
          subTitle='DETALLE'
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
          <Column className="col-lg-6 col-md-6 col-sm-12 col-12">
            <TableResponsive>
              <Table className={"table-borderless"}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha Compra
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fechaHora}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Proveedor
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.proveedor}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Telefono
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.telefono}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Celular
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.celular}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Email
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.email}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Dirección
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.direccion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Almacen
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.almacen}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>

          <Column className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <TableResponsive>
              <Table className={"table-borderless"}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Comprobante
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Serie - Numeración
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.serieNumeracion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Tipo
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.tipo}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Notas
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.notas}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Total
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {numberFormat(this.state.total, this.state.codiso)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Transacciones</TableTitle>
              <Table className={"table-light"}>
                <TableHeader className="thead-dark">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Impuesto %</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Medida</TableHead>
                    <TableHead>Importe</TableHead>
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
          <Column className="col-lg-9 col-md-9 col-sm-12 col-xs-12"></Column>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <Table >
              <TableHeader>{this.renderTotal()}</TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Transacciones</TableTitle>
              <Table className={"table-light"}>
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

CompraDetalle.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string
  })
};

export default CompraDetalle;
