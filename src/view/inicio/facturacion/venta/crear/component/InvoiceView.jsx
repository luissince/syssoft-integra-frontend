import { images } from '../../../../../../helper';
import { isEmpty } from '../../../../../../helper/utils.helper';
import ItemSearch from './ItemSearch';
import ItemView from './ItemView';

const InvoiceView = (props) => {
  const {
    refProducto,
    producto,
    productos,
    sarchProducto,
    idSucursal,
    filterProducto,
    handleFilterProducto,
    handleAddItem,
  } = props;

  const { handleStarProduct } = props;

  return (
    <div className="h-100 d-flex flex-column items">
      <ItemSearch
        refProducto={refProducto}
        producto={producto}
        idSucursal={idSucursal}
        filterProducto={filterProducto}
        handleFilterProducto={handleFilterProducto}
      />
      <ListSearchItems
        productos={productos}
        sarchProducto={sarchProducto}
        handleAddItem={handleAddItem}
        handleStarProduct={handleStarProduct}
      />
    </div>
  );
};

const ListSearchItems = ({
  productos,
  sarchProducto,
  handleAddItem,
  handleStarProduct,
}) => {
  if (sarchProducto) {
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
          No hay productos que satisfacen la búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="d-flex h-100 align-items-start justify-content-around flex-wrap mh-100 overflow-hidden overflow-y-auto my-2">
        {productos.map((item, index) => {
          return (
            <ItemView
              key={index}
              producto={item}
              handleAddItem={() => handleAddItem(item)}
              handleStarProduct={handleStarProduct}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceView;
