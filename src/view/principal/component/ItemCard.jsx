import PropTypes from 'prop-types';
import Button from '../../../components/Button';
import Image from '../../../components/Image';
import { images } from '../../../helper';

const ItemCard = ({ item, handleIngresar }) => {
  return (
    <div className="card">
      <Image
        default={images.noImage}
        src={`${item.imagen}`}
        alt={'Imagen de la sucursal'}
        isFullScreen={false}
        overrideClass="mb-2 w-full h-40 object-contain"
      />
      <div className="card-body">
        <div className="flex flex-col gap-3">
          <h6 className="text-primary font-weight-bold text-center">
            {item.nombre}
          </h6>

          <p className="text-secondary text-center">{item.direccion}</p>

          <Button
            className="btn-block btn-outline-primary"
            onClick={() => handleIngresar(item)}
          >
            <i className="bi bi-arrow-right-circle-fill"></i> Ingresar
          </Button>
        </div>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  handleIngresar: PropTypes.func.isRequired,
};

export default ItemCard;
