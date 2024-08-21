import React from 'react';
import {
  isEmpty,
  formatTime,
  rounded,
  convertNullText,
  numberFormat,
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
import { setKardexData, setKardexPaginacion } from '../../../../redux/predeterminadoSlice';
import Select from '../../../../components/Select';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
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

      productos: [],

      idAlmacen: '',
      nombreAlmacen: 'TODOS LOS ALMACENES',
      almacenes: [],

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      codISO: convertNullText(this.props.moneda.codiso),

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    this.refIdAlmacen = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadingData = async () => {
    if (this.props.kardex && this.props.kardex.data) {
      this.setState(this.props.kardex.data)
    } else {
      const [almacenes] = await Promise.all([
        this.fetchComboAlmacen({ idSucursal: this.state.idSucursal })
      ]);

      this.setState({
        almacenes,
        initialLoad: false,
      }, () => {
        this.updateReduxState();
      });
    }
  }

  updateReduxState() {
    this.props.setKardexData(this.state)
    // this.props.setKardexPaginacion({
    //   upperPageBound: this.refPaginacion.current.upperPageBound,
    //   lowerPageBound: this.refPaginacion.current.lowerPageBound,
    //   isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
    //   isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
    //   pageBound: this.refPaginacion.current.pageBound,
    //   messagePaginacion: this.refPaginacion.current.messagePaginacion,
    // });
  }

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
      idSucursal: this.state.idSucursal
    };

    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const kardex = await this.fetchListarKardex(params);

    const cantidad = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === 'INGRESO'
          ? parseFloat(item.cantidad)
          : -parseFloat(item.cantidad);
      return accumlate;
    }, 0);

    const costo = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === 'INGRESO'
          ? parseFloat(item.costo * item.cantidad)
          : -parseFloat(item.costo * item.cantidad);
      return accumlate;
    }, 0);

    this.setState({
      lista: kardex,
      cantidad: cantidad,
      costo: costo,
      loading: false,
    }, () => {
      this.updateReduxState();
    });
  }

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
      this.loadDataKardex(value.idProducto)
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
        this.loadDataKardex(this.state.producto.idProducto)
      }
    });
  };

  //------------------------------------------------------------------------------------------
  // Generar Body HTML
  //------------------------------------------------------------------------------------------

  generateBody() {
    const { loading, lista, messageTable } = this.state;

    if (loading) {
      return (
        <SpinnerTable
          colSpan='12'
          message={messageTable}
        />
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr className="text-center">
          <td colSpan="12">¡No hay datos para mostrar!</td>
        </tr>
      );
    }

    let cantidad = 0;
    let costo = 0;

    return lista.map((item, index) => {
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
        <tr key={index}>
          <td>{++index}</td>
          <td>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </td>
          <td>
            <Link className="btn-link" to={getPathNavigation(item.opcion, item.idNavegacion)}>
              {item.detalle} <i className='bi bi-hand-index-fill'></i>
            </Link>
          </td>

          <td className="bg-success text-white">
            {item.tipo === 'INGRESO' ? '+' + rounded(item.cantidad) : ''}
          </td>
          <td className="bg-danger text-white">
            {item.tipo === 'SALIDA' ? '-' + rounded(item.cantidad) : ''}
          </td>
          <td className="font-weight-bold">{rounded(cantidad)}</td>
          <td>{numberFormat(item.costo, this.state.codISO)}</td>

          <td>
            {item.tipo === 'INGRESO'
              ? '+' + rounded(item.costo * item.cantidad)
              : ''}
          </td>
          <td>
            {item.tipo === 'SALIDA'
              ? '-' + rounded(item.costo * item.cantidad)
              : ''}
          </td>
          <td>{numberFormat(costo, this.state.codISO)}</td>

          <td>{item.almacen}</td>
          <td>
            {item.apellidos}
            {<br />}
            {item.nombres}
          </td>
        </tr>
      );
    });
  }

  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  render() {
    const { producto, cantidad, costo } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title='Kardex'
          subTitle='LISTA'
        />

        <Row>
          <Column className="col-md-9 col-12">
            <SearchInput
              ref={this.refProducto}
              autoFocus={true}
              label={"Filtrar los productos por código o nombre:"}
              placeholder="Filtrar productos..."
              refValue={this.refValueProducto}
              data={this.state.productos}
              handleClearInput={this.handleClearInputProducto}
              handleFilter={this.handleFilterProducto}
              handleSelectItem={this.handleSelectItemProducto}
              renderItem={(value) => (
                <>
                  {value.codigo} / {value.nombre} <small>({value.categoria})</small>
                </>
              )}
              renderIconLeft={<i className="bi bi-search"></i>}
            />
          </Column>

          <Column className="col-md-3 col-12" formGroup={true}>
            <Select
              group={true}
              iconLeft={<i className="fa fa-building"></i>}
              label={"Almacen:"}
              refSelect={this.refIdAlmacen}
              value={this.state.idAlmacen}
              onChange={this.handleSelectAlmacen}
            >
              <option value="">-- Almacen --</option>
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

        <Row>
          <Column formGroup={true}>
            <h5>Información del Producto</h5>
            <p>
              <strong>Código del Producto:</strong>{' '}
              {producto && producto.codigo}
            </p>
            <p>
              <strong>Nombre del Producto:</strong>{' '}
              {producto && producto.nombre}
            </p>
            <p>
              <strong>Almacen:</strong> {this.state.nombreAlmacen}
            </p>
            <p>
              <strong>Cantidad Actual:</strong> {cantidad}{' '}
              {producto && producto.medida}
            </p>
            <p>
              <strong>Valor del Producto:</strong>{' '}
              {numberFormat(costo, this.state.codISO)}
            </p>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="table-responsive">
              <table className="table table-bordered rounded">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      rowSpan={2}
                      colSpan={1}
                      width="5%"
                      className="text-center"
                    >
                      #
                    </th>
                    <th scope="col" rowSpan={2} colSpan={1} width="10%">
                      Fecha
                    </th>
                    <th scope="col" rowSpan={2} colSpan={1} width="30%">
                      Detalle
                    </th>
                    <th scope="col" rowSpan={1} colSpan={3} width="25%">
                      Unidades
                    </th>
                    <th scope="col" rowSpan={2} colSpan={1} width="15%">
                      Cambios <br /> Costo
                    </th>
                    <th
                      scope="col"
                      rowSpan={1}
                      colSpan={3}
                      width="25%"
                      className="text-center"
                    >
                      Valores
                    </th>
                    <th
                      scope="col"
                      rowSpan={2}
                      colSpan={1}
                      width="10%"
                      className="text-center"
                    >
                      Almacen
                    </th>
                    <th
                      scope="col"
                      rowSpan={2}
                      colSpan={1}
                      width="10%"
                      className="text-center"
                    >
                      Usuario
                    </th>
                  </tr>
                  <tr>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Existencia</th>

                    <th>Debe</th>
                    <th>Haber</th>
                    <th>Saldo</th>
                  </tr>
                </thead>

                <tbody>{this.generateBody()}</tbody>
              </table>
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
    paginacion: PropTypes.object
  }),
  setKardexData: PropTypes.func,
  setKardexPaginacion: PropTypes.func,
  moneda: PropTypes.object,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    kardex: state.predeterminado.kardex
  };
};

const mapDispatchToProps = { setKardexData, setKardexPaginacion }

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedKardex = connect(mapStateToProps, mapDispatchToProps)(Kardex);

export default ConnectedKardex;