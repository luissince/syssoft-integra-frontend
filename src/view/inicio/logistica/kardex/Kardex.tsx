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
import { BsDatabaseSlash } from 'react-icons/bs';
import { listKardex } from '@/network/rest/api-client';
import { alertKit } from 'alert-kit';
import { TIPO_PRODUCTO_ACTIVO_FIJO, TIPO_PRODUCTO_LOTE, tipoProductoMap } from '@/model/types/tipo-producto';
import { ProductFilterInterface } from '@/model/ts/interface/product';
import { cn } from '@/lib/utils';
import { TIPO_KARDEX_INGRESO, TIPO_KARDEX_SALIDA } from '@/model/types/tipo-kardex';
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

  producto: ProductFilterInterface | null;
  cantidad: number;
  costo: number;
  valor: number;

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
      return;
    }

    const params = {
      idSucursal: this.state.idSucursal,
    };

    const response = await comboAlmacen(params, this.abortControllerTable.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Kardex",
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
    this.props.setKardexData(this.state);
  }

  async fetchFiltrarProducto(params: Record<string, any>) {
    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async loadDataKardex(idProducto: string) {
    const params = {
      idProducto: idProducto,
      idAlmacen: this.state.idAlmacen,
    };

    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const { success, data: kardex, message } = await listKardex(params, this.abortControllerTable.signal);

    if (!success) {
      alertKit.warning({
        title: "Kardex",
        message: message,
      });
      return;
    }

    const { cantidad, valor } = kardex.reduce((acc: { cantidad: number, valor: number }, item) => {
      const cantidadItem = Number(item.cantidad) || 0;
      const costoItem = Number(item.costo) || 0;

      const factor = item.idTipoKardex === TIPO_KARDEX_INGRESO ? 1 : -1;

      acc.cantidad += factor * cantidadItem;
      acc.valor += factor * costoItem * cantidadItem;

      return acc;
    }, { cantidad: 0, valor: 0 });

    const costo = isEmpty(kardex) ? 0 : kardex[kardex.length - 1].costo;

    this.setState({
      lista: kardex,
      cantidad: cantidad,
      costo: costo,
      valor: valor,
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

  handleSelectAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { producto, almacenes } = this.state;

    const nombreAlmacen = isEmpty(event.target.value)
      ? "TODOS LOS ALMACENES"
      : almacenes.find((item) => item.idAlmacen === event.target.value)?.nombre;

    this.setState({
      idAlmacen: event.target.value,
      nombreAlmacen: nombreAlmacen,
    }, () => {
      if (producto) {
        this.loadDataKardex(producto.idProducto);
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar producto
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = async () => {
    this.setState({ productos: [], producto: null });
  };

  handleFilterProducto = async (value: string) => {
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

  handleSelectItemProducto = async (value: ProductFilterInterface) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState({
      producto: value,
      productos: [],
    }, () => {
      this.loadDataKardex(value.idProducto);
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Métodos de utilidad
  |--------------------------------------------------------------------------
  */

  getLoteIcon = (fechaVencimiento: any) => {
    const fechaVenc = new Date(fechaVencimiento);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 30 && diasRestantes > 0) {
      return (
        <span className="text-warning" title="Próximo a vencer">⚠️</span>
      );
    }

    if (diasRestantes <= 0) {
      return (
        <span className="text-danger" title="Vencido">🚫</span>
      );
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

  renderInformacionProducto() {
    const { producto, nombreAlmacen, cantidad, costo, valor } = this.state;

    const { codiso } = this.props.moneda;

    if (!producto) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 animate-pulse mb-3">
          <div className="lg:col-span-3 rounded border p-3">
            <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>

            <div className="flex flex-col gap-3">
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>

          {/* Imagen skeleton */}
          <div className="rounded border p-6 flex items-center justify-center">
            <div className="w-40 h-40 bg-gray-300 rounded"></div>
          </div>
        </div>
      );
    }

    const tipoProducto = tipoProductoMap.get(producto.idTipoProducto);
    if (!tipoProducto) return null;

    const { icon: Icon, color, label } = tipoProducto;

    return (
      <div className="max-w-7xl mx-auto mb-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-3">
          <div className="lg:col-span-3 rounded border p-3 gap-3">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-base font-semibold text-gray-900">
                Información del Producto
              </h5>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Código:</strong> {producto.codigo}
              </p>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Nombre:</strong> {producto.nombre}
              </p>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Almacén:</strong> {nombreAlmacen}
              </p>
              <div className="flex items-center gap-1">
                <strong className="text-sm text-gray-900">Tipo Producto:</strong>
                <span className={cn("text-sm flex items-center gap-1", color)}>
                  <Icon size={17} />
                  {label}
                </span>
              </div>
            </div>
          </div>

          {/*  Imagen del producto */}
          <div className="rounded border p-6 flex items-center justify-center">
            <Image
              default={images.noImage}
              src={producto.imagen || null}
              alt={producto.nombre || 'Producto sin imagen'}
              overrideClass="w-40 h-40 object-contain"
            />
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded border p-6">
            <p className="text-sm font-medium text-gray-600">Unidades Disponibles</p>
            <p className="text-xl font-bold text-gray-900">{rounded(cantidad)}</p>
          </div>
          <div className="bg-white rounded border p-6">
            <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(costo, codiso)}</p>
          </div>
          <div className="bg-white rounded border p-6">
            <p className="text-sm font-medium text-gray-600">Valor Total</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(valor, codiso)}</p>
          </div>
        </div>
      </div>
    );
  }

  renderGenerateBody() {
    const { loading, messageTable, lista, producto } = this.state;

    const { codiso } = this.props.moneda;

    if (!producto) {
      return (
        <tr>
          <td colSpan={10} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</p>
              <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    };

    const tipo = producto.idTipoProducto === TIPO_PRODUCTO_LOTE || producto.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO;

    if (loading) {
      return (
        <SpinnerTable colSpan={tipo ? 12 : 10} message={messageTable} />
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr>
          <td colSpan={tipo ? 12 : 10} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <BsDatabaseSlash className="w-12 h-12 text-gray-400" />
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
      // Determinar el factor de cantidad y costo
      const factor = item.idTipoKardex === TIPO_KARDEX_INGRESO ? 1 : -1;
      cantidadAcumulada += factor * Number(item.cantidad);
      costoAcumulado += factor * Number(item.costo) * Number(item.cantidad);

      const esIngreso = item.idTipoKardex === TIPO_KARDEX_INGRESO;
      const esSalida = item.idTipoKardex === TIPO_KARDEX_SALIDA;

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

          {
            producto && producto.idTipoProducto === TIPO_PRODUCTO_LOTE && (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  {this.getLoteIcon(item.fechaVencimiento)}
                  <div className="ml-2">
                    <div className="font-medium">{item.lote}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(item.fechaVencimiento), 'dd/MM/yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.ubicacion}
                    </div>
                  </div>
                </div>
              </td>
            )
          }

          {
            producto && producto.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="ml-2">
                    <div className="font-medium">{item.serie}</div>
                    <div className="text-xs text-gray-500">
                      {item.ubicacion}
                    </div>
                  </div>
                </div>
              </td>
            )
          }

          {/* Ingreso: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={esIngreso ? 'text-green-700' : 'text-gray-400'}>
              {esIngreso ? `+${rounded(item.cantidad)}` : '--'}
            </span>
          </td>

          {/* Ingreso: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            <span className={esIngreso ? 'text-green-700' : 'text-gray-400'}>
              {esIngreso ? formatCurrency(item.costo, codiso) : '--'}
            </span>
          </td>

          {/* Ingreso: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={esIngreso ? 'text-green-700' : 'text-gray-400'}>
              {esIngreso ? `+${formatCurrency(item.costo * item.cantidad, codiso)}` : '--'}
            </span>
          </td>

          {/* Salida: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={esSalida ? 'text-red-600' : 'text-gray-400'}>
              {esSalida ? `-${rounded(item.cantidad)}` : '--'}
            </span>
          </td>

          {/* Salida: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            <span className={esSalida ? 'text-red-600' : 'text-gray-400'}>
              {esSalida ? formatCurrency(item.costo, codiso) : '--'}
            </span>
          </td>

          {/* Salida: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
            <span className={esSalida ? 'text-red-600' : 'text-gray-400'}>
              {esSalida ? `-${formatCurrency(item.costo * item.cantidad, codiso)}` : '--'}
            </span>
          </td>

          {/* Saldo: Cantidad */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-500">
            {rounded(cantidadAcumulada)}
          </td>

          {/* Saldo: Costo Unitario */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
            {formatCurrency(cantidadAcumulada > 0 ? costoAcumulado / cantidadAcumulada : 0, codiso)}
          </td>

          {/* Saldo: Total */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-500">
            {formatCurrency(costoAcumulado, codiso)}
          </td>
        </tr>
      );
    });
  }

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  render() {
    const { producto } = this.state;

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
        <div className="max-w-7xl mx-auto mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <SearchInput
                ref={this.refProducto}
                autoFocus={true}
                label={<p className="mb-2">Filtrar los productos por código o nombre:</p>}
                placeholder="Filtrar productos..."
                refValue={this.refValueProducto}
                data={this.state.productos}
                handleClearInput={this.handleClearInputProducto}
                handleFilter={this.handleFilterProducto}
                handleSelectItem={this.handleSelectItemProducto}
                renderItem={(value: ProductFilterInterface) => (
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
                classNameContainer="w-full relative group"
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

        {/* Información del producto */}
        {this.renderInformacionProducto()}

        {/* Tabla de movimientos */}
        <div className="rounded border border-gray-200 overflow-hidden">
          {/* Encabezado de la tabla */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Movimientos de Kardex</h2>
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"
                  >
                    Fecha
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"
                  >
                    Descripción
                  </th>
                  {
                    producto && producto.idTipoProducto === TIPO_PRODUCTO_LOTE && (
                      <th
                        rowSpan={2}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"
                      >
                        Lote
                      </th>
                    )
                  }
                  {
                    producto && producto.idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && (
                      <th
                        rowSpan={2}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"
                      >
                        Serie
                      </th>
                    )
                  }
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 w-[20%]"
                  >
                    Ingreso
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50 w-[20%]"
                  >
                    Salida
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 w-[20%]"
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
    kardex: state.predeterminado.kardex,
  };
};

const mapDispatchToProps = { setKardexData, setKardexPaginacion };

/**
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedKardex = connect(mapStateToProps, mapDispatchToProps)(Kardex);

export default ConnectedKardex;
