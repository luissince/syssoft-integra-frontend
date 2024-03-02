import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { calculateTax, calculateTaxBruto, formatNumberWithZeros, formatTime, isText, numberFormat, rounded } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCotizacion } from '../../../../../network/rest/principal.network';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import { Table, TableResponsive } from '../../../../../components/Table';
import Title from '../../../../../components/Title';
import { SpinnerView } from '../../../../../components/Spinner';

class CotizacionDetalle extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idCotizacion: '',
      fechaHora: '',

      cliente: '',
      telefono: '',
      celular: '',
      email: '',
      direccion: '',

      comprobante: '',
      serieNumeracion: '',

      estado: '',

      observacion: '',
      notas: '',

      codiso: '',
      total: 0,

      detalle: [],
      salidas: []
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCotizacion = new URLSearchParams(url).get('idCotizacion');

    if (isText(idCotizacion)) {
      this.loadingData(idCotizacion);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadingData(id) {
    const [cotizacion] = await Promise.all([
      this.fetchDetailCotizacion(id)
    ]);

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

      estado,
      observacion,
      nota,
      codiso,

    } = cotizacion.cabecera;

    const monto = cotizacion.detalle.reduce((accumlate, item) => accumlate + (item.precio * item.cantidad), 0,);

    this.setState({
      idCotizacion: id,
      fechaHora: fecha + " " + formatTime(hora),

      comprobante: comprobante,
      serieNumeracion: serie + "-" + formatNumberWithZeros(numeracion),

      cliente: documento + " - " + informacion,
      telefono: telefono,
      celular: celular,
      email: email,
      direccion: direccion,

      estado: estado === 1 ? <span className='text-success'>ACTIVO</span> : <span className='text-danger'>ANULADO</span>,
      observacion: observacion,
      notas: nota,
      codiso: codiso,
      total: monto,

      detalle: cotizacion.detalle,

      loading: false,
    });
  }

  async fetchDetailCotizacion(id) {
    const params = {
      idCotizacion: id,
    };

    const response = await detailCotizacion(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return false;
    }
  }

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalle) {
      const cantidad = item.cantidad;
      const valor = item.precio;

      const impuesto = item.porcentaje;

      const valorActual = cantidad * valor;
      const valorSubNeto = calculateTaxBruto(impuesto, valorActual);
      const valorImpuesto = calculateTax(impuesto, valorSubNeto);
      const valorNeto = valorSubNeto + valorImpuesto;

      subTotal += valorSubNeto;
      total += valorNeto;
    }

    const impuestosGenerado = () => {
      const resultado = this.state.detalle.reduce((acc, item) => {
        const total = item.cantidad * item.precio;
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
          <tr key={index}>
            <th className="text-right mb-2">{impuesto.nombre} :</th>
            <th className="text-right mb-2">
              {numberFormat(impuesto.valor, this.state.codiso)}
            </th>
          </tr>
        );
      });
    }
    return (
      <>
        <tr>
          <th className="text-right mb-2">SUB TOTAL :</th>
          <th className="text-right mb-2">
            {numberFormat(subTotal, this.state.codiso)}
          </th>
        </tr>
        {impuestosGenerado()}
        <tr className="border-bottom"></tr>
        <tr>
          <th className="text-right h5">TOTAL :</th>
          <th className="text-right h5">
            {numberFormat(total, this.state.codiso)}
          </th>
        </tr>
      </>
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
          title='Cotización'
          subTitle='Detalle'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
              >
                <i className="fa fa-print"></i> A4
              </button>{' '}
              <button
                type="button"
                className="btn btn-light"
              >
                <i className="fa fa-print"></i> Ticket
              </button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-6 col-md-6 col-sm-12 col-12">
            <TableResponsive
              className={"table table-borderless"}
              formGroup={true}
              tHead={
                <>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha Compra
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.fechaHora}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Cliente
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.cliente}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Telefono
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.telefono}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Celular
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.celular}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Email
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.email}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Dirección
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.direccion}
                    </th>
                  </tr>
                </>
              }
            />
          </Column>

          <Column className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <TableResponsive
              className={"table table-borderless"}
              formGroup={true}
              tHead={
                <>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Comprobante
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.comprobante}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Serie - Numeración
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.serieNumeracion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.estado}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.observacion}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Notas
                    </th>
                    <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {this.state.notas}
                    </th>
                  </tr>
                  <tr>
                    <th className="table-secondary w-25 p-1 font-weight-normal ">
                      Total
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
              className="table table-light table-striped"
              title={"Detalle"}
              tHead={
                <tr>
                  <th>#</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Impuesto %</th>
                  <th>Cantidad</th>
                  <th>Medida</th>
                  <th>Importe</th>
                </tr>
              }
              tBody={
                <>
                  {this.state.detalle.map((item, index) => (
                    <tr key={index}>
                      <td>{++index}</td>
                      <td>{item.producto}</td>
                      <td className="text-right">
                        {numberFormat(item.precio, this.state.codiso)}
                      </td>

                      <td>{item.categoria}</td>
                      <td className="text-right">{item.impuesto}</td>
                      <td className="text-right">{rounded(item.cantidad)}</td>
                      <td>{item.medida}</td>
                      <td className="text-right">
                        {numberFormat(
                          item.cantidad * item.precio,
                          this.state.codiso,
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-9 col-md-9 col-sm-12 col-xs-12"></Column>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <Table
              formGroup={true}
              tHead={this.renderTotal()}
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

export default CotizacionDetalle;
