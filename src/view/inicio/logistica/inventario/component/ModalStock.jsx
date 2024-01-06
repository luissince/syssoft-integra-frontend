import {
  keyNumberFloat,
  spinnerLoading,
} from '../../../../../helper/utils.helper';

const ModalStock = (props) => {
  const { idModalStock } = props;

  const { loading } = props;

  const { refStockMinimo, stockMinimo, handleInputStockMinimo } = props;

  const { refStockMaximo, stockMaximo, handleInputStockMaximo } = props;

  const { handleSave } = props;

  return (
    <div
      className="modal fade"
      id={idModalStock}
      tabIndex="-1"
      aria-labelledby="modalStockLabel"
      aria-hidden={true}
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Actualizar stock</h5>
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
            {loading && spinnerLoading('Cargando información...')}

            <div className="row">
              <div className="form-group col-sm-6  col-12">
                <label>
                  Stock Máximo
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ingrese..."
                  ref={refStockMaximo}
                  value={stockMaximo}
                  onChange={handleInputStockMaximo}
                  onKeyDown={keyNumberFloat}
                />
              </div>

              <div className="form-group col-sm-6 col-12">
                <label>
                  Stock Mínimo
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  autoFocus
                  type="text"
                  className="form-control "
                  placeholder="ingrese..."
                  ref={refStockMinimo}
                  value={stockMinimo}
                  onChange={handleInputStockMinimo}
                  onKeyDown={keyNumberFloat}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
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

export default ModalStock;
