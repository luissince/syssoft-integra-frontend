import PropTypes from 'prop-types';
import Paginacion from '../../../../../../components/Paginacion';
import {
  getRowCellIndex,
  isEmpty,
  numberFormat,
  rounded,
} from '../../../../../../helper/utils.helper';
import Image from '../../../../../../components/Image';
import { images } from '../../../../../../helper';
import Button from '../../../../../../components/Button';
import CustomComponent from '../../../../../../model/class/custom-component';
import React from 'react';
import { filtrarProductoVenta } from '../../../../../../network/rest/principal.network';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../components/Table';
import {
  A_GRANEL,
  UNIDADES,
  VALOR_MONETARIO,
} from '../../../../../../model/types/tipo-tratamiento-producto';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SuccessReponse from '../../../../../../model/class/response';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Select from '../../../../../../components/Select';
import Search from '../../../../../../components/Search';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentHeader,
  CustomModalContentOverflow,
  CustomModalContentScroll,
  CustomModalContentSubHeader,
} from '../../../../../../components/CustomModal';
import { SpinnerTable } from '../../../../../../components/Spinner';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProductos extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      show: false,
      buscar: '',
      lista: [],
      restart: false,
      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
    };

    this.abortController = new AbortController();
    this.refInputBuscar = React.createRef();
    this.refTable = React.createRef();
    this.eventSource = null;
    this.index = -1;
  }

  loadInit = async () => {
    if (this.state.loading) return;
    this.setState({ lista: this.props.productos });
  };

  updateSelection = (children) => {
    children.forEach((row) => row.classList.remove('table-active'));

    const selectedChild = children[this.index];
    selectedChild.classList.add('table-active');
    selectedChild.scrollIntoView({ block: 'center' });
  };

  handleOnOpen = async () => {
    this.refInputBuscar.current.focus();
    this.setState({ lista: this.props.productos });
  };

  handleSearchText = async (text) => {
    if (this.state.loading) return;

    if (isEmpty(text)) {
      this.index = -1;
      this.setState({ lista: this.props.productos, totalPaginacion: 0 });
      return;
    }

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(0, text.trim());
    await this.setStateAsync({ opcion: 0 });
  };

  handlePaginacion = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.handleSelectPaginacion();
  };

  handleSelectPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0, this.state.buscar);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      default:
        this.fillTable(0, this.state.buscar);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    // this.setState({
    //     loading: true,
    //     show: false,
    //     lista: [],
    //     messageTable: 'Cargando información...',
    // });

    // this.index = 0;

    // const searchParams = new URLSearchParams();
    // searchParams.append("tipo", opcion);
    // searchParams.append("filtrar", buscar);
    // searchParams.append("idSucursal", this.props.idSucursal);
    // searchParams.append("idAlmacen", this.props.idAlmacen);
    // searchParams.append("posicionPagina", (this.state.paginacion - 1) * this.state.filasPorPagina);
    // searchParams.append("filasPorPagina", this.state.filasPorPagina);

    // this.eventSource = new EventSource(filtrarStreamProductoVenta(searchParams.toString()));

    // this.eventSource.onopen = () => {
    //     this.setState({
    //         show: true,
    //     });
    // }

    // this.eventSource.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     if (data === "__END__") {
    //         this.setState({
    //             loading: false,
    //         });

    //         this.eventSource.close()
    //         return
    //     }

    //     if (typeof data === 'object') {
    //         this.setState(prevState => ({
    //             lista: [...prevState.lista, data],
    //         }));
    //     }

    //     if (typeof data === 'number') {
    //         const totalPaginacion = parseInt(
    //             Math.ceil(parseFloat(data) / this.state.filasPorPagina),
    //         );

    //         this.setState({
    //             totalPaginacion: totalPaginacion,
    //         });
    //     }
    // };

    // this.eventSource.onerror = () => {
    //     this.setState({
    //         loading: false,
    //     });
    // };

    this.index = 0;

    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      tipo: opcion,
      filtrar: buscar.trim(),
      idSucursal: this.props.idSucursal,
      idAlmacen: this.props.idAlmacen,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await filtrarProductoVenta(
      params,
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState({
        loading: false,
        lista: response.data.lists,
        totalPaginacion: totalPaginacion,
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

  handleOnHidden = () => {
    this.setState({
      loading: false,
      show: false,
      buscar: '',
      lista: [],
      restart: false,
      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
    });

    this.index = -1;
  };

  handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (isEmpty(this.state.lista)) return;

      this.refTable.current.focus();
      const table = this.refTable.current;
      if (!table) return;

      this.index = 0;
      const children = table.tBodies[0].children;
      if (children.length === 0) return;

      children[this.index].classList.add('table-active');
      children[this.index].focus();
    }
  };

  handleKeyDownTable = (event) => {
    const table = this.refTable.current;
    if (!table) return;

    const children = Array.from(table.tBodies[0].children);
    if (children.length === 0) return;

    if (event.key === 'ArrowUp') {
      this.index = (this.index - 1 + children.length) % children.length;
      this.updateSelection(children);
      event.preventDefault();
    }

    if (event.key === 'ArrowDown') {
      this.index = (this.index + 1) % children.length;
      this.updateSelection(children);
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      if (this.index >= 0) {
        const item = this.state.lista[this.index];
        if (item) {
          this.props.handleSeleccionar(item);
          this.refInputBuscar.current.focus();
          this.refInputBuscar.current.select();

          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  };

  handleOnClickTable = async (event) => {
    const { rowIndex, children } = getRowCellIndex(event);

    if (rowIndex === -1) return;

    const item = this.state.lista[rowIndex];
    if (item) {
      this.index = rowIndex;
      this.updateSelection(children);
      this.props.handleSeleccionar(item);
      this.refInputBuscar.current.focus();
      this.refInputBuscar.current.select();
    }
  };

  generateBody = () => {
    const { loading, show, lista } = this.state;

    if (loading && !show) {
      return (
        <SpinnerTable
          colSpan="8"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="8">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return lista.map((item, index) => {
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

      const tipoTratamiento =
        item.idTipoTratamientoProducto === UNIDADES
          ? 'EN UNIDADES'
          : item.idTipoTratamientoProducto === VALOR_MONETARIO
            ? 'VALOR MONETARIO'
            : item.idTipoTratamientoProducto === A_GRANEL
              ? 'A GRANEL'
              : 'SERVICIO';

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id || ++index}</TableCell>
          <TableCell>
            {tipo()}
            {tipoTratamiento}
          </TableCell>
          <TableCell>
            {item.codigo}
            <br />
            <b>{item.nombreProducto}</b>{' '}
            {item.preferido === 1 && (
              <i className="fa fa-star text-warning"></i>
            )}
          </TableCell>
          <TableCell className="text-right">
            {numberFormat(item.precio, this.props.codiso)}
          </TableCell>
          <TableCell>{item.medida}</TableCell>
          <TableCell>{item.categoria}</TableCell>
          <TableCell
            className={`${
              item.tipo === 'PRODUCTO' && item.cantidad <= 0
                ? 'text-danger'
                : 'text-success'
            }`}
          >
            {item.tipo === 'PRODUCTO' ? (
              <>
                {item.almacen}
                <br />
                STOCK: {rounded(item.cantidad)}
              </>
            ) : (
              'SERVICIO'
            )}
          </TableCell>
          <TableCell className="text-center">
            <Image
              default={images.noImage}
              src={item.imagen}
              alt="Logo"
              width={100}
            />
          </TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const { loading, lista, totalPaginacion, paginacion, restart } = this.state;

    const {
      refModal,
      isOpen,
      almacenes,
      refAlmacen,
      idAlmacen,
      handleSelectIdIdAlmacen,
      handleClose,
    } = this.props;

    return (
      <CustomModal
        ref={refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={handleClose}
        contentLabel="Modal de Productos"
        className={'modal-custom-lg'}
      >
        <CustomModalContentScroll>
          <CustomModalContentHeader contentRef={refModal}>
            Productos
          </CustomModalContentHeader>

          <CustomModalContentSubHeader>
            <Row>
              <Column className="col-md-8 col-12" formGroup={true}>
                <Search
                  group={true}
                  label={'Buscar por código o nombres:'}
                  iconLeft={<i className="bi bi-search"></i>}
                  placeholder={`Buscar por código, nombres...`}
                  refInput={this.refInputBuscar}
                  onSearch={this.handleSearchText}
                  buttonRight={
                    <Button
                      className="btn-outline-secondary"
                      title="Recargar"
                      onClick={this.loadInit}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  }
                  onKeyDown={this.handleInputKeyDown}
                />
              </Column>

              <Column className="col-md-4 col-12" formGroup={true}>
                <Select
                  label={
                    <>
                      Almacen:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  ref={refAlmacen}
                  value={idAlmacen}
                  onChange={async (event) =>
                    handleSelectIdIdAlmacen(event, true, () =>
                      this.handleOnOpen(),
                    )
                  }
                >
                  <option value="">-- Almacen --</option>
                  {almacenes.map((item, index) => (
                    <option key={index} value={item.idAlmacen}>
                      {item.nombre}
                    </option>
                  ))}
                </Select>
              </Column>
            </Row>
          </CustomModalContentSubHeader>

          <CustomModalContentBody>
            <CustomModalContentOverflow>
              <div
                className="h-100 overflow-auto"
                onKeyDown={this.handleKeyDownTable}
              >
                <Table
                  ref={this.refTable}
                  tabIndex="0"
                  onClick={this.handleOnClickTable}
                  className="table table-bordered table-hover table-sticky"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead width="5%" className="text-center">
                        #
                      </TableHead>
                      <TableHead width="13%">Tipo/Venta</TableHead>
                      <TableHead width="20%">Nombres</TableHead>
                      <TableHead width="7%">Precio</TableHead>
                      <TableHead width="5%">Medida</TableHead>
                      <TableHead width="5%">Categoría</TableHead>
                      <TableHead width="10%">Inventario</TableHead>
                      <TableHead width="5%">Imagen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{this.generateBody()}</TableBody>
                </Table>
              </div>
            </CustomModalContentOverflow>
          </CustomModalContentBody>

          <CustomModalContentFooter className={'footer-cm-table'}>
            <Paginacion
              className="w-100"
              loading={loading}
              data={lista}
              totalPaginacion={totalPaginacion}
              paginacion={paginacion}
              fillTable={this.handlePaginacion}
              restart={restart}
            />
          </CustomModalContentFooter>
        </CustomModalContentScroll>
      </CustomModal>
    );
  }
}

ModalProductos.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  productos: PropTypes.array,
  codiso: PropTypes.string.isRequired,
  idSucursal: PropTypes.string.isRequired,

  almacenes: PropTypes.array,
  idAlmacen: PropTypes.string.isRequired,
  refAlmacen: PropTypes.object,
  handleSelectIdIdAlmacen: PropTypes.func,

  handleClose: PropTypes.func.isRequired,
  handleSeleccionar: PropTypes.func.isRequired,
};

export default ModalProductos;
