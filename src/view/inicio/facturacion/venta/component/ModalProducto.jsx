const ModalProducto = (props) => {

    const { idModal } = props;

    const { handleSave, handleOpenAndClose } = props;

    return (
        <div id={idModal} className='side-modal'>
            <div className='side-modal_wrapper'>
                <div className="card border-0 rounded-0">
                    <div className="card-header">Editar producto</div>
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={handleOpenAndClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>

                    <div className="card-body">


                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="d-block">Campos obligatorios <i className="fa fa-asterisk text-danger small"></i></span>
                            <div>
                                <button className='btn btn-outline-success mr-2' onClick={handleSave}>Aceptar</button>
                                <button className='btn btn-outline-secondary ' onClick={handleOpenAndClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='side-modal_bottom'>
                </div>
            </div>
            <div className="side-modal_overlay" onClick={handleOpenAndClose}>
            </div>
        </div>
    );
}

export default ModalProducto;