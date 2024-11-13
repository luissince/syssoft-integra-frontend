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
import Image from '../../../../components/Image';
import { images } from '../../../../helper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';

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
      valor: 0,

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

    const valor = kardex.reduce((accumlate, item) => {
      accumlate +=
        item.tipo === 'INGRESO'
          ? parseFloat(item.costo * item.cantidad)
          : -parseFloat(item.costo * item.cantidad);
      return accumlate;
    }, 0);

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
        <TableRow className="text-center">
          <TableCell colSpan="12">¡No hay datos para mostrar!</TableCell>
        </TableRow>
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
        <TableRow key={index}>
          {/* <TableCell>{++index}</TableCell> */}
          <TableCell>{item.fecha}<br />{formatTime(item.hora)}</TableCell>
          <TableCell>
            <Link className="btn-link" to={getPathNavigation(item.opcion, item.idNavegacion)}>
              {item.detalle} <i className='bi bi-hand-index-fill'></i>
            </Link>
          </TableCell>
          <TableCell className="bg-success text-white">{item.tipo === 'INGRESO' ? '+' + rounded(item.cantidad) : ''}</TableCell>
          <TableCell>{item.tipo === 'INGRESO' ? numberFormat(item.costo, this.state.codISO) : ''}</TableCell>
          <TableCell>{item.tipo === 'INGRESO' ? '+' + rounded(item.costo * item.cantidad) : ''}</TableCell>

          <TableCell className="bg-danger text-white">{item.tipo === 'SALIDA' ? '-' + rounded(item.cantidad) : ''}</TableCell>
          <TableCell>{item.tipo === 'SALIDA' ? numberFormat(item.costo, this.state.codISO) : ''}</TableCell>
          <TableCell>{item.tipo === 'SALIDA' ? '-' + rounded(item.costo * item.cantidad) : ''}</TableCell>

          <TableCell>{numberFormat(cantidad, this.state.codISO)}</TableCell>
          <TableCell>{numberFormat(costo / cantidad, this.state.codISO)}</TableCell>
          <TableCell>{numberFormat(costo, this.state.codISO)}</TableCell>

          <TableCell>{item.almacen}</TableCell>
          <TableCell>{item.apellidos}{<br />}{item.nombres}</TableCell> 
          {/* 
          <TableCell className="bg-success text-white">{item.tipo === 'INGRESO' ? '+' + rounded(item.cantidad) : ''}</TableCell>
          <TableCell className="bg-danger text-white">{item.tipo === 'SALIDA' ? '-' + rounded(item.cantidad) : ''}</TableCell>
          <TableCell className="font-weight-bold">{rounded(cantidad)}</TableCell>
          <TableCell>{numberFormat(item.costo, this.state.codISO)}</TableCell>
          <TableCell>{item.tipo === 'INGRESO' ? '+' + rounded(item.costo * item.cantidad) : ''}</TableCell>
          <TableCell>{item.tipo === 'SALIDA' ? '-' + rounded(item.costo * item.cantidad) : ''}</TableCell>
          <TableCell>{numberFormat(costo, this.state.codISO)}</TableCell>
          
          <TableCell>{item.apellidos}{<br />}{item.nombres}</TableCell> */}
        </TableRow>
      );
    });
  }


  //------------------------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------------------------

  render() {
    const { producto, cantidad, costo, valor } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title='Kardex'
          subTitle='Método Promedio Ponderado'
          handleGoBack={() => this.props.history.goBack()}
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
              renderItem={(value) =>
                <div className="d-flex align-items-center">
                  <Image
                    default={images.noImage}
                    src={value.imagen}
                    alt={value.nombre}
                    width={60}
                  />

                  <div className='ml-2'>
                    {value.codigo}
                    <br />
                    {value.nombre}
                  </div>
                </div>}
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
              <strong>Unidades Disponibles:</strong> {cantidad}{' '}
              {producto && producto.unidad}
            </p>
            <p>
              <strong>Costo Promedio Ponderado:</strong>{' '}
              {numberFormat(costo, this.state.codISO)}
            </p>
            <p>
              <strong>Valor Total Inventario:</strong>{' '}
              {numberFormat(valor, this.state.codISO)}
            </p>
          </Column>

          <Column formGroup={true}>
            <div className='d-flex align-items-center justify-content-end'>
              <Image
                default={images.noImage}
                src={producto && producto.imagen || null}
                alt={producto && producto.nombre || "Producto sin imagen"}
                width={160}
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className="table table-bordered rounded">
                <TableHeader>
                  <TableRow>
                    <TableHead width="10%" className="text-center align-bottom" rowSpan={2} colSpan={1}>Fecha</TableHead>
                    <TableHead width="21%" className="text-center align-bottom" rowSpan={2} colSpan={1}>Descripción</TableHead>
                    <TableHead width="23%" className="text-center" rowSpan={1} colSpan={3}>Ingreso</TableHead>
                    <TableHead width="23%" className="text-center" rowSpan={1} colSpan={3}>Salidas</TableHead>
                    <TableHead width="23%" className="text-center" rowSpan={1} colSpan={3}>Saldos</TableHead>
                    <TableHead width="10%" className="text-center align-bottom" rowSpan={2} colSpan={1}>Almacen</TableHead>
                    <TableHead width="10%" className="text-center align-bottom" rowSpan={2} colSpan={1}>Usuario</TableHead>
                  </TableRow>

                  <TableRow>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Costo Unitario</TableHead>
                    <TableHead className="text-center">Total</TableHead>

                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Costo Unitario</TableHead>
                    <TableHead className="text-center">Total</TableHead>

                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Costo Unitario</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
                </TableBody>
              </Table>
            </TableResponsive>
            {/* <div className="table-responsive">
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
            </div> */}
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