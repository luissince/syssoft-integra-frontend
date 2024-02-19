import { spinnerLoading } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const ModalProducto = (props) => {

  const { idModal, loading, producto } = props;

  const { refPrecio, refBonificacion, refDescripcion } = props;

  const { listPrecio } = props;

  const { handleSave, handleClose } = props;

  const handleSeleccionar = (precio) => {
    refPrecio.current.value = precio.valor;
  };

  return (
    <div id={idModal} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Editar producto</div>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={handleClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <div className="card-body h-100 overflow-y-auto">
            {loading && spinnerLoading()}

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <h5>
                    <i className="fa fa-pencil"></i>{' '}
                    {producto && producto.nombreProducto}
                  </h5>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Precio: <i className="fa fa-asterisk text-danger small"></i>{' '}
                  </label>
                  <input
                    className="form-control"
                    autoFocus
                    placeholder="0.00"
                    ref={refPrecio}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Bonificación:</label>
                  <input
                    className="form-control"
                    placeholder="0"
                    ref={refBonificacion}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Descripción:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Ingrese los datos del producto"
                    ref={refDescripcion}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Lista de Precios:</label>
                  <ul className="list-group">
                    {listPrecio.map((item, index) => (
                      <button
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSeleccionar(item)}
                      >
                        {item.nombre} - {item.valor}
                      </button>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </span>
              <div>
                <button
                  className="btn btn-outline-success mr-2"
                  onClick={handleSave}
                >
                  Aceptar
                </button>
                <button
                  className="btn btn-outline-secondary "
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="side-modal_overlay" onClick={handleClose}></div>
    </div>
  );
};

ModalProducto.propTypes = {
  idModal: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  producto:  PropTypes.object,

  refPrecio: PropTypes.object.isRequired,
  refBonificacion: PropTypes.object.isRequired,
  refDescripcion: PropTypes.object.isRequired,

  listPrecio: PropTypes.any.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
}

export default ModalProducto;
