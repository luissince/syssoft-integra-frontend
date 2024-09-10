import React from 'react';
import {
  isEmpty,
  rounded,
  convertNullText,
  numberFormat,
  alertWarning,
  alertDialog,
  alertInfo,
  isNumeric,
  alertSuccess,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  actualizarStockInventario,
  comboAlmacen,
  listInventario,
  obtenerStockInventario,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';
import Title from '../../../../components/Title';
import { SpinnerTable, SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { TableResponsive } from '../../../../components/Table';
import CustomModalStock from './component/ModalStock';
import Select from '../../../../components/Select';
import Search from '../../../../components/Search';
import { setListaInventarioData, setListaInventarioPaginacion } from '../../../../redux/predeterminadoSlice';
import Button from '../../../../components/Button';

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
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      isOpenStock: false,
      loadingModal: false,
      stockMinimo: '',
      stockMaximo: '',

      loading: false,
      lista: [],
      restart: false,

      idAlmacen: '',
      almacenes: [],

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codISO: convertNullText(this.props.moneda.codiso),

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refModalStock = React.createRef();

    this.idInventario = '';

    this.refStockMinimo = React.createRef();
    this.refStockMaximo = React.createRef();

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
    } else {
      const [almacenes] = await Promise.all([
        this.fetchComboAlmacen({ idSucursal: this.state.idSucursal })
      ]);

      this.setState({
        almacenes,
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

  async fetchObtenerStockInvetario() {
    const params = {
      idInventario: this.idInventario,
    };

    const response = await obtenerStockInventario(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  //------------------------------------------------------------------------------------------
  // Funciones del modal
  //------------------------------------------------------------------------------------------

  handleOpenModal = (inventario) => {
    this.idInventario = inventario.idInventario;
    this.setState({
      isOpenStock: true,
      loadingModal: true,
    })
  };

  handleCloseModal = () => {
    this.setState({ isOpenStock: false })
  }

  handleOnOpen = async () => {
    const stock = await this.fetchObtenerStockInvetario();

    this.setState({
      stockMinimo: stock.cantidadMinima,
      stockMaximo: stock.cantidadMaxima,
      loadingModal: false,
    });
  }

  handleHiddenModal = () => {
    this.setState({
      stockMinimo: '',
      stockMaximo: '',
      loadingModal: false,
    });
  }

  handleInputStockMinimo = (event) => {
    this.setState({ stockMinimo: event.target.value });
  };

  handleInputStockMaximo = (event) => {
    this.setState({ stockMaximo: event.target.value });
  };

  handleSave = () => {
    if (!isNumeric(this.state.stockMinimo)) {
      alertWarning('Inventario', 'Ingrese el stock mínimo', () => {
        this.refStockMinimo.current.focus();
      });
      return;
    }

    if (!isNumeric(this.state.stockMaximo)) {
      alertWarning('Inventario', 'Ingrese el stock máximo', () => {
        this.refStockMaximo.current.focus();
      });
      return;
    }

    alertDialog('Inventario', '¿Estas seguro de continar?', async (accept) => {
      if (accept) {

        const data = {
          stockMinimo: this.state.stockMinimo,
          stockMaximo: this.state.stockMaximo,
          idInventario: this.idInventario,
        };

        this.handleCloseModal()
        alertInfo('Inventario', 'Procesando información...');

        const response = await actualizarStockInventario(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Inventario', response.data, () => {
            this.loadingInit();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Inventario', response.getMessage());
        }
      }
    });
  };

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value }, () => this.loadingInit());
  };

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  generarBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='8'
          message='Cargando información de la tabla...'
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="8">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => {
      const background =
        parseFloat(item.cantidad) <= 0 ? 'bg-danger' : 'bg-success';
      const color = 'text-white';

      return (
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{item.codigo}<br /><b>{item.producto}</b></td>
          <td>{item.almacen}</td>
          <td>{item.cantidadMaxima} {item.medida}</td>
          <td>{item.cantidadMinima} {item.medida}</td>
          <td className={`${background} ${color}`}>{rounded(item.cantidad)} {item.medida}</td>
          <td>{numberFormat(item.costo, this.state.codISO)}</td>
          <td className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleOpenModal(item)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </td>
        </tr>
      );
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
          refModal={this.refModalStock}
          isOpen={this.state.isOpenStock}
          onOpen={this.handleOnOpen}
          onHidden={this.handleHiddenModal}
          onClose={this.handleCloseModal}

          loading={this.state.loadingModal}

          refStockMinimo={this.refStockMinimo}
          stockMinimo={this.state.stockMinimo}
          handleInputStockMinimo={this.handleInputStockMinimo}

          refStockMaximo={this.refStockMaximo}
          stockMaximo={this.state.stockMaximo}
          handleInputStockMaximo={this.handleInputStockMaximo}

          handleSave={this.handleSave}
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              onSearch={this.searchText}
              placeholder="Buscar..."
            />
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">
                  <i className="fa fa-building"></i>
                </div>
              </div>
              <Select
                value={this.state.idAlmacen}
                onChange={this.handleSelectAlmacen}>
                <option value={''}>-- Almacen --</option>
                {this.state.almacenes.map((item, index) => {
                  return (
                    <option key={index} value={item.idAlmacen}>
                      {item.nombre}
                    </option>
                  );
                })}
              </Select>
            </div>
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <button
              className="btn btn-outline-secondary"
              onClick={() => this.loadingInit()}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <span>Cantidad de Items: </span>
          </Column>

          <Column className="col-md-3 col-sm-12" formGroup={true}>
            <span className="text-success">Valor de Inventario: </span>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive
              tHead={
                <tr>
                  <th width="5%" className="text-center">
                    #
                  </th>
                  <th width="30%">Producto</th>
                  <th width="15%">Almacen</th>
                  <th width="10%">Stock Máx.</th>
                  <th width="10%">Stock Mín.</th>
                  <th width="15%">Cantidad Actual</th>
                  <th width="10%">Costo</th>
                  <th width="5%">Editar</th>
                </tr>
              }
              tBody={this.generarBody()}
            />
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
