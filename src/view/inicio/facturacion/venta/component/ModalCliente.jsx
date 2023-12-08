const ModalCliente = (props) => {

    const { idModalCliente } = props;

    const { handleSaveCliente, handleOpenAndCloseCliente } = props;

    return (
        <div id={idModalCliente} className='side-modal'>
            <div className='side-modal_wrapper'>
                <div className="card border-0 rounded-0">
                    <div className="card-header">Configuración de Venta</div>
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={handleOpenAndCloseCliente}>
                        <span aria-hidden="true">&times;</span>
                    </button>

                    <div className="card-body">


                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="d-block">Campos obligatorios <i className="fa fa-asterisk text-danger small"></i></span>
                            <div>
                                <button className='btn btn-outline-success mr-2' onClick={handleSaveCliente}>Aceptar</button>
                                <button className='btn btn-outline-secondary ' onClick={handleOpenAndCloseCliente}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='side-modal_bottom'>
                </div>
            </div>
            <div className="side-modal_overlay" onClick={handleOpenAndCloseCliente}>
            </div>
        </div>
    );
}

export default ModalCliente;