import Button from "../../../../../../components/Button";
import CustomModal, { CustomModalContentBody, CustomModalContentFooter, CustomModalContentHeader } from "../../../../../../components/CustomModal";
import PropTypes from 'prop-types';

const ModalElegirInterfaz = ({
    refModal,
    isOpen,
    handleClose,

    handleInterfazClasico,
    handleInterfazModerno,
}) => {
    return (
        <CustomModal
            ref={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            contentLabel="Elegir Interfaz"
        >
            <CustomModalContentHeader
                contentRef={refModal}>
                SysSoft Integr
            </CustomModalContentHeader>

            <CustomModalContentBody>
                <h5 className='text-center'>Elegir Interfaz</h5>
                <div className='d-flex justify-content-center align-items-center gap-2-5 py-3'>
                    <Button className="btn-outline-info"
                        onClick={handleInterfazClasico}>
                        <i className="fa fa-desktop"></i> Clasico
                    </Button>
                    {" "}
                    <Button className="btn-outline-info"
                        onClick={handleInterfazModerno}>
                        <i className="fa fa-tablet"></i> Moderno
                    </Button>
                </div>
            </CustomModalContentBody>

            <CustomModalContentFooter>
                <Button
                    className="btn-danger"
                    onClick={async () => await refModal.current.handleOnClose()}
                >
                    <i className="fa fa-close"></i> Cerrar
                </Button>
            </CustomModalContentFooter>
        </CustomModal>
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