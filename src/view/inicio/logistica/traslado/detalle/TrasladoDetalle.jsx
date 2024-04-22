import {
  spinnerLoading,
  formatTime,
  rounded,
  isText,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { detailTraslado } from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';

class TrasladoDetalle extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idAjuste: '',

      tipo: '',
      almacenOrigen: '',
      almacenDestino: '',
      sucursalDestino: '',
      estado: 0,
      fecha: '',
      hora: '',
      motivo: '',
      observacion: '',
      detalle: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.abortControllerView = new AbortController();
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idTraslado = new URLSearchParams(url).get('idTraslado');
    if (isText(idTraslado)) {
      this.loadDataId(idTraslado);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadDataId(id) {
    const [traslado] = await Promise.all([
      this.fetchDetalleTraslado(id)
    ]);

    this.setState({
      fecha: traslado.cabecera.fecha,
      hora: traslado.cabecera.hora,
      tipo: traslado.cabecera.tipo,
      motivo: traslado.cabecera.motivo,
      observacion: traslado.cabecera.observacion,
      almacenOrigen: traslado.cabecera.almacenOrigen,
      almacenDestino: traslado.cabecera.almacenDestino,
      sucursalDestino: traslado.cabecera.sucursalDestino,
      estado: traslado.cabecera.estado,

      detalle: traslado.detalle,
      loading: false,
    });
  }

  async fetchDetalleTraslado(id) {
    const params = {
      idTraslado: id,
    };

    const responde = await detailTraslado(params, this.abortControllerView.signal,);

    if (responde instanceof SuccessReponse) {
      return responde.data;
    }

    if (responde instanceof ErrorResponse) {
      if (responde.getType() === CANCELED) return;

      return null;
    }
  }

  render() {
    const { tipo, motivo, almacenOrigen, almacenDestino, sucursalDestino, estado, fecha, hora, observacion } =
      this.state;

    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>
                Ajuste <small className="text-secondary">detalle</small>
              </h5>
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
                        Fecha y Hora
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {fecha} - {formatTime(hora)}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Tipo de traslado
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {tipo}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Motivo
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {motivo}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Almacen de Origen
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {almacenOrigen}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Sucursal de Destino
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {sucursalDestino}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Almacen de Destino
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {almacenDestino}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Observación
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {observacion}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        Estado
                      </th>
                      <th
                        className={`table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal ${estado === 1 ? 'text-success' : 'text-danger'
                          }`}
                      >
                        {estado === 1 ? 'ACTIVO' : 'ANULADO'}
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
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.detalle.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="text-center">{++index}</td>
                        <td>
                          {item.codigo}
                          <br />
                          {item.producto}
                        </td>
                        <td>{item.categoria}</td>
                        <td>{rounded(item.cantidad)}</td>
                        <td>{item.unidad}</td>
                      </tr>
                    );
                  })}
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
const ConnectedTrasladoDetalle = connect(mapStateToProps, null)(TrasladoDetalle);

export default ConnectedTrasladoDetalle;
