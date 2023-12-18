import {
  keyNumberFloat,
  spinnerLoading,
} from '../../../../../helper/utils.helper';

const ModalProducto = (props) => {
  const { idModalProducto } = props;

  const { loadModal, productos } = props;

  const {
    refIdProductoCombo,
    refCantidadCombo,
    refUnidadCombo,
    refCostoCombo,
  } = props;

  const { handleSelectProductoCombo, handleSaveItemCombo } = props;

  return (
    <div
      className="modal fade"
      id={idModalProducto}
      tabIndex="-1"
      aria-labelledby="modalInventarioLabel"
      aria-hidden={true}
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Seleccione producto</h5>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden={true}>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {loadModal && spinnerLoading('Cargando información...')}

            <div className="form-group">
              <label>
                Producto <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <select
                className="form-control"
                ref={refIdProductoCombo}
                onChange={handleSelectProductoCombo}
              >
                <option value={''}>-- Seleccione --</option>
                {productos.map((item, index) => (
                  <option key={index} value={item.idProducto}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="form-group col-sm-4 col-12">
                <label>
                  Cantidad
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control "
                  placeholder="0"
                  ref={refCantidadCombo}
                  onKeyDown={keyNumberFloat}
                />
              </div>

              <div className="form-group col-sm-4  col-12">
                <label>
                  Unidad de Medida
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control disabled"
                  disabled
                  ref={refUnidadCombo}
                />
              </div>

              <div className="form-group col-sm-4  col-12">
                <label>
                  Costo
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control disabled"
                  placeholder="0"
                  disabled
                  ref={refCostoCombo}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveItemCombo}
            >
              Aceptar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProducto;
