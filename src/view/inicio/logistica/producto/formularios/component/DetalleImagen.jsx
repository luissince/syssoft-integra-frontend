import Button from '../../../../../../components/Button';
import { Switches } from '../../../../../../components/Checks';
import { ImageUpload } from '../../../../../../components/Image';
import { images } from '../../../../../../helper';
import { formatDecimal } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { PRODUCTO } from '../../../../../../model/types/tipo-producto';

const DetalleImagen = (props) => {
  const { idTipoProducto } = props;

  const { imagen, handleInputImagen, handleRemoveImagen } = props;

  const { nombre, precio } = props;

  const { publicar, handleSelectPublico } = props;

  const { negativo, handleSelectNegativo } = props;

  const { preferido, handleSelectPreferido } = props;

  const { estado, handleSelectEstado } = props;

  const { handleRegistrar, handleCerrar } = props;

  return (
    <>
      <div
        className="flex items-center justify-center"
      >
        <ImageUpload
          className="w-full flex flex-col items-center text-center gap-2"
          label="Imagen principal del producto"
          subtitle="Las imagenes no debe superar los 500 KB."
          imageUrl={imagen.url}
          defaultImage={images.noImage}
          alt="Imagen del producto"
          inputId="fileImagen"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
          onChange={handleInputImagen}
          onClear={handleRemoveImagen}
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-3">
        <h4 className="text-gray-500">
          {nombre || 'Producto sin nombre'}
        </h4>

        <h4 className="text-gray-500">
          S/ {formatDecimal(precio)} PEN
        </h4>
      </div>

      <div className="dropdown-divider"></div>

      <div className="flex flex-col gap-3">
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


        {idTipoProducto === PRODUCTO && (
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
        )}

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
      </div>

      <div className="flex justify-center gap-3">
        <div className="w-full">
          <Button className="btn-success btn-block" onClick={handleRegistrar}>
            <i className="fa fa-save"></i> Guardar
          </Button>
        </div>
        <div className="w-full">
          <Button className="btn-secondary btn-block" onClick={handleCerrar}>
            <i className="fa fa-close"></i> Cerrar
          </Button>
        </div>
      </div>
    </>
  );
};

DetalleImagen.propTypes = {
  idTipoProducto: PropTypes.string,

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
};

export default DetalleImagen;
