import { formatDecimal } from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const DetalleImagen = (props) => {
  const { tipo } = props;

  const { imagen, refFileImagen, handleInputImagen, handleRemoveImagen } = props;

  const { nombre, precio } = props;

  const { publicar, handleSelectPublico } = props;

  const { negativo, handleSelectNegativo } = props;

  const { inventariado, handleSelectInventariado } = props;

  const { preferido, handleSelectPreferido } = props;

  const { estado, handleSelectEstado } = props;

  const { handleRegistrar, handleCerrar } = props;

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <div className="">
              <img
                src={imagen}
                alt=""
                className="img-fluid border border-primary rounded"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 text-center ">
          <input
            type="file"
            id="fileImage"
            accept="image/png, image/jpeg, image/gif, image/svg, image/webp"
            className="display-none"
            ref={refFileImagen}
            onChange={handleInputImagen}
          />
          <label htmlFor="fileImage" className="btn btn-outline-secondary m-0">
            <div className="content-button">
              <i className="bi bi-image"></i>
              <span></span>
            </div>
          </label>{' '}
          <button
            className="btn btn-outline-secondary"
            onClick={handleRemoveImagen}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div className="row">
        <div className=" col-12">
          <h4 className="text-black-50 pt-2">
            {nombre !== '' ? nombre : 'Producto sin nombre'}
          </h4>
        </div>
      </div>

      <div className="row">
        <div className=" col-12">
          <h2 className="text-black-50">S/ {formatDecimal(precio)} PEN</h2>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="row">
        <div className="form-group col-md-12">
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customSwitchPublicar"
              checked={publicar}
              onChange={handleSelectPublico}
            />
            <label
              className="custom-control-label"
              htmlFor="customSwitchPublicar"
            >
              <div className="font-weight-bold text-black-50 ">
                Publicar en la Tienda Virtual
              </div>
              <div className="text-black-50">
                Publica este producto en tu tienda.
              </div>
            </label>
          </div>
        </div>
      </div>

      {tipo === 'TP0001' && (
        <div className="row">
          <div className="form-group col-md-12">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customSwitchInventariable"
                checked={inventariado}
                onChange={handleSelectInventariado}
              />
              <label
                className="custom-control-label"
                htmlFor="customSwitchInventariable"
              >
                <div className="font-weight-bold text-black-50 ">
                  Inventariable
                </div>
                <div className="text-black-50">
                  Controla costos y cantidades.
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {tipo === 'TP0001' && (
        <div className="row">
          <div className="form-group col-md-12">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customSwitchVentaNegativo"
                checked={negativo}
                onChange={handleSelectNegativo}
              />
              <label
                className="custom-control-label"
                htmlFor="customSwitchVentaNegativo"
              >
                <div className="font-weight-bold text-black-50 ">
                  Venta en negativo
                </div>
                <div className="text-black-50">
                  Vende sin unidades disponibles
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="form-group col-md-12">
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customSwitchPreferido"
              checked={preferido}
              onChange={handleSelectPreferido}
            ></input>
            <label
              className="custom-control-label"
              htmlFor="customSwitchPreferido"
            >
              <div className="font-weight-bold text-black-50 ">Preferido</div>
              <div className="text-black-50">
                Se muestra como producto estrella al cargar la venta.
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-12">
          <div className="custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customSwitchEstado"
              checked={estado}
              onChange={handleSelectEstado}
            >
            </input>
            <label
              className="custom-control-label"
              htmlFor="customSwitchEstado">
              <div className="font-weight-bold text-black-50 ">Estado</div>
              <div className="text-black-50">
                Controla si el producto esta disponible.
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-6">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleRegistrar}
          >
            <i className='fa fa-save'></i>  Guardar
          </button>
        </div>
        <div className="form-group col-md-6">
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleCerrar}
          >
            <i className='fa fa-close'></i>  Cerrar
          </button>
        </div>
      </div>
    </>
  );
};

DetalleImagen.propTypes = {
  tipo: PropTypes.string,

  imagen: PropTypes.string,
  refFileImagen: PropTypes.object,
  handleInputImagen: PropTypes.func,
  handleRemoveImagen: PropTypes.func,

  nombre: PropTypes.string,
  precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  publicar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  handleSelectPublico: PropTypes.func,

  negativo: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  handleSelectNegativo: PropTypes.func,

  inventariado: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  handleSelectInventariado: PropTypes.func,

  preferido: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  handleSelectPreferido: PropTypes.func,

  estado: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  handleSelectEstado: PropTypes.func,

  handleRegistrar: PropTypes.func,
  handleCerrar: PropTypes.func,
}

export default DetalleImagen;
