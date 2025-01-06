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
import TextArea from '../../../../components/TextArea';

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
      loading: true,
      messageWarning: '',
      msgLoading: 'Cargando datos...',

      idEmpresa: '',
      documento: '',
      razonSocial: '',
      nombreEmpresa: '',
      email: '',
      paginaWeb: '',

      usuarioEmail: '',
      claveEmail: '',

      usuarioSolSunat: '',
      claveSolSunat: '',

      idApiSunat: '',
      claveApiSunat: '',

      certificado: 'Hacer click para seleccionar su archivo.',
      claveCertificado: '',

      fireBaseCertificado: 'Hacer click para seleccionar su archivo.',

      logo: {
        src: images.noImage,
      },
      image: {
        src: images.noImage,
      },
      icon: {
        src: images.noImage,
      },

      horarioAtencion: '',
      acercaNosotros: '',
      politicasPrivacidad: '',
      terminosCondiciones: '',

      lookPasswordEmail: false,
      lookPasswordSol: false,
      lookPasswordClave: false,
      lookPasswordClaveCertificado: false,


      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDocumento = React.createRef();
    this.refRazonSocial = React.createRef();
    this.refEmail = React.createRef();
    this.refPaginaWeb = React.createRef();

    this.refPasswordEmail = React.createRef();
    this.refPasswordSol = React.createRef();
    this.refPasswordClave = React.createRef();
    this.refPasswordClaveCertificado = React.createRef();

    this.refFileCertificado = React.createRef();
    this.refFileFireBase = React.createRef();

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

      console.log(empresa);

      this.setState({
        idEmpresa: empresa.idEmpresa,

        documento: empresa.documento,
        razonSocial: empresa.razonSocial,
        nombreEmpresa: empresa.nombreEmpresa,
        email: empresa.email,
        paginaWeb: empresa.paginaWeb,

        usuarioSolSunat: empresa.usuarioSolSunat ?? "",
        claveSolSunat: empresa.claveSolSunat ?? "",

        idApiSunat: empresa.idApiSunat ?? "",
        claveApiSunat: empresa.claveApiSunat ?? "",

        certificado: empresa.certificadoSunat ?? "Hacer click para seleccionar su archivo.",
        claveCertificado: empresa.claveCertificadoSunat ?? "",

        usuarioEmail: empresa.usuarioEmail ?? "",
        claveEmail: empresa.claveEmail ?? "",

        logo: empresa.rutaLogo ?? { src: images.noImage },
        image: empresa.rutaImage ?? { src: images.noImage },
        icon: empresa.rutaIcon ?? { src: images.noImage },

        horarioAtencion: empresa.horarioAtencion ?? "",
        acercaNosotros: empresa.acercaNosotros ?? "",
        politicasPrivacidad: empresa.politicasPrivacidad ?? "",
        terminosCondiciones: empresa.terminosCondiciones ?? "",

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

  handleFileLogo = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      this.setState({
        logo: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url
        }
      })
    } else {
      this.setState({
        logo: {
          url: images.noImage
        }
      });
    }

    event.target.value = null;
  };

  handleFileImage = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      this.setState({
        image: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url
        }
      })
    } else {
      this.setState({
        image: {
          url: images.noImage
        }
      });
    }

    event.target.value = null;
  };

  handleFileIcon = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      this.setState({
        icon: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url
        }
      })
    } else {
      this.setState({
        icon: {
          url: images.noImage
        }
      });
    }

    event.target.value = null;
  };

  handleClearLogo = () => {
    this.setState({
      logo: {
        url: images.noImage
      }
    });
  }

  handleClearImage = () => {
    this.setState({
      image: {
        url: images.noImage
      }
    });
  };

  handleClearIcono = () => {
    this.setState({
      icon: {
        url: images.noImage
      }
    });
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

      const certificadoSend = await convertFileBase64(this.refFileCertificado.current.files);

      const fireBaseSend = await convertFileBase64(this.refFileFireBase.current.files);

      const data = {
        documento: this.state.documento.trim(),
        razonSocial: this.state.razonSocial.trim(),
        nombreEmpresa: this.state.nombreEmpresa.trim(),
        email: this.state.email.trim(),
        paginaWeb: this.state.paginaWeb.trim(),

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

        logo: this.state.logo,
        image: this.state.image,
        icon: this.state.icon,

        horarioAtencion: this.state.horarioAtencion.trim(),
        acercaNosotros: this.state.acercaNosotros.trim(),
        politicasPrivacidad: this.state.politicasPrivacidad.trim(),
        terminosCondiciones: this.state.terminosCondiciones.trim(),

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
                  onClick={() => this.handleGetApiSunat()}
                >
                  <img src={images.sunat} alt="Sunat" width="12" />
                </Button>
              }
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <Input
              label={<>Razón Social: <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ingrese la razón social"
              refInput={this.refRazonSocial}
              value={this.state.razonSocial}
              onChange={(event) =>
                this.setState({ razonSocial: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <Input
              label={<>Nombre Comercial: <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ingrese el nombre comercial"
              refInput={this.refNombreEmpresa}
              value={this.state.nombreEmpresa}
              onChange={(event) =>
                this.setState({ nombreEmpresa: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6 col-12"} formGroup={true}>
            <Input
              label={<>Email:</>}
              placeholder="Ingrese el nombre comercial"
              refInput={this.refEmail}
              value={this.state.email}
              onChange={(event) =>
                this.setState({ email: event.target.value })
              }
            />
          </Column>

          <Column className={"col-md-6 col-12"} formGroup={true}>
            <Input
              label={<>Página Web:</>}
              placeholder="Ingrese el nombre comercial"
              refInput={this.refPaginaWeb}
              value={this.state.paginaWeb}
              onChange={(event) =>
                this.setState({ paginaWeb: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <Input
              label={<>Usuario Email(<small>Para el envío del correo, solo activo para cuentas de gmail</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Email de Envío"
              refInput={this.refEmail}
              value={this.state.usuarioEmail}
              onChange={(event) =>
                this.setState({ usuarioEmail: event.target.value })
              }
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <Input
              group={true}
              label={<>Contraseña Email (<small>Para el envío del correo, solo activo para cuentas de gmail</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="********"
              refInput={this.refPasswordEmail}
              value={this.state.claveEmail}
              onChange={(event) =>
                this.setState({ claveEmail: event.target.value })
              }
              type={this.state.lookPasswordEmail ? 'text' : 'password'}
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  onClick={this.handleLookPasswordEmail}
                >
                  <i className={this.state.lookPasswordEmail ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </Button>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <Input
              label={<>Usuario Sol(<small>Para el envío a Sunat</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Usurio secundario"
              refInput={this.refUserSolSunat}
              value={this.state.usuarioSolSunat}
              onChange={(event) =>
                this.setState({ usuarioSolSunat: event.target.value })
              }
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <Input
              group={true}
              label={<>Clave Sol(<small>Para el envío a Sunat</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="********"
              refInput={this.refPasswordSol}
              value={this.state.claveSolSunat}
              onChange={(event) =>
                this.setState({ claveSolSunat: event.target.value })
              }
              type={this.state.refPasswordSol ? 'text' : 'password'}
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  onClick={this.handleLookPasswordSol}
                >
                  <i className={this.state.refPasswordSol ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </Button>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"} formGroup={true}>
            <Input
              label={<>Id Api Sunat(<small>Para el envío de guía de remisión</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Usurio Api Sunat"
              refInput={this.refIdApiSunat}
              value={this.state.idApiSunat}
              onChange={(event) =>
                this.setState({ idApiSunat: event.target.value })
              }
            />
          </Column>

          <Column className={"col-md-6"} formGroup={true}>
            <Input
              group={true}
              label={<>Clave Api Sunat(<small>Para el envío de guía de remisión</small>):<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="********"
              refInput={this.refPasswordClave}
              value={this.state.claveApiSunat}
              onChange={(event) =>
                this.setState({ claveApiSunat: event.target.value })
              }
              type={this.state.lookPasswordClave ? 'text' : 'password'}
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  onClick={this.handleLookPasswordApiSunat}
                >
                  <i className={this.state.lookPasswordClave ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </Button>
              }
            />
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
            <Input
              group={true}
              label={<>Contraseña de tu Certificado:<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="********"
              refInput={this.refPasswordClaveCertificado}
              value={this.state.claveCertificado}
              onChange={(event) =>
                this.setState({ claveCertificado: event.target.value })
              }
              type={this.state.lookPasswordClaveCertificado ? 'text' : 'password'}
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  onClick={this.handleLookPasswordCertificado}
                >
                  <i className={this.state.lookPasswordClaveCertificado ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                </Button>
              }
            />
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
          <Column className={"col-md-4 col-12"} formGroup={true}>
            <div className="text-center">
              <label>Logo</label>
              <br />
              <small>Para mostrar en los reportes</small>
              <div className="text-center mb-2">
                <Image
                  src={this.state.logo.url}
                  alt={"Logo de la empresa"}
                  className={"img-fluid border border-primary rounded"}
                  width={250}
                />
              </div>

              <input
                type="file"
                id="fileLogo"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                className="display-none"
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
                onClick={this.handleDownload.bind(this, this.state.logo.src)}
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
          </Column>

          <Column className={"col-md-4 col-12"} formGroup={true}>
            <div className="text-center">
              <label>Imagen</label>
              <br />
              <small>Para mostrar el logo en sistema en la página web</small>
              <div className="text-center mb-2">
                <Image
                  src={this.state.image.url}
                  alt={"Imagen de la empresa"}
                  className={"img-fluid border border-primary rounded"}
                  width={250}
                />
              </div>

              <input
                type="file"
                id="fileImage"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                className="display-none"
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
                onClick={this.handleDownload.bind(this, this.state.image.url)}
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
          </Column>

          <Column className={"col-md-4 col-12"} formGroup={true}>
            <div className="text-center">
              <label>Icono</label>
              <br />
              <small>Usuado como favicon de la página web</small>
              <div className="text-center mb-2">
                <Image
                  src={this.state.icon.url}
                  alt={"Icono de la empresa"}
                  className={"img-fluid border border-primary rounded"}
                  width={250}
                />
              </div>

              <input
                type="file"
                id="fileIcon"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                className="display-none"
                onChange={this.handleFileIcon}
              />
              <label
                htmlFor="fileIcon"
                className="btn btn-outline-secondary m-0"
              >
                <div className="content-button">
                  <i className="bi bi-image"></i>
                  <span></span>
                </div>
              </label>{' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleClearIcono}
              >
                <i className="bi bi-trash"></i>
              </Button>
              {' '}
              <Button
                className="btn-outline-secondary"
                onClick={this.handleDownload.bind(this, this.state.icon.url)}
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-12"} formGroup={true}>
            <TextArea
              label={<>Horario de Atención:</>}
              rows={4}
              placeholder="Ingrese el horario de atención"
              value={this.state.horarioAtencion}
              onChange={(event) =>
                this.setState({ horarioAtencion: event.target.value })
              }
            />
          </Column>

          <Column className={"col-12"} formGroup={true}>
            <TextArea
              label={<>Acerca de Nosotros:</>}
              rows={8}
              placeholder="Ingrese la información de Acerca de Nosotros"
              value={this.state.acercaNosotros}
              onChange={(event) =>
                this.setState({ acercaNosotros: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6 col-12"} formGroup={true}>
            <TextArea
              label={<>Políticas de Privacidad:</>}
              rows={8}
              placeholder="Ingrese su políticas de privacidad"
              value={this.state.politicasPrivacidad}
              onChange={(event) =>
                this.setState({ politicasPrivacidad: event.target.value })
              }
            />
          </Column>

          <Column className={"col-md-6 col-12"} formGroup={true}>
            <TextArea
              label={<>Terminos y Condiciones:</>}
              rows={8}
              placeholder="Ingrese sus terminos y condiciones"
              value={this.state.terminosCondiciones}
              onChange={(event) =>
                this.setState({ terminosCondiciones: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-primary"
              onClick={() => this.handleGuardar()}
            >
              <i className="fa fa-save"></i> Guardar
            </Button>{' '}
            <Button
              className="btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cerrar
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