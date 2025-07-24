import React from 'react';
import {
  rounded,
  convertNullText,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  comboAlmacen,
  documentsPdfCodbarProducto,
  listInventario,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../components/Title';
import { SpinnerTable, SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import CustomModalStock from './component/ModalStock';
import Select from '../../../../components/Select';
import Search from '../../../../components/Search';
import { setListaInventarioData, setListaInventarioPaginacion } from '../../../../redux/predeterminadoSlice';
import Button from '../../../../components/Button';
import pdfVisualizer from 'pdf-visualizer';
import { Card, CardBody, CardHeader, CardText, CardTitle } from '../../../../components/Card';
import { Box, CircleCheck, Clock, TriangleAlert } from 'lucide-react';
import Image from '../../../../components/Image';
import { images } from '../../../../helper';
import DropdownActions from '../../../../components/DropdownActions';
import ProgressBar from '../../../../components/ProgressBar';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Inventario extends CustomComponent {

  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      // Atributos de busqueda
      idTipoAlmacen: '',
      tiposAlmacenes: [],

      idAlmacen: '',
      almacenes: [],

      isEstado: '',
      estados: [],

      // Atributos principales de la tabla
      loading: false,
      lista: [],
      restart: false,

      lotesVisible: {},

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      // Atributos de uso
      codiso: convertNullText(this.props.moneda.codiso),

      // Atributos del modal stock
      isOpenStock: false,

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.refModalStock = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    if (this.props.inventarioLista && this.props.inventarioLista.data && this.props.inventarioLista.paginacion) {
      this.setState(this.props.inventarioLista.data)
      this.refPaginacion.current.upperPageBound = this.props.inventarioLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.inventarioLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.inventarioLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.inventarioLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.inventarioLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.inventarioLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.inventarioLista.data.buscar);
    } else {
      const [almacenes] = await Promise.all([
        this.fetchComboAlmacen({ idSucursal: this.state.idSucursal })
      ]);

      const almacenFilter = almacenes.find((item) => item.predefinido === 1);

      this.setState({
        almacenes,
        idAlmacen: almacenFilter ? almacenFilter.idAlmacen : '',
        initialLoad: false
      }, async () => {
        await this.loadingInit();
        this.updateReduxState();
      });
    }
  }

  updateReduxState() {
    this.props.setListaInventarioData(this.state)
    this.props.setListaInventarioPaginacion({
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
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  }

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
  }

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      idSucursal: this.state.idSucursal,
      idAlmacen: this.state.idAlmacen,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listInventario(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const result = response.data.result;
      const total = response.data.total;
      const totalPaginacion = parseInt(Math.ceil(parseFloat(total) / this.state.filasPorPagina));

      this.setState({
        loading: false,
        lista: result,
        totalPaginacion: totalPaginacion,
      }, () => {
        this.updateReduxState();
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  };

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }


  //------------------------------------------------------------------------------------------
  // Funciones del modal producto
  //------------------------------------------------------------------------------------------

  handleOpenModalStock = async (producto) => {
    this.setState({ isOpenStock: true });
    await this.refModalStock.current.loadDatos(producto);
  }

  handleCloseStock = async () => {
    this.setState({ isOpenStock: false })
  }

  //--------------------------------------------------------------------------------------------
  // Handlers
  //--------------------------------------------------------------------------------------------


  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value }, () => this.loadingInit());
  };


  handleOpenPrinterCodBar = async (idProducto) => {
    await pdfVisualizer.init({
      url: documentsPdfCodbarProducto(),
      title: 'Lista de productos - Código de Barras',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  toggleLotesVisibility = (index) => {
    this.setState(prevState => ({
      lotesVisible: {
        ...prevState.lotesVisible,
        [index]: !prevState.lotesVisible?.[index]
      }
    }));
  };

  getLotesEnRiesgo = (lotes) => {
    if (!lotes || lotes.length === 0) return 0;

    return lotes.filter(lote => lote.diasRestantes <= 30 || lote.estado === 'Crítico').length;
  };

  getProximoVencimiento = (lotes) => {
    if (!lotes || lotes.length === 0) return 'N/A';

    const lotesOrdenados = [...lotes].sort((a, b) => a.diasRestantes - b.diasRestantes);
    return lotesOrdenados[0].fechaVencimiento;
  };

  determinarEstadoLote = (lote) => {
    if (lote.diasRestantes <= 0) {
      return {
        estado: 'Vencido',
        clase: 'bg-dark text-white',
        icono: 'bi bi-x-circle-fill',
        colorBarra: 'bg-dark'
      };
    } else if (lote.diasRestantes > 0 && lote.diasRestantes <= 30) {
      return {
        estado: 'Próximo',
        clase: 'bg-warning text-dark',
        icono: 'bi bi-clock-fill',
        colorBarra: 'bg-warning'
      };
    } else if (lote.diasRestantes <= 90) {
      return {
        estado: 'Vigilar',
        clase: 'bg-info text-white',
        icono: 'bi bi-eye-fill',
        colorBarra: 'bg-info'
      };
    } else {
      return {
        estado: 'Óptimo',
        clase: 'bg-success text-white',
        icono: 'bi bi-check-circle-fill',
        colorBarra: 'bg-success'
      };
    }
  };

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  generarBody() {
    const { loading, lista } = this.state;

    if (loading) {
      return (
        <SpinnerTable
          colSpan='6'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (!lista || lista.length === 0) {
      return (
        <TableRow className="text-center">
          <td colSpan="10">¡No hay datos registrados!</td>
        </TableRow>
      );
    }

    return lista.flatMap((item, index) => {
      const calcularPorcentaje = () => {
        const { cantidad, cantidadMinima, cantidadMaxima } = item;
        const rango = cantidadMaxima - cantidadMinima;
        if (rango <= 0) return 100;

        const porcentaje = ((cantidad - cantidadMinima) / rango) * 100;
        return Number(rounded(Math.max(0, Math.min(100, porcentaje)), 0));
      };

      const determinarEstadoInventario = (item) => {
        const { cantidad, cantidadMinima, cantidadMaxima } = item;
        if (cantidad < cantidadMinima) {
          return {
            estado: 'Crítico',
            clase: 'bg-danger text-white',
            icono: 'bi bi-exclamation-triangle-fill'
          };
        } else if (cantidad > cantidadMaxima) {
          return {
            estado: 'Exceso',
            clase: 'bg-info text-white',
            icono: 'bi bi-arrow-up-circle-fill'
          };
        } else {
          return {
            estado: 'Óptimo',
            clase: 'bg-success text-white',
            icono: 'bi bi-check-circle-fill'
          };
        }
      };

      // Determinar si el producto tiene lotes
      const tieneLotes = item.lotes && item.lotes.length > 0;
      const estadoInventario = determinarEstadoInventario(item);

      const filaPrincipal = (
        <TableRow key={`inv-${index}`} className={`bg-white ${tieneLotes ? 'border-bottom-0' : ''}`}>
          <TableCell className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span>{item.id}</span>
              {tieneLotes && (
                <button
                  className="btn btn-link btn-sm p-0"
                  onClick={() => this.toggleLotesVisibility(index)}
                  title={this.state.lotesVisible?.[index] ? "Ocultar lotes" : "Ver lotes"}
                >
                  <i className={`bi ${this.state.lotesVisible?.[index] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </button>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className='d-flex align-items-center gap-2'>
              <Image
                default={images.noImage}
                src={item.imagen}
                alt={item.producto}
                width={70}
              />
              <div className='d-flex flex-column gap-2 justify-content-center'>
                {item.codigo}
                <strong>{item.producto}</strong>
                {tieneLotes && (
                  <small className="text-info">
                    <i className="bi bi-box-seam"></i> {item.lotes.length} lote(s)
                  </small>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="d-flex flex-column">
              <span>{item.categoria}</span>
              {tieneLotes && (
                <small className="text-muted">
                  Próximo venc: {this.getProximoVencimiento(item.lotes)}
                </small>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{rounded(item.cantidad)} {item.medida || ''}</strong>
                <div className="small text-muted">
                  Max: {item.cantidadMaxima} | Min: {item.cantidadMinima}
                </div>
              </div>
              {tieneLotes && (
                <div className="text-end">
                  <small className="text-muted d-block">
                    Distribuido en {item.lotes.length} lote(s)
                  </small>
                </div>
              )}
            </div>
            <ProgressBar
              value={calcularPorcentaje()}
              className={
                item.cantidad < item.cantidadMinima ? "bg-danger" :
                  item.cantidad > item.cantidadMaxima ? "bg-success" : "bg-warning"
              }
            />
          </TableCell>
          <TableCell className="text-center">
            <div className="d-flex flex-column gap-1 align-items-center">
              <span className={`badge rounded-pill ${estadoInventario.clase} d-flex align-items-center justify-content-center gap-1`}>
                <i className={estadoInventario.icono}></i>
                {estadoInventario.estado}
              </span>
              {tieneLotes && this.getLotesEnRiesgo(item.lotes) > 0 && (
                <small className="text-warning">
                  <i className="bi bi-exclamation-triangle"></i> {this.getLotesEnRiesgo(item.lotes)} lote(s) en riesgo
                </small>
              )}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <DropdownActions
              options={[
                {
                  image: <i className="bi bi-pencil"></i>,
                  tooltip: 'Editar',
                  label: 'Editar',
                  onClick: () => this.handleOpenModalStock(item),
                },
                {
                  image: <i className="fa fa-barcode"></i>,
                  tooltip: 'Código de Barras',
                  label: 'Código de Barras',
                  onClick: () => this.handleOpenPrinterCodBar(item.idProducto),
                },

              ]}
            />
          </TableCell>
        </TableRow>
      );

      const filasLotes = (tieneLotes && this.state.lotesVisible?.[index])
        ? item.lotes.map((lote, loteIndex) => {
          const estadoLote = this.determinarEstadoLote(lote);
          const esUltimoLote = loteIndex === item.lotes.length - 1;

          return (
            <TableRow key={`lote-${index}-${loteIndex}`} className={`bg-gray border-start border-1 border-info ${esUltimoLote ? 'border-bottom border-info' : ''}`}>
              <TableCell colSpan="10" className="border-gray">
                <Table>
                  <TableHeader className="bg-gray">
                    <TableRow>
                      <TableHead width="5%" className="border-gray border-0">Lote</TableHead>
                      <TableHead width="20%" className="border-gray border-0">Vencimiento</TableHead>
                      <TableHead width="10%" className="border-gray border-0">Días</TableHead>
                      <TableHead width="15%" className="border-gray border-0">Cantidad</TableHead>
                      <TableHead width="10%" className="border-gray border-0 text-center">Estado</TableHead>
                      <TableHead width="7%" className="border-gray border-0 text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-gray">
                    <TableRow>
                      <TableCell className="border-gray border-0">
                        <small className="text-muted">L-{loteIndex + 1}</small>
                      </TableCell>
                      <TableCell className="border-gray border-0">
                        <div className="d-flex align-items-center gap-2 ps-3">
                          <i className="bi bi-box text-muted"></i>
                          <div>
                            <div className="fw-bold">{lote.codigoLote}</div>
                            <small className="text-muted">
                              Lote de: {item.producto}
                            </small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="border-gray border-0">
                        <div className="d-flex flex-column">
                          <span>Venc: {lote.fechaVencimiento}</span>
                          <small className={`${lote.diasRestantes <= 30 ? 'text-danger' : lote.diasRestantes <= 90 ? 'text-warning' : 'text-muted'}`}>
                            {lote.diasRestantes} días restantes
                          </small>
                        </div>
                      </TableCell>
                      <TableCell className="border-gray border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{rounded(lote.cantidad)} {item.medida || ''}</strong>
                        </div>
                        <ProgressBar
                          value={rounded((lote.cantidad / item.cantidad) * 100, 0, 'number')}
                          className={estadoLote.colorBarra}
                        />
                      </TableCell>
                      <TableCell className="border-gray border-0 text-center">
                        <span className={`badge rounded-pill ${estadoLote.clase} d-flex align-items-center justify-content-center gap-1`}>
                          <i className={estadoLote.icono}></i>
                          {estadoLote.estado}
                        </span>
                      </TableCell>
                      <TableCell className="border-gray border-0 text-center">
                        <Button className="btn-outline-dark btn-sm">
                          <i className="fa fa-shopping-cart"></i>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          );
        })
        : [];

      return [filaPrincipal, ...filasLotes];
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title='Inventario'
          subTitle='INICIAL'
          handleGoBack={() => this.props.history.goBack()}
        />

        <CustomModalStock
          ref={this.refModalStock}
          isOpen={this.state.isOpenStock}
          onClose={this.handleCloseStock}

          handleSave={this.loadingInit}
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Select
              group
              iconLeft={<i className="fa fa-building"></i>}
              value={this.state.idAlmacen}
              onChange={this.handleSelectAlmacen}>
              <option value={''}>-- Almacen --</option>
              {this.state.almacenes.map((item, index) => {
                return (
                  <option key={index} value={item.idAlmacen}>
                    {item.nombre} - {item.tipoAlmacen}
                  </option>
                );
              })}
            </Select>
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <Select
              group
              iconLeft={<i className="fa fa-building"></i>}
              value={this.state.estado}
              onChange={this.handleSelectAlmacen}>
              <option value={''}>-- Estado --</option>

            </Select>
          </Column>

          <Column formGroup={true}>
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>
        </Row>

        {/* <Row>
          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <span>Cantidad de Items: </span>
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <span className="text-success">Valor de Inventario: </span>
          </Column>
        </Row> */}

        <Row>
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total Productos</CardTitle>
                <Box className='text-info' />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Lotes por Vencen</CardTitle>
                <Clock className='text-warning' />
              </CardHeader>
              <CardBody>
                <CardText>$123,456</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Stock Crítico</CardTitle>
                <TriangleAlert className='text-danger' />
              </CardHeader>
              <CardBody>
                <CardText>24</CardText>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Stock Óptimo</CardTitle>
                <CircleCheck className='text-success' />
              </CardHeader>
              <CardBody>
                <CardText>56</CardText>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="20%">Producto</TableHead>
                    <TableHead width="10%">Categoría</TableHead>
                    <TableHead width="15%">Stock Total</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="7%" className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generarBody()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Paginacion
          ref={this.refPaginacion}
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
        />
      </ContainerWrapper>
    );
  }
}

Inventario.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  moneda: PropTypes.object,
  inventarioLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object
  }),
  setListaInventarioData: PropTypes.func,
  setListaInventarioPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    inventarioLista: state.predeterminado.inventarioLista
  };
};

const mapDispatchToProps = { setListaInventarioData, setListaInventarioPaginacion }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedInventario = connect(mapStateToProps, mapDispatchToProps)(Inventario);

export default ConnectedInventario;
