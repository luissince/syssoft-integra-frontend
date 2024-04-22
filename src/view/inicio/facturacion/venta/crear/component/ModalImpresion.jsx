import { CustomModalContent } from "../../../../../../components/CustomModal";
import PropTypes from 'prop-types';

const ModalImpresion = ({
    refModal,
    isOpen,
    handleClose,

    handlePrintA4,
    handlePrintTicket,
}) => {

    return (
        <CustomModalContent
            contentRef={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            contentLabel="Modal de Impresión"
            titleHeader="SysSoft Integra"
            body={
                <>
                    <h5 className='text-center'>Opciones de impresión</h5>
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
                    onClick={async () => await refModal.current.handleOnClose()}
                >
                    <i className="fa fa-close"></i> Cerrar
                </button>
            }
        />
    );
}

ModalImpresion.propTypes = {
    refModal: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,

    handlePrintA4: PropTypes.func.isRequired,
    handlePrintTicket: PropTypes.func.isRequired
}

export default ModalImpresion;