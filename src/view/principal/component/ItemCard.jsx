import PropTypes from 'prop-types';
import Button from '../../../components/Button';
import Image from '../../../components/Image';
import { images } from '../../../helper';

const ItemCard = ({ item, handleIngresar }) => {
  return (
    <div className="border border-solid border-[#e2e8f0] w-60 flex flex-col rounded">
      <div className="flex-1 px-3 py-4 flex flex-col gap-y-3">
        <Image
          default={images.noImage}
          src={`${item.imagen}`}
          alt={'Imagen de la sucursal'}
          isFullScreen={false}
          overrideClass="mb-2 w-full h-40 object-contain"
        />
        <h6 className="text-primary font-weight-bold text-center">
          {item.nombre}
        </h6>

        <div className="h-full">
          <p className="text-secondary text-center">{item.direccion}</p>
        </div>

        <Button
          className="btn-block btn-outline-primary"
          onClick={() => handleIngresar(item)}
        >
          <i className="bi bi-arrow-right-circle-fill"></i> Ingresar
        </Button>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  handleIngresar: PropTypes.func.isRequired,
};

export default ItemCard;
