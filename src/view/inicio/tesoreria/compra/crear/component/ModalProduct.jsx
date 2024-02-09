import { CustomModalContent } from '../../../../../../components/CustomModal';
import {
  keyNumberFloat,
  spinnerLoading,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

export const CustomModalProduct = ({
  refPrinter,
  isOpen,
  onOpen,
  onHidden,
  onClose,

  loading,

  refCantidad,
  cantidad,
  handleInputCantidad,

  refCosto,
  costo,
  handleInputCosto,

  handleAdd,
}) => {

  return (
    <CustomModalContent
      contentRef={(ref) => refPrinter.current = ref}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal Producto"
      titleHeader="Agregar Producto"
      body={
        <>
          {loading && spinnerLoading('Cargando datos...')}

          <h5>Detalle de la Compra</h5>

          <div className="row">
            <div className="col-md-4 col-sm-4">
              <hr />
            </div>
            <div className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
              <h6 className="mb-0">Tipos de cobros</h6>
            </div>
            <div className="col-md-4 col-sm-4">
              <hr />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  autoFocus
                  type="text"
                  className="form-control"
                  placeholder="0.00"
                  ref={refCantidad}
                  value={cantidad}
                  onChange={handleInputCantidad}
                  onKeyUp={(event) => {
                    if (event.code === 'Enter') {
                      handleAdd();
                    }
                  }}
                  onKeyDown={keyNumberFloat}
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Costo:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0.00"
                  ref={refCosto}
                  value={costo}
                  onChange={handleInputCosto}
                  onKeyDown={keyNumberFloat}
                />
              </div>
            </div>
          </div>
        </>
      }

      footer={
        <>
          <button type="button"
            className="btn btn-primary"
            onClick={handleAdd}>
            <i className="fa fa-plus"></i> Agregar
          </button>
          <button type="button"
            className="btn btn-danger"
            onClick={onClose}>
            <i className="fa fa-close"></i> Cerrar
          </button>
        </>
      }
    />
  );
}

CustomModalProduct.propTypes = {
  refPrinter: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,

  refCantidad: PropTypes.object.isRequired,
  cantidad: PropTypes.string.isRequired,
  handleInputCantidad: PropTypes.func.isRequired,

  refCosto: PropTypes.object.isRequired,
  costo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputCosto: PropTypes.func.isRequired,

  handleAdd: PropTypes.func.isRequired,
}
