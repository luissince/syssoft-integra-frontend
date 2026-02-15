import { formatTime, rounded } from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { detailAjuste } from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import { images } from '@/helper';
import Image from '@/components/Image';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class LogisticaAjusteDetalle extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando datos...",

      idAjuste: "",

      tipo: "",
      almacen: "",
      estado: 0,
      fecha: "",
      hora: "",
      motivo: "",
      observacion: "",
      detalles: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.abortControllerView = new AbortController();
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idAjuste = new URLSearchParams(url).get("idAjuste");
    if (idAjuste !== null) {
      this.loadDataId(idAjuste);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  async loadDataId(id) {
    const [ajuste] = await Promise.all([this.fetchDetalleAjuste(id)]);

    this.setState({
      tipo: ajuste.cabecera.tipo,
      almacen: ajuste.cabecera.almacen,
      estado: ajuste.cabecera.estado,
      fecha: ajuste.cabecera.fecha,
      hora: ajuste.cabecera.hora,
      motivo: ajuste.cabecera.motivo,
      observacion: ajuste.cabecera.observacion,

      detalles: ajuste.detalles,
      loading: false,
    });
  }

  async fetchDetalleAjuste(id) {
    const params = {
      idAjuste: id,
    };

    const responde = await detailAjuste(
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
    const { tipo, motivo, almacen, estado, fecha, hora, observacion } =
      this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Ajuste"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />

        <div>
          <div className="flex gap-3 mb-3">
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> A4
            </Button>
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> 80MM
            </Button>
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Cabecera</h2>

        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Fecha y Hora:
              </p>
            </div>
            <div className="w-4/5">
              <p className="text-base">
                {fecha} - {formatTime(hora)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Tipo de ajuste:
              </p>
            </div>
            <div className="w-4/5">
              <p className="text-base">
                {tipo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Motivo:
              </p>
            </div>
            <div className="w-4/5">
              <p className="text-base">
                {motivo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Almacen:
              </p>
            </div>
            <div className="w-4/5">
              <p className="text-base">
                {almacen}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Observación:
              </p>
            </div>
            <div className="w-4/5">
              <p className="text-base">
                {observacion}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-1/5">
              <p className="text-base text-gray-600">
                Estado:
              </p>
            </div>
            <div className="w-4/5">
              <p className={cn(
                "text-base",
                estado === 1 ? "text-green-500" : "text-red-500"
              )}>
                {estado === 1 ? 'ACTIVO' : 'ANULADO'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Detalles</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-gray-600 text-sm">
                <tr>
                  <th className="p-4 text-center">#</th>
                  <th className="p-4 text-center">Imagen</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right">Cantidad</th>
                  <th className="p-4 text-right">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {this.state.detalles.map((item, index) => {
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-700 tet-center">{item.id}</td>
                      <td className="p-4 text-center">
                        <div className="w-full flex justify-center">
                          <div className="max-w-28 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
                            <Image
                              default={images.noImage}
                              src={item.imagen}
                              alt={item.producto}
                              overrideClass="max-w-full max-h-full w-auto h-auto object-contain block"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">
                        <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
                        <p className="text-base font-bold">{item.producto}</p>
                      </td>
                      <td className="p-4 text-gray-700">{item.categoria}</td>
                      <td className="p-4 text-gray-700 text-right">{rounded(item.cantidad)}</td>
                      <td className="p-4 text-gray-900 font-medium text-right">
                        {item.unidad}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedAjusteDetalle = connect(
  mapStateToProps,
  null,
)(LogisticaAjusteDetalle);

export default ConnectedAjusteDetalle;
