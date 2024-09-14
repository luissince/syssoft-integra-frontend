import PropTypes from 'prop-types';
import { CustomModalContent } from '../../../../../../components/CustomModal';
import Button from '../../../../../../components/Button';

const ModalImpresion = ({
    refModal,
    isOpen,
    handleClose,
    handleHidden,

    handlePrintA4,
    handlePrintTicket,
}) => {
    return (
        <CustomModalContent
            contentRef={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            onHidden={handleHidden}
            contentLabel="Modal de Impresión"
            titleHeader="SysSoft Integra"
            body={
                <>
                    <h5 className='text-center'>Opciones de impresión</h5>
                    <div className='d-flex justify-content-center align-items-center gap-2_5 mt-3'>
                        <Button className="btn-outline-info"
                            onClick={handlePrintA4}>
                            <i className="fa fa-file-pdf-o"></i> A4
                        </Button>
                        {" "}
                        <Button className="btn-outline-info"
                            onClick={handlePrintTicket}>
                            <i className="fa fa-sticky-note"></i> Ticket
                        </Button>
                    </div>
                </>
            }
            footer={
                <Button
                    className="btn-danger"
                    onClick={async () => await refModal.current.handleOnClose()}>
                    <i className="fa fa-close"></i> Cerrar
                </Button>
            }
        />
    );
}

ModalImpresion.propTypes = {
    refModal: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleHidden: PropTypes.func,

    handlePrintA4: PropTypes.func.isRequired,
    handlePrintTicket: PropTypes.func.isRequired
}

export default ModalImpresion;