import React from 'react';
import Button from '../../../../../../components/Button';
import Input from '../../../../../../components/Input';
import { images } from '../../../../../../helper';
import { isEmpty, keyUpSearch, numberFormat } from '../../../../../../helper/utils.helper';
import CustomComponent from '../../../../../../model/class/custom-component';
import { A_GRANEL, UNIDADES, VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';
import PropTypes from 'prop-types';
import { filtrarProductoVenta } from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';

class InvoiceView extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      tipo: 0,
      buscar: '',
      loading: false,

      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
    }

    this.refProducto = React.createRef();
    this.eventSource = null;
  }

  componentWillUnmount() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  handleSelectTipo = (tipo) => {
    this.setState({ tipo: tipo }, () => {
      this.refProducto.current.focus();
    })
  }

  handleInputBuscar = async (event) => {
    this.setState({ buscar: event.target.value })
    if (isEmpty(event.target.value)) {
      this.props.handleUpdateProductos([], false, true)
    }
  }

  handleSearchCodBar = async (event) => {
    if (event.key === 'Enter') {

      this.setState({
        loading: true,
      });

      const params = {
        tipo: 1,
        filtrar: this.state.buscar,
        idSucursal: this.props.idSucursal,
        idAlmacen: this.props.idAlmacen,
        posicionPagina: 0,
        filasPorPagina: 1,
      };

      const response = await filtrarProductoVenta(params);
      if (response instanceof SuccessReponse) {
        if (!isEmpty(response.data.lists)) {
          this.props.handleAddItem(response.data.lists[0])
        }

        this.setState({
          loading: false,
          buscar: ''
        });
        this.refProducto.current.focus();
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        this.setState({
          loading: false,
          buscar: ''
        });
        this.refProducto.current.focus();
      }

      // const params = {
      //   tipo: 1,
      //   filtrar: this.state.producto,
      //   idSucursal: this.props.idSucursal,
      //   idAlmacen: this.props.idAlmacen,
      // };

      // const result = await this.fetchFiltrarVenta(params);

      // if (!isEmpty(result)) {
      //   this.handleAddItem(result[0])
      // }

      // this.setState({ loading: false, producto: '' });
    }
  }

  handleSearchText = async (text) => {
    if (this.state.loading) return;

    if (text.length <= 2) return;

    this.props.handleUpdateProductos([], true);
    await this.setStateAsync({ paginacion: 1 });
    this.fillTable(0, text.trim());
    await this.setStateAsync({ tipo: 0 });
  }

  handlePaginacion = async (listid) => {
    await this.setStateAsync({ paginacion: listid });
    this.handleSelectPaginacion();
  }

  handleSelectPaginacion = () => {
    switch (this.state.tipo) {
      case 0:
        this.fillTable(0, this.state.buscar);
        break;
    }
  }

  fillTable = async (tipo, buscar) => {
    // this.setState({
    //   loading: true,
    // });

    // const searchParams = new URLSearchParams();
    // searchParams.append("tipo", tipo);
    // searchParams.append("filtrar", buscar);
    // searchParams.append("idSucursal", this.props.idSucursal);
    // searchParams.append("idAlmacen", this.props.idAlmacen);
    // searchParams.append("posicionPagina", (this.state.paginacion - 1) * this.state.filasPorPagina);
    // searchParams.append("filasPorPagina", this.state.filasPorPagina);

    // this.eventSource = new EventSource(filtrarStreamProductoVenta(searchParams.toString()));

    // this.eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data === "__END__") {
    //     this.setState({
    //       loading: false,
    //     });

    //     this.eventSource.close()
    //     return
    //   }

    //   if (typeof data === 'object') {
    //     this.props.handleUpdateProductos(data);
    //   }

    //   if (typeof data === 'number') {
    //     const totalPaginacion = parseInt(
    //       Math.ceil(parseFloat(data) / this.state.filasPorPagina),
    //     );

    //     this.setState({
    //       totalPaginacion: totalPaginacion,
    //     });
    //   }
    // };

    // this.eventSource.onerror = () => {
    //   this.setState({
    //     loading: false,
    //   });
    // };

    this.setState({
      loading: true,
      // productos: []
    });

    const params = {
      tipo: tipo,
      filtrar: buscar,
      idSucursal: this.props.idSucursal,
      idAlmacen: this.props.idAlmacen,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await filtrarProductoVenta(params);
    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      // this.setState(prevState => ({
      //   loading: false,
      //   productos: [...prevState.productos, ...response.data.lists],
      //   totalPaginacion: totalPaginacion,
      // }));

      for (const item of response.data.lists) {
        this.props.handleUpdateProductos(item);
      }

      this.setState({
        loading: false,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
      });
    }
  }

  render() {
    const {
      codiso,
      handleStarProduct,
      handleAddItem,
      productos
    } = this.props;

    const {
      buscar,
      tipo,
      loading,
      totalPaginacion
    } = this.state;

    return (
      <div className="h-100 d-flex flex-column items">
        <ItemSearch
          refProducto={this.refProducto}
          buscar={buscar}
          tipo={tipo}
          handleSelectTipo={this.handleSelectTipo}

          handleInputBuscar={this.handleInputBuscar}
          handleSearchCodBar={this.handleSearchCodBar}
          handleSearchText={this.handleSearchText}
        />
        <ListSearchItems
          refProducto={this.refProducto}
          codiso={codiso}
          productos={productos}
          loading={loading}
          totalPaginacion={totalPaginacion}
          handlePaginacion={this.handlePaginacion}
          handleAddItem={handleAddItem}
          handleStarProduct={handleStarProduct}
        />
      </div>
    );
  }
}

const ItemSearch = (props) => {
  const {
    refProducto,
    buscar,
    tipo,
    handleSelectTipo,
    handleInputBuscar,
    handleSearchCodBar,
    handleSearchText
  } = props;

  return (
    <div className="d-flex align-items-center justify-content-between p-4">
      <div className="w-100 mr-2">
        <div className="input-group">
          <div className="input-group-prepend">
            <Button
              className={`${tipo === 1 ? "btn-success " : "btn-outline-success"} px-3`}
              onClick={() => handleSelectTipo(1)}
              icono={<i className='fa fa-barcode'></i>}
            />

            <Button
              className={`${tipo === 0 ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleSelectTipo(0)}
              icono={<i className='fa fa-search px-1'></i>}
            />
          </div>
          {
            tipo === 1 ?
              <Input
                className="border border-success"
                placeholder={`Buscar código de barras.`}
                refInput={refProducto}
                value={buscar}
                onChange={handleInputBuscar}
                onKeyDown={handleSearchCodBar}
                autoFocus={true}
              />
              :
              <Input
                className="border border-success"
                placeholder={`Buscar por código, nombres.`}
                refInput={refProducto}
                value={buscar}
                onChange={handleInputBuscar}
                onKeyUp={(event) => keyUpSearch(event, () => handleSearchText(buscar))}
                autoFocus={true}
              />
          }

        </div>
      </div>
      {/* <button className='btn btn-outline-success d-flex align-items-center justify-content-center' style={{ minWidth: "10rem" }}>
                <div className='mr-2'>Nuevo producto</div>
                <img src={images.add} alt='Agregar Producto' />
            </button> */}
    </div>
  );
};

class ListSearchItems extends React.Component {
  constructor(props) {
    super(props);
    this.refScroll = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.index = 1;
  }

  handleScroll() {
    const { loading, totalPaginacion } = this.props;

    if (loading)
      return;


    if (this.index >= totalPaginacion)
      return;


    if (this.refScroll.current) {
      const container = this.refScroll.current;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight && !this.props.loading) {
        this.index++;
        this.props.handlePaginacion(this.index);
      }
    }
  }

  render() {
    const {
      refProducto,
      loading,
      codiso,
      productos,
      handleAddItem,
      handleStarProduct,
    } = this.props;

    if (loading && isEmpty(productos)) {
      return (
        <div className="p-2 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
          <span className="loader-one"></span>
          <p className="text-secondary mt-5 text-base">Buscando ...</p>
        </div>
      );
    }

    if (isEmpty(productos)) {
      return (
        <div className="p-2 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
          <img className="mb-1" src={images.basket} alt="Canasta" />
          <p className="text-secondary text-base">
            Use la barra de busqueda para encontrar su productos.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden">
        <div
          ref={this.refScroll}
          onScroll={this.handleScroll}
          className="d-flex h-100 align-items-start justify-content-around flex-wrap mh-100 overflow-hidden overflow-y-auto"
        >
          {productos.map((item, index) => (
            <ItemView
              key={index}
              codiso={codiso}
              producto={item}
              handleAddItem={() => {
                handleAddItem(item)
                refProducto.current.focus();
              }}
              handleStarProduct={handleStarProduct}
            />
          ))}

          {loading &&
            <div className="p-2 w-100 d-flex flex-column align-items-center justify-content-center">
              <span className="loader-one"></span>
              <p className="text-secondary mt-5 text-base">Buscando ...</p>
            </div>
          }
        </div>
      </div>
    );
  }
}


const ItemView = (props) => {
  const { codiso } = props;

  const {
    idProducto,
    codigo,
    nombreProducto,
    cantidad,
    precio,
    medida,
    tipo,
    preferido,
    negativo,
    imagen,
    almacen,
    idTipoTratamientoProducto
  } = props.producto;

  const {
    handleAddItem,
    handleStarProduct,
  } = props;

  const cssNegativo =
    tipo !== 'PRODUCTO' ? '' : tipo === 'PRODUCTO' && negativo === 1 ? 'text-danger' : 'text-success';
  const detalleNegativo =
    tipo !== 'PRODUCTO' ? '' : tipo === 'PRODUCTO' && negativo === 1 ? 'VENTA SIN CONTROL DE STOCK' : 'VENTA CON CONTROL DE STOCK';

  const tipoTratamiento = idTipoTratamientoProducto === UNIDADES ? "EN UNIDADES"
    : idTipoTratamientoProducto === VALOR_MONETARIO ? "VALOR MONETARIO"
      : idTipoTratamientoProducto === A_GRANEL ? "A GRANEL" : "SERVICIO"

  return (
    <button
      type="button"
      className={`item-view ${tipo === 'PRODUCTO' && cantidad <= 0 ? 'border border-danger' : ''}`}
      onClick={handleAddItem}
    >
      <div className='position-absolute ml-1 mt-1 badge badge-danger'>
        {tipoTratamiento}
      </div>
      <div
        className="item-view_favorite btn px-1 py-1 position-absolute"
        onClick={(e) => {
          e.stopPropagation();
          const data = {
            idProducto: idProducto,
            preferido: preferido === 1 ? 0 : 1,
          };
          handleStarProduct(data);
        }}
      >
        {preferido === 1 && (
          <i
            className="fa fa-star text-white"
            style={{ fontSize: '25px' }}
          ></i>
        )}
        {preferido === 0 && (
          <i
            className="fa fa-star-o text-white"
            style={{ fontSize: '25px' }}></i>
        )}
      </div>
      <div className="item-view_describe">
        <p
          className={`item-view_describe-title ${tipo === 'PRODUCTO' && cantidad <= 0 ? 'text-danger' : ''} position-absolute`}
        >
          {tipo === 'PRODUCTO' ? `INV. ${cantidad}` : `SERVICIO`}
        </p>
        <div className="item-view_describe-image">
          <img src={imagen ? imagen : images.sale} alt="Venta" width={96} height={96} />
        </div>
      </div>
      <span className="text-center d-block w-100 my-1">
        <strong>{codigo}</strong>
      </span>
      <span className="text-center d-block w-100 my-1">
        <strong>{nombreProducto}</strong>
      </span>

      <span className={`text-center d-block w-100 my-1 text-xs ${cssNegativo}`}>
        {detalleNegativo}
      </span>
      <span className="text-center d-block w-100 ml-1 mr-1 mt-1 mb-3">
        <span className='text-xl'>{numberFormat(precio, codiso)}</span> <span className='text-sm'>x {medida}</span>
      </span>
      <span className='text-left d-block w-100 ml-1 mr-1 mt-1 text-sm'>
        Almacen: {almacen}
      </span>
    </button>
  );
};


InvoiceView.propTypes = {
  idSucursal: PropTypes.string.isRequired,
  idAlmacen: PropTypes.string.isRequired,
  codiso: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  handleUpdateProductos: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

ItemSearch.propTypes = {
  refProducto: PropTypes.object.isRequired,
  buscar: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  tipo: PropTypes.number.isRequired,
  handleSelectTipo: PropTypes.func.isRequired,
  handleInputBuscar: PropTypes.func.isRequired,
  handleSearchCodBar: PropTypes.func.isRequired,
  handleSearchText: PropTypes.func.isRequired
}

ItemView.propTypes = {
  codiso: PropTypes.string.isRequired,
  producto: PropTypes.shape({
    idProducto: PropTypes.string.isRequired,
    codigo: PropTypes.string,
    nombreProducto: PropTypes.string.isRequired,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precio: PropTypes.number.isRequired,
    medida: PropTypes.string.isRequired,
    tipo: PropTypes.string.isRequired,
    preferido: PropTypes.number.isRequired,
    negativo: PropTypes.number.isRequired,
    imagen: PropTypes.string,
    almacen: PropTypes.string,
    idTipoTratamientoProducto: PropTypes.string
  }),
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

ListSearchItems.propTypes = {
  refProducto: PropTypes.object.isRequired,
  codiso: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  totalPaginacion: PropTypes.number.isRequired,
  handlePaginacion: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

export default InvoiceView;
