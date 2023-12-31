import CryptoJS from 'crypto-js';
import {
  rounded,
  numberFormat,
  calculateTaxBruto,
  calculateTax,
  formatTime,
  spinnerLoading,
  isText,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import { detailFactura } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';

class VentaDetalle extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idVenta: '',
      comprobante: '',
      cliente: '',
      fecha: '',
      notas: '',
      formaVenta: '',
      estado: '',
      codiso: '',
      simbolo: '',
      total: '',
      usuario: '',

      detalle: [],
      ingresos: [],
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idVenta = new URLSearchParams(url).get('idVenta');
    if (isText(idVenta)) {
      this.loadingData(idVenta);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadingData(id) {
    const [factura] = await Promise.all([
      await this.fetchIdFactura(id)
    ]);

    if (!factura) {
      this.props.history.goBack();
      return;
    }

    const {
      comprobante,
      serie,
      numeracion,
      documento,
      informacion,
      fecha,
      hora,
      tipo,
      estado,
      simbolo,
      codiso,
      usuario,
    } = factura.cabecera;

    const monto = factura.ingresos.reduce((accumlate, item) => accumlate + item.monto, 0,);

    await this.setStateAsync({
      idVenta: id,
      comprobante: comprobante + '  ' + serie + '-' + numeracion,
      cliente: documento + ' - ' + informacion,
      fecha: fecha + ' ' + formatTime(hora),
      notas: '',
      formaVenta: tipo === 1 ? 'Contado' : 'Crédito',
      estado: estado === 1 ? <span className="text-success font-weight-bold">
        Cobrado
      </span> : estado === 2 ? <span className="text-warning font-weight-bold">
        Por cobrar
      </span> : estado == 3 ? <span className="text-danger font-weight-bold">
        Anulado
      </span> : <span className="text-info font-weight-bold">
        Por llevar
      </span>,
      simbolo: simbolo,
      codiso: codiso,
      usuario: usuario,
      total: rounded(monto),
      detalle: factura.detalle,

      ingresos: factura.ingresos,

      loading: false,
    });
  }

  async fetchIdFactura(id) {
    const params = {
      idVenta: id,
    };

    const response = await detailFactura(params, this.abortControllerView.signal);

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

  async onEventImprimir() {
    const data = {
      idEmpresa: 'EM0001',
      idVenta: this.state.idVenta,
    };

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria',).toString();
    const params = new URLSearchParams({ params: ciphertext });
    window.open('/api/factura/repcomprobante?' + params, '_blank');
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
                Venta
                <small className="text-secondary"> detalle</small>
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
                onClick={() => this.onEventImprimir()}
              >
                <i className="fa fa-print"></i> Imprimir
              </button>{' '}
              {/* <button type="button" className="btn btn-light"><i className="fa fa-edit"></i> Editar</button> */}{' '}
              {/* <button type="button" className="btn btn-light"><i className="fa fa-remove"></i> Eliminar</button> */}{' '}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
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
                        Cliente
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.cliente}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Fecha
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.fecha}
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
                        Forma de venta
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.formaVenta}
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
                        Usuario
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.usuario}
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
            <div className="form-group">
              <p className="lead">Detalle</p>
              <div className="table-responsive">
                <table className="table table-light table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Concepto</th>
                      <th>Unidad</th>
                      <th>Categoría</th>
                      <th>Cantidad</th>
                      <th>Impuesto</th>
                      <th>Precio</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.detalle.map((item, index) => (
                      <tr key={index}>
                        <td>{++index}</td>
                        <td>{item.producto}</td>
                        <td>{item.medida}</td>
                        <td>{item.categoria}</td>
                        <td className="text-right">{rounded(item.cantidad)}</td>
                        <td className="text-right">{item.impuesto}</td>
                        <td className="text-right">
                          {numberFormat(item.precio, this.state.codiso)}
                        </td>
                        <td className="text-right">
                          {numberFormat(
                            item.cantidad * item.precio,
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
          <div className="col">
            <p className="lead">Ingresos asociado</p>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(VentaDetalle);
