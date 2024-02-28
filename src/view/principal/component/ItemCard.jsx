import PropTypes from 'prop-types';
import { isEmpty } from '../../../helper/utils.helper';
import { images } from '../../../helper';

const ItemCard = ({ item, handleIngresar }) => {
    return (
        <div className="col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="form-group">
                <div className="card">
                    <img
                        src={isEmpty(item.ruta) ? images.noImage : `${import.meta.env.VITE_APP_IMAGE}${item.ruta}`}
                        alt="Imagen de la sucursal"
                        className="card-img-top"
                    />

                    <div className="card-body m-2">
                        <h6 className="text-primary font-weight-bold">
                            {item.nombre}
                        </h6>
                        <h6 className="text-secondary">{item.direccion}</h6>
                        <button
                            onClick={() => handleIngresar(item)}
                            type="button"
                            className="btn btn-block btn-outline-primary"
                        >
                            <i className="bi bi-arrow-right-circle-fill"></i> Ingresar
                        </button>
                    </div>

                    <hr className="m-0" />
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