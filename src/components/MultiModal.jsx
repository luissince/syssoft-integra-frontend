import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { images } from "../helper";
import Button from "./Button";
import CustomModal, { CustomModalContentBody, CustomModalContentFooter, CustomModalContentHeader, CustomModalForm } from "./CustomModal";
import { SpinnerView } from './Spinner';
import { CLIENTE_JURIDICO, CLIENTE_NATURAL } from '../model/types/tipo-cliente';
import { comboTipoDocumento, createPersona, getUbigeo } from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';
import ErrorResponse from '../model/class/error-response';
import { CANCELED } from '../model/types/types';
import { alertDialog, convertNullText, currentDate, isEmpty, keyNumberPhone, validateNumberWhatsApp } from '../helper/utils.helper';
import { getDni, getRuc } from '../network/rest/apisperu.network';
import Row from './Row';
import Column from './Column';
import RadioButton from './RadioButton';
import Select from './Select';
import Input from './Input';
import SearchInput from './SearchInput';
import { RUC } from '../model/types/tipo-documento';
import { alertKit } from 'alert-kit';

/**
 * Modal para mostrar del impresión.
 */
const ModalImpresion = ({
    refModal,
    isOpen,
    clear,
    handleClose,
    handleHidden,

    handlePrinterA4,
    handlePrinter80MM,
    handlePrinter58MM
}) => {
    return (
        <CustomModal
            ref={refModal}
            isOpen={isOpen}
            onClose={handleClose}
            onHidden={handleHidden}
            contentLabel={"Modal de Impresión"}
            shouldCloseOnEsc={false}>
            <CustomModalContentHeader
                contentRef={refModal}
                showClose={false}>
                SysSoft Integra
            </CustomModalContentHeader>

            <CustomModalContentBody>
                <div className='text-center'>
                    <img src={images.accept} width={64} height={64} className='mb-2' />
                </div>
                <h5 className='text-center '>Proceso Completado</h5>

                <div className="dropdown-divider mb-3"></div>

                <div className='alert alert-primary text-center'>
                    Se guardaron correctamente los datos.
                </div>
                <div className='d-flex justify-content-center'>
                    <Button
                        autoFocus
                        className='btn-danger'
                        onClick={async () => {
                            if (clear) clear();
                            await refModal.current.handleOnClose();
                        }}>
                        <img src={images.escoba} width={22} /> Realizar otra Operación.
                    </Button>
                </div>
                <div className='d-flex justify-content-center align-items-center flex-wrap gap-2-5 mt-3'>
                    {handlePrinterA4 && <Button className="btn-outline-secondary"
                        onClick={handlePrinterA4}>
                        <i className="fa fa-print"></i> A4
                    </Button>}
                    {" "}
                    {handlePrinter80MM && <Button className="btn-outline-secondary"
                        onClick={handlePrinter80MM}>
                        <i className="fa fa-print"></i> 80MM
                    </Button>
                    }
                    {" "}
                    {handlePrinter58MM && <Button className="btn-outline-secondary"
                        onClick={handlePrinter58MM}>
                        <i className="fa fa-print"></i> 58MM
                    </Button>
                    }
                </div>
            </CustomModalContentBody>
        </CustomModal>
    );
}

ModalImpresion.propTypes = {
    refModal: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    clear: PropTypes.func,
    handleClose: PropTypes.func.isRequired,
    handleHidden: PropTypes.func,

    handlePrinterA4: PropTypes.func,
    handlePrinter80MM: PropTypes.func,
    handlePrinter58MM: PropTypes.func,
}

/**
 * Modal para mostrar el modal de pre impresión.
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

    handleOpen = async () => {
        this.refPhone.current.focus();
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
        this.abortController = new AbortController();

        this.setState({
            loading: true,
            message: 'Generando pre impresión...'
        });

        await this.props.handleProcess(
            type,
            this.abortController,
            () => {
                this.peticion = true;
                this.abortController = null;

                this.setState({ loading: false });
            },
            () => {
                this.peticion = false;
                this.abortController = null;
                this.setState({ loading: false });
            });
    }

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
            <CustomModal
                ref={this.refModal}
                isOpen={isOpen}
                onClose={handleClose}
                onHidden={this.handleOnHidden}
                contentLabel={"Modal Pre Impresión"}>
                <CustomModalContentHeader
                    contentRef={this.refModal}>
                    SysSoft Integra
                </CustomModalContentHeader>

                <CustomModalContentBody>
                    <SpinnerView
                        loading={loading}
                        message={message}
                    />

                    <h5 className='text-center'>Opciones de pre-impresión</h5>
                    <div className='d-flex justify-content-center align-items-center gap-2-5 mt-3'>
                        <Button
                            className="btn-outline-info"
                            onClick={() => this.handlePrint('a4')}>
                            <i className="fa fa-file-pdf-o"></i> A4
                        </Button>
                        {" "}
                        <Button
                            className="btn-outline-info"
                            onClick={() => this.handlePrint('ticket')}>
                            <i className="fa fa-sticky-note"></i> Ticket
                        </Button>
                    </div>
                </CustomModalContentBody>

                <CustomModalContentFooter>
                    <Button
                        className="btn-danger"
                        onClick={async () => await this.refModal.current.handleOnClose()}>
                        <i className="fa fa-close"></i> Cerrar
                    </Button>
                </CustomModalContentFooter>
            </CustomModal>
        );
    }
}

ModalPreImpresion.propTypes = {
    isOpen: PropTypes.bool.isRequired,

    handleClose: PropTypes.func.isRequired,
    handleProcess: PropTypes.func.isRequired,
};

/**
 * Modal para registrar de personas.
 * @extends React.Component
 */
class ModalPersona extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            msgLoading: 'Cargando datos...',

            idTipoCliente: CLIENTE_NATURAL,
            idTipoDocumento: '',
            documento: '',
            informacion: '',
            celular: '',
            email: '',
            direccion: '',
            idUbigeo: '',

            tiposDocumentos: [],

            ubigeos: [],
        }

        this.refModal = React.createRef();
        this.peticion = false;
        this.abortController = null;

        this.refTipoDocumento = React.createRef();
        this.refDocumento = React.createRef();
        this.refInformacion = React.createRef();
        this.refCelular = React.createRef();

        this.refDireccion = React.createRef();
        this.refUbigeo = React.createRef();
        this.refValueUbigeo = React.createRef();
    }

    handleOnOpen = async () => {
        this.abortController = new AbortController();

        const response = await comboTipoDocumento(
            this.abortController.signal,
        );

        if (response instanceof SuccessReponse) {
            this.peticion = true;
            this.abortController = null;

            this.setState({
                tiposDocumentos: response.data,
                loading: false,
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.peticion = false;
            this.abortController = null;

            this.setState({
                msgLoading: 'Se produjo un error un interno, intente nuevamente.',
            });
        }
    }

    handleOnHidden = async () => {
        if (!this.peticion) {
            if (this.abortController) {
                this.abortController.abort();
            }
        }

        this.setState({
            loading: true,
            msgLoading: 'Cargando datos...',

            idTipoCliente: CLIENTE_NATURAL,
            idTipoDocumento: '',
            documento: '',
            informacion: '',
            celular: '',
            email: '',
            direccion: '',
            idUbigeo: '',

            tiposDocumentos: [],

            ubigeos: [],
        });

        this.peticion = false;
        this.abortController = null;
    }

    handleTipoCliente = (event) => {
        this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' })
    }

    handleSelectTipoDocumento = (event) => {
        this.setState({ idTipoDocumento: event.target.value });
    }

    handleInputNumeroDocumento = (event) => {
        this.setState({ documento: event.target.value });
    }

    handleInputInformacion = (event) => {
        this.setState({ informacion: event.target.value });
    }

    handleInputCelular = (event) => {
        this.setState({ celular: event.target.value });
    }

    handleInputEmail = (event) => {
        this.setState({ email: event.target.value });
    }

    handleInputDireccion = (event) => {
        this.setState({ direccion: event.target.value });
    }

    handleGetApiReniec = async () => {
        if (this.state.documento.length !== 8) {
            alertKit.warning({
                title: "Persona",
                message: 'Para iniciar la busqueda en número dni debe tener 8 caracteres.',
            }, () => {
                this.refDocumento.current.focus();
            })
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de DNI...',
        });

        const response = await getDni(this.state.documento);

        if (response instanceof SuccessReponse) {
            this.setState({
                documento: convertNullText(response.data.dni),
                informacion: convertNullText(response.data.apellidoPaterno) + ' ' + convertNullText(response.data.apellidoMaterno) + ' ' + convertNullText(response.data.nombres),
                loading: false,
            });
        }

        if (response instanceof ErrorResponse) {
            alertKit.warning({
                title: 'Persona',
                message: response.getMessage(),
            }, () => {
                this.setState({
                    loading: false,
                });
            });
        }
    }

    handleGetApiSunat = async () => {
        if (this.state.documento.length !== 11) {
            alertKit.warning({
                title: "Persona",
                message: 'Para iniciar la busqueda en número ruc debe tener 11 caracteres.',
            }, () => {
                this.refDocumentoPj.current.focus();
            })
            return;
        }

        this.setState({
            loading: true,
            msgLoading: 'Consultando número de RUC...',
        });

        const response = await getRuc(this.state.documento);

        if (response instanceof SuccessReponse) {
            this.setState({
                documento: convertNullText(response.data.ruc),
                informacionPj: convertNullText(response.data.razonSocial),
                direccionPj: convertNullText(response.data.direccion),
                loading: false,
            });
        }

        if (response instanceof ErrorResponse) {
            alertKit.warning({
                title: 'Persona',
                message: response.getMessage(),
            }, () => {
                this.setState({
                    loading: false,
                });
            });
        }
    }

    handleFilter = async (value) => {
        const searchWord = value;
        this.setState({ idUbigeo: '' });

        if (isEmpty(searchWord)) {
            this.setState({ ubigeos: [] });
            return;
        }

        const params = {
            filtrar: searchWord,
        };

        const response = await getUbigeo(params);

        if (response instanceof SuccessReponse) {
            this.setState({ ubigeos: response.data });
        }

        if (response instanceof ErrorResponse) {
            this.setState({ ubigeos: [] });
        }
    }

    handleSelectItem = async (value) => {
        this.refUbigeo.current.initialize(value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')');
        this.setState({
            ubigeos: [],
            idUbigeo: value.idUbigeo,
        });
    }

    handleClearInput = () => {
        this.setState({ ubigeos: [], idUbigeo: '', });
    }

    handleOnSubmit = async () => {
        const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumento);

        if (isEmpty(this.state.idTipoDocumento)) {
            alertKit.warning({
                title: "Persona",
                message: 'Seleccione el tipo de documento.',
            }, () => {
                this.refTipoDocumento.current.focus();
            })
            return;
        }

        if (isEmpty(this.state.documento)) {
            alertKit.warning({
                title: "Persona",
                message: 'Ingrese el número de documento.',
            }, () => {
                this.refDocumento.current.focus();
            })
            return;
        }

        if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.documento.length) {
            alertKit.warning({
                title: "Persona",
                message: `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`,
            }, () => {
                this.refDocumento.current.focus();
            })
            return;
        }

        if (isEmpty(this.state.informacion)) {
            alertKit.warning({
                title: "Persona",
                message: 'Ingrese los apellidos y nombres.',
            }, () => {
                this.refInformacion.current.focus();
            })
            return;
        }

        alertKit.question({
            title: "Persona",
            message: '¿Estás seguro de continuar?',
            acceptButton: {
                html: "<i class='fa fa-check'></i> Aceptar",
            },
            cancelButton: {
                html: "<i class='fa fa-close'></i> Cancelar",
            },
        }, async (accept) => {
            if (accept) {
                const data = {
                    idTipoCliente: this.state.idTipoCliente,
                    idTipoDocumento: this.state.idTipoDocumento,
                    documento: this.state.documento.toString().trim().toUpperCase(),
                    informacion: this.state.informacion.trim().toUpperCase(),
                    cliente: true,
                    proveedor: false,
                    conductor: false,
                    licenciaConducir: '',
                    telefono: '',
                    celular: this.state.celular.toString().trim().toUpperCase(),
                    fechaNacimiento: currentDate(),
                    email: this.state.email.trim(),
                    genero: '',
                    direccion: this.state.direccion.trim().toUpperCase(),
                    idUbigeo: this.state.idUbigeo,
                    estadoCivil: '',
                    predeterminado: false,
                    estado: true,
                    observacion: '',
                    idUsuario: this.props.idUsuario,
                };

                alertKit.loading({
                    message: 'Procesando información...',
                });

                const response = await createPersona(data);

                if (response instanceof SuccessReponse) {
                    alertKit.success({
                        title: 'Persona',
                        message: response.data,
                    }, async () => {
                        await this.refModal.current.handleOnClose()
                    });
                }

                if (response instanceof ErrorResponse) {
                    alertKit.warning({
                        title: 'Persona',
                        message: response.getMessage(),
                    });
                }
            }
        });
    }

    render() {
        const {
            idTipoCliente,
            idTipoDocumento,
            documento,
            informacion,
            celular,
            email,
            direccion,
        } = this.state;

        const {
            isOpen,
            onClose,
        } = this.props;

        return (
            <CustomModalForm
                contentRef={this.refModal}
                isOpen={isOpen}
                onOpen={this.handleOnOpen}
                onHidden={this.handleOnHidden}
                onClose={onClose}
                contentLabel="Modal Proveedor"
                titleHeader="Agregar Proveedor"
                onSubmit={this.handleOnSubmit}
                body={
                    <>
                        <SpinnerView
                            loading={this.state.loading}
                            message={this.state.msgLoading}
                        />

                        <Row>
                            <Column>
                                <label>
                                    Tipo de Persona: <i className="fa fa-asterisk text-danger small"></i>
                                </label>
                            </Column>
                        </Row>

                        <Row>
                            <Column formGroup={true}>
                                <RadioButton
                                    className='form-check-inline'
                                    name='ckTipoCliente'
                                    id={CLIENTE_NATURAL}
                                    value={CLIENTE_NATURAL}
                                    checked={idTipoCliente === CLIENTE_NATURAL}
                                    onChange={this.handleTipoCliente}
                                >
                                    <i className="bi bi-person"></i> Persona Natural
                                </RadioButton>

                                <RadioButton
                                    className='form-check-inline'
                                    name='ckTipoCliente'
                                    id={CLIENTE_JURIDICO}
                                    value={CLIENTE_JURIDICO}
                                    checked={idTipoCliente === CLIENTE_JURIDICO}
                                    onChange={this.handleTipoCliente}
                                >
                                    <i className="bi bi-building"></i> Persona Juridica
                                </RadioButton>
                            </Column>
                        </Row>

                        <Row>
                            <Column className='col-md-6 col-12' formGroup={true}>
                                <Select
                                    label={<>Tipo Documento: <i className='fa fa-asterisk text-danger small'></i></>}
                                    value={idTipoDocumento}
                                    ref={this.refTipoDocumento}
                                    onChange={this.handleSelectTipoDocumento}
                                >
                                    <option value="">-- Seleccione --</option>
                                    {
                                        idTipoCliente === CLIENTE_NATURAL && (
                                            this.state.tiposDocumentos.filter((item) => item.idTipoDocumento !== RUC).map((item, index) => (
                                                <option key={index} value={item.idTipoDocumento}>
                                                    {item.nombre}
                                                </option>
                                            ))
                                        )
                                    }
                                    {
                                        idTipoCliente === CLIENTE_JURIDICO && (
                                            this.state.tiposDocumentos.filter((item) => item.idTipoDocumento === RUC).map((item, index) => (
                                                <option key={index} value={item.idTipoDocumento}>
                                                    {item.nombre}
                                                </option>
                                            ))
                                        )
                                    }
                                </Select>
                            </Column>

                            <Column className='col-md-6 col-12' formGroup={true}>
                                <Input
                                    group={true}
                                    label={<>  N° de documento ({documento.length}): <i className="fa fa-asterisk text-danger small"></i></>}
                                    role={"integer"}
                                    ref={this.refDocumento}
                                    value={documento}
                                    onChange={this.handleInputNumeroDocumento}
                                    placeholder="00000000"
                                    buttonRight={<>
                                        {
                                            idTipoCliente === CLIENTE_NATURAL && (
                                                <Button
                                                    className="btn-outline-secondary"
                                                    title="Reniec"
                                                    onClick={this.handleGetApiReniec}
                                                >
                                                    <img src={images.reniec} alt="Reniec" width="12" />
                                                </Button>
                                            )
                                        }
                                        {
                                            idTipoCliente === CLIENTE_JURIDICO && (
                                                <Button
                                                    className="btn-outline-secondary"
                                                    title="Sunat"
                                                    onClick={this.handleGetApiSunat}
                                                >
                                                    <img src={images.sunat} alt="Sunat" width="12" />
                                                </Button>
                                            )
                                        }
                                    </>}
                                />

                            </Column>
                        </Row>

                        <Row>
                            <Column formGroup={true}>
                                <Input
                                    label={<>
                                        {idTipoCliente === CLIENTE_NATURAL && 'Apellidos y Nombres:'}
                                        {idTipoCliente === CLIENTE_JURIDICO && 'Razón Social:'}
                                        <i className="fa fa-asterisk text-danger small"></i>
                                    </>}
                                    ref={this.refInformacion}
                                    value={informacion}
                                    onChange={this.handleInputInformacion}
                                    placeholder={
                                        idTipoCliente === CLIENTE_NATURAL
                                            ? 'Ingrese sus Apellidos y Nombres'
                                            : 'Ingrese su Razón Social'
                                    }
                                />
                            </Column>
                        </Row>

                        <Row>
                            <Column className='col-md-6 col-12' formGroup={true}>
                                <Input
                                    label={"N° de Celular:"}
                                    role={"phone"}
                                    value={celular}
                                    ref={this.refCelular}
                                    onChange={this.handleInputCelular}
                                    placeholder="Ingrese el número de celular."
                                />
                            </Column>

                            <Column formGroup={true}>
                                <Input
                                    label={"E-Mail:"}
                                    type="email"
                                    value={email}
                                    onChange={this.handleInputEmail}
                                    placeholder="Ingrese el email"
                                />
                            </Column>
                        </Row>

                        <Row>
                            <Column formGroup={true}>
                                <Input
                                    label={"Dirección:"}
                                    ref={this.refDireccion}
                                    value={direccion}
                                    onChange={this.handleInputDireccion}
                                    placeholder="Ingrese la dirección"
                                />
                            </Column>
                        </Row>

                        <Row>
                            <Column formGroup={true}>
                                <SearchInput
                                    ref={this.refUbigeo}
                                    label={"Ubigeo:"}
                                    placeholder="Escribe para iniciar a filtrar..."
                                    refValue={this.refValueUbigeo}
                                    data={this.state.ubigeos}
                                    handleClearInput={this.handleClearInput}
                                    handleFilter={this.handleFilter}
                                    handleSelectItem={this.handleSelectItem}
                                    renderItem={(value) =>
                                        <>{value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')'}</>
                                    }
                                />
                            </Column>
                        </Row>
                    </>
                }
                footer={
                    <>
                        <Button
                            type="submit"
                            className="btn-primary">
                            <i className="fa fa-save"></i> Registrar
                        </Button>
                        <Button
                            type="button"
                            className="btn-danger"
                            onClick={async () => await this.refModal.current.handleOnClose()}>
                            <i className="fa fa-close"></i> Cerrar
                        </Button>
                    </>
                }
            />
        );
    }
}

ModalPersona.propTypes = {
    refModal: PropTypes.object,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,

    idUsuario: PropTypes.string.isRequired
};

/**
 * Modal para enviar mensaje por Whatsapp.
 */
class ModalSendWhatsApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
        }

        this.refPhone = React.createRef();
    }

    handleOpen = async () => {
        this.refPhone.current.focus();
        this.setState({ phone: this.props.phone ?? '' })
    }

    handleInputPhone = (event) => {
        this.setState({ phone: event.target.value })
    }

    handleSendWhatsapp = async () => {
        if (!validateNumberWhatsApp(this.state.phone)) {
            alertKit.warning({
                title: "WhatsApp",
                message: "El número de teléfono no es válido.",
            }, () => {
                this.refPhone.current.focus();
            });
            return;
        }

        this.props.handleProcess(this.state.phone, async () => {
            await this.props.refModal.current.handleOnClose()
        });
    }


    render() {
        const {
            refModal,
            isOpen,
            handleClose,
            handleHidden,
        } = this.props;

        return (
            <CustomModal
                ref={refModal}
                isOpen={isOpen}
                onOpen={this.handleOpen}
                onClose={handleClose}
                onHidden={handleHidden}
                contentLabel={"Modal de Enviar Whatsapp"}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}>
                <CustomModalContentHeader
                    contentRef={refModal}
                    showClose={true}
                    isMoveable={true}>
                    SysSoft Integra
                </CustomModalContentHeader>

                <CustomModalContentBody>
                    <h4>Enviar Mensaje WhatsApp</h4>

                    <Row>
                        <Column formGroup={true}>
                            <Input
                                autoFocus={true}
                                label={"Número de teléfono (con código de país)"}
                                placeholder={"Ej: +51966750883"}
                                ref={this.refPhone}
                                value={this.state.phone}
                                onChange={this.handleInputPhone}
                                onKeyDown={keyNumberPhone}
                            />
                        </Column>
                    </Row>

                    <Row>
                        <Column formGroup={true}>
                            <Button
                                autoFocus={true}
                                className='btn-dark'
                                onClick={this.handleSendWhatsapp}>
                                <img src={images.whatsapp} width={22} /> Enviar mensaje
                            </Button>
                        </Column>
                    </Row>
                </CustomModalContentBody>
            </CustomModal>
        );
    }
}

ModalSendWhatsApp.propTypes = {
    refModal: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    phone: PropTypes.string,
    handleHidden: PropTypes.func,
    handleClose: PropTypes.func.isRequired,
    handleProcess: PropTypes.func.isRequired,
}

export {
    ModalImpresion,
    ModalPreImpresion,
    ModalPersona,
    ModalSendWhatsApp
}
