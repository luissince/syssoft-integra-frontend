import {
  isEmpty,
  convertNullText,
  numberFormat,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  deleteProducto,
  listProducto,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { images } from '../../../../../helper';
import Title from '../../../../../components/Title';
import { SpinnerTable } from '../../../../../components/Spinner';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../components/Table';
import Image from '../../../../../components/Image';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import {
  setListaProductoData,
  setListaProductoPaginacion,
} from '../../../../../redux/predeterminadoSlice';
import React from 'react';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Productos extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      // add: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[1].privilegio[0].estado,
      // ),
      // view: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[1].privilegio[1].estado,
      // ),
      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[1].privilegio[2].estado,
      // ),
      // remove: statePrivilegio(
      //   this.props.token.userToken.menus[3].submenu[1].privilegio[3].estado,
      // ),

      loading: false,
      lista: [],
      restart: false,

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codiso: convertNullText(this.props.moneda.codiso),

      vista: 'tabla',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    if (
      this.props.productoLista &&
      this.props.productoLista.data &&
      this.props.productoLista.paginacion
    ) {
      this.setState(this.props.productoLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.productoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.productoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.productoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.productoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.productoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.productoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.productoLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaProductoData(this.state);
    this.props.setListaProductoPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  loadingInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listProducto(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState(
        {
          loading: false,
          lista: response.data.result,
          totalPaginacion: totalPaginacion,
        },
        () => {
          this.updateReduxState();
        },
      );
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable:
          'Se produjo un error interno, intente nuevamente por favor.',
      });
    }
  };

  handleChangeView = (value) => {
    this.setState({ vista: value });
  };

  handleAgregar = async () => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/agregar`,
    });
  };

  handleEditar(idProducto) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/editar`,
      search: '?idProducto=' + idProducto,
    });
  }

  handleMostrar = (idProducto) => {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/detalle`,
      search: '?idProducto=' + idProducto,
    });
  };

  handleEliminar = (idProducto) => {
    alertKit.question({
      title: 'Producto',
      message: '¿Estás seguro de eliminar el producto?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (event) => {
      if (event) {
        alertKit.loading({ message: 'Procesando información...' });

        const params = {
          idProducto: idProducto,
          idUsuario: this.state.idUsuario,
        };

        const response = await deleteProducto(params);

        if (response instanceof ErrorResponse) {
          alertKit.warning({
            title: 'Producto',
            message: response.getMessage(),
          });
          return;
        }

        alertKit.success({
          title: 'Producto',
          message: response.data,
        }, () => {
          this.loadingInit();
        });
      }
    });
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan="10"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="10">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const tipo = function () {
        if (item.tipo === 'PRODUCTO') {
          return (
            <>
              <span>
                Producto <i className="bi bi-basket"></i>
              </span>
              <br />
              <span>{item.venta}</span>
            </>
          );
        }

        if (item.tipo === 'SERVICIO') {
          return (
            <>
              <span>
                Servicio <i className="bi bi-person-workspace"></i>{' '}
              </span>
              <br />
              <span>{item.venta}</span>
            </>
          );
        }

        return (
          <>
            <span>
              Combo <i className="bi bi-fill"></i>{' '}
            </span>
            <br />
            <span>{item.venta}</span>
          </>
        );
      };

      const estado =
        item.estado === 1 ? (
          <span className="badge badge-success">Activo</span>
        ) : (
          <span className="badge badge-danger">Inactivo</span>
        );

      return (
        <TableRow key={index}>
          <TableCell className="text-center">{item.id}</TableCell>
          <TableCell>{tipo()}</TableCell>
          <TableCell>
            {item.codigo}
            <br />
            <b>{item.nombre}</b>{' '}
            {item.preferido === 1 && (
              <i className="fa fa-star text-warning"></i>
            )}
          </TableCell>
          <TableCell className="text-right">
            {numberFormat(item.precio, this.state.codiso)}
          </TableCell>
          <TableCell>{item.medida}</TableCell>
          <TableCell>{item.categoria}</TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell>
            <Image
              default={images.noImage}
              src={item.imagen}
              alt={item.nombre}
              width={100}
            />
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              title="Editar"
              // disabled={!this.state.edit}
              onClick={() => this.handleEditar(item.idProducto)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-danger btn-sm"
              title="Anular"
              // disabled={!this.state.remove}
              onClick={() => this.handleEliminar(item.idProducto)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    const { vista } = this.state;

    return (
      <ContainerWrapper>
        {/* Encabezado */}
        <Title
          title="Productos"
          subTitle="Gestión de productos"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Acciones principales + Toggle vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i>
              Nuevo Registro
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Recargar Vista
            </button>
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => this.handleChangeView('tabla')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1 ${vista === 'tabla'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => this.handleChangeView('cuadricula')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1 ${vista === 'cuadricula'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar producto
            </label>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search text-gray-400"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por código o nombre..."
              theme="modern"
            />
          </div>
        </div>

        {/* Render condicional: Tabla o Cuadrícula */}
        {vista === 'tabla' ? (
          /* 📊 Vista Tabla */
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Medida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24 text-center">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28 text-center">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20 text-center">
                      Editar
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20 text-center">
                      Eliminar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {this.state.loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                          <p className="text-gray-500">
                            Cargando información...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : isEmpty(this.state.lista) ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <i className="bi bi-box text-4xl mb-3 block text-gray-400"></i>
                          <p className="text-lg font-medium">
                            No se encontraron productos
                          </p>
                          <p className="text-sm">Intenta cambiar el filtro</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    this.state.lista.map((item, index) => {
                      const tipo = item.tipo === 'PRODUCTO'
                        ? 'Producto 🛒'
                        : item.tipo === 'SERVICIO'
                          ? 'Servicio 👷'
                          : 'Combo 🎁';

                      const estadoClass =
                        item.estado === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800';

                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {tipo}
                            <div className="text-base text-gray-500">{item.venta}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.codigo}
                            </div>
                            {item.preferido === 1 && (
                              <div className="mt-1 inline-flex items-center text-yellow-500">
                                <i className="fa fa-star text-base mr-1"></i>
                                <span className="text-base">Preferido</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            {numberFormat(item.precio, this.state.codiso)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.medida}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.categoria}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${estadoClass}`}
                            >
                              {item.estado === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Image
                              default={images.noImage}
                              src={item.imagen}
                              alt={item.nombre}
                              width={60}
                              className="mx-auto rounded border border-gray-200"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                              title="Editar"
                              onClick={() => this.handleEditar(item.idProducto)}
                            >
                              <i className="bi bi-pencil text-lg"></i>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-300"
                              title="Eliminar"
                              onClick={() => this.handleEliminar(item.idProducto)}
                            >
                              <i className="bi bi-trash text-lg"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              ref={this.refPaginacion}
              loading={this.state.loading}
              data={this.state.lista}
              totalPaginacion={this.state.totalPaginacion}
              paginacion={this.state.paginacion}
              fillTable={this.paginacionContext}
              restart={this.state.restart}
              className="md:px-4 py-3 bg-white border-t border-gray-200"
              theme="modern"
            />
          </div>
        ) : (
          /* 🟦 Vista Cuadrícula */
          <div className="space-y-6">
            {this.state.loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : isEmpty(this.state.lista) ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                <i className="bi bi-box text-5xl mb-4 block text-gray-400"></i>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron productos
                </p>
                <p className="text-sm text-gray-500">
                  Intenta cambiar el filtro de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {this.state.lista.map((item, index) => {
                  const tipo = item.tipo === 'PRODUCTO'
                    ? 'Producto 🛒'
                    : item.tipo === 'SERVICIO'
                      ? 'Servicio 👷'
                      : 'Combo 🎁';

                  const estadoClass =
                    item.estado === 1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800';

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border hover:shadow-md transition group overflow-hidden"
                    >
                      <div className=" bg-white flex items-center justify-center p-2">
                        <Image
                          default={images.noImage}
                          src={item.imagen}
                          alt={item.nombre}
                          overrideClass="w-full h-40 object-contain"
                        />
                      </div>
                      <div className="py-2 px-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {item.nombre}
                          </h5>
                          {item.preferido === 1 && (
                            <span className="text-yellow-500 ml-1">
                              <i className="fa fa-star text-sm"></i>
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500 mb-1">
                          <span className="font-medium">Código:</span> {item.codigo}
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Tipo:</span> {tipo} • {item.venta}
                        </div>

                        <div className="text-lg font-bold text-gray-900 mb-2">
                          {numberFormat(item.precio, this.state.codiso)}
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Medida:</span> {item.medida}
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Categoría:</span> {item.categoria}
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoClass}`}
                          >
                            {item.estado === 1 ? 'Activo' : 'Inactivo'}
                          </span>

                          <div className="flex gap-1">
                            <button
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                              title="Editar"
                              onClick={() => this.handleEditar(item.idProducto)}
                            >
                              <i className="bi bi-pencil text-lg"></i>
                            </button>
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-300"
                              title="Eliminar"
                              onClick={() => this.handleEliminar(item.idProducto)}
                            >
                              <i className="bi bi-trash text-lg"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Paginacion
              ref={this.refPaginacion}
              loading={this.state.loading}
              data={this.state.lista}
              totalPaginacion={this.state.totalPaginacion}
              paginacion={this.state.paginacion}
              fillTable={this.paginacionContext}
              restart={this.state.restart}
              className="md:px-2 py-3 bg-white border-t border-gray-200"
              theme="modern"
            />
          </div>
        )}
      </ContainerWrapper>
    );
  }

}

Productos.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  moneda: PropTypes.object,
  productoLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaProductoData: PropTypes.func,
  setListaProductoPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    productoLista: state.predeterminado.productoLista,
  };
};

const mapDispatchToProps = { setListaProductoData, setListaProductoPaginacion };

const ConnectedProductos = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Productos);

export default ConnectedProductos;
