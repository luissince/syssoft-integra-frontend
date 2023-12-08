const ModalConfiguration = (props) => {

    const { idModalConfiguration } = props;

    const { refImpuesto, impuestos } = props;

    const { refMoneda, monedas } = props;

    const { handleSaveOptions, handleOpenAndCloseOptions} = props;

    return (
        <div id={idModalConfiguration} className='side-modal'>
            <div className='side-modal_wrapper'>
                <div className="card border-0 rounded-0">
                    <div className="card-header">Configuración de Venta</div>
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={handleOpenAndCloseOptions}>
                        <span aria-hidden="true">&times;</span>
                    </button>

                    <div className="card-body">
                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <label>Impuesto</label>
                                    <select
                                        title="Lista de Impuestos"
                                        className="form-control"
                                        ref={refImpuesto}
                                    >
                                        <option value="">-- Impuesto --</option>
                                        {
                                            impuestos.map((item, index) => (
                                                <option key={index} value={item.idImpuesto}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <label>Moneda</label>
                                    <select
                                        title="Lista de Monedas"
                                        className="form-control"
                                        ref={refMoneda}
                                    >
                                        <option value="">-- Moneda --</option>
                                        {
                                            monedas.map((item, index) => (
                                                <option key={index} value={item.idMoneda}>{item.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="d-block">Campos obligatorios <i className="fa fa-asterisk text-danger small"></i></span>
                            <div>
                                <button className='btn btn-outline-success mr-2' onClick={handleSaveOptions}>Aceptar</button>
                                <button className='btn btn-outline-secondary ' onClick={handleOpenAndCloseOptions}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='side-modal_bottom'>
                </div>
            </div>
            <div className="side-modal_overlay" onClick={handleOpenAndCloseOptions}>
            </div>
        </div>
    );
}

export default ModalConfiguration;