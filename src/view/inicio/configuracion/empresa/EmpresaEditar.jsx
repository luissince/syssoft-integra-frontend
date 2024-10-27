import React from 'react';
import PropTypes from 'prop-types';
import {
  convertNullText,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  keyNumberInteger,
  imageBase64,
  isText,
  isEmpty,
  convertFileBase64,
  guId,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import {
  getIdEmpresa,
  updateEmpresa,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import { getRuc } from '../../../../network/rest/apisperu.network';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Image from '../../../../components/Image';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { downloadFileAsync } from '../../../../redux/downloadSlice';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class EmpresaProceso extends CustomComponent {

  /**
   * 
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      idEmpresa: '',
      documento: '',
      razonSocial: '',
      nombreEmpresa: '',

      usuarioEmail: '',
      claveEmail: '',

      usuarioSolSunat: '',
      claveSolSunat: '',

      idApiSunat: '',
      claveApiSunat: '',

      certificado: 'Hacer click para seleccionar su archivo.',
      claveCertificado: '',

      fireBaseCertificado: 'Hacer click para seleccionar su archivo.',

      logo: images.noImage,
      image: images.noImage,

      lookPasswordEmail: false,
      lookPasswordSol: false,
      lookPasswordClave: false,
      lookPasswordClaveCertificado: false,

      loading: true,
      messageWarning: '',
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDocumento = React.createRef();
    this.refRazonSocial = React.createRef();

    this.refPasswordEmail = React.createRef();
    this.refPasswordSol = React.createRef();
    this.refPasswordClave = React.createRef();
    this.refPasswordClaveCertificado = React.createRef();

    this.refFileCertificado = React.createRef();
    this.refFileFireBase = React.createRef();

    this.refFileLogo = React.createRef();
    this.refFileImagen = React.createRef();

    this.abortController = new AbortController();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  componentDidMount() {
    const url = this.props.location.search;
    const idEmpresa = new URLSearchParams(url).get('idEmpresa');
    if (isText(idEmpresa)) {
      this.loadingData(idEmpresa);
    } else {
      this.props.history.goBack();
    }

    this.refDocumento.current.focus();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  loadingData = async (id) => {
    const params = {
      idEmpresa: id,
    };

    const response = await getIdEmpresa(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      const empresa = response.data;

      this.setState({
        idEmpresa: empresa.idEmpresa,

        documento: empresa.documento,
        razonSocial: empresa.razonSocial,
        nombreEmpresa: empresa.nombreEmpresa,

        usuarioSolSunat: empresa.usuarioSolSunat ?? "",
        claveSolSunat: empresa.claveSolSunat ?? "",

        idApiSunat: empresa.idApiSunat ?? "",
        claveApiSunat: empresa.claveApiSunat ?? "",

        certificado: empresa.certificadoSunat ?? "Hacer click para seleccionar su archivo.",
        claveCertificado: empresa.claveCertificadoSunat ?? "",

        usuarioEmail: empresa.usuarioEmail ?? "",
        claveEmail: empresa.claveEmail ?? "",

        logo: empresa.rutaLogo,
        image: empresa.rutaImage,

        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        msgModal: response.getMessage(),
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  handleFileCertificado = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ certificado: event.target.files[0].name });
    } else {
      this.setState({ certificado: 'Hacer click para seleccionar su archivo.' }, () => {
        this.refFileCertificado.current.value = '';
      });
    }
  };

  handleFileFireBaseBase = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ fireBaseCertificado: event.target.files[0].name });
    } else {
      this.setState({ fireBaseCertificado: 'Hacer click para seleccionar su archivo.' }, () => {
        this.refFileFireBase.current.value = '';
      });
    }
  };

  async handleGetApiSunat() {
    if (isEmpty(this.state.documento)) {
      this.refDocumento.current.focus();
      return;
    }

    if (this.state.documento.length !== 11) {
      this.refDocumento.current.focus();
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
        razonSocial: convertNullText(response.data.razonSocial),
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Empresa', response.getMessage(), () => {
        this.setState({
          loading: false,
        });
      });
    }
  }

  handleLookPasswordEmail = () => {
    this.setState({ lookPasswordEmail: !this.state.lookPasswordEmail }, () => {
      this.refPasswordEmail.current.focus();
    });
  };

  handleLookPasswordSol = () => {
    this.setState({ refPasswordSol: !this.state.refPasswordSol }, () => {
      this.refPasswordSol.current.focus();
    });
  };

  handleLookPasswordApiSunat = () => {
    this.setState({ lookPasswordClave: !this.state.lookPasswordClave }, () => {
      this.refPasswordClave.current.focus();
    });
  };

  handleLookPasswordCertificado = () => {
    this.setState({ lookPasswordClaveCertificado: !this.state.lookPasswordClaveCertificado }, () => {
      this.refPasswordClaveCertificado.current.focus();
    });
  };

  // ------------------------------------------------------------------------
  // Eventos para manejo de imagenes
  // ------------------------------------------------------------------------

  handleFileLogo = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ logo: URL.createObjectURL(event.target.files[0]) });
    } else {
      this.setState({ logo: images.noImage }, () => {
        this.refFileLogo.current.value = '';
      });
    }
  };

  handleFileImage = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ image: URL.createObjectURL(event.target.files[0]) });
    } else {
      this.setState({ image: images.noImage, }, () => {
        this.refFileImagen.current.value = '';
      });
    }
  };

  async handleClearLogo() {
    await this.setStateAsync({
      logo: images.noImage,
    });
    this.refFileLogo.current.value = '';
  }

  async handleClearImage() {
    await this.setStateAsync({
      image: images.noImage,
    });
    this.refFileImagen.current.value = '';
  };

  handleDownload(url) {
    if (isEmpty(url)) return;

    const id = guId();
    this.props.downloadFileAsync({ id, url });
  };

  // ------------------------------------------------------------------------
  // Evento para editar empresa
  // ------------------------------------------------------------------------

  async handleGuardar() {
    if (isEmpty(this.state.documento)) {
      alertWarning('Empresa', 'Ingrese el número de documento.', () =>
        this.refDocumento.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.razonSocial)) {
      alertWarning('Empresa', 'Ingrese la razón social.', () =>
        this.refRazonSocial.current.focus(),
      );
      return;
    }

    alertDialog('Empresa', '¿Está seguro de continuar?', async () => {
      alertInfo('Empresa', 'Procesando información...');

      const logoSend = await imageBase64(this.refFileLogo.current.files[0]);

      const imageSend = await imageBase64(this.refFileImagen.current.files[0]);

      const certificadoSend = await convertFileBase64(this.refFileCertificado.current.files);

      const fireBaseSend = await convertFileBase64(this.refFileFireBase.current.files);

      const data = {
        documento: this.state.documento.trim(),
        razonSocial: this.state.razonSocial.trim(),
        nombreEmpresa: this.state.nombreEmpresa.trim(),

        usuarioSolSunat: this.state.usuarioSolSunat.trim(),
        claveSolSunat: this.state.claveSolSunat.trim(),

        idApiSunat: this.state.idApiSunat.trim(),
        claveApiSunat: this.state.claveApiSunat.trim(),

        usuarioEmail: this.state.usuarioEmail.trim(),
        claveEmail: this.state.claveEmail.trim(),

        certificado: certificadoSend.data ?? "",
        extCertificado: certificadoSend.extension ?? "",
        claveCertificado: this.state.claveCertificado,

        fireBase: fireBaseSend.data ?? "",
        extFireBase: fireBaseSend.extension ?? "",

        logo: logoSend.base64String ?? "",
        extlogo: logoSend.extension ?? "",

        image: imageSend.base64String ?? "",
        extimage: imageSend.extension ?? "",

        idUsuario: this.state.idUsuario,
        idEmpresa: this.state.idEmpresa,
      };

      const response = await updateEmpresa(data);

      if (response instanceof SuccessReponse) {
        alertSuccess('Empresa', response.data, () => {
          this.props.history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertWarning('Empresa', response.getMessage());
      }
    });
  };

  /*
|--------------------------------------------------------------------------
| Método de renderización
|--------------------------------------------------------------------------
|
| El método render() es esencial en los componentes de React y se encarga de determinar
| qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
| del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
| en la interfaz de usuario. La salida del método render() puede incluir otros componentes
| de React, elementos HTML o una combinación de ambos. Es importante que el método render()
| sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
| directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
| actuales del componente para determinar lo que se mostrará.
|
*/

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Empresa'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <Input
              group={true}
              label={<>Ruc ({this.state.documento.length}): <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="10909000223"
              refInput={this.refDocumento}
              value={this.state.documento}
              onChange={(event) =>
                this.setState({ documento: event.target.value })
              }
              onKeyDown={keyNumberInteger}
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  title="Sunat"
                  onClick={() => this.handleGetApiSunat()}
                >
                  <img src={images.sunat} alt="Sunat" width="12" />
                </Button>
              }
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Razón Social: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              ref={this.refRazonSocial}
              value={this.state.razonSocial}
              onChange={(event) =>
                this.setState({ razonSocial: event.target.value })
              }
              placeholder="Ingrese la razón social"
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <label>Nombre Comercial: </label>
            <input
              type="text"
              className="form-control"
              value={this.state.nombreEmpresa}
              onChange={(event) =>
                this.setState({ nombreEmpresa: event.target.value })
              }
              placeholder="Ingrese el nombre comercial"
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Usuario Email (<small>Para el envío del correo</small>):{' '}
            </label>
            <input
              type="text"
              className="form-control"
              value={this.state.usuarioEmail}
              onChange={(event) =>
                this.setState({ usuarioEmail: event.target.value })
              }
              placeholder="Email de Envío"
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Contraseña Email (<small>Para el envío del correo</small>):{' '}
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordEmail}
                type={this.state.lookPasswordEmail ? 'text' : 'password'}
                className="form-control"
                value={this.state.claveEmail}
                onChange={(event) =>
                  this.setState({ claveEmail: event.target.value })
                }
                placeholder="********"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Email"
                  onClick={this.handleLookPasswordEmail}
                >
                  <i className={this.state.lookPasswordEmail ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </button>
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Usuario Sol(<small>Para el envío a Sunat</small>):{' '}
            </label>
            <input
              type="text"
              className="form-control"
              value={this.state.usuarioSolSunat}
              onChange={(event) =>
                this.setState({ usuarioSolSunat: event.target.value })
              }
              placeholder="usuario"
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Clave Sol(<small>Para el envío a Sunat</small>):{' '}
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordSol}
                type={this.state.refPasswordSol ? 'text' : 'password'}
                className="form-control"
                value={this.state.claveSolSunat}
                onChange={(event) =>
                  this.setState({ claveSolSunat: event.target.value })
                }
                placeholder="********"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Sunat"
                  onClick={this.handleLookPasswordSol}
                >
                  <i className={this.state.refPasswordSol ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </button>
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Id Api Sunat(<small>Para el envío de guía de remisión</small>):{' '}
            </label>
            <input
              type="text"
              className="form-control"
              value={this.state.idApiSunat}
              onChange={(event) =>
                this.setState({ idApiSunat: event.target.value })
              }
              placeholder="usuario"
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Clave Api Sunat(<small>Para el envío de guía de remisión</small>):{' '}
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordClave}
                type={this.state.lookPasswordClave ? 'text' : 'password'}
                className="form-control"
                value={this.state.claveApiSunat}
                onChange={(event) =>
                  this.setState({ claveApiSunat: event.target.value })
                }
                placeholder="********"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Sunat"
                  onClick={this.handleLookPasswordApiSunat}
                >
                  <i className={this.state.lookPasswordClave ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </button>
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>
              Seleccionar Archivo (.p12, .pfx u otros):
            </label>
            <input
              type="file"
              id="fileCertificado"
              accept=".p12,.pfx"
              className="display-none"
              ref={this.refFileCertificado}
              onChange={this.handleFileCertificado}
            />
            <label htmlFor={"fileCertificado"} className='form-control cursor-pointer '>
              {this.state.certificado}
            </label>
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <label>
              Contraseña de tu Certificado:
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordClaveCertificado}
                type={this.state.lookPasswordClaveCertificado ? 'text' : 'password'}
                className="form-control"
                value={this.state.claveCertificado}
                onChange={(event) =>
                  this.setState({ claveCertificado: event.target.value })
                }
                placeholder="********"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Email"
                  onClick={this.handleLookPasswordCertificado}
                >
                  <i className={this.state.lookPasswordClaveCertificado ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </button>
              </div>
            </div>
          </Column>
        </Row>
        <Row>
          <Column formGroup={true}>
            <label>
              Seleccionar Archivo de Configuración de FireBase (.json):
            </label>
            <input
              type="file"
              id="fileFireBase"
              accept=".json"
              className="display-none"
              ref={this.refFileFireBase}
              onChange={this.handleFileFireBaseBase}
            />
            <label htmlFor={"fileFireBase"} className='form-control cursor-pointer'>
              {this.state.fireBaseCertificado}
            </label>
          </Column>
        </Row>


        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <div className="text-center">
              <label>Logo</label>
              <br />
              <small>Usuado para los reportes</small>
              <div className="text-center mb-2">
                <Image
                  src={this.state.logo}
                  alt={"Logo de la empresa"}
                  className={"img-fluid border border-primary rounded"}
                  width={250}
                />
              </div>

              <input
                type="file"
                id="fileLogo"
                accept="image/png, image/jpeg, image/gif, image/svg, image/webp"
                className="display-none"
                ref={this.refFileLogo}
                onChange={this.handleFileLogo}
              />
              <label htmlFor="fileLogo" className="btn btn-outline-secondary m-0">
                <div className="content-button">
                  <i className="bi bi-image"></i>
                  <span></span>
                </div>
              </label>
              {' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleClearLogo}
              >
                <i className="bi bi-trash"></i>
              </Button>
              {' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleDownload.bind(this, this.state.logo)}
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <div className="text-center">
              <label>Imagen</label>
              <br />
              <small>Usuado para mostrar el logo en sistema</small>
              <div className="text-center mb-2">
                <Image
                  src={this.state.image}
                  alt={"Logo de la empresa"}
                  className={"img-fluid border border-primary rounded"}
                  width={250}
                />
              </div>

              <input
                type="file"
                id="fileImage"
                accept="image/png, image/jpeg, image/gif, image/svg"
                className="display-none"
                ref={this.refFileImagen}
                onChange={this.handleFileImage}
              />
              <label
                htmlFor="fileImage"
                className="btn btn-outline-secondary m-0"
              >
                <div className="content-button">
                  <i className="bi bi-image"></i>
                  <span></span>
                </div>
              </label>{' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleClearImage}
              >
                <i className="bi bi-trash"></i>
              </Button>
              {' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleDownload.bind(this, this.state.image)}
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-primary"
              onClick={() => this.handleGuardar()}
            >
              Guardar
            </Button>{' '}
            <Button
              className="btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

EmpresaProceso.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedEmpresaProceso = connect(mapStateToProps, mapDispatchToProps)(EmpresaProceso);

export default ConnectedEmpresaProceso;