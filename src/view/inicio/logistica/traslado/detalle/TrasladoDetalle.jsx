import {
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
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableBody,
  TableRow,
  TableTitle,
} from '../../../../../components/Table';
import { images } from '../../../../../helper';
import Image from '../../../../../components/Image';
import Button from '../../../../../components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
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
      detalles: [],

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
    const [traslado] = await Promise.all([this.fetchDetalleTraslado(id)]);

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

      detalles: traslado.detalles,
      loading: false,
    });
  }

  async fetchDetalleTraslado(id) {
    const params = {
      idTraslado: id,
    };

    const responde = await detailTraslado(
      params,
      this.abortControllerView.signal,
    );

    if (responde instanceof SuccessReponse) {
      return responde.data;
    }

    if (responde instanceof ErrorResponse) {
      if (responde.getType() === CANCELED) return;

      return null;
    }
  }

  render() {
    const {
      tipo,
      motivo,
      almacenOrigen,
      almacenDestino,
      sucursalDestino,
      estado,
      fecha,
      hora,
      observacion,
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Traslado"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              // onClick={this.handlePrintInvoices.bind(this, 'A4')}
            >
              <i className="fa fa-print"></i> A4
            </Button>{' '}
            <Button
              className="btn-light"
              // onClick={this.handlePrintInvoices.bind(this, '80mm')}
            >
              <i className="fa fa-print"></i> 80MM
            </Button>{' '}
            <Button
              className="btn-light"
              // onClick={this.handlePrintInvoices.bind(this, '58mm')}
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TableResponsive>
              <Table width="100%">
                <TableHeader>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Fecha y Hora
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {fecha} - {formatTime(hora)}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Tipo de traslado
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {tipo}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Motivo
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {motivo}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Almacen de Origen
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {almacenOrigen}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Sucursal de Destino
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {sucursalDestino}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Almacen de Destino
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {almacenDestino}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Observación
                    </TableHead>
                    <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                      {observacion}
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                      Estado
                    </TableHead>
                    <TableHead
                      className={`table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal ${
                        estado === 1 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {estado === 1 ? 'ACTIVO' : 'ANULADO'}
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
              <TableTitle>Detalles</TableTitle>
              <Table className="table table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.state.detalles.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{item.id}</TableCell>
                        <TableCell className="text-center">
                          <Image
                            default={images.noImage}
                            src={item.imagen}
                            alt={item.producto}
                            width={100}
                          />
                        </TableCell>
                        <TableCell>
                          {item.codigo}
                          <br />
                          {item.producto}
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{rounded(item.cantidad)}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>
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
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedTrasladoDetalle = connect(
  mapStateToProps,
  null,
)(TrasladoDetalle);

export default ConnectedTrasladoDetalle;
