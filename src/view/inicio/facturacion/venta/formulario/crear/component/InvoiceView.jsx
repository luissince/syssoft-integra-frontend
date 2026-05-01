import React from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { images } from '@/helper';
import {
  formatNumberWithZeros,
  isEmpty,
  formatCurrency,
} from '@/helper/utils.helper';
import CustomComponent from '@/components/CustomComponent';
import {
  A_GRANEL,
  NINGUNO,
  UNIDADES,
  VALOR_MONETARIO,
} from '@/model/types/tipo-tratamiento-producto';
import PropTypes from 'prop-types';
import { filtrarProductoVenta } from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import Search from '@/components/Search';
import { cn } from '@/lib/utils';
import { TIPO_PRODUCTO_NORMAL, TIPO_PRODUCTO_SERVICIO, TIPO_PRODUCTO_LOTE, TIPO_PRODUCTO_ACTIVO_FIJO } from '@/model/types/tipo-producto';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
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
    };

    this.initial = { ...this.state };

    this.refSearch = React.createRef();

    this.refProducto = React.createRef();
    this.eventSource = null;
  }

  componentWillUnmount() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  clearDataComponents = () => {
    this.setState(this.initial, () => {
      this.refSearch.current.restart();
      this.refProducto.current.focus();
    });
  };

  setInitialData = (state) => {
    this.setState(state);
    this.refSearch.current.initialize(state.buscar);
  };

  handleSelectTipo = (tipo) => {
    this.setState({ tipo: tipo }, () => {
      this.refProducto.current.focus();
    });
  };

  handleInputBuscar = async (event) => {
    this.setState({ buscar: event.target.value });
    if (isEmpty(event.target.value)) {
      this.props.handleUpdateProductos([], false, true);
    }
  };

  handleSearchCodBar = async (event) => {
    if (event.key === "Enter") {
      this.setState({
        loading: true,
      });

      const params = {
        tipo: 1,
        filtrar: this.state.buscar,
        idAlmacen: this.props.idAlmacen,
        posicionPagina: 0,
        filasPorPagina: 1,
      };

      const response = await filtrarProductoVenta(params);
      if (response instanceof SuccessReponse) {
        if (!isEmpty(response.data.list)) {
          this.props.handleAddItem(response.data.list[0]);
        }

        this.setState({
          loading: false,
          buscar: '',
        });
        this.refProducto.current.focus();
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        this.setState({
          loading: false,
          buscar: '',
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
  };

  handleSearchText = async (text) => {
    if (this.state.loading) return;

    if (isEmpty(text)) {
      this.props.handleUpdateProductos([], false, true);
      return;
    }

    this.props.handleUpdateProductos([], true);
    await this.setStateAsync({ paginacion: 1, buscar: text });
    this.fillTable(0, text.trim());
    await this.setStateAsync({ tipo: 0 });
  };

  handlePaginacion = async (listid) => {
    await this.setStateAsync({ paginacion: listid });
    this.handleSelectPaginacion();
  };

  handleSelectPaginacion = () => {
    switch (this.state.tipo) {
      case 0:
        this.fillTable(0, this.state.buscar);
        break;
    }
  };

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
      idAlmacen: this.props.idAlmacen,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await filtrarProductoVenta(params);
    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        String(Math.ceil(Number(response.data.total) / this.state.filasPorPagina)),
      );

      // this.setState(prevState => ({
      //   loading: false,
      //   productos: [...prevState.productos, ...response.data.lists],
      //   totalPaginacion: totalPaginacion,
      // }));

      for (const item of response.data.list) {
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
  };

  render() {
    const {
      codiso,
      handleStarProduct,
      handleAddItem,
      productos,
      cotizacion,
      pedido,
    } = this.props;

    const { buscar, tipo, loading, totalPaginacion } = this.state;

    return (
      <>
        <ItemSearch
          refProducto={this.refProducto}
          refSearch={this.refSearch}
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

        <div
          className="bg-white w-full flex relative border border-solid border-[#cbd5e1] flex-[1_1_3.5rem]"
        >
          <div className="px-3 flex justify-center items-center gap-2">
            {cotizacion && (
              <>
                <img src={images.cotizacion} width={22} /> COTIZACIÓN:
                <h6>
                  {cotizacion.serie}-{formatNumberWithZeros(cotizacion.numeracion)}
                </h6>
              </>
            )}

            {pedido && (
              <>
                <img src={images.invoice} width={22} /> PEDIDO:
                <h6>
                  {pedido.serie}-{formatNumberWithZeros(pedido.numeracion)}
                </h6>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

const ItemSearch = (props) => {
  const {
    refProducto,
    refSearch,
    buscar,
    tipo,
    handleSelectTipo,
    handleInputBuscar,
    handleSearchCodBar,
    handleSearchText,
  } = props;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="w-full mr-2">
        <div className="input-group">
          <div className="input-group-prepend">
            <Button
              className={cn(
                "px-3",
                tipo === 1 ? "btn-primary" : "btn-outline-primary"
              )}
              onClick={() => handleSelectTipo(1)}
            >
              <i className="fa fa-barcode"></i>
            </Button>

            <Button
              className={cn(
                tipo === 0 ? "btn-primary" : "btn-outline-primary"
              )}
              onClick={() => handleSelectTipo(0)}
            >
              <i className="fa fa-search px-1"></i>
            </Button>
          </div>
          {
            tipo === 1 ? (
              <Input
                className="border border-primary"
                placeholder={`Buscar código de barras...`}
                ref={refProducto}
                value={buscar}
                onChange={handleInputBuscar}
                onKeyDown={handleSearchCodBar}
                autoFocus={true}
              />
            ) : (
              <Search
                ref={refSearch}
                className="border border-primary"
                placeholder={`Buscar por código, nombres...`}
                refInput={refProducto}
                onSearch={handleSearchText}
              />
            )
            // <Input
            //   className="border border-success"
            //   placeholder={`Buscar por código, nombres.`}
            //   refInput={refProducto}
            //   value={buscar}
            //   onChange={handleInputBuscar}
            //   onKeyUp={(event) => keyUpSearch(event, () => handleSearchText(buscar))}
            //   autoFocus={true}
            // />
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

    if (loading) return;

    if (this.index >= totalPaginacion) return;

    if (this.refScroll.current) {
      const container = this.refScroll.current;
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight &&
        !this.props.loading
      ) {
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
        <div className="p-2 w-full h-full flex flex-col items-center justify-center">
          <span className="loader-one"></span>
          <p className="text-secondary mt-5 text-base">Buscando ...</p>
        </div>
      );
    }

    if (isEmpty(productos)) {
      return (
        <div className="p-2 w-full h-full flex flex-col items-center justify-center">
          <img className="mb-1" src={images.basket} alt="Canasta" />
          <p className="text-secondary text-base">
            Use la barra de busqueda para encontrar su productos.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden h-full">
        <div
          ref={this.refScroll}
          onScroll={this.handleScroll}
          className="flex h-full items-start justify-around flex-wrap mh-100 overflow-hidden overflow-y-auto"
        >
          {productos.map((item, index) => (
            <ItemView
              key={index}
              codiso={codiso}
              producto={item}
              handleAddItem={() => {
                handleAddItem(item);
                refProducto.current.focus();
              }}
              handleStarProduct={handleStarProduct}
            />
          ))}

          {loading && (
            <div className="p-2 w-full flex flex-col items-center justify-center">
              <span className="loader-one"></span>
              <p className="text-secondary mt-5 text-base">Buscando ...</p>
            </div>
          )}
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
    preferido,
    negativo,
    imagen,
    almacen,
    idTipoProducto,
    idTipoTratamientoProducto,
  } = props.producto;

  const { handleAddItem, handleStarProduct } = props;

  return (
    <Button
      contentClassName={cn(
        "item-view",
        idTipoProducto === TIPO_PRODUCTO_NORMAL && cantidad <= 0 && "border border-danger",
        idTipoProducto === TIPO_PRODUCTO_SERVICIO && cantidad <= 0 && "",
        idTipoProducto === TIPO_PRODUCTO_LOTE && cantidad <= 0 && "border border-danger",
        idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && cantidad <= 0 && "border border-danger",
      )}
      onClick={handleAddItem}
    >
      <div className="absolute z-10 ml-1 mt-1 badge badge-danger">
        {idTipoTratamientoProducto === UNIDADES && "EN UNIDADES"}
        {idTipoTratamientoProducto === VALOR_MONETARIO && "VALOR MONETARIO"}
        {idTipoTratamientoProducto === A_GRANEL && "A GRANEL"}
        {idTipoTratamientoProducto === NINGUNO && "NINGUNO"}
      </div>
      <div
        className="item-view_favorite btn z-10 px-1 py-1 absolute"
        onClick={(e) => {
          e.stopPropagation();
          const data = {
            idProducto: idProducto,
            preferido: preferido === 1 ? 0 : 1,
          };
          handleStarProduct(data);
        }}
      >
        <i className={cn(
          "text-white !text-2xl",
          preferido === 1 ? "fa fa-star" : "fa fa-star-o"
        )} />
      </div>
      <div className="item-view_describe">
        <p
          className={cn(
            "item-view_describe-title absolute",
            idTipoProducto === TIPO_PRODUCTO_NORMAL && cantidad <= 0 && "text-red-500",
            idTipoProducto === TIPO_PRODUCTO_SERVICIO && cantidad <= 0 && "",
            idTipoProducto === TIPO_PRODUCTO_LOTE && cantidad <= 0 && "text-red-500",
            idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && cantidad <= 0 && "text-red-500",
          )}
        >
          {idTipoProducto === TIPO_PRODUCTO_NORMAL && `STOCK: ${cantidad}`}
          {idTipoProducto === TIPO_PRODUCTO_SERVICIO && "SERVICIO"}
          {idTipoProducto === TIPO_PRODUCTO_LOTE && `STOCK: ${cantidad}`}
          {idTipoProducto === TIPO_PRODUCTO_ACTIVO_FIJO && `STOCK: ${cantidad}`}
        </p>
        <div className="flex items-center justify-center">
          <img
            src={imagen ? imagen : images.sale}
            alt="Venta"
            className="w-full h-36 object-contain"
          />
        </div>
      </div>
      <span className="text-center block w-full my-1">
        <strong>{codigo}</strong>
      </span>
      <span className="text-center block w-full my-1">
        <strong>{nombreProducto}</strong>
      </span>

      <span className={cn(
        "text-center block w-full my-1 text-xs",
        idTipoProducto !== TIPO_PRODUCTO_SERVICIO && negativo === 1 ? "text-green-600" : "text-red-500"
      )}>
        {idTipoProducto === TIPO_PRODUCTO_SERVICIO
          ? "SIN CONTROL DE STOCK"
          : negativo === 1
            ? "VENTA CON CONTROL DE STOCK"
            : "VENTA SIN CONTROL DE STOCK"}
      </span>
      <span className="text-center block w-full mb-3">
        <span className="text-xl">{formatCurrency(precio, codiso)}</span>{' '}
        <span className="text-sm">x {medida}</span>
      </span>
      <span className="text-gray-500 block w-full text-left px-3 py-1 text-sm">
        Almacen: {almacen}
      </span>
    </Button>
  );
};

InvoiceView.propTypes = {
  idSucursal: PropTypes.string.isRequired,
  idAlmacen: PropTypes.string.isRequired,
  codiso: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  cotizacion: PropTypes.object,
  pedido: PropTypes.object,
  handleUpdateProductos: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
};

ItemSearch.propTypes = {
  refProducto: PropTypes.object.isRequired,
  refSearch: PropTypes.object.isRequired,
  buscar: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  tipo: PropTypes.number.isRequired,
  handleSelectTipo: PropTypes.func.isRequired,
  handleInputBuscar: PropTypes.func.isRequired,
  handleSearchCodBar: PropTypes.func.isRequired,
  handleSearchText: PropTypes.func.isRequired,
};

ItemView.propTypes = {
  codiso: PropTypes.string.isRequired,
  producto: PropTypes.shape({
    idProducto: PropTypes.string.isRequired,
    codigo: PropTypes.string,
    nombreProducto: PropTypes.string.isRequired,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precio: PropTypes.number.isRequired,
    medida: PropTypes.string.isRequired,
    preferido: PropTypes.number.isRequired,
    negativo: PropTypes.number.isRequired,
    imagen: PropTypes.string,
    almacen: PropTypes.string,
    idTipoProducto: PropTypes.string,
    idTipoTratamientoProducto: PropTypes.string,
  }),
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
};

ListSearchItems.propTypes = {
  refProducto: PropTypes.object.isRequired,
  codiso: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  totalPaginacion: PropTypes.number.isRequired,
  handlePaginacion: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
};

export default InvoiceView;
