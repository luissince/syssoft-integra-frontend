import { handlePasteInteger, keyNumberInteger, keyNumberPhone, spinnerLoading } from "../../../../../../helper/utils.helper";
import { CLIENTE_JURIDICO, CLIENTE_NATURAL } from "../../../../../../model/types/tipo-cliente";
import PropTypes from 'prop-types';

const ModalCliente = (props) => {
  // Desestructurar props para extraer valores específicos
  const { idModal, loading } = props;

  const { handleSave, handleClose, handleClickIdTipoCliente } = props;

  const { tiposDocumentos } = props;

  const { refIdTipoDocumentoPn, idTipoDocumentoPn, handleSelectIdTipoDocumentoPn } = props;

  const { refNumeroDocumentoPn, numeroDocumentoPn, handleInputNumeroDocumentoPn } = props;

  const { refInformacionPn, informacionPn, handleInputInformacionPn } = props;

  const { refNumerCelularPn, numerCelularPn, handleInputNumeroCelularPn } = props;

  const { refDireccionPn, direccionPn, handleInputDireccionPn } = props;

  const { refIdTipoDocumentoPj, idTipoDocumentoPj, handleSelectIdTipoDocumentoPj } = props;

  const { refNumeroDocumentoPj, numeroDocumentoPj, handleInputNumeroDocumentoPj } = props;

  const { refInformacionPj, informacionPj, handleInputInformacionPj } = props;

  const { refNumerCelularPj, numerCelularPj, handleInputNumeroCelularPj } = props;

  const { refDireccionPj, direccionPj, handleInputDireccionPj } = props;

  // Renderizar el componente modal
  return (
    <div id={idModal} className="side-modal">
      <div className="side-modal_wrapper">
        {/* Tarjeta para el contenido del modal */}
        <div className="card h-100 border-0 rounded-0">
          {/* Encabezado de la tarjeta para el modal */}
          <div className="card-header">Agregar Cliente</div>
          {/* Botón de cerrar para el modal */}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={handleClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          {/* Cuerpo de la tarjeta que contiene el contenido principal del modal */}
          <div className="card-body h-100 overflow-y-auto">
            {loading && spinnerLoading()}

            {/* Navegación por pestañas para Persona Natural y Persona Jurídica */}
            <div className="row">
              <div className="col">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  {/* Pestaña para Persona Natural */}
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link active"
                      id="datos-tab"
                      data-bs-toggle="tab"
                      href="#datos"
                      role="tab"
                      aria-controls="datos"
                      aria-selected={true}
                      onClick={() => handleClickIdTipoCliente(CLIENTE_NATURAL)}
                    >
                      <i className="bi bi-person"></i> Persona Natural
                    </a>
                  </li>
                  {/* Pestaña para Persona Jurídica */}
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="contacto-tab"
                      data-bs-toggle="tab"
                      href="#contacto"
                      role="tab"
                      aria-controls="contacto"
                      aria-selected={false}
                      onClick={() => handleClickIdTipoCliente(CLIENTE_JURIDICO)}
                    >
                      <i className="bi bi-building"></i> Persona Juridica
                    </a>
                  </li>
                </ul>

                {/* Contenido de la pestaña para Persona Natural y Persona Jurídica */}
                <div className="tab-content pt-2" id="myTabContent">
                  {/* Contenido de la pestaña Persona Natural */}
                  <div
                    className="tab-pane fade show active"
                    id="datos"
                    role="tabpanel"
                    aria-labelledby="datos-tab"
                  >
                    {/* Campos del formulario para Persona Natural */}
                    {/* Agregar comentarios para cada grupo de formulario describiendo el propósito */}
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <select
                            className="form-control"
                            ref={refIdTipoDocumentoPn}
                            value={idTipoDocumentoPn}
                            onChange={handleSelectIdTipoDocumentoPn}>
                            <option value={""}>- Seleccione -</option>
                            {tiposDocumentos.filter((item) => item.idTipoDocumento !== 'TD0003').map((item, index) => (
                              <option key={index} value={item.idTipoDocumento}>
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
                            N° de documento ({numeroDocumentoPn.length}): <i className="fa fa-asterisk text-danger small"></i>
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="00000000"
                            ref={refNumeroDocumentoPn}
                            value={numeroDocumentoPn}
                            onChange={handleInputNumeroDocumentoPn}
                            onKeyDown={keyNumberInteger}
                            onPaste={handlePasteInteger}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Apellidos y Nombres: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese sus apellidos y nombres."
                            ref={refInformacionPn}
                            value={informacionPn}
                            onChange={handleInputInformacionPn}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            N° de Celular:
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese el número de celular."
                            onKeyDown={keyNumberPhone}
                            ref={refNumerCelularPn}
                            value={numerCelularPn}
                            onChange={handleInputNumeroCelularPn}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Dirección:
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese la dirección"
                            ref={refDireccionPn}
                            value={direccionPn}
                            onChange={handleInputDireccionPn}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Contenido de la pestaña Persona Jurídica */}
                  <div
                    className="tab-pane fade"
                    id="contacto"
                    role="tabpanel"
                    aria-labelledby="contacto-tab"
                  >
                    {/* Campos del formulario para Persona Natural */}
                    {/* Agregar comentarios para cada grupo de formulario describiendo el propósito */}
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <select
                            className="form-control"
                            ref={refIdTipoDocumentoPj}
                            value={idTipoDocumentoPj}
                            onChange={handleSelectIdTipoDocumentoPj}>
                            <option value={""}>- Seleccione -</option>
                            {tiposDocumentos.filter((item) => item.idTipoDocumento === 'TD0003').map((item, index) => (
                              <option key={index} value={item.idTipoDocumento}>
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
                            N° de documento ({numeroDocumentoPj.length}): <i className="fa fa-asterisk text-danger small"></i>
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="00000000"
                            ref={refNumeroDocumentoPj}
                            value={numeroDocumentoPj}
                            onChange={handleInputNumeroDocumentoPj}
                            onKeyDown={keyNumberInteger}
                            onPaste={handlePasteInteger}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Razón Social: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese su razón social."
                            ref={refInformacionPj}
                            value={informacionPj}
                            onChange={handleInputInformacionPj}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            N° de Celular:
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese el número de celular."
                            onKeyDown={keyNumberPhone}
                            ref={refNumerCelularPj}
                            value={numerCelularPj}
                            onChange={handleInputNumeroCelularPj}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Dirección:
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder="Ingrese la dirección"
                            ref={refDireccionPj}
                            value={direccionPj}
                            onChange={handleInputDireccionPj}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de la tarjeta que contiene botones para Guardar y Cancelar */}
          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios <i className="fa fa-asterisk text-danger small"></i>
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

ModalCliente.propTypes = {
  idModal: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,

  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleClickIdTipoCliente: PropTypes.func.isRequired,

  tiposDocumentos: PropTypes.array.isRequired,

  refIdTipoDocumentoPn: PropTypes.object.isRequired,
  idTipoDocumentoPn: PropTypes.string.isRequired,
  handleSelectIdTipoDocumentoPn: PropTypes.func.isRequired,

  refNumeroDocumentoPn: PropTypes.object.isRequired,
  numeroDocumentoPn: PropTypes.string.isRequired,
  handleInputNumeroDocumentoPn: PropTypes.func.isRequired,

  refInformacionPn: PropTypes.object.isRequired,
  informacionPn: PropTypes.string.isRequired,
  handleInputInformacionPn: PropTypes.func.isRequired,

  refNumerCelularPn: PropTypes.object.isRequired,
  numerCelularPn: PropTypes.string.isRequired,
  handleInputNumeroCelularPn: PropTypes.func.isRequired,

  refDireccionPn: PropTypes.object.isRequired,
  direccionPn: PropTypes.string.isRequired,
  handleInputDireccionPn: PropTypes.func.isRequired,

  refIdTipoDocumentoPj: PropTypes.object.isRequired,
  idTipoDocumentoPj: PropTypes.string.isRequired,
  handleSelectIdTipoDocumentoPj: PropTypes.func.isRequired,

  refNumeroDocumentoPj: PropTypes.object.isRequired,
  numeroDocumentoPj: PropTypes.string.isRequired,
  handleInputNumeroDocumentoPj: PropTypes.func.isRequired,

  refInformacionPj: PropTypes.object.isRequired,
  informacionPj: PropTypes.string.isRequired,
  handleInputInformacionPj: PropTypes.func.isRequired,

  refNumerCelularPj: PropTypes.object.isRequired,
  numerCelularPj: PropTypes.string.isRequired,
  handleInputNumeroCelularPj: PropTypes.func.isRequired,

  refDireccionPj: PropTypes.object.isRequired,
  direccionPj: PropTypes.string.isRequired,
  handleInputDireccionPj: PropTypes.func.isRequired,
}


export default ModalCliente;
