const ModalConfiguration = (props) => {

    const { idImpuesto, refImpuesto, impuestos, idMoneda, refMoneda, monedas, handleSelectImpuesto, handleSelectMoneda, handleCloseOptions } = props;
    
    return (
        <div id="side-model-invoice" className='side-modal'>
            <div className='side-modal_wrapper'>
                <div className='w-100 h-100 bg-white d-flex flex-column'>
                    <div className="card border-0 rounded-0">
                        <h5 className="card-header">Configuración de Venta</h5>
                        <button
                            type="button"
                            className="close"
                            aria-label="Close"
                            onClick={handleCloseOptions}>
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
                                            value={idImpuesto}
                                            ref={refImpuesto}
                                        onChange={handleSelectImpuesto}
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
                                            value={idMoneda}
                                            onChange={handleSelectMoneda}>
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
                    </div>
                    {/* <div className='side-modal_bottom'>
                        <div className="d-flex align-items-center justify-content-center">
                            <p className="text-danger m-0 px-2">*</p>
                            <p className="m-0">Campos obligatorios</p>
                        </div>
                        <div className='d-flex'>
                            <button className='btn btn-outline-secondary mr-2' onClick={handleCloseOptions}>Cancelar</button>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default ModalConfiguration;