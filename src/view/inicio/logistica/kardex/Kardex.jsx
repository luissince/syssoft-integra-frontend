import React from 'react';
import {
  isEmpty,
  formatTime,
  rounded,
  convertNullText,
  formatCurrency,
  getPathNavigation,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  comboAlmacen,
  filtrarProducto,
  listKardex,
} from '../../../../network/rest/principal.network';
import { connect } from 'react-redux';
import SearchInput from '../../../../components/SearchInput';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import { SpinnerTable, SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  setKardexData,
  setKardexPaginacion,
} from '../../../../redux/predeterminadoSlice';
import Select from '../../../../components/Select';
import Image from '../../../../components/Image';
import { images } from '../../../../helper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../components/Table';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class Kardex extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      producto: null,
      cantidad: 0,
      costo: 0,
      valor: 0,
      manejaLote: false,

      productos: [],

      idAlmacen: '',
      nombreAlmacen: 'TODOS LOS ALMACENES',
      almacenes: [],

      loading: false,
      lista: [],
      restart: false,

      // Filtros adicionales
      mostrarSinLote: true,
      filtroFecha: 'todos', // 'todos', 'hoy', 'semana', 'mes'

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codiso: convertNullText(this.props.moneda.codiso),

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
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

      this.setState(
        {
          almacenes,
          idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
          initialLoad: false,
        },
        () => {
          this.updateReduxState();
        },
      );
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
        item.tipo === 'INGRESO'
          ? parseFloat(item.cantidad)
          : -parseFloat(item.cantidad);
      return accumlate;
    }, 0);

    const valor = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === 'INGRESO'
          ? parseFloat(item.costo * item.cantidad)
          : -parseFloat(item.costo * item.cantidad);
      return accumlate;
    }, 0);

    const costo = isEmpty(kardex) ? 0 : kardex[kardex.length - 1].costo;

    this.setState(
      {
        lista: kardex,
        cantidad: cantidad,
        costo: costo,
        valor: valor,
        manejaLote: manejaLote,
        loading: false,
      },
      () => {
        this.updateReduxState();
      },
    );
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
    this.setState(
      {
        producto: value,
        productos: [],
      },
      () => {
        this.loadDataKardex(value.idProducto);
      },
    );
  };

  handleSelectAlmacen = (event) => {
    this.setState(
      {
        idAlmacen: event.target.value,
        nombreAlmacen: isEmpty(event.target.value)
          ? 'TODOS LOS ALMACENES'
          : this.refIdAlmacen.current.options[
              this.refIdAlmacen.current.selectedIndex
            ].innerText,
      },
      () => {
        if (this.state.producto) {
          this.loadDataKardex(this.state.producto.idProducto);
        }
      },
    );
  };

  handleToggleSinLote = () => {
    this.setState({ mostrarSinLote: !this.state.mostrarSinLote });
  };

  handleFilterFecha = (event) => {
    this.setState({ filtroFecha: event.target.value });
  };

  /*
  |--------------------------------------------------------------------------
  | Métodos de utilidad
  |--------------------------------------------------------------------------
  */

  getFilteredData = () => {
    let filteredData = this.state.lista;

    // Filtrar por lotes si es necesario
    if (this.state.manejaLote && !this.state.mostrarSinLote) {
      filteredData = filteredData.filter(
        (item) => item.codigoLote !== 'SIN LOTE',
      );
    }

    // Filtrar por fecha
    if (this.state.filtroFecha !== 'todos') {
      const today = new Date();
      const filterDate = new Date();

      switch (this.state.filtroFecha) {
        case 'hoy':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'mes':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }

      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.f);
        return itemDate >= filterDate;
      });
    }

    return filteredData;
  };

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
        (fechaVenc - hoy) / (1000 * 60 * 60 * 24),
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
    const { loading, messageTable, manejaLote, codiso } = this.state;

    if (loading) {
      return (
        <SpinnerTable
          colSpan={manejaLote ? '15' : '13'}
          message={messageTable}
        />
      );
    }

    const filteredData = this.getFilteredData();

    if (isEmpty(filteredData)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan={manejaLote ? '15' : '13'}>
            ¡No hay datos para mostrar!
          </TableCell>
        </TableRow>
      );
    }

    let cantidad = 0;
    let costo = 0;

    return filteredData.map((item, index) => {
      cantidad =
        cantidad +
        (item.tipo === 'INGRESO'
          ? parseFloat(item.cantidad)
          : -parseFloat(item.cantidad));
      costo =
        costo +
        (item.tipo === 'INGRESO'
          ? parseFloat(item.costo * item.cantidad)
          : -parseFloat(item.costo * item.cantidad));

      return (
        <TableRow key={index}>
          <TableCell>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </TableCell>
          <TableCell>
            <Link
              className="btn-link"
              to={getPathNavigation(item.opcion, item.idNavegacion)}
            >
              {item.detalle} <i className="bi bi-hand-index-fill"></i>
            </Link>
          </TableCell>

          {/* Columnas de lote (solo si el producto maneja lotes) */}
          {manejaLote && (
            <TableCell>
              <div className="d-flex align-items-center">
                {this.getLoteIcon(item.codigoLote, item.fechaVencimiento)}
                <span className="ml-1">{item.codigoLote}</span>
              </div>
              <div className="d-flex align-items-center">
                <span
                  className={
                    item.fechaVencimiento === 'SIN FECHA' ? 'text-muted' : ''
                  }
                >
                  {item.fechaVencimiento}
                </span>
              </div>
            </TableCell>
          )}

          {/* Columnas de Ingreso */}
          <TableCell className="bg-success text-white">
            {item.tipo === 'INGRESO' ? '+' + rounded(item.cantidad) : ''}
          </TableCell>
          <TableCell>
            {item.tipo === 'INGRESO' ? formatCurrency(item.costo, codiso) : ''}
          </TableCell>
          <TableCell>
            {item.tipo === 'INGRESO'
              ? '+' + formatCurrency(item.costo * item.cantidad, codiso)
              : ''}
          </TableCell>

          {/* Columnas de Salida */}
          <TableCell className="bg-danger text-white">
            {item.tipo === 'SALIDA' ? '-' + rounded(item.cantidad) : ''}
          </TableCell>
          <TableCell>
            {item.tipo === 'SALIDA' ? formatCurrency(item.costo, codiso) : ''}
          </TableCell>
          <TableCell>
            {item.tipo === 'SALIDA'
              ? '-' + formatCurrency(item.costo * item.cantidad, codiso)
              : ''}
          </TableCell>

          {/* Columnas de Saldo */}
          <TableCell className="font-weight-bold">
            {rounded(cantidad)}
          </TableCell>
          <TableCell>
            {formatCurrency(cantidad > 0 ? costo / cantidad : 0, codiso)}
          </TableCell>
          <TableCell>{formatCurrency(costo, codiso)}</TableCell>

          {/* <TableCell>{item.almacen}</TableCell>
          <TableCell>
            <small>{item.usuario}</small>
          </TableCell> */}
        </TableRow>
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
      mostrarSinLote,
      filtroFecha,
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

        {/* Filtros principales */}
        <Row>
          <Column className="col-md-9 col-12">
            <SearchInput
              ref={this.refProducto}
              autoFocus={true}
              label={'Filtrar los productos por código o nombre:'}
              placeholder="Filtrar productos..."
              refValue={this.refValueProducto}
              data={this.state.productos}
              handleClearInput={this.handleClearInputProducto}
              handleFilter={this.handleFilterProducto}
              handleSelectItem={this.handleSelectItemProducto}
              renderItem={(value) => (
                <div className="d-flex align-items-center">
                  <Image
                    default={images.noImage}
                    src={value.imagen}
                    alt={value.nombre}
                    width={60}
                  />
                  <div className="ml-2">
                    <strong>{value.codigo}</strong>
                    <br />
                    {value.nombre}
                    {value.lote === 1 && (
                      <span className="badge badge-info ml-2">Con Lotes</span>
                    )}
                  </div>
                </div>
              )}
              renderIconLeft={<i className="bi bi-search"></i>}
            />
          </Column>

          <Column className="col-md-3 col-12" formGroup={true}>
            <Select
              group={true}
              iconLeft={<i className="fa fa-building"></i>}
              label={'Almacén:'}
              ref={this.refIdAlmacen}
              value={this.state.idAlmacen}
              onChange={this.handleSelectAlmacen}
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
          </Column>
        </Row>

        {/* Filtros adicionales */}
        {producto && (
          <Row>
            <Column className="col-md-4 col-12" formGroup={true}>
              <Select
                group={true}
                iconLeft={<i className="fa fa-calendar"></i>}
                label={'Filtrar por fecha:'}
                value={filtroFecha}
                onChange={this.handleFilterFecha}
              >
                <option value="todos">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
              </Select>
            </Column>

            {manejaLote && (
              <Column className="col-md-4 col-12" formGroup={true}>
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mostrarSinLote"
                    checked={mostrarSinLote}
                    onChange={this.handleToggleSinLote}
                  />
                  <label className="form-check-label" htmlFor="mostrarSinLote">
                    Mostrar movimientos sin lote
                  </label>
                </div>
              </Column>
            )}
          </Row>
        )}

        {/* Información del producto */}
        <Row>
          <Column className="col-md-8 col-12" formGroup={true}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  Información del Producto
                  {manejaLote && (
                    <span className="badge badge-info ml-2">Maneja Lotes</span>
                  )}
                </h5>
                <Row>
                  <Column className="col-md-6">
                    <p>
                      <strong>Código:</strong> {producto && producto.codigo}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {producto && producto.nombre}
                    </p>
                    <p>
                      <strong>Almacén:</strong> {this.state.nombreAlmacen}
                    </p>
                  </Column>
                  <Column className="col-md-6">
                    <p>
                      <strong>Unidades Disponibles:</strong> {rounded(cantidad)}{' '}
                      {producto && producto.unidad}
                    </p>
                    <p>
                      <strong>Costo Promedio:</strong>{' '}
                      {formatCurrency(costo, this.state.codiso)}
                    </p>
                    <p>
                      <strong>Valor Total:</strong>{' '}
                      {formatCurrency(valor, this.state.codiso)}
                    </p>
                  </Column>
                </Row>
              </div>
            </div>
          </Column>

          <Column className="col-md-4 col-12" formGroup={true}>
            <div className="card">
              <div className="card-body text-center">
                <Image
                  default={images.noImage}
                  src={(producto && producto.imagen) || null}
                  alt={(producto && producto.nombre) || 'Producto sin imagen'}
                  width={160}
                  className="img-thumbnail"
                />
              </div>
            </div>
          </Column>
        </Row>

        {/* Tabla de movimientos */}
        <Row>
          <Column>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  Movimientos de Kardex
                  {manejaLote && (
                    <span className="float-right">
                      <small>
                        <span className="text-success">✅ Lote válido</span>
                        <span className="text-warning ml-2">
                          ⚠️ Próximo a vencer
                        </span>
                        <span className="text-danger ml-2">🚫 Vencido</span>
                      </small>
                    </span>
                  )}
                </h5>
              </div>
              <div className="card-body">
                <TableResponsive>
                  <Table className="table table-bordered table-hover">
                    <TableHeader className="thead-dark">
                      <TableRow>
                        <TableHead
                          width="8%"
                          className="text-center align-bottom"
                          rowSpan={2}
                        >
                          Fecha
                        </TableHead>
                        <TableHead
                          width="20%"
                          className="text-center align-bottom"
                          rowSpan={2}
                        >
                          Descripción
                        </TableHead>

                        {/* Columnas de lote (solo si el producto maneja lotes) */}
                        {manejaLote && (
                          <>
                            <TableHead
                              width="15%"
                              className="text-center align-bottom"
                              rowSpan={2}
                            >
                              Lote
                            </TableHead>
                          </>
                        )}

                        <TableHead
                          width="18%"
                          className="text-center"
                          colSpan={3}
                        >
                          Ingreso
                        </TableHead>
                        <TableHead
                          width="18%"
                          className="text-center"
                          colSpan={3}
                        >
                          Salida
                        </TableHead>
                        <TableHead
                          width="18%"
                          className="text-center"
                          colSpan={3}
                        >
                          Saldo
                        </TableHead>
                        {/* <TableHead width="8%" className="text-center align-bottom" rowSpan={2}>
                          Almacén
                        </TableHead>
                        <TableHead width="8%" className="text-center align-bottom" rowSpan={2}>
                          Usuario
                        </TableHead> */}
                      </TableRow>

                      <TableRow>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">
                          Costo Unit.
                        </TableHead>
                        <TableHead className="text-center">Total</TableHead>

                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">
                          Costo Unit.
                        </TableHead>
                        <TableHead className="text-center">Total</TableHead>

                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">
                          Costo Unit.
                        </TableHead>
                        <TableHead className="text-center">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{this.generateBody()}</TableBody>
                  </Table>
                </TableResponsive>
              </div>
            </div>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

Kardex.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  kardex: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setKardexData: PropTypes.func,
  setKardexPaginacion: PropTypes.func,
  moneda: PropTypes.object,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

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
