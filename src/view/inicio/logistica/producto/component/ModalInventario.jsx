import {
  keyNumberFloat,
  spinnerLoading,
} from '../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const ModalInventario = (props) => {
  const { idModalInventario } = props;

  const { loadModal, almacenes } = props;

  const { refIdAlmacen, refCantidad, refCantidadMaxima, refCantidadMinima } =
    props;

  const { handleSaveAlmacen } = props;

  return (
    <div
      className="modal fade"
      id={idModalInventario}
      tabIndex="-1"
      aria-labelledby="modalInventarioLabel"
      aria-hidden={true}
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Seleccione Almacen</h5>
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
                Nombre Almacen{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <select className="form-control" ref={refIdAlmacen}>
                <option value={''}>-- Seleccione --</option>
                {almacenes.map((item, index) => (
                  <option key={index} value={item.idAlmacen}>
                    {item.nombre} / {item.sucursal}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="form-group col-sm-4 col-12">
                <label>
                  Cantidad Inicial
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0"
                  ref={refCantidad}
                  onKeyDown={keyNumberFloat}
                />
              </div>

              <div className="form-group col-sm-4  col-12">
                <label>
                  Cantidad máxima
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0"
                  ref={refCantidadMaxima}
                  onKeyDown={keyNumberFloat}
                />
              </div>

              <div className="form-group col-sm-4  col-12">
                <label>
                  Cantidad mínima
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0"
                  ref={refCantidadMinima}
                  onKeyDown={keyNumberFloat}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAlmacen}
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

ModalInventario.propTypes = {
  
}

export default ModalInventario;
