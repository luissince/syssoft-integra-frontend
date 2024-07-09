import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  convertNullText,
  numberFormat,
} from '../../../../../helper/utils.helper';
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
import { TableResponsive } from '../../../../../components/Table';
import Image from '../../../../../components/Image';
import Button from '../../../../../components/Button';
import Search from '../../../../../components/Search';

class Productos extends CustomComponent {
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

      codISO: convertNullText(this.props.moneda.codiso),

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
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

      await this.setStateAsync({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
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
              this.loadInit();
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
        <tr className="text-center">
          <td colSpan="10">¡No hay datos registrados!</td>
        </tr>
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
        <tr key={index}>
          <td className="text-center">{item.id}</td>
          <td>{tipo()}</td>
          <td>
            {item.codigo}
            <br />
            <b>{item.nombre}</b>{' '}
            {item.preferido === 1 && (<i className="fa fa-star text-warning"></i>)}
          </td>
          <td className="text-right">
            {numberFormat(item.precio, this.state.codISO)}
          </td>
          <td>{item.medida}</td>
          <td>{item.categoria}</td>
          <td className="text-center">{estado}</td>
          <td>
            <Image
              default={images.noImage}
              src={item.imagen}
              alt="Logo"
              width={100}
            />
          </td>
          <td className="text-center">
            <Button
              className='btn-outline-warning btn-sm'
              title="Editar"
              icono={<i className="bi bi-pencil"></i>}
              // disabled={!this.state.edit}
              onClick={() => this.handleEditar(item.idProducto)}
            />
          </td>
          <td className="text-center">
            <Button
              className='btn-outline-danger btn-sm'
              title="Anular"
              icono={<i className="bi bi-trash"></i>}
              // disabled={!this.state.remove}
              onClick={() => this.handleEliminar(item.idProducto)}
            />
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Productos'
          subTitle='Lista'
        />

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              onSearch={this.searchText}
              placeholder="Buscar por código y descripción..."
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Button
              className="btn btn-outline-info"
              onClick={this.handleAgregar}
            // disabled={!this.state.add}
            >
              <i className="bi bi-file-plus"></i> Nuevo Registro
            </Button>{' '}
            <Button
              className="btn btn-outline-secondary"
              onClick={() => this.loadInit()}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
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
                  <th width="15%">Tipo/Venta</th>
                  <th width="25%">Nombre</th>
                  <th width="15%">Precio</th>
                  <th width="10%">Medida</th>
                  <th width="10%">Categoría</th>
                  <th width="10%" className="text-center">
                    Estado
                  </th>
                  <th width="10%" className="text-center">
                    Imagen
                  </th>
                  <th width="5%" className="text-center">
                    Editar
                  </th>
                  <th width="5%" className="text-center">
                    Eliminar
                  </th>
                </tr>
              }
              tBody={this.generateBody()}
            />
          </Column>
        </Row>

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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const ConnectedProductos = connect(mapStateToProps, null)(Productos);

export default ConnectedProductos;
