import { CustomModalContent } from "../../../../../../components/CustomModal";
import PropTypes from 'prop-types';
import { SpinnerView } from "../../../../../../components/Spinner";

const ModalPreImpresion = ({
    refModal,
    isOpen,
    handleClose,

    loading,
    message,

    handlePrintA4,
    handlePrintTicket,
}) => {
    return (
        <CustomModalContent
        contentRef={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            contentLabel="Modal de Pre Impresión"
            titleHeader="SysSoft Integra"
            body={
                <>
                    <SpinnerView
                        loading={loading}
                        message={message}
                    />

                    <h5 className='text-center'>Opciones de pre-impresión</h5>
                    <div className='d-flex justify-content-center align-items-center gap-2_5 mt-3'>
                        <button type="button" className="btn btn-outline-info"
                            onClick={handlePrintA4}>
                            <i className="fa fa-file-pdf-o"></i> A4
                        </button>
                        {" "}
                        <button type="button" className="btn btn-outline-info"
                            onClick={handlePrintTicket}>
                            <i className="fa fa-sticky-note"></i> Ticket
                        </button>
                    </div>
                </>
            }
            footer={
                <button 
                    type="button"
                    className="btn btn-danger"
                    onClick={async () => await refModal.current.handleOnClose()}>
                    <i className="fa fa-close"></i> Cerrar
                </button>
            }
        />
    );
}

ModalPreImpresion.propTypes = {
    refModal: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,

    loading: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,

    handlePrintA4: PropTypes.func.isRequired,
    handlePrintTicket: PropTypes.func.isRequired
}

export default ModalPreImpresion;