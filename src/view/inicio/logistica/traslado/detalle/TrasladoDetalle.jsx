import {
  formatTime,
  rounded,
  isText,
} from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { detailTraslado } from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import { images } from '@/helper';
import Image from '@/components/Image';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class TrasladoDetalle extends CustomComponent {

  /**
  * Inicializa un nuevo componente.
  * @param {Object} props - Las propiedades pasadas al componente.
  */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando datos...",

      idAjuste: "",

      tipo: "",
      almacenOrigen: "",
      almacenDestino: "",
      sucursalDestino: "",
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

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  componentDidMount() {
    const url = this.props.location.search;
    const idTraslado = new URLSearchParams(url).get("idTraslado");
    if (isText(idTraslado)) {
      this.loadDataId(idTraslado);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

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

  /*
 |--------------------------------------------------------------------------
 | Método de renderizado
 |--------------------------------------------------------------------------
 |
 | El método render() es esencial en los componentes de React y se encarga de determinar
 | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
 | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
 | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
 | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
 | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
 | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
 | actuales del componente para determinar lo que se mostrará.
 |
 */


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

        <div>
          <div className="flex flex-wrap gap-3 mb-3">
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> A4
            </Button>{' '}
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> 80MM
            </Button>{' '}
            <Button
              className="btn-light"
            >
              <i className="fa fa-print"></i> 58MM
            </Button>
          </div>
        </div>

        {/* Resumen de la venta */}
        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800">Cabecera</h2>

          <div className="mb-3">
            {
              [
                { label: "Fecha y Hora:", value: `${fecha} - ${formatTime(hora)}` },
                { label: "Tipo de traslado:", value: tipo },
                { label: "Motivo:", value: motivo },
                { label: "Almacen de Origen:", value: almacenOrigen },
                { label: "Sucursal de Destino:", value: sucursalDestino },
                { label: "Almacen de Destino:", value: almacenDestino },
                { label: "Observación:", value: observacion },
                { label: "Estado:", value: estado === 1 ? 'ACTIVO' : 'ANULADO', valueClass: estado === 1 ? "text-green-500" : "text-red-500" },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-5 py-2">
                  <p className="text-sm text-gray-600 uppercase">
                    {item.label}
                  </p>
                  <p className={cn(
                    "text-sm ext-gray-900 font-medium",
                    item.valueClass ?? ""
                  )}>
                    {item.value}
                  </p>
                </div>
              ))
            }
          </div>
        </div>

        <div className="mb-8 bg-white overflow-hidden">
          <h2 className="text-base font-semibold text-gray-800 mb-3 uppercase">Detalles</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="p-4 text-center text-sm uppercase">#</th>
                  <th className="p-4 text-center text-sm uppercase">Imagen</th>
                  <th className="p-4 text-sm uppercase">Producto</th>
                  <th className="p-4 text-sm uppercase">Categoría</th>
                  <th className="p-4 text-right text-sm uppercase">Cantidad</th>
                  <th className="p-4 text-right text-sm uppercase">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {
                  this.state.detalles.map((item, index) => {
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-700 tet-center">{item.id}</td>
                        <td className="p-4 text-center">
                          <div className="w-full flex justify-center">
                            <div className="w-28 aspect-square relative flex items-center justify-center overflow-hidden border border-gray-200">
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
                  })
                }
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
const ConnectedTrasladoDetalle = connect(
  mapStateToProps,
  null,
)(TrasladoDetalle);

export default ConnectedTrasladoDetalle;
