import Button from '../../../../../../components/Button';
import { Switches } from '../../../../../../components/Checks';
import Column from '../../../../../../components/Column';
import Row from '../../../../../../components/Row';
import { formatDecimal } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const DetalleImagen = (props) => {
  const { tipo } = props;

  const { imagen, handleInputImagen, handleRemoveImagen } = props;

  const { nombre, precio } = props;

  const { publicar, handleSelectPublico } = props;

  const { negativo, handleSelectNegativo } = props;

  const { preferido, handleSelectPreferido } = props;

  const { estado, handleSelectEstado } = props;

  const { handleRegistrar, handleCerrar } = props;

  return (
    <>
      <Row>
        <Column className="col-12 text-center" formGroup={true}>
          <img
            src={imagen.url}
            alt="Logo"
            className="img-fluid border border-primary rounded"
          />
          <label>
            <b className='text-danger'>* Las imagenes no debe superar los 50 KB.</b>
          </label>
        </Column>
      </Row>

      <Row>
        <Column className="col-12 text-center" formGroup={true}>
          <input
            type="file"
            id="fileImage"
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="display-none"
            onChange={handleInputImagen}
          />
          <label htmlFor="fileImage" className="btn btn-outline-secondary m-0">
            <div className="content-button">
              <i className="bi bi-image"></i>
              <span></span>
            </div>
          </label>{' '}
          <Button
            className="btn-outline-secondary"
            onClick={handleRemoveImagen}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </Column>
      </Row>

      <Row>
        <Column className=" col-12" formGroup={true}>
          <h4 className="text-black-50">
            {nombre !== '' ? nombre : 'Producto sin nombre'}
          </h4>
        </Column>
      </Row>

      <Row>
        <Column className=" col-12" formGroup={true}>
          <h2 className="text-black-50">S/ {formatDecimal(precio)} PEN</h2>
        </Column>
      </Row>

      <div className="dropdown-divider"></div>

      <Row>
        <Column className="col-md-12" formGroup={true}>
          <Switches
            id="customSwitchPublicar"
            checked={publicar}
            onChange={handleSelectPublico}
          >
            <div className="font-weight-bold text-black-50 ">
              Publicar en la Tienda Virtual
            </div>
            <div className="text-black-50">
              Publica este producto en tu tienda.
            </div>
          </Switches>
        </Column>
      </Row>

      {tipo === 'TP0001' && (
        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Switches
              id="customSwitchVentaNegativo"
              checked={negativo}
              onChange={handleSelectNegativo}
            >
              <div className="font-weight-bold text-black-50 ">
                Venta en negativo
              </div>
              <div className="text-black-50">
                Vende sin unidades disponibles
              </div>
            </Switches>
          </Column>
        </Row>
      )}

      <Row>
        <Column className="col-md-12" formGroup={true}>
          <Switches
            id="customSwitchPreferido"
            checked={preferido}
            onChange={handleSelectPreferido}
          >
            <div className="font-weight-bold text-black-50 ">Preferido</div>
            <div className="text-black-50">
              Se muestra como producto estrella al cargar la venta.
            </div>
          </Switches>
        </Column>
      </Row>

      <Row>
        <Column className="col-md-12" formGroup={true}>
          <Switches
            id="customSwitchEstado"
            checked={estado}
            onChange={handleSelectEstado}
          >
            <div className="font-weight-bold text-black-50 ">Estado</div>
            <div className="text-black-50">
              Controla si el producto esta disponible.
            </div>
          </Switches>
        </Column>
      </Row>

      <Row>
        <Column className="col-md-6" formGroup={true}>
          <Button
            className="btn-primary btn-block"
            onClick={handleRegistrar}
          >
            <i className='fa fa-save'></i>  Guardar
          </Button>
        </Column>
        <Column className="col-md-6" formGroup={true}>
          <Button
            className="btn-secondary btn-block"
            onClick={handleCerrar}
          >
            <i className='fa fa-close'></i>  Cerrar
          </Button>
        </Column>
      </Row>
    </>
  );
};

DetalleImagen.propTypes = {
  tipo: PropTypes.string,

  imagen: PropTypes.object,
  handleInputImagen: PropTypes.func,
  handleRemoveImagen: PropTypes.func,

  nombre: PropTypes.string,
  precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  publicar: PropTypes.bool,
  handleSelectPublico: PropTypes.func,

  negativo: PropTypes.bool,
  handleSelectNegativo: PropTypes.func,

  preferido: PropTypes.bool,
  handleSelectPreferido: PropTypes.func,

  estado: PropTypes.bool,
  handleSelectEstado: PropTypes.func,

  handleRegistrar: PropTypes.func,
  handleCerrar: PropTypes.func,
}

export default DetalleImagen;