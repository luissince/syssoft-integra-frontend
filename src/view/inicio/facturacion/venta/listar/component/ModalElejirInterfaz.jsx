import { CustomModalContent } from "../../../../../../components/CustomModal";
import PropTypes from 'prop-types';

const ModalElegirInterfaz = ({
    refModal,
    isOpen,
    handleClose,

    handleInterfazClasico,
    handleInterfazModerno,
}) => {
    return (
        < CustomModalContent
            contentRef={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            contentLabel="Elegir Interfaz"
            titleHeader="SysSoft Integra"
            body={
                <>
                    <h5 className='text-center'>Elegir Interfaz</h5>
                    <div className='d-flex justify-content-center align-items-center gap-2_5 mt-3'>
                        <button type="button" className="btn btn-outline-info"
                            onClick={handleInterfazClasico}>
                            <i className="fa fa-desktop"></i> Clasico
                        </button>
                        {" "}
                        <button type="button" className="btn btn-outline-info"
                            onClick={handleInterfazModerno}>
                            <i className="fa fa-tablet"></i> Moderno
                        </button>
                    </div>
                </>
            }
            footer={
                <button type="button"
                    className="btn btn-danger"
                    //onClick={async () => await refModal.current.handleClose()}
                    onClick={async () => await refModal.current.handleOnClose()}
                    >
                    <i className="fa fa-close"></i> Cerrar
                </button>
            }
        />
    );
}

ModalElegirInterfaz.propTypes = {
    refModal: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,

    handleInterfazClasico: PropTypes.func.isRequired,
    handleInterfazModerno: PropTypes.func.isRequired
}


export default ModalElegirInterfaz;