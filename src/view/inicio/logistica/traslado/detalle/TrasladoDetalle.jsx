import {
  formatTime,
  rounded,
  isText,
} from '../../../../../helper/utils.helper';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import { detailTraslado, getPdfTraslado } from '../../../../../network/rest/principal.network';
import { CANCELED } from '../../../../../model/types/types';
import { connect } from 'react-redux';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import { images } from '../../../../../helper';
import Image from '../../../../../components/Image';
import pdfVisualizer from 'pdf-visualizer';
import { cn } from '@/lib/utils';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class TrasladoDetalle extends CustomComponent {

  /**
   * Crea una nueva instancia del componente Venta.
   *
   * @param {Object} props - Propiedades recibidas del componente padre.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTraslado: '',
      cabecera: null,
      detalles: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
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

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  async loadDataId(idTraslado) {
    const params = {
      idTraslado: idTraslado
    }

    const { success, data, message, type } = await detailTraslado(
      params,
      this.abortControllerView.signal,
    );

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: 'Traslado',
        message: message,
      }, () => {
        this.close();
      });
      return;
    }

    this.setState({
      idTraslado: idTraslado,
      cabecera: data.cabecera,
      detalles: data.detalles,
      loading: false,
    });
  }

  close = () => {
    this.props.history.goBack();
  };

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


  //------------------------------------------------------------------------------------------
  // Eventos para impresión
  //------------------------------------------------------------------------------------------

  /**
   * Función para imprimir el pdf
   * @param {string} size - Tamaño del pdf A4, 80mm, 58mm
   * @returns {Promise<void>}
   */
  handlePrintPdf = async (size) => {
    const url = getPdfTraslado(this.state.idTraslado, size);

    await pdfVisualizer.init({
      url: url,
      title: 'Traslado',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
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

  renderCabecera() {
    const { loading, cabecera, detalles } = this.state;

    if (loading) return null;

    return (
      <div className="mb-8 bg-white overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800">Cabecera</h2>
        <div className="divide-y divide-gray-100">
          {[
            {
              label: 'Fecha y Hora', value: () => {
                return cabecera.fecha + ' ' + formatTime(cabecera.hora);
              }
            },
            {
              label: 'Tipo Traslado', value: () => {
                return cabecera.tipo
              }
            },
            {
              label: 'Motivo', value: () => {
                return cabecera.motivo;
              }
            },
            { label: 'Sucursal de Origen', value: () => cabecera.sucursalOrigen },
            { label: 'Almacen de Origen', value: () => cabecera.almacenOrigen },

            { label: 'Sucursal de Destino', value: () => cabecera.sucursalDestino },
            { label: 'Almacen de Destino', value: () => cabecera.almacenDestino },

            {
              label: 'Estado', value: () => {
                return (
                  <span className={cn(
                    "inline-flex items-center rounded-full",
                    "text-xs font-medium",
                    "px-2.5 py-0.5",
                    cabecera.estado === 0 && "bg-red-100 text-red-800",
                    cabecera.estado === 1 && "bg-green-100 text-green-800",
                  )}>
                    {cabecera.estado === 1 ? 'ACTIVO' : 'ANULADO'}
                  </span>
                );
              }
            },

            { label: 'Observación', value: () => cabecera.observacion },

          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
              <p>{item.label}</p>
              <p className="md:col-span-3 font-bold">{item.value()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderDetalles() {
    const { loading, cabecera, detalles } = this.state;

    if (loading) return null;

    return (
      <div className="mb-8 bg-white overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Detalles</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-gray-600 text-sm">
              <tr>
                <th className="p-4 text-center">#</th>
                <th className="p-4 text-center">Imagen</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Medida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {
                detalles.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 text-center">{item.id}</td>
                    <td className="p-4 text-center">
                      <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.producto}
                        width={80}
                        className="mx-auto rounded border border-gray-200"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-sm text-gray-500">{item.codigo}</p>
                      <p className="text-black uppercase">{item.producto}</p>
                    </td>
                    <td className="p-4">{item.categoria}</td>
                    <td className="p-4">{rounded(item.cantidad)}</td>
                    <td className="p-4">{item.medida}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const {
      cabecera,
      detalles
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        {/* Titulo */}
        <Title
          title="Traslado"
          subTitle="DETALLE"
          handleGoBack={() => this.props.history.goBack()}
        />


        {/* Acciones */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintPdf.bind(this, 'A4')}
          >
            <i className="fa fa-print"></i> A4
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintPdf.bind(this, '80mm')}
          >
            <i className="fa fa-print"></i> 80MM
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={this.handlePrintPdf.bind(this, '58mm')}
          >
            <i className="fa fa-print"></i> 58MM
          </button>
        </div>

        {/* Cabecera */}
        {this.renderCabecera()}

        {/* Detalles */}
        {this.renderDetalles()}
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
