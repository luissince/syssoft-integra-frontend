import { images } from '../../../../../../helper';
import { isEmpty } from '../../../../../../helper/utils.helper';
import ItemSearch from './ItemSearch';
import ItemView from './ItemView';
import PropTypes from 'prop-types';

const InvoiceView = (props) => {
  const {
    codiso,
    refProducto,
    producto,
    productos,
    filtrarCodBar,
    filtrarProducto,
    handleCodBarProducto,
    handleAllProducto,
    handleFilterCodBarProducto,
    handleSearchCodBarProducto,
    handleFilterAllProducto,
    handleAddItem,
  } = props;

  const { handleStarProduct } = props;

  return (
    <div className="h-100 d-flex flex-column items">
      <ItemSearch
        refProducto={refProducto}
        producto={producto}         
        filtrarCodBar={filtrarCodBar}
        handleCodBarProducto={handleCodBarProducto}
        handleAllProducto={handleAllProducto}
        handleFilterCodBarProducto={handleFilterCodBarProducto}
        handleSearchCodBarProducto={handleSearchCodBarProducto}
        handleFilterAllProducto={handleFilterAllProducto}
      />
      <ListSearchItems
        codiso={codiso}
        productos={productos}
        filtrarProducto={filtrarProducto}
        handleAddItem={handleAddItem}
        handleStarProduct={handleStarProduct}
      />
    </div>
  );
};

const ListSearchItems = ({
  codiso,
  productos,
  filtrarProducto,
  handleAddItem,
  handleStarProduct,
}) => {
  if (filtrarProducto) {
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
              codiso={codiso}
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

InvoiceView.propTypes = {
  codiso: PropTypes.string.isRequired,
  refProducto: PropTypes.object.isRequired,
  producto: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  filtrarCodBar: PropTypes.bool.isRequired,
  filtrarProducto: PropTypes.bool.isRequired,
  handleCodBarProducto: PropTypes.func.isRequired,
  handleAllProducto: PropTypes.func.isRequired,
  handleFilterCodBarProducto: PropTypes.func.isRequired,
  handleSearchCodBarProducto: PropTypes.func.isRequired,
  handleFilterAllProducto: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

ListSearchItems.propTypes = {
  codiso: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  filtrarProducto: PropTypes.bool.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

export default InvoiceView;
