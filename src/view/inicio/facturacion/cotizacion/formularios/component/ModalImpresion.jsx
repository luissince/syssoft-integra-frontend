import PropTypes from 'prop-types';
import { CustomModalContent } from '../../../../../../components/CustomModal';
import Button from '../../../../../../components/Button';
import { images } from '../../../../../../helper';

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
                    <div className='text-center'>
                        <img src={images.accept} width={64} height={64} className='mb-2' />
                    </div>
                    <h5 className='text-center '>Proceso Completado Correctamente</h5>

                    <div className="dropdown-divider mb-3"></div>

                    <div className='alert alert-primary text-center'>
                        Se guardaron correctamente los datos.
                    </div>
                    <div className='d-flex justify-content-center'>
                        <Button
                            autoFocus={true}
                            className='btn-danger'
                            onClick={async () => await refModal.current.handleOnClose()}>
                            <img src={images.escoba} width={22} /> Realizar otra Operación.
                        </Button>
                    </div>
                    <div className='d-flex justify-content-center align-items-center flex-wrap gap-2_5 mt-3'>
                        <Button className="btn-outline-secondary"
                            onClick={handlePrintA4}>
                            <img src={images.filea4} width={22} /> Imprimir A4
                        </Button>
                        {" "}
                        <Button className="btn-outline-secondary"
                            onClick={handlePrintTicket}>
                            <img src={images.ticket} width={22} /> Imprimit Ticket
                        </Button>
                    </div>
                </>
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