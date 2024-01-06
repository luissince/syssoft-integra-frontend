import {
  keyNumberFloat,
  spinnerLoading,
} from '../../../../../../helper/utils.helper';

const ModalProduct = (props) => {
  const { idModal, loading } = props;

  const { refCantidad, cantidad, handleInputCantidad } = props;

  const { refCosto, costo, handleInputCosto } = props;

  const { handleAddProduct } = props;

  return (
    <div
      className="modal fade"
      id={idModal}
      data-bs-keyboard="false"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Agregar Producto</h6>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {loading && spinnerLoading('Cargando datos...')}

            {/* Titutlo del modal */}
            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                <div className="text-left">
                  <h5>Detalle de la Compra</h5>
                </div>
              </div>
            </div>

            {/* Sun titulo */}
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
                        handleAddProduct();
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

            <br />
          </div>

          {/* Procesar y cerrar venta */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddProduct}
            >
              <i className="bi bi-plus"></i> Agregar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-bs-dismiss="modal"
            >
              <i className="bi bi-x"></i> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProduct;
