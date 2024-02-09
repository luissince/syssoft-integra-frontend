import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import { calculateTax, calculateTaxBruto, formatNumberWithZeros, formatTime, isText, numberFormat, rounded, spinnerLoading } from '../../../../../helper/utils.helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { detailCompra } from '../../../../../network/rest/principal.network';

class CompraDetalle extends CustomComponent {

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

      detalle: [],
      salidas: []
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
      await this.fetchDetailCompra(id)
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

    const monto = compra.detalle.reduce((accumlate, item) => accumlate + (item.costo * item.cantidad), 0,);
    

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

      detalle: compra.detalle,
      salidas: compra.salidas,

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

  renderTotal() {
    let subTotal = 0;
    let total = 0;

    for (const item of this.state.detalle) {
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
      const resultado = this.state.detalle.reduce((acc, item) => {
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
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Compra
                <small className="text-secondary"> Detalle </small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
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
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
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
                        Proveedor
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.proveedor}
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
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Almacen
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.almacen}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
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
                        Tipo
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.tipo}
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
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <p className="lead">Detalle</p>
            <div className="table-responsive">
              <table className="table table-light table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Costo</th>
                    <th>Categoría</th>
                    <th>Impuesto %</th>
                    <th>Cantidad</th>
                    <th>Medida</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.detalle.map((item, index) => (
                    <tr key={index}>
                      <td>{++index}</td>
                      <td>{item.producto}</td>
                      <td className="text-right">
                        {numberFormat(item.costo, this.state.codiso)}
                      </td>

                      <td>{item.categoria}</td>
                      <td className="text-right">{item.impuesto}</td>
                      <td className="text-right">{rounded(item.cantidad)}</td>
                      <td>{item.medida}</td>
                      <td className="text-right">
                        {numberFormat(
                          item.cantidad * item.costo,
                          this.state.codiso,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12"></div>
          <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>{this.renderTotal()}</thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <p className="lead">Salidas asociados</p>
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
                        No hay ingresos para mostrar.
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
      </ContainerWrapper>
    );
  }
}

export default CompraDetalle;
