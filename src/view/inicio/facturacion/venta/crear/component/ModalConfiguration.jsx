import PropTypes from 'prop-types';

const ModalConfiguration = (props) => {
  const { idModalConfiguration } = props;

  const { refImpuesto, impuestos } = props;

  const { refMoneda, monedas } = props;

  const { refAlmacen, almacenes } = props;

  const { refComentario } = props;

  const { handleSaveOptions, handleCloseOptions } = props;

  return (
    <div id={idModalConfiguration} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Configuración de Venta</div>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={handleCloseOptions}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <div className="card-body h-100 overflow-y-auto">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Impuesto:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <select
                    title="Lista de Impuestos"
                    className="form-control"
                    ref={refImpuesto}
                  >
                    <option value="">-- Impuesto --</option>
                    {impuestos.map((item, index) => (
                      <option key={index} value={item.idImpuesto}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Moneda: <i className="fa fa-asterisk text-danger small"></i>{' '}
                  </label>
                  <select
                    title="Lista de Monedas"
                    className="form-control"
                    ref={refMoneda}
                  >
                    <option value="">-- Moneda --</option>
                    {monedas.map((item, index) => (
                      <option key={index} value={item.idMoneda}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Almacen: <i className="fa fa-asterisk text-danger small"></i>{' '}
                  </label>
                  <select
                    title="Lista de Almacenes"
                    className="form-control"
                    ref={refAlmacen}
                  >
                    <option value="">-- Almacen --</option>
                    {almacenes.map((item, index) => (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Comentario:</label>
                  <textarea
                    className="form-control"
                    placeholder="Comentario de la venta."
                    ref={refComentario}
                  ></textarea>
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
                  onClick={handleSaveOptions}
                >
                  Aceptar
                </button>
                <button
                  className="btn btn-outline-secondary "
                  onClick={handleCloseOptions}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="side-modal_bottom"></div>
      </div>
      <div
        className="side-modal_overlay"
        onClick={handleCloseOptions}
      ></div>
    </div>
  );
};

ModalConfiguration.propTypes = {
  idModalConfiguration: PropTypes.string.isRequired,

  refImpuesto: PropTypes.object.isRequired,
  impuestos: PropTypes.array.isRequired,

  refMoneda: PropTypes.object.isRequired,
  monedas: PropTypes.array.isRequired,

  refAlmacen: PropTypes.object.isRequired,
  almacenes: PropTypes.array.isRequired,

  refComentario: PropTypes.object.isRequired,

  handleSaveOptions: PropTypes.func.isRequired,
  handleCloseOptions: PropTypes.func.isRequired,
}


export default ModalConfiguration;
