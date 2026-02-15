import React from 'react';
import {
  isEmpty,
  formatTime,
  rounded,
  formatCurrency,
  getPathNavigation,
} from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
  comboAlmacen,
  filtrarProducto,
  listKardex,
} from '@/network/rest/principal.network';
import { connect } from 'react-redux';
import SearchInput from '@/components/SearchInput';
import { CANCELED } from '@/constants/requestStatus';
import Title from '@/components/Title';
import { SpinnerTable, SpinnerView } from '@/components/Spinner';
import { Link } from 'react-router-dom';
import {
  setKardexData,
  setKardexPaginacion,
} from '@/redux/predeterminadoSlice';
import Select from '@/components/Select';
import Image from '@/components/Image';
import { images } from '@/helper';

interface Props {
  token: {
    project: {
      idSucursal: string;
      nombre: string;
    };
    userToken: {
      idUsuario: string;
    };
  };
  moneda: {
    codiso: string;
  };
  history: {
    goBack: () => void,
  };
  kardex: {
    data: any;
    paginacion: any;
  };
  setKardexData: (data: any) => void;
  setKardexPaginacion: (paginacion: any) => void;
}

interface State {
  initialLoad: boolean;
  initialMessage: string;

  producto: any;
  cantidad: number;
  costo: number;
  valor: number;
  manejaLote: boolean;

  productos: Array<any>;

  idAlmacen: string;
  nombreAlmacen: string;
  almacenes: Array<any>;

  loading: boolean;
  lista: Array<any>;
  restart: boolean;

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
class Kardex extends CustomComponent<Props, State> {

  private refProducto: React.RefObject<SearchInput>;
  private refValueProducto: React.RefObject<HTMLInputElement>;
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

      producto: null,
      cantidad: 0,
      costo: 0,
      valor: 0,
      manejaLote: false,

      productos: [],

      idAlmacen: "",
      nombreAlmacen: "-",
      almacenes: [],

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,

      messageTable: "Cargando información...",

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();
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
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (this.props.kardex && this.props.kardex.data) {
      this.setState(this.props.kardex.data);
    } else {
      const [almacenes] = await Promise.all([
        this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
      ]);

      const almacenFilter = almacenes.find((item) => item.predefinido === 1);

      this.setState({
        almacenes,
        idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
        initialLoad: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setKardexData(this.state);
  }

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;
      return [];
    }
  }

  async fetchListarKardex(params) {
    const response = await listKardex(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;
      return [];
    }
  }

  async fetchFiltrarProducto(params) {
    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async loadDataKardex(idProducto) {
    const params = {
      idProducto: idProducto,
      idAlmacen: this.state.idAlmacen,
      idSucursal: this.state.idSucursal,
    };

    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const kardex = await this.fetchListarKardex(params);

    // Verificar si el producto maneja lotes
    const manejaLote = kardex.length > 0 ? kardex[0].manejaLote === 1 : false;

    const cantidad = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === "INGRESO"
          ? parseFloat(item.cantidad)
          : -parseFloat(item.cantidad);
      return accumlate;
    }, 0);

    const valor = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === "INGRESO"
          ? Number(item.costo * item.cantidad)
          : -Number(item.costo * item.cantidad);
      return accumlate;
    }, 0);

    const costo = isEmpty(kardex) ? 0 : kardex[kardex.length - 1].costo;

    this.setState({
      lista: kardex,
      cantidad: cantidad,
      costo: costo,
      valor: valor,
      manejaLote: manejaLote,
      loading: false,
    }, () => {
      this.updateReduxState();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  */

  //------------------------------------------------------------------------------------------
  // Filtrar producto
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = async () => {
    this.setState({ productos: [], producto: null });
  };

  handleFilterProducto = async (value) => {
    const searchWord = value;
    this.setState({ producto: null });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProducto(params);
    this.setState({ productos });
  };

  handleSelectItemProducto = async (value) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState({
      producto: value,
      productos: [],
    }, () => {
      this.loadDataKardex(value.idProducto);
    });
  };

  handleSelectAlmacen = (event) => {
    this.setState({
      idAlmacen: event.target.value,
      nombreAlmacen: isEmpty(event.target.value)
        ? 'TODOS LOS ALMACENES'
        : this.refIdAlmacen.current.options[
          this.refIdAlmacen.current.selectedIndex
        ].innerText,
    }, () => {
      if (this.state.producto) {
        this.loadDataKardex(this.state.producto.idProducto);
      }
    });
  };


  /*
  |--------------------------------------------------------------------------
  | Métodos de utilidad
  |--------------------------------------------------------------------------
  */

  getLoteIcon = (codigoLote, fechaVencimiento) => {
    if (codigoLote === 'N/A') return '';
    if (codigoLote === 'SIN LOTE')
      return <span className="text-muted">📦</span>;

    // Verificar si está próximo a vencer (30 días)
    if (fechaVencimiento && fechaVencimiento !== 'SIN FECHA') {
      const [dia, mes, año] = fechaVencimiento.split('/');
      const fechaVenc = new Date(año, mes - 1, dia);
      const hoy = new Date();
      const diasRestantes = Math.ceil(
        (fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diasRestantes <= 30 && diasRestantes > 0) {
        return (
          <span className="text-warning" title="Próximo a vencer">
            ⚠️
          </span>
        );
      } else if (diasRestantes <= 0) {
        return (
          <span className="text-danger" title="Vencido">
            🚫
          </span>
        );
      }
    }

    return <span className="text-success">✅</span>;
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  */

  //------------------------------------------------------------------------------------------
  // Generar Body HTML
  //------------------------------------------------------------------------------------------

  generateBody() {
    const { loading, messageTable, manejaLote, lista } = this.state;

    if (loading) {
      return (
        <SpinnerTable colSpan={manejaLote ? 12 : 10} message={messageTable} />
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr>
          <td colSpan={manejaLote ? 12 : 10} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
              <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    let cantidadAcumulada = 0;
    let costoAcumulado = 0;

    return lista.map((item, index) => {
      cantidadAcumulada += item.tipo === "INGRESO" ? Number(item.cantidad) : -Number(item.cantidad);
      costoAcumulado += item.tipo === "INGRESO" ? Number(item.costo * item.cantidad) : -Number(item.costo * item.cantidad);

      // Determinar el color de fondo para filas alternas
      const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

      return (
        <tr key={index} className={`${rowBgColor} hover:bg-gray-100 transition-colors`}>
          {/* Fecha */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{item.fecha}</span>
              <span className="text-xs">{formatTime(item.hora)}</span>
            </div>
          </td>

          {/* Descripción */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <Link
              to={getPathNavigation(item.opcion, item.idNavegacion)}
              className="text-indigo-600 hover:text-indigo-900 font-medium"
            >
              {item.detalle}
            </Link>
          </td>

          {/* Lote (si aplica) */}
          {
            manejaLote && (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  {this.getLoteIcon(item.lote, item.fechaVencimiento)}
                  <div className="ml-2">
                    <div className="font-medium">{item.lote}</div>
                    <div className="text-xs text-gray-500">
                      {item.fechaVencimiento !== 'SIN FECHA' ? item.fechaVencimiento : 'Sin fecha'}
                    </div>
                  </div>
                </div>
              </td>
            )
          }

          {/* Ingreso: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={item.tipo === 'INGRESO' ? 'text-green-600' : 'text-gray-400'}>
              {item.tipo === 'INGRESO' ? `+${rounded(item.cantidad)}` : '--'}
            </span>
          </td>

          {/* Ingreso: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            <span className={item.tipo === 'INGRESO' ? 'text-green-600' : 'text-gray-400'}>
              {item.tipo === 'INGRESO' ? formatCurrency(item.costo, this.props.moneda.codiso) : '--'}
            </span>
          </td>

          {/* Ingreso: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={item.tipo === 'INGRESO' ? 'text-green-600' : 'text-gray-400'}>
              {item.tipo === 'INGRESO' ? `+${formatCurrency(item.costo * item.cantidad, this.props.moneda.codiso)}` : '--'}
            </span>
          </td>

          {/* Salida: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={item.tipo === 'SALIDA' ? 'text-red-600' : 'text-gray-400'}>
              {item.tipo === 'SALIDA' ? `-${rounded(item.cantidad)}` : '--'}
            </span>
          </td>

          {/* Salida: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            <span className={item.tipo === 'SALIDA' ? 'text-red-600' : 'text-gray-400'}>
              {item.tipo === 'SALIDA' ? formatCurrency(item.costo, this.props.moneda.codiso) : '--'}
            </span>
          </td>

          {/* Salida: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={item.tipo === 'SALIDA' ? 'text-red-600' : 'text-gray-400'}>
              {item.tipo === 'SALIDA' ? `-${formatCurrency(item.costo * item.cantidad, this.props.moneda.codiso)}` : '--'}
            </span>
          </td>

          {/* Saldo: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
            {rounded(cantidadAcumulada)}
          </td>

          {/* Saldo: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            {formatCurrency(cantidadAcumulada > 0 ? costoAcumulado / cantidadAcumulada : 0, this.props.moneda.codiso)}
          </td>

          {/* Saldo: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
            {formatCurrency(costoAcumulado, this.props.moneda.codiso)}
          </td>
        </tr>
      );
    });
  }

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  render() {
    const {
      producto,
      cantidad,
      costo,
      valor,
      manejaLote,
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Kardex"
          subTitle="Método Promedio Ponderado"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Filtros principales (estilo moderno) */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="md:col-span-3">
              <SearchInput
                ref={this.refProducto}
                autoFocus={true}
                label="Filtrar los productos por código o nombre:"
                placeholder="Filtrar productos..."
                refValue={this.refValueProducto}
                data={this.state.productos}
                handleClearInput={this.handleClearInputProducto}
                handleFilter={this.handleFilterProducto}
                handleSelectItem={this.handleSelectItemProducto}
                renderItem={(value) => (
                  <div className="flex items-center">
                    <Image
                      default={images.noImage}
                      src={value.imagen}
                      alt={value.nombre}
                      overrideClass="w-16 h-16 object-contain"
                    />
                    <div className="ml-2">
                      <p className="text-xs font-bold">{value.codigo}</p>
                      <p className="text-sm">{value.nombre}</p>
                    </div>
                  </div>
                )}
                renderIconLeft={<i className="bi bi-search"></i>}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Almacén
              </label>
              <Select
                group={false}
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

        {/* Información del producto */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 bg-white rounded border p-6 gap-3">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-base font-semibold text-gray-900">
                  Información del Producto
                </h5>
                {
                  manejaLote && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Maneja Lotes
                    </span>
                  )
                }
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Código:</strong> {producto && producto.codigo}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Nombre:</strong> {producto && producto.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Almacén:</strong> {this.state.nombreAlmacen}
                </p>
              </div>
            </div>

            <div className="bg-white rounded border p-6 flex items-center justify-center">
              <Image
                default={images.noImage}
                src={(producto && producto.imagen) || null}
                alt={(producto && producto.nombre) || 'Producto sin imagen'}
                overrideClass="w-40 h-40 object-contain"
              />
            </div>
          </div>

          {/* Tarjetas resumen */}
          {
            producto && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded border p-6">
                  <p className="text-sm font-medium text-gray-600">Unidades Disponibles</p>
                  <p className="text-xl font-bold text-gray-900">{rounded(cantidad)}</p>
                </div>
                <div className="bg-white rounded border p-6">
                  <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(costo, this.props.moneda.codiso)}</p>
                </div>
                <div className="bg-white rounded border p-6">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(valor, this.props.moneda.codiso)}</p>
                </div>
              </div>
            )
          }
        </div>

        {/* Tabla de movimientos */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Encabezado de la tabla */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Movimientos de Kardex</h2>
              {manejaLote && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-1">✅</span>
                    <span>Lote válido</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-orange-600 mr-1">⚠️</span>
                    <span>Próximo a vencer</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-1">🚫</span>
                    <span>Vencido</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenedor de la tabla con scroll horizontal */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado de la tabla */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: '120px' }}
                  >
                    Fecha
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: '200px' }}
                  >
                    Descripción
                  </th>
                  {manejaLote && (
                    <th
                      rowSpan={2}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: '150px' }}
                    >
                      Lote
                    </th>
                  )}
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50"
                  >
                    Ingreso
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50"
                  >
                    Salida
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50"
                  >
                    Saldo
                  </th>
                </tr>
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                    Costo Unit.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                    Costo Unit.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Costo Unit.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>

              {/* Cuerpo de la tabla */}
              <tbody className="bg-white divide-y divide-gray-200">
                {this.generateBody()}
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
    kardex: state.predeterminado.kardex,
  };
};

const mapDispatchToProps = { setKardexData, setKardexPaginacion };

/**
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedKardex = connect(mapStateToProps, mapDispatchToProps)(Kardex);

export default ConnectedKardex;
