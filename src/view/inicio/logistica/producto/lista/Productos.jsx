import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../../components/Table';
import Image from '../../../../../components/Image';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';
import { setListaProductoData, setListaProductoPaginacion } from '../../../../../redux/predeterminadoSlice';
import React from 'react';

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
    if (this.props.productoLista && this.props.productoLista.data && this.props.productoLista.paginacion) {
      this.setState(this.props.productoLista.data)
      this.refPaginacion.current.upperPageBound = this.props.productoLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound = this.props.productoLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive = this.props.productoLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive = this.props.productoLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound = this.props.productoLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion = this.props.productoLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.productoLista.data.buscar);
    } else {
      await this.loadingInit();
      this.updateReduxState();
    }
  }

  updateReduxState() {
    this.props.setListaProductoData(this.state)
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
  }

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

      this.setState({
        loading: false,
        lista: response.data.result,
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
        messageTable:
          'Se produjo un error interno, intente nuevamente por favor.',
      });
    }
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
    alertDialog(
      'Producto',
      '¿Estás seguro de eliminar el producto?',
      async (event) => {
        if (event) {
          alertInfo('Producto', 'Procesando información...');
          const params = {
            idProducto: idProducto,
            idUsuario: this.state.idUsuario,
          };

          const response = await deleteProducto(params);
          if (response instanceof SuccessReponse) {
            alertSuccess('Producto', response.data, () => {
              this.loadingInit();
            });
          }

          if (response instanceof ErrorResponse) {
            alertWarning('Producto', response.getMessage());
          }
        }
      },
    );
  };

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='10'
          message='Cargando información de la tabla...'
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
          <TableCell>{item.codigo}<br /><b>{item.nombre}</b>{' '}{item.preferido === 1 && (<i className="fa fa-star text-warning"></i>)}</TableCell>
          <TableCell className="text-right">{numberFormat(item.precio, this.state.codiso)}</TableCell>
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
              className='btn-outline-warning btn-sm'
              title="Editar"
              icono={<i className="bi bi-pencil"></i>}
              // disabled={!this.state.edit}
              onClick={() => this.handleEditar(item.idProducto)}
            />
          </TableCell>
          <TableCell className="text-center">
            <Button
              className='btn-outline-danger btn-sm'
              title="Anular"
              icono={<i className="bi bi-trash"></i>}
              // disabled={!this.state.remove}
              onClick={() => this.handleEliminar(item.idProducto)}
            />
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Productos'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Button
              className="btn-outline-info"
              onClick={this.handleAgregar}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn-outline-secondary"
              onClick={this.loadingInit}
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Buscar por código y descripción..."
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="15%">Tipo/Venta</TableHead>
                    <TableHead width="25%">Nombre</TableHead>
                    <TableHead width="15%">Precio</TableHead>
                    <TableHead width="10%">Medida</TableHead>
                    <TableHead width="10%">Categoría</TableHead>
                    <TableHead width="10%" className="text-center">Estado</TableHead>
                    <TableHead width="10%" className="text-center">Imagen</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
                    <TableHead width="5%" className="text-center">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
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
    paginacion: PropTypes.object
  }),
  setListaProductoData: PropTypes.func,
  setListaProductoPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
    productoLista: state.predeterminado.productoLista
  };
};

const mapDispatchToProps = { setListaProductoData, setListaProductoPaginacion }

const ConnectedProductos = connect(mapStateToProps, mapDispatchToProps)(Productos);

export default ConnectedProductos;
