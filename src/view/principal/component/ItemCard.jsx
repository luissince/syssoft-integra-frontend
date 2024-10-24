import PropTypes from 'prop-types';
import Button from '../../../components/Button';
import Image from '../../../components/Image';

const ItemCard = ({ item, handleIngresar }) => {
  return (
    <div className="col-lg-4 col-md-5 col-sm-12 col-12">
      <div className="form-group">
        <div className="card">
          <Image
            src={ `${item.imagen}`}
            alt={"Imagen de la sucursal"}
            className={"card-img-top"}
          />
          <div className="card-body m-2">
            <h6 className="text-primary font-weight-bold text-center">
              {item.nombre}
            </h6>
            <h6 className="text-secondary text-center">{item.direccion}</h6>
            <Button
              className='btn-block btn-outline-primary'
              onClick={() => handleIngresar(item)}
            >
              <i className="bi bi-arrow-right-circle-fill"></i> Ingresar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  handleIngresar: PropTypes.func.isRequired
};

export default ItemCard;