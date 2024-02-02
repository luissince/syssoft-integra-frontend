import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  isText,
  formatTime,
  rounded,
  formatNumberWithZeros,
  spinnerLoading,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { detailGuiaRemision } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import printJS from 'print-js';
import { pdfA4GuiaRemision, pdfTicketGuiaRemision } from '../../../../../helper/lista-pdf.helper';

class GuiaRemisionDetalle extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idGuiaRemision:'',
      fecha: "",
      hora: "",
      comprobante: "",
      serie: "",
      numeracion: "",
      modalidadTraslado: "",
      motivoTraslado: "",
      fechaTraslado: "",
      tipoPeso: "",
      peso: "",
      marca: "",
      numeroPlaca: "",
      documentoConductor: "",
      informacionConductor: "",
      licenciaConducir: "",
      direccionPartida: "",
      ubigeoPartida: "",
      direccionLlegada: "",
      ubigeoLlegada: "",
      usuario: "",
      comprobanteRef: "",
      serieRef: "",
      numeracionRef: "",
      cliente: "",

      detalle: []
    };

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idGuiaRemision = new URLSearchParams(url).get('idGuiaRemision');
    if (isText(idGuiaRemision)) {
      await this.loadingData(idGuiaRemision);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadingData(id) {
    const [guiaRemision] = await Promise.all([
      await this.fetchIdFactura(id)
    ]);

    const {
      fecha,
      hora,
      comprobante,
      serie,
      numeracion,
      modalidadTraslado,
      motivoTraslado,
      fechaTraslado,
      tipoPeso,
      peso,
      marca,
      numeroPlaca,
      documentoConductor,
      informacionConductor,
      licenciaConducir,
      direccionPartida,
      ubigeoPartida,
      direccionLlegada,
      ubigeoLlegada,
      usuario,
      comprobanteRef,
      serieRef,
      numeracionRef,
      cliente
    } = guiaRemision.cabecera;


    this.setState({
      idGuiaRemision:id,
      fecha,
      hora,
      comprobante,
      serie,
      numeracion,
      modalidadTraslado,
      motivoTraslado,
      fechaTraslado,
      tipoPeso,
      peso,
      marca,
      numeroPlaca,
      documentoConductor,
      informacionConductor,
      licenciaConducir,
      direccionPartida,
      ubigeoPartida,
      direccionLlegada,
      ubigeoLlegada,
      usuario,
      comprobanteRef,
      serieRef,
      numeracionRef,
      cliente,

      detalle: guiaRemision.detalle,

      loading: false,
    });
  }

  async fetchIdFactura(id) {
    const params = {
      idGuiaRemision: id,
    };

    const response = await detailGuiaRemision(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return false;
    }
  }

  handlePrintA4 = () => {
    printJS({
      printable: pdfA4GuiaRemision(this.state.idGuiaRemision),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
  }

  handlePrintTicket = () => {
    printJS({
      printable: pdfTicketGuiaRemision(this.state.idGuiaRemision),
      type: 'pdf',
      showModal: true,
      modalMessage: "Recuperando documento...",
      onPrintDialogClose: () => {
        console.log("onPrintDialogClose")
      }
    })
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col-12">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Guía Remisión
                <small className="text-secondary"> Detalle </small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handlePrintA4}
              >
                <i className="fa fa-print"></i> A4
              </button>
              {" "}
              <button
                type="button"
                className="btn btn-light"
                onClick={this.handlePrintTicket}
              >
                <i className="fa fa-print"></i> Ticket
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 col-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Fecha
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.fecha} {formatTime(this.state.hora)}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Comprobante
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.serie}-{formatNumberWithZeros(this.state.numeracion)}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Fecha Traslado
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.fechaTraslado}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Cliente
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.cliente}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Motivo Traslado
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.motivoTraslado}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Modalidad Traslado
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.modalidadTraslado}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Peso (KGM o TNE)
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.tipoPeso}  {this.state.peso}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Comprobante Asociado
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.comprobanteRef}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Serie y Numeración
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.serieRef}-{formatNumberWithZeros(this.state.numeracionRef)}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 col-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Conductor
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.documentoConductor},  {this.state.informacionConductor}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Número de Licencia
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.licenciaConducir}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Número de Placa
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.numeroPlaca}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Dirección de Partida
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.direccionPartida}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-35 p-1 font-weight-normal ">
                        Dirección de Llegada
                      </th>
                      <th className="table-light border-bottom w-65 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.direccionLlegada}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <p className="lead">Detalle</p>
            <div className="table-responsive">
              <table className="table table-light table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Código</th>
                    <th>Und/Medida</th>
                    <th>Cantidad</th>                 
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.detalle.map((item, index) => (
                      <tr key={index}>
                        <td>{++index}</td>
                        <td>{item.nombre}</td>
                        <td>{item.codigo}</td>
                        <td>{item.medida}</td>
                        <td>{rounded(item.cantidad)}</td>                       
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(GuiaRemisionDetalle);
