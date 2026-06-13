import React from 'react';
import {
  isEmpty,
  formatTime,
  rounded,
  formatCurrency,
  getPathNavigation,
  formatDate,
  currentDate,
} from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
  comboAlmacen,
  listHistorial,
} from '@/network/rest/principal.network';
import { connect } from 'react-redux';
import SearchInput from '@/components/SearchInput';
import { CANCELED } from '@/constants/requestStatus';
import Title from '@/components/Title';
import { SpinnerTable, SpinnerView } from '@/components/Spinner';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import {
  sethistorialData,
  sethistorialPaginacion,
} from '@/redux/predeterminadoSlice';
import Select from '@/components/Select';
import Search from '@/components/Search';
import { BsDatabaseSlash } from 'react-icons/bs';
import { alertKit } from 'alert-kit';
import { HistorialFilterInterface } from '@/model/ts/interface/historial';
import { format } from 'date-fns';

interface Props {
  token: {
    project: {
      idSucursal: string;
      nombre: string;
    };
    userToken: {
      usuario: {
        idUsuario: string;
      };
    };
  };
  moneda: {
    codiso: string;
  };
  history: {
    goBack: () => void,
  };
  historial: {
    data: any;
    paginacion: any;
  };
  sethistorialData: (data: any) => void;
  sethistorialPaginacion: (paginacion: any) => void;
}

interface State {
  initialLoad: boolean;
  initialMessage: string;

  historial: HistorialFilterInterface | null;
  historiales: Array<any>;

  idAlmacen: string;
  nombreAlmacen: string;
  almacenes: Array<any>;

  fechaInicio: string,
  fechaFinal: string,

  loading: boolean;
  lista: Array<any>;
  restart: boolean;

  buscar: string,

  opcion: number;
  paginacion: number;
  totalPaginacion: number;
  filasPorPagina: number;

  messageTable: string;

  idSucursal: string;
  idUsuario: string;

}

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Historial extends CustomComponent<Props, State> {

  private refSearch: React.RefObject<SearchInput>;
  private refHistorial: React.RefObject<SearchInput>;
  private refValueHistorial: React.RefObject<HTMLInputElement>;
  private refIdAlmacen: React.RefObject<HTMLSelectElement>;

  private abortControllerTable: AbortController | null;

  /**
     *
     * Constructor
  */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: "Cargando datos...",

      historial: null,
      historiales: [],

      idAlmacen: "",
      nombreAlmacen: "-",
      almacenes: [],

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),

      loading: false,
      lista: [],
      restart: false,

      buscar: "",

      opcion: 0,
      paginacion: 1,
      totalPaginacion: 0,
      filasPorPagina: 10,

      messageTable: "Cargando información...",

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refSearch = React.createRef();

    this.refHistorial = React.createRef();
    this.refValueHistorial = React.createRef();
    this.refIdAlmacen = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  */
  async componentDidMount() {
    await this.loadingData();
    // Cargar historial inicial al montar la página
    await this.loadDataHistorial(0, '', '');
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (this.props.historial && this.props.historial.data) {
      this.setState(this.props.historial.data);
      return;
    }

    const params = {
      idSucursal: this.state.idSucursal,
    };

    const response = await comboAlmacen(params, this.abortControllerTable.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Historial",
        message: response.getMessage(),
      });
      return;
    }

    const almacenes = response.data;

    const almacenFilter = almacenes.find((item) => item.predefinido === 1);

    this.setState({
      almacenes,
      idAlmacen: almacenFilter ? almacenFilter.idAlmacen : "",
      nombreAlmacen: almacenFilter ? almacenFilter.nombre : "-",
      initialLoad: false,
    }, () => {
      this.updateReduxState();
    });
  };

  updateReduxState() {
    if (this.props.sethistorialData) this.props.sethistorialData(this.state);
  }

  handleGoBack = () => {
    try {
      if (this.props.history && typeof this.props.history.goBack === 'function') {
        this.props.history.goBack();
        return;
      }
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined' && window.history && typeof window.history.back === 'function') {
      window.history.back();
    }
  }

  async fetchFiltrarHistorial(params: Record<string, any>) {
    const response = await listHistorial(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async loadDataHistorial(opcion, buscar, almacen) {
    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      almacen: this.state.idAlmacen,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };


    const response = await listHistorial(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const data = response.data || [];
      const totalPaginacion = parseInt(
        String(Math.ceil(Number(data.result.total) / this.state.filasPorPagina)),
      );

      this.setState({ lista: data.result, loading: false, totalPaginacion: totalPaginacion }, () => {
        this.updateReduxState();
      });
    }

    if (response instanceof ErrorResponse) {
      alertKit.warning({
        title: "Historial",
        message: response.getMessage ? response.getMessage() : 'Ocurrió un error',
      });
      this.setState({ loading: false, lista: [], totalPaginacion: 0 });
      return [];
    }
  }

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: true, buscar: text });

    this.loadDataHistorial(1, text.trim(), '');
    await this.setStateAsync({ opcion: 1 });
  };

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  */

  handleSelectAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { historial, almacenes } = this.state;

    const nombreAlmacen = isEmpty(event.target.value)
      ? "TODOS LOS ALMACENES"
      : almacenes.find((item) => item.idAlmacen === event.target.value)?.nombre;

    this.setState({
      idAlmacen: event.target.value,
      nombreAlmacen: nombreAlmacen,
    }, () => {
      // Ejecutar fetchFiltrarHistorial al cambiar de almacén
      (async () => {
        const buscar = historial ? ((historial as any).idPersona || '') : '';
        const params = { opcion: 1, buscar, idAlmacen: event.target.value };
        this.setState({ loading: true, lista: [], messageTable: 'Cargando información...' });
        const data = await this.fetchFiltrarHistorial(params);
        this.setState({ lista: data || [], loading: false });
      })();
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar historial
  //------------------------------------------------------------------------------------------

  handleClearInputHistorial = async () => {
    this.setState({ historiales: [], historial: null });
  };

  //------------------------------------------------------------------------------------------
  // Generar Body HTML
  //------------------------------------------------------------------------------------------
  renderGenerateBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
              <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    if (this.state.loading) return <SpinnerTable colSpan={8} message={this.state.messageTable} />;

    if (isEmpty(this.state.lista)) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
              <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return (
      this.state.lista.map((item, index) => {
        const esIngreso = item.tipo === "ENTREGA";
        const esSalida = item.tipo === "DEVOLUCION";

        return (
          <tr key={index} className={esIngreso ? "bg-green-50" : "bg-yellow-50"}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.id}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.responsable}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.activo}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.area}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.serie}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.correlativo}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {format(item.fecha, "dd-MM-yyyy")}<br />
              <span className="text-xs text-gray-500">{formatTime(item.hora)}</span>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.tipo}
            </td>
          </tr>
        );
      })
    )
  }

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  render() {
    const { historial } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Historial"
          subTitle="MOVIMIENTOS"
          handleGoBack={() => this.handleGoBack()}
        />

        {/* Filtros principales (estilo moderno) */}
        <div className="max-w-7xl mx-auto mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 flex flex-col gap-2">
              <div>
                Buscar
              </div>
              <Search
                group={true}
                iconLeft={<i className="bi bi-search text-gray-400"></i>}
                ref={this.refSearch}
                onSearch={this.searchText}
                placeholder="Buscar por comprobante o cliente..."
                theme="modern"
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Select
                group={false}
                label={<p>Almacén:</p>}
                ref={this.refIdAlmacen}
                value={this.state.idAlmacen}
                onChange={this.handleSelectAlmacen}
                className="w-full"
              >
                <option value="">-- Todos los Almacenes --</option>
                {this.state.almacenes.map((item, index) => {
                  return (
                    <option key={index} value={item.idAlmacen}>
                      {item.nombre}
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>
        </div>

        {/* Tabla de movimientos */}
        <div className="rounded border border-gray-200 overflow-hidden">
          {/* Encabezado de la tabla */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Movimientos de Asigancion</h2>
            </div>
          </div>

          {/* Contenedor de la tabla con scroll horizontal */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado de la tabla */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Id</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correlativo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Movimiento</th>
                </tr>
              </thead>

              {/* Cuerpo de la tabla */}
              <tbody className="bg-white divide-y divide-gray-200">
                {this.renderGenerateBody()}
              </tbody>
            </table>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

/**
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    historial: state.predeterminado.historial,
  };
};

const mapDispatchToProps = { sethistorialData, sethistorialPaginacion };

/**
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedHistorial = connect(mapStateToProps, mapDispatchToProps)(Historial);

export default withRouter(ConnectedHistorial);


// const Historiales = () => {
//   const history = useHistory();
//   const [historial, setHistorial] = useState<HistorialesInterface[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [paginacion, setPaginacion] = useState(1);
//   const [totalPaginacion, setTotalPaginacion] = useState(0);
//   const [filasPorPagina] = useState(10);

//   useEffect(() => {
//     const fetchHistorial = async () => {
//       setLoading(true);
//       // Simulación de llamada API
//       const mockData: HistorialesInterface[] = [
//         { id: 1, activo: "Laptop Dell XPS 15", serie: "SN001", responsable: "Juan Pérez", area: "Ventas", fechaAsignacion: "01/04/2026", fechaDevolucion: "05/04/2026", estado: "Devuelto" },
//         { id: 2, activo: "Proyector Epson", serie: "SN002", responsable: "María López", area: "Soporte Técnico", fechaAsignacion: "02/04/2026", fechaDevolucion: null, estado: "Asignado" },
//       ];
//       setHistorial(mockData);
//       setTotalPaginacion(Math.ceil(mockData.length / filasPorPagina));
//       setLoading(false);
//     };
//     fetchHistorial();
//   }, []);

//   const renderBody = () => {
//     if (historial.length === 0) {
//       return (
//         <tr>
//           <td colSpan={7} className="px-6 py-12 text-center">
//             <div className="flex flex-col items-center">
//               <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
//               <p className="mt-2 text-sm font-medium text-gray-900">No hay registros</p>
//             </div>
//           </td>
//         </tr>
//       );
//     }

//     return historial.map((item) => (
//       <tr key={item.id} className={item.fechaDevolucion ? "bg-green-50" : "bg-yellow-50"}>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.activo}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.serie}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.responsable}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.area}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.fechaAsignacion}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">{item.fechaDevolucion || "---"}</td>
//         <td className="px-6 py-4 text-sm text-gray-900">
//           <span className={`px-2 py-1 rounded-full text-xs ${item.fechaDevolucion ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
//             {item.estado}
//           </span>
//         </td>
//       </tr>
//     ));
//   };

//   return (
//     <ContainerWrapper>
//       <SpinnerView loading={loading} message="Cargando historial..." />

//       <Title
//         title="Historial"
//         subTitle="ASIGNACIONES"
//         handleGoBack={() => history.goBack()}
//       />

//       <Title
//           title="Historial"
//           subTitle="ASIGNACIONES"
//           handleGoBack={() => this.props.history.goBack()}
//         />

//       <div className="rounded border border-gray-200 overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serie</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Asignación</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Devolución</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {renderBody()}
//           </tbody>
//         </table>

//         {/* <Paginacion
//           totalPaginacion={totalPaginacion}
//           paginacion={paginacion}
//           fillTable={setPaginacion}
//           theme="modern"
//           className="md:px-4 py-3 bg-white border-t border-gray-200"
//         /> */}
//       </div>
//     </ContainerWrapper>
//   );
// };

// export default Historiales;