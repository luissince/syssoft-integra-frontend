import { images } from '../../../../../../helper';
import { numberFormat } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { A_GRANEL, UNIDADES, VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';

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

export default ItemView;