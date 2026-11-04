import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { images } from '../helper';
import Button from './Button';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader,
  CustomModalForm,
} from './CustomModal';
import { SpinnerView } from './Spinner';
import {
  comboTipoDocumento,
  createPersona,
  getUbigeo,
} from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';
import ErrorResponse from '../model/class/error-response';
import { CANCELED } from '../model/types/types';
import {
  convertNullText,
  currentDate,
  formatCurrency,
  isEmpty,
  isNumeric,
  isText,
  keyNumberPhone,
  validateNumberWhatsApp,
} from '../helper/utils.helper';
import { getDni, getRuc } from '../network/rest/api-client';
import Row from './Row';
import Column from './Column';
import Select from './Select';
import Input from './Input';
import SearchInput from './SearchInput';
import { alertKit } from 'alert-kit';
import { JURIDICA } from '@/model/types/tipo-entidad';
import { Capacitor } from '@capacitor/core';
import { BsWhatsapp } from 'react-icons/bs';
import TextArea from './TextArea';

/**
 * Modal para mostrar del impresión.
 */
const ModalImpresion = ({
  title = "SysSoft Integra",
  message = "Proceso Completado",
  subTitle = "Se guardaron correctamente los datos.",

  buttonTitle = "Realizar otra Operación.",

  refModal,
  isOpen,
  clear,
  handleClose,
  handleHidden,

  handlePrinterMobile,
  handlePrinterA4,
  handlePrinter80MM,
  handlePrinter58MM,
}) => {
  return (
    <CustomModal
      ref={refModal}
      isOpen={isOpen}
      onClose={handleClose}
      onHidden={handleHidden}
      contentLabel={'Modal de Impresión'}
      shouldCloseOnEsc={false}
    >
      <CustomModalContentHeader contentRef={refModal} showClose={false}>
        {title}
      </CustomModalContentHeader>

      <CustomModalContentBody>
        <div className="flex items-center justify-center">
          <img src={images.accept} width={64} height={64} className="mb-2" />
        </div>

        <h5 className="text-center">
          {message}
        </h5>

        <div className="dropdown-divider mb-3"></div>

        <div className="alert alert-primary text-center">
          {subTitle}
        </div>
        <div className="d-flex justify-content-center">
          <Button
            autoFocus
            className="btn-danger"
            onClick={async () => {
              if (clear) clear();
              await refModal.current.handleOnClose();
            }}
          >
            <div className="flex items-center justify-between space-x-2">
              <img src={images.escoba} width={22} />{' '}
              <span>{buttonTitle}</span>
            </div>
          </Button>
        </div>
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-2-5 mt-3">
          {
            Capacitor.isNativePlatform() ? (
              <Button
                className="btn-outline-secondary"
                onClick={handlePrinterMobile}>
                <i className="fa fa-print"></i> Imprimir
              </Button>
            ) : (
              <>
                {handlePrinterA4 && (
                  <Button
                    className="btn-outline-secondary"
                    onClick={handlePrinterA4}>
                    <i className="fa fa-print"></i> A4
                  </Button>
                )}{' '}
                {handlePrinter80MM && (
                  <Button
                    className="btn-outline-secondary"
                    onClick={handlePrinter80MM}
                  >
                    <i className="fa fa-print"></i> 80MM
                  </Button>
                )}{' '}
                {handlePrinter58MM && (
                  <Button
                    className="btn-outline-secondary"
                    onClick={handlePrinter58MM}
                  >
                    <i className="fa fa-print"></i> 58MM
                  </Button>
                )}
              </>
            )
          }
        </div>
      </CustomModalContentBody>
    </CustomModal>
  );
};

ModalImpresion.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  subTitle: PropTypes.string,

  buttonTitle: PropTypes.string,

  refModal: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  clear: PropTypes.func,
  handleClose: PropTypes.func.isRequired,
  handleHidden: PropTypes.func,

  handlePrinterMobile: PropTypes.func,
  handlePrinterA4: PropTypes.func,
  handlePrinter80MM: PropTypes.func,
  handlePrinter58MM: PropTypes.func,
};

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
    };

    this.initial = { ...this.state };

    this.peticion = false;
    this.abortController = null;

    this.refModal = React.createRef();
  }

  handleOpen = async () => {

  };

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState(this.initial);

    this.peticion = false;
    this.abortController = null;
  };

  handlePrint = async (type) => {
    this.abortController = new AbortController();

    this.setState({
      loading: true,
      message: 'Generando pre impresión...',
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
      },
    );
  };

  render() {
    const { loading, message } = this.state;

    const { isOpen, handleClose } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onClose={handleClose}
        onHidden={this.handleOnHidden}
        contentLabel={'Modal Pre Impresión'}
      >
        <CustomModalContentHeader contentRef={this.refModal}>
          SysSoft Integra
        </CustomModalContentHeader>

        <CustomModalContentBody>
          <SpinnerView loading={loading} message={message} />

          <h5 className="text-center">Opciones de pre-impresión</h5>
          <div className="d-flex justify-content-center align-items-center gap-2-5 mt-3">
            <Button
              className="btn-outline-info"
              onClick={() => this.handlePrint('a4')}
            >
              <i className="fa fa-file-pdf-o"></i> A4
            </Button>{' '}
            <Button
              className="btn-outline-info"
              onClick={() => this.handlePrint('ticket')}
            >
              <i className="fa fa-sticky-note"></i> Ticket
            </Button>
          </div>
        </CustomModalContentBody>

        <CustomModalContentFooter>
          <Button
            className="btn-danger"
            onClick={async () => await this.refModal.current.handleOnClose()}
          >
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

      idTipoDocumento: '',
      documento: '',
      informacion: '',
      celular: '',
      email: '',
      direccion: '',
      idUbigeo: '',

      tiposDocumentos: [],

      ubigeos: [],
    };

    this.initial = { ...this.state };

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

    const response = await comboTipoDocumento(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState({
        tiposDocumentos: response.data,
        loading: false,
      }, () => {
        this.refTipoDocumento.current.focus();
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
  };

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState(this.initial);

    this.peticion = false;
    this.abortController = null;
  };

  handleSelectTipoDocumento = (event) => {
    this.setState({ idTipoDocumento: event.target.value });
  };

  handleInputNumeroDocumento = (event) => {
    this.setState({ documento: event.target.value });
  };

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value });
  };

  handleInputCelular = (event) => {
    this.setState({ celular: event.target.value });
  };

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value });
  };

  handleGetApiReniec = async () => {
    if (this.state.documento.length !== 8) {
      alertKit.warning({
        title: 'Persona',
        message:
          'Para iniciar la busqueda en número dni debe tener 8 caracteres.',
      }, () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    this.setState({
      loading: true,
      msgLoading: 'Consultando número de DNI...',
    });

    const { success, data, message, type } = await getDni(this.state.documento);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: "Persona",
        message: message,
      }, () => {
        this.setState({
          loading: false,
        });
      });
      return;
    }

    this.setState({
      documento: convertNullText(data.dni),
      informacion:
        convertNullText(data.apellidoPaterno) +
        ' ' +
        convertNullText(data.apellidoMaterno) +
        ' ' +
        convertNullText(data.nombres),
      loading: false,
    });
  };

  handleGetApiSunat = async () => {
    if (this.state.documento.length !== 11) {
      alertKit.warning({
        title: 'Persona',
        message:
          'Para iniciar la busqueda en número ruc debe tener 11 caracteres.',
      }, () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    this.setState({
      loading: true,
      msgLoading: 'Consultando número de RUC...',
    });

    const { success, data, message, type } = await getRuc(this.state.documento);

    if (!success) {
      if (type === CANCELED) return;

      alertKit.warning({
        title: "Persona",
        message: message,
      }, () => {
        this.setState({
          loading: false,
        });
      });
      return;
    }

    this.setState({
      documento: convertNullText(data.ruc),
      informacion: convertNullText(data.razonSocial),
      direccion: convertNullText(data.direccion),
      loading: false,
    });
  };

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
  };

  handleSelectItem = async (value) => {
    this.refUbigeo.current.initialize(`${value.departamento} - ${value.provincia} - ${value.distrito} (${value.ubigeo})`);
    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  };

  handleClearInput = () => {
    this.setState({ ubigeos: [], idUbigeo: '' });
  };

  handleOnSubmit = async () => {
    const tipoDocumento = this.state.tiposDocumentos.find(
      (item) => item.idTipoDocumento === this.state.idTipoDocumento,
    );

    if (isEmpty(this.state.idTipoDocumento)) {
      alertKit.warning({
        title: 'Persona',
        message: 'Seleccione el tipo de documento.',
      }, () => {
        this.refTipoDocumento.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.documento)) {
      alertKit.warning({
        title: 'Persona',
        message: 'Ingrese el número de documento.',
      }, () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    if (
      tipoDocumento &&
      tipoDocumento.obligado === 1 &&
      tipoDocumento.longitud !== this.state.documento.length
    ) {
      alertKit.warning({
        title: 'Persona',
        message: `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`,
      }, () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertKit.warning({
        title: 'Persona',
        message: 'Ingrese los apellidos y nombres.',
      }, () => {
        this.refInformacion.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Persona',
      message: '¿Estás seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
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
          await this.refModal.current.handleOnClose();
        });
      }

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: 'Persona',
          message: response.getMessage(),
        });
      }
    }
  };

  render() {
    const {
      idTipoDocumento,
      documento,
      informacion,
      celular,
      email,
      direccion,

      tiposDocumentos
    } = this.state;

    const { contentLabel = 'Modal Persona', titleHeader = 'Agregar Persona', isOpen, onClose } = this.props;

    const tipoDocumento = tiposDocumentos.find((item) => item.idTipoDocumento === idTipoDocumento);

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel={contentLabel}
        titleHeader={titleHeader}
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView
              loading={this.state.loading}
              message={this.state.msgLoading}
            />

            <Row>
              <Column className="col-md-6 col-12" formGroup={true}>
                <Select
                  label={
                    <label>
                      Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                  }
                  value={idTipoDocumento}
                  ref={this.refTipoDocumento}
                  onChange={this.handleSelectTipoDocumento}
                >
                  <option value="">-- Seleccione --</option>
                  {
                    tiposDocumentos.map((item, index) => (
                      <option key={index} value={item.idTipoDocumento}>
                        {item.nombre}
                      </option>
                    ))
                  }
                </Select>
              </Column>

              <Column className="col-md-6 col-12" formGroup={true}>
                <Input
                  group={true}
                  label={
                    <label>
                      N° de documento ({documento.length}): <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                  }
                  role={'integer'}
                  ref={this.refDocumento}
                  value={documento}
                  onChange={this.handleInputNumeroDocumento}
                  placeholder={tipoDocumento && tipoDocumento.longitud ? `Ingrese ${tipoDocumento.longitud} dígitos` : 'Ingrese número de documento'}
                  buttonRight={
                    <>
                      {tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ?
                        (
                          <Button
                            className="btn-outline-secondary"
                            title="Sunat"
                            onClick={this.handleGetApiSunat}
                          >
                            <img src={images.sunat} alt="Sunat" width="12" />
                          </Button>
                        )
                        :
                        (
                          <Button
                            className="btn-outline-secondary"
                            title="Reniec"
                            onClick={this.handleGetApiReniec}
                          >
                            <img src={images.reniec} alt="Reniec" width="12" />
                          </Button>
                        )
                      }
                    </>
                  }
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={
                    <label>
                      {tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ? 'Razón Social: ' : 'Apellidos y Nombres: '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                  }
                  ref={this.refInformacion}
                  value={informacion}
                  onChange={this.handleInputInformacion}
                  placeholder={tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ? 'Ingrese Razón Social' : 'Ingrese Apellidos y Nombres'}
                />
              </Column>
            </Row>

            <Row>
              <Column className="col-md-6 col-12" formGroup={true}>
                <Input
                  label="N° de Celular:"
                  role={'phone'}
                  value={celular}
                  ref={this.refCelular}
                  onChange={this.handleInputCelular}
                  placeholder="Ingrese el número de celular."
                />
              </Column>

              <Column formGroup={true}>
                <Input
                  label="Correo Electrónico:"
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
                  label="Dirección:"
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
                  label="Ubigeo:"
                  placeholder="Escribe para iniciar a filtrar..."
                  refValue={this.refValueUbigeo}
                  data={this.state.ubigeos}
                  handleClearInput={this.handleClearInput}
                  handleFilter={this.handleFilter}
                  handleSelectItem={this.handleSelectItem}
                  renderItem={(value) => (
                    `${value.departamento} - ${value.provincia} - ${value.distrito} (${value.ubigeo})`
                  )}
                />
              </Column>
            </Row>
          </>
        }
        footer={
          <>
            <Button type="submit" className="btn-primary">
              <i className="fa fa-save"></i> Registrar
            </Button>
            <Button
              type="button"
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </>
        }
      />
    );
  }
}

ModalPersona.propTypes = {
  contentLabel: PropTypes.string,
  titleHeader: PropTypes.string,

  refModal: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,

  idUsuario: PropTypes.string.isRequired,
};

/**
 * Modal para enviar mensaje por Whatsapp.
 */
class ModalSendWhatsApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      phone: '',
      message: '',
      type: 'text',
      pdfType: '',
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();

    this.refPhone = React.createRef();
    this.refMessage = React.createRef();
    this.refPdfType = React.createRef();
  }

  handleOpen = async () => {
    this.refPhone.current.focus();
    this.setState({
      name: this.props.person?.informacion ?? '',
      phone: this.props.person?.celular ?? ''
    });
  };

  handleHidden = async () => {
    this.setState(this.initial);
  };

  handleChangeType = (event) => {
    this.setState({
      type: event.target.value,
    });
  };

  handleChangePdfType = (event) => {
    this.setState({
      pdfType: event.target.value,
    });
  };

  handleInputNanme = (event) => {
    this.setState({ name: event.target.value });
  };

  handleInputPhone = (event) => {
    this.setState({ phone: event.target.value });
  };

  handleInputMessage = (event) => {
    this.setState({ message: event.target.value });
  };

  handleSendWhatsapp = async () => {
    const { name, phone, message, type, pdfType } = this.state;

    if (!validateNumberWhatsApp(phone)) {
      alertKit.warning({
        title: 'WhatsApp',
        message: 'El número de teléfono no es válido.',
      }, () => {
        this.refPhone.current.focus();
      });
      return;
    }

    if (!isText(message)) {
      alertKit.warning({
        title: 'WhatsApp',
        message: 'El mensaje no puede ser vacío.',
      }, () => {
        this.refMessage.current.focus();
      });
      return;
    }

    if (type === 'pdf' && !isText(pdfType)) {
      alertKit.warning({
        title: 'WhatsApp',
        message: 'El tipo de pdf no puede ser vacío.',
      }, () => {
        this.refPdfType.current.focus();
      });
      return;
    }

    const body = {
      name,
      phone,
      message,
      type,
      pdfType,
    };

    this.props.handleProcess(body, async () => {
      await this.refModal.current.handleOnClose();
    });
  };

  render() {
    const { isOpen, handleClose, documents } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onClose={handleClose}
        onOpen={this.handleOpen}
        onHidden={this.handleHidden}
        contentLabel={'Modal de Enviar Whatsapp'}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <CustomModalContentHeader
          contentRef={this.refModal}
          showClose={true}
          isMoveable={true}
        >
          SysSoft Integra
        </CustomModalContentHeader>

        <CustomModalContentBody>
          <h5 className="mb-3">Enviar Mensaje WhatsApp</h5>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm mb-1">
                Información
              </label>

              <Input
                autoFocus
                placeholder="Ej: Juan"
                value={this.state.name}
                onChange={this.handleInputNanme}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Número de teléfono (con código de país)
              </label>

              <Input
                autoFocus
                placeholder="Ej: +51966750883"
                ref={this.refPhone}
                value={this.state.phone}
                onChange={this.handleInputPhone}
                onKeyDown={keyNumberPhone}
              />
            </div>

            <div>
              <label className="block text-sm  mb-1">
                Tipo de envío
              </label>

              <Select
                value={this.state.type}
                onChange={this.handleChangeType}
              >
                <option value="text">Mensaje de texto</option>
                <option value="pdf">Documento PDF</option>
              </Select>
            </div>

            {this.state.type === 'pdf' && (
              <div>
                <label className="block text-sm mb-1">
                  Tipo de documento
                </label>

                <Select
                  ref={this.refPdfType}
                  value={this.state.pdfType}
                  onChange={this.handleChangePdfType}
                >
                  {
                    !isEmpty(documents) && (
                      documents.map((item, index) => (
                        <option key={index} value={item.value}>{item.label}</option>
                      ))
                    )
                  }
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">
                {this.state.type === 'pdf' ? 'Mensaje del documento' : 'Mensaje'}
              </label>

              <TextArea
                placeholder="Escribe tu mensaje aquí"
                ref={this.refMessage}
                value={this.state.message}
                onChange={this.handleInputMessage}
              />
            </div>

            <Button
              className="btn-success"
              onClick={this.handleSendWhatsapp}
            >
              <div className="flex items-center justify-center gap-3">
                <BsWhatsapp />
                <span>
                  {this.state.type === 'pdf'
                    ? 'Enviar PDF por WhatsApp'
                    : 'Enviar mensaje por WhatsApp'}
                </span>
              </div>
            </Button>
          </div>
        </CustomModalContentBody>
      </CustomModal>
    );
  }
}

ModalSendWhatsApp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  person: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
  handleProcess: PropTypes.func.isRequired,
  documents: PropTypes.array,
};

/**
 * Modal para pagar al credito.
 */

class ModalPago extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      monto: '',
      total: 0,
      pagado: 0,
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refMonto = React.createRef();
  }

  handleOnOpen = () => {
    const total = this.props.detalles.reduce(
      (acc, detalle) =>
        acc + Number(detalle.costo || detalle.precio || 0) * Number(detalle.cantidad || 0),
      0
    );

    const pagado = this.props.transacciones
      .flatMap(transaccion => transaccion.detalles || [])
      .reduce(
        (acc, detalle) => acc + Number(detalle.monto || 0),
        0
      );

    this.setState({
      total,
      pagado,
      monto: '',
    });
  };

  handleOnHidden = () => {
    this.setState(this.initial);
  };

  handleInputMonto = (event) => {
    this.setState({
      monto: event.target.value,
    });
  };

  handleOnProcess = async () => {

    const { monto, total, pagado } = this.state;

    if (!isNumeric(monto)) {
      alertKit.warning({
        title: 'Pago',
        message: 'Ingrese un monto válido.',
      }, () => {
        this.refMonto.current?.focus();
      });

      return;
    }

    const montoPago = Number(monto);
    const saldo = total - pagado;

    if (montoPago <= 0) {
      alertKit.warning({
        title: 'Pago',
        message: 'El monto debe ser mayor a 0.',
      }, () => {
        this.refMonto.current?.focus();
      });

      return;
    }

    if (montoPago > saldo) {
      alertKit.warning({
        title: 'Pago',
        message: `El monto no puede superar el saldo pendiente de ${formatCurrency(saldo, this.props.codiso)}.`,
      }, () => {
        this.refMonto.current?.focus();
      });

      return;
    }

    await this.refModal.current.handleOnClose();
    this.props.onProcess(montoPago);
  };

  render() {

    const {
      title,
      isOpen,
      onClose,
      codiso
    } = this.props;

    const {
      monto,
      total,
      pagado,
    } = this.state;

    const montoPago = Number(monto || 0);
    const saldo = Math.max(total - pagado, 0);
    const saldoDespuesPago = Math.max(saldo - montoPago, 0);

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onClose={onClose}
        onHidden={this.handleOnHidden}
        contentLabel={title}
      >

        <CustomModalContentForm
          onSubmit={this.handleOnProcess}
        >
          <CustomModalContentHeader
            contentRef={this.refModal}
            showClose={true}
            isMoveable={true}
          >
            {title}
          </CustomModalContentHeader>

          <CustomModalContentBody>

            {/* RESUMEN */}
            <div className="grid grid-cols-3 gap-3 mb-3">

              <div className="rounded-lg bg-gray-50 border p-3">
                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="text-lg font-semibold text-gray-800">
                  {formatCurrency(total, codiso)}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                <p className="text-xs text-green-600">
                  Pagado
                </p>

                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(pagado, codiso)}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-xs text-red-600">
                  Saldo
                </p>

                <p className="text-lg font-semibold text-red-700">
                  {formatCurrency(saldo, codiso)}
                </p>
              </div>

            </div>

            {/* NUEVO PAGO */}
            <div className="mb-3">
              <Input
                autoFocus={true}
                label={
                  <label>
                    Nuevo pago: <i className="fa fa-asterisk text-danger small" />
                  </label>
                }
                placeholder="0.00"
                role="float"
                ref={this.refMonto}
                value={monto}
                onChange={this.handleInputMonto}
              />

            </div>

            {/* PREVISUALIZACIÓN */}
            {montoPago > 0 && montoPago <= saldo && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Pago actual
                  </span>

                  <span className="font-medium">
                    {formatCurrency(montoPago, codiso)}
                  </span>
                </div>

                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">
                    Saldo después del pago
                  </span>

                  <span className="font-semibold text-blue-700">
                    {formatCurrency(saldoDespuesPago, codiso)}
                  </span>
                </div>

              </div>
            )}
          </CustomModalContentBody>

          <CustomModalContentFooter>

            <div className="w-full flex flex-col md:flex-row gap-3">

              <Button
                type="submit"
                className="btn-primary w-full md:w-auto"
                disabled={
                  !isNumeric(monto) ||
                  Number(monto) <= 0 ||
                  Number(monto) > saldo
                }
              >
                <i className="fa fa-save"></i>
                Registrar pago
              </Button>

              <Button
                type="button"
                className="btn-danger w-full md:w-auto"
                onClick={async () =>
                  await this.refModal.current.handleOnClose()
                }
              >
                <i className="fa fa-close"></i>
                Cerrar
              </Button>

            </div>

          </CustomModalContentFooter>

        </CustomModalContentForm>

      </CustomModal>
    );
  }
}

export { ModalImpresion, ModalPreImpresion, ModalPersona, ModalSendWhatsApp, ModalPago };
