import React from 'react';
import {
  spinnerLoading,
  isEmpty,
  rounded,
  convertNullText,
  numberFormat,
  showModal,
  viewModal,
  clearModal,
  alertWarning,
  alertDialog,
  alertInfo,
  hideModal,
  isNumeric,
  alertSuccess,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import Paginacion from '../../../../components/Paginacion';
import { keyUpSearch } from '../../../../helper/utils.helper';
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
import ModalStock from './component/ModalStock';

class Inventario extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      loadingModal: true,
      stockMinimo: '',
      stockMaximo: '',

      loading: false,
      lista: [],
      restart: false,

      idAlmacen: '',
      almacenes: [],

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codISO: convertNullText(this.props.moneda.codiso),

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    /**
     * Identificador del modal de inventario.
     * @type {string}
     */
    this.idModalStock = 'modalStock';

    this.idInventario = '';

    this.refStockMinimo = React.createRef();
    this.refStockMaximo = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();

    viewModal(this.idModalStock, async () => {
      this.refStockMinimo.current.focus();

      const stock = await this.fetchObtenerStockInvetario();

      this.setState({
        stockMinimo: stock.cantidadMinima,
        stockMaximo: stock.cantidadMaxima,
        loadingModal: false,
      });
    });

    clearModal(this.idModalStock, async () => {
      this.setState({
        stockMinimo: '',
        stockMaximo: '',
        loadingModal: true,
      });
    });
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  async loadingData() {
    const [almacenes] = await Promise.all([await this.fetchComboAlmacen({idSucursal: this.state.idSucursal})]);

    await this.setStateAsync({
      almacenes,
      initialLoad: false,
    });
    this.loadInit();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, '');
    await this.setStateAsync({ opcion: 0 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0, '');
        break;
      case 1:
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      default:
        this.fillTable(0, '');
    }
  };

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  fillTable = async (opcion, buscar) => {
    await this.setStateAsync({
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

    const response = await listInventario(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const result = response.data.result;
      const total = response.data.total;
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(total) / this.state.filasPorPagina),
      );

      await this.setStateAsync({
        loading: false,
        lista: result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  };

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params,this.abortControllerTable.signal);

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
    showModal(this.idModalStock);
  };

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
        hideModal(this.idModalStock);
        alertInfo('Inventario', 'Procesando información...');

        const data = {
          stockMinimo: this.state.stockMinimo,
          stockMaximo: this.state.stockMaximo,
          idInventario: this.idInventario,
        };

        const response = await actualizarStockInventario(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Inventario', response.data, () => {
            this.loadInit();
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
    this.setState({ idAlmacen: event.target.value }, () => this.loadInit());
  };

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="8">
            {spinnerLoading('Cargando información de la tabla...', true)}
          </td>
        </tr>
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
          <td>
            {item.codigo}
            <br />
            <b>{item.producto}</b>
          </td>
          <td>{item.almacen}</td>
          <td>
            {item.cantidadMaxima} {item.medida}
          </td>
          <td>
            {item.cantidadMinima} {item.medida}
          </td>
          <td className={`${background} ${color}`}>
            {rounded(item.cantidad)} {item.medida}
          </td>
          <td>{numberFormat(item.costo, this.state.codISO)}</td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() => this.handleOpenModal(item)}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.initialLoad && spinnerLoading(this.state.initialMessage)}

        <ModalStock
          idModalStock={this.idModalStock}
          loading={this.state.loadingModal}
          refStockMinimo={this.refStockMinimo}
          stockMinimo={this.state.stockMinimo}
          handleInputStockMinimo={this.handleInputStockMinimo}
          refStockMaximo={this.refStockMaximo}
          stockMaximo={this.state.stockMaximo}
          handleInputStockMaximo={this.handleInputStockMaximo}
          handleSave={this.handleSave}
        />

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Inventario <small className="text-secondary">INICIAL</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filtre por datos del producto..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchText(event.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-12">
            <div className="form-group">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="fa fa-building"></i>
                  </div>
                </div>
                <select
                  className="form-control"
                  value={this.state.idAlmacen}
                  onChange={this.handleSelectAlmacen}
                >
                  <option value={''}>-- Almacen --</option>
                  {this.state.almacenes.map((item, index) => {
                    return (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.loadInit()}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 col-sm-12">
            <div className="form-group">
              <span>Cantidad de Items: </span>
            </div>
          </div>

          <div className="col-md-3 col-sm-12 text-success">
            <div className="form-group">
              <span>Valor de Inventario: </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
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
                </thead>
                <tbody>{this.generarBody()}</tbody>
              </table>
            </div>
          </div>
        </div>

        <Paginacion
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

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
    moneda: state.predeterminadoReducer.moneda,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(Inventario);
