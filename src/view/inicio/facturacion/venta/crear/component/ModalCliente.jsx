const ModalCliente = (props) => {
  const { idModal } = props;

  const { handleSave, handleOpenAndClose } = props;

  return (
    <div id={idModal} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Configuración de Venta</div>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={handleOpenAndClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <div className="card-body h-100 overflow-y-auto">

            <div className="row">
              <div className="col">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  {/* Persona Natural */}
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link active"
                      id="datos-tab"
                      data-bs-toggle="tab"
                      href="#datos"
                      role="tab"
                      aria-controls="datos"
                      aria-selected={true}
                    // onClick={() => this.setState({ tipo: 1 })}
                    >
                      <i className="bi bi-person"></i> Persona Natural
                    </a>
                  </li>
                  {/* Persona Juridica */}
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="contacto-tab"
                      data-bs-toggle="tab"
                      href="#contacto"
                      role="tab"
                      aria-controls="contacto"
                      aria-selected={false}
                    // onClick={() => this.setState({ tipo: 2 })}
                    >
                      <i className="bi bi-building"></i> Persona Juridica
                    </a>
                  </li>
                </ul>

                <div className="tab-content pt-2" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="datos"
                    role="tabpanel"
                    aria-labelledby="datos-tab"
                  >
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <select className="form-control">
                            <option>- Seleccione -</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            N° de documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder=""
                          // ref={refPrecio}
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
                            placeholder=""
                          // ref={refPrecio}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            N° de Celular: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder=""
                          // ref={refPrecio}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Dirección: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder=""
                          // ref={refPrecio}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div
                    className="tab-pane fade"
                    id="contacto"
                    role="tabpanel"
                    aria-labelledby="contacto-tab"
                  >
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <select className="form-control">
                            <option>- Seleccione -</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            N° de documento: <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder=""
                          // ref={refPrecio}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label>
                            Razón Social : <i className="fa fa-asterisk text-danger small"></i>{' '}
                          </label>
                          <input
                            className="form-control"
                            autoFocus
                            placeholder=""
                          // ref={refPrecio}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
                  onClick={handleOpenAndClose}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="side-modal_overlay" onClick={handleOpenAndClose}></div>
    </div>
  );
};

export default ModalCliente;
