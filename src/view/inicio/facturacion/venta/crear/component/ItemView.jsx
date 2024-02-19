import { images } from '../../../../../../helper';
import { numberFormat } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const ItemView = (props) => {

  const { codiso } = props;

  const {
    idProducto,
    codigo,
    nombreProducto,
    cantidad,
    precio,
    tipo,
    preferido,
    negativo,
    imagen
  } = props.producto;

  const {
    handleAddItem,
    handleStarProduct,
  } = props;

  const cssNegativo =
    tipo !== 'PRODUCTO' ? '' : tipo === 'PRODUCTO' && negativo === 0 ? 'text-danger' : 'text-success';
  const detalleNegativo =
    tipo !== 'PRODUCTO' ? '' : tipo === 'PRODUCTO' && negativo === 0 ? 'VENTA SIN NEGATIVO' : 'VENTA CON NEGATIVO';

  return (
    <button
      type="button"
      className={`item-view ${tipo === 'PRODUCTO' && cantidad <= 0 ? 'border border-danger' : ''}`}
      onClick={handleAddItem}
    >
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
      <span className="text-center d-block w-100 ml-1 mr-1 mt-1 mb-3 text-xl ">
        {numberFormat(precio, codiso)}
      </span>
    </button>
  );
};

ItemView.propTypes = {
  codiso: PropTypes.string.isRequired,
  producto: PropTypes.shape({
    idProducto: PropTypes.string.isRequired,
    codigo: PropTypes.string.isRequired,
    nombreProducto: PropTypes.string.isRequired,
    cantidad: PropTypes.number.isRequired,
    precio: PropTypes.number.isRequired,
    tipo: PropTypes.string.isRequired,
    preferido: PropTypes.number.isRequired,
    negativo: PropTypes.number.isRequired,
    imagen: PropTypes.string.isRequired,
  }),
  handleAddItem: PropTypes.func.isRequired,
  handleStarProduct: PropTypes.func.isRequired,
}

export default ItemView;
