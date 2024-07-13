import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CustomModalContent } from "../../../../../components/CustomModal";
import { SpinnerView } from "../../../../../components/Spinner";
import { alertWarning, readDataFile } from '../../../../../helper/utils.helper';
import { obtenerPreCotizacionPdf } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import printJS from 'print-js';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalPreImpresion extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: '',
        }

        this.peticion = false;
        this.abortController = null;

        this.refModal = React.createRef();
    }

    handleOnHidden = async () => {
        if (!this.peticion) {
            if (this.abortController) {
                this.abortController.abort();
            }
        }

        this.setState({ loading: false, });
        this.peticion = false;
        this.abortController = null;
    }

    handlePrint = async (type) => {
        const { idComprobante, idCliente, idMoneda, idUsuario, idSucursal, nota, detalles } = this.props;

        this.abortController = new AbortController();

        this.setState({
            loading: true,
            message: 'Generando pre impresión...'
        })

        const response = await obtenerPreCotizacionPdf({
            idComprobante: idComprobante,
            idCliente: idCliente,

            idMoneda: idMoneda,
            idUsuario: idUsuario,
            idSucursal: idSucursal,
            nota: nota,

            detalle: detalles
        }, type, this.abortController.signal);

        if (response instanceof SuccessReponse) {
            const base64 = await readDataFile(response.data);

            this.peticion = true;
            this.abortController = null;

            this.setState({ loading: false });
            printJS({
                printable: base64,
                type: 'pdf',
                base64: true,
                onPrintDialogClose: this.props.handleClose
            })
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.setState({
                loadingPreImpresion: false
            })

            alertWarning("Cotización", response.getMessage())
        }
    }


    handlePrintA4 = () => {
        this.handlePrint("a4");
    };

    handlePrintTicket = () => {
        this.handlePrint("ticket");
    };
    render() {
        const {
            loading,
            message,
        } = this.state;

        const {
            isOpen,
            handleClose,
        } = this.props;

        return (
            <CustomModalContent
                contentRef={this.refModal}
                isOpen={isOpen}
                onClose={handleClose}
                onHidden={this.handleOnHidden}
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
                                onClick={this.handlePrintA4}>
                                <i className="fa fa-file-pdf-o"></i> A4
                            </button>
                            {" "}
                            <button type="button" className="btn btn-outline-info"
                                onClick={this.handlePrintTicket}>
                                <i className="fa fa-sticky-note"></i> Ticket
                            </button>
                        </div>
                    </>
                }
                footer={
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={async () => await this.refModal.current.handleOnClose()}>
                        <i className="fa fa-close"></i> Cerrar
                    </button>
                }
            />
        );
    }
}

ModalPreImpresion.propTypes = {
    isOpen: PropTypes.bool.isRequired,

    idComprobante: PropTypes.string.isRequired,
    idCliente: PropTypes.string.isRequired,
    idMoneda: PropTypes.string.isRequired,
    idUsuario: PropTypes.string.isRequired,
    idSucursal: PropTypes.string.isRequired,
    nota: PropTypes.string.isRequired,
    detalles: PropTypes.array.isRequired,

    handleClose: PropTypes.func.isRequired,
};

export default ModalPreImpresion;
