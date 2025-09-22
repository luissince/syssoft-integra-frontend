import React from 'react';
import PropTypes from 'prop-types';
import {
  convertNullText,
  alertDialog,
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
import { ImageUpload, MultiImages } from '../../../../components/Image';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { downloadFileAsync } from '../../../../redux/downloadSlice';
import TextArea from '../../../../components/TextArea';
import { alertKit } from 'alert-kit';

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

      banner: {
        src: images.noImage,
      },

      portada: {
        src: images.noImage,
      },

      banners: [],

      numeroWhatsapp: '',
      tituloWhatsapp: '',
      mensajeWhatsapp: '',
      informacion: '',
      acercaNosotros: '',
      politicasPrivacidad: '',
      terminosCondiciones: '',

      lookPasswordEmail: false,
      lookPasswordSol: false,
      lookPasswordClave: false,
      lookPasswordClaveCertificado: false,

      paginaWeb: '',
      youTubePagina: '',
      facebookPagina: '',
      twitterPagina: '',
      instagramPagina: '',
      tiktokPagina: '',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refDocumento = React.createRef();
    this.refRazonSocial = React.createRef();

    this.refPasswordEmail = React.createRef();
    this.refPasswordSol = React.createRef();
    this.refPasswordClave = React.createRef();
    this.refPasswordClaveCertificado = React.createRef();

    this.refPaginaWeb = React.createRef();
    this.refYouTube = React.createRef();
    this.refFacebook = React.createRef();
    this.refTwitter = React.createRef();
    this.refInstagram = React.createRef();
    this.refTiktok = React.createRef();

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

      this.setState({
        idEmpresa: empresa.idEmpresa,

        documento: empresa.documento,
        razonSocial: empresa.razonSocial,
        nombreEmpresa: empresa.nombreEmpresa,
        email: empresa.email,

        usuarioSolSunat: empresa.usuarioSolSunat ?? '',
        claveSolSunat: empresa.claveSolSunat ?? '',

        idApiSunat: empresa.idApiSunat ?? '',
        claveApiSunat: empresa.claveApiSunat ?? '',

        certificado:
          empresa.certificadoSunat ??
          'Hacer click para seleccionar su archivo.',
        claveCertificado: empresa.claveCertificadoSunat ?? '',

        fireBaseCertificado:
          empresa.certificadoFirebase ??
          'Hacer click para seleccionar su archivo.',

        logo: empresa.rutaLogo ?? { src: images.noImage },
        image: empresa.rutaImage ?? { src: images.noImage },
        icon: empresa.rutaIcon ?? { src: images.noImage },
        banner: empresa.rutaBanner ?? { src: images.noImage },
        portada: empresa.rutaPortada ?? { src: images.noImage },
        banners: empresa.banners ?? [],

        numeroWhatsapp: empresa.numeroWhatsapp ?? '',
        tituloWhatsapp: empresa.tituloWhatsapp ?? '',
        mensajeWhatsapp: empresa.mensajeWhatsapp ?? '',
        informacion: empresa.informacion ?? '',
        acercaNosotros: empresa.acercaNosotros ?? '',
        politicasPrivacidad: empresa.politicasPrivacidad ?? '',
        terminosCondiciones: empresa.terminosCondiciones ?? '',

        paginaWeb: empresa.paginaWeb,
        youTubePagina: empresa.youTubePagina,
        facebookPagina: empresa.facebookPagina,
        twitterPagina: empresa.twitterPagina,
        instagramPagina: empresa.instagramPagina,
        tiktokPagina: empresa.tiktokPagina,

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
      this.setState(
        { certificado: 'Hacer click para seleccionar su archivo.' },
        () => {
          this.refFileCertificado.current.value = '';
        },
      );
    }
  };

  handleFileFireBaseBase = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ fireBaseCertificado: event.target.files[0].name });
    } else {
      this.setState(
        { fireBaseCertificado: 'Hacer click para seleccionar su archivo.' },
        () => {
          this.refFileFireBase.current.value = '';
        },
      );
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

      alertKit.error({
        headerTitle: 'SysSoft Integra',
        title: 'Error',
        message: response.getMessage(),
        onClose: () => {
          this.setState({
            loading: false,
          });
        },
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
    this.setState(
      {
        lookPasswordClaveCertificado: !this.state.lookPasswordClaveCertificado,
      },
      () => {
        this.refPasswordClaveCertificado.current.focus();
      },
    );
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

      if (logoSend.size > 500) {
        alertKit.warning({
          title: 'Logo repote',
          message:
            'El logo del reporte ' +
            file.name +
            ' no debe superar los 500KB(Kilobytes).',
        });
        return;
      }

      this.setState({
        logo: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    } else {
      this.setState({
        logo: {
          url: images.noImage,
        },
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

      if (logoSend.size > 500) {
        alertKit.warning({
          title: 'Logo pagina web',
          message:
            'El logo pagina web ' +
            file.name +
            ' no debe superar los 500KB(Kilobytes).',
        });
        return;
      }

      this.setState({
        image: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    } else {
      this.setState({
        image: {
          url: images.noImage,
        },
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

      if (logoSend.size > 50) {
        alertKit.warning({
          title: 'Icono',
          message:
            'El icono ' + file.name + ' no debe superar los 50KB(Kilobytes).',
        });
        return;
      }

      this.setState({
        icon: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    } else {
      this.setState({
        icon: {
          url: images.noImage,
        },
      });
    }

    event.target.value = null;
  };

  handleFileBanner = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      if (logoSend.width !== 1200 && logoSend.height !== 1200) {
        alertKit.warning({
          title: 'Banner',
          message:
            'La imagen del banner ' +
            file.name +
            ' tiene que tener un aspecto de 1200 x 1200 pixeles.',
        });
        return;
      }

      if (logoSend.size > 1024) {
        alertKit.warning({
          title: 'Banner',
          message:
            'La imagen del banner ' +
            file.name +
            ' no debe superar los 1024KB(Kilobytes).',
        });
        return;
      }

      this.setState({
        banner: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    } else {
      this.setState({
        banner: {
          url: images.noImage,
        },
      });
    }

    event.target.value = null;
  };

  handleFilePortada = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      if (logoSend.width !== 1200 && logoSend.height !== 1200) {
        alertKit.warning({
          title: 'Portada',
          message:
            'La imagen de la portada ' +
            file.name +
            ' tiene que tener un aspecto de 1200 x 1200 pixeles.',
        });
        return;
      }

      if (logoSend.size > 1024) {
        alertKit.warning({
          title: 'Portada',
          message:
            'La imagen de la portada ' +
            file.name +
            ' no debe superar los 1024KB(Kilobytes).',
        });
        return;
      }

      this.setState({
        portada: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    } else {
      this.setState({
        portada: {
          url: images.noImage,
        },
      });
    }

    event.target.value = null;
  };

  handleClearLogo = () => {
    this.setState({
      logo: {
        url: images.noImage,
      },
    });
  };

  handleClearImage = () => {
    this.setState({
      image: {
        url: images.noImage,
      },
    });
  };

  handleClearIcono = () => {
    this.setState({
      icon: {
        url: images.noImage,
      },
    });
  };

  handleClearBanner = () => {
    this.setState({
      banner: {
        url: images.noImage,
      },
    });
  };

  handleClearPortada = () => {
    this.setState({
      portada: {
        url: images.noImage,
      },
    });
  };

  handleDownload(url) {
    if (isEmpty(url)) return;

    const id = guId();
    this.props.downloadFileAsync({ id, url });
  }

  // ------------------------------------------------------------------------
  // Eventos para manejo de los banners
  // ------------------------------------------------------------------------

  handleSelectBanners = (banners) => {
    this.setState({ banners: banners });
  };

  handleRemoveBanners = (banners) => {
    this.setState({ banners: banners });
  };

  // ------------------------------------------------------------------------
  // Evento para editar empresa
  // ------------------------------------------------------------------------

  handleGuardar = async () => {
    if (isEmpty(this.state.documento)) {
      alertKit.warning({
        title: 'Documento',
        message: 'Ingrese el número de documento.',
        onClose: () => {
          this.refDocumento.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.razonSocial)) {
      alertKit.warning({
        title: 'Razón Social',
        message: 'Ingrese la razón social.',
        onClose: () => {
          this.refRazonSocial.current.focus();
        },
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Empresa',
      message: '¿Estás seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      await this.handleGuardarProcess();
    }
  };

  handleGuardarProcess = async () => {
    alertKit.loading({
      message: 'Procesando información...',
    });

    const certificadoSend = await convertFileBase64(
      this.refFileCertificado.current.files,
    );

    const fireBaseSend = await convertFileBase64(
      this.refFileFireBase.current.files,
    );

    const data = {
      documento: this.state.documento.trim(),
      razonSocial: this.state.razonSocial.trim(),
      nombreEmpresa: this.state.nombreEmpresa.trim(),
      email: this.state.email.trim(),

      usuarioSolSunat: this.state.usuarioSolSunat.trim(),
      claveSolSunat: this.state.claveSolSunat.trim(),

      idApiSunat: this.state.idApiSunat.trim(),
      claveApiSunat: this.state.claveApiSunat.trim(),

      certificado: certificadoSend.data ?? '',
      extCertificado: certificadoSend.extension ?? '',
      claveCertificado: this.state.claveCertificado,

      fireBase: fireBaseSend.data ?? '',
      extFireBase: fireBaseSend.extension ?? '',

      logo: this.state.logo,
      image: this.state.image,
      icon: this.state.icon,
      banner: this.state.banner,
      portada: this.state.portada,
      banners: this.state.banners,

      numeroWhatsapp: this.state.numeroWhatsapp.trim(),
      tituloWhatsapp: this.state.tituloWhatsapp.trim(),
      mensajeWhatsapp: this.state.mensajeWhatsapp.trim(),
      informacion: this.state.informacion.trim(),
      acercaNosotros: this.state.acercaNosotros.trim(),
      politicasPrivacidad: this.state.politicasPrivacidad.trim(),
      terminosCondiciones: this.state.terminosCondiciones.trim(),

      paginaWeb: this.state.paginaWeb.trim(),
      youTubePagina: this.state.youTubePagina.trim(),
      facebookPagina: this.state.facebookPagina.trim(),
      twitterPagina: this.state.twitterPagina.trim(),
      instagramPagina: this.state.instagramPagina.trim(),
      tiktokPagina: this.state.tiktokPagina.trim(),

      idUsuario: this.state.idUsuario,
      idEmpresa: this.state.idEmpresa,
    };

    const response = await updateEmpresa(data);

    if (response instanceof SuccessReponse) {
      alertKit.success({
        headerTitle: 'SysSoft Integra',
        title: 'Empresa',
        message: response.data,
        onClose: () => {
          this.props.history.goBack();
        },
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.error({
        headerTitle: 'SysSoft Integra',
        title: 'Error',
        message: response.getMessage(),
        onClose: () => {
          this.setState({
            loading: false,
          });
        },
      });
    }
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
          title="Empresa"
          subTitle="EDITAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">1</span> Información General
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Ruc ({this.state.documento.length}):{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="10909000223"
              ref={this.refDocumento}
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

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={
                <>
                  Razón Social:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese la razón social"
              ref={this.refRazonSocial}
              value={this.state.razonSocial}
              onChange={(event) =>
                this.setState({ razonSocial: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={
                <>
                  Nombre Comercial:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese el nombre comercial"
              ref={this.refNombreEmpresa}
              value={this.state.nombreEmpresa}
              onChange={(event) =>
                this.setState({ nombreEmpresa: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Email:</>}
              placeholder="Ingrese el nombre comercial"
              ref={this.refEmail}
              value={this.state.email}
              onChange={(event) => this.setState({ email: event.target.value })}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">3</span> Credenciales para
              envio de comprobantes electrónicos a SUNAT
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={
                <>
                  Usuario Sol(<small>Para el envío a Sunat</small>):
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Usurio secundario"
              ref={this.refUserSolSunat}
              value={this.state.usuarioSolSunat}
              onChange={(event) =>
                this.setState({ usuarioSolSunat: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Clave Sol(<small>Para el envío a Sunat</small>):
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="********"
              ref={this.refPasswordSol}
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
                  <i
                    className={
                      this.state.refPasswordSol
                        ? 'fa fa-eye'
                        : 'fa fa-eye-slash'
                    }
                  ></i>
                </Button>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6'} formGroup={true}>
            <Input
              label={
                <>
                  Id Api Sunat(<small>Para el envío de guía de remisión</small>
                  ):<i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Usurio Api Sunat"
              ref={this.refIdApiSunat}
              value={this.state.idApiSunat}
              onChange={(event) =>
                this.setState({ idApiSunat: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Clave Api Sunat(
                  <small>Para el envío de guía de remisión</small>):
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="********"
              ref={this.refPasswordClave}
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
                  <i
                    className={
                      this.state.lookPasswordClave
                        ? 'fa fa-eye'
                        : 'fa fa-eye-slash'
                    }
                  ></i>
                </Button>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>Seleccionar Archivo (.p12, .pfx u otros):</label>
            <input
              type="file"
              id="fileCertificado"
              accept=".p12,.pfx"
              className="display-none"
              ref={this.refFileCertificado}
              onChange={this.handleFileCertificado}
            />
            <label
              htmlFor={'fileCertificado'}
              className="form-control cursor-pointer"
            >
              {this.state.certificado}
            </label>
          </Column>

          <Column className={'col-md-6'} formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Contraseña de tu Certificado:
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="********"
              ref={this.refPasswordClaveCertificado}
              value={this.state.claveCertificado}
              onChange={(event) =>
                this.setState({ claveCertificado: event.target.value })
              }
              type={
                this.state.lookPasswordClaveCertificado ? 'text' : 'password'
              }
              buttonRight={
                <Button
                  className="btn-outline-secondary"
                  onClick={this.handleLookPasswordCertificado}
                >
                  <i
                    className={
                      this.state.lookPasswordClaveCertificado
                        ? 'fa fa-eye'
                        : 'fa fa-eye-slash'
                    }
                  ></i>
                </Button>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">4</span> Configuración de
              Firebase para subir imagenes y documentos
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

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
            <label
              htmlFor={'fileFireBase'}
              className="form-control cursor-pointer"
            >
              {this.state.fireBaseCertificado}
            </label>
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">5</span> Imagens para uso en
              la página web y reportes
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className={'col-md-4 col-12'} formGroup={true}>
            <ImageUpload
              label="Logo reporte"
              subtitle={
                <>
                  Para mostrar en los reportes.{' '}
                  <b className="text-danger">
                    La imagen no debe superar los 500KB(Kilobytes).
                  </b>
                </>
              }
              imageUrl={this.state.logo.url}
              defaultImage={images.noImage}
              alt="Logo reporte"
              inputId="fileLogo"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileLogo}
              onClear={this.handleClearLogo}
              onDownload={() => this.handleDownload(this.state.logo.url)}
            />
          </Column>

          <Column className={'col-md-4 col-12'} formGroup={true}>
            <ImageUpload
              label="Logo pagina web"
              subtitle={
                <>
                  Para mostrar en la página web como banner.{' '}
                  <b className="text-danger">
                    La imagen no debe superar los 500KB(Kilobytes).
                  </b>
                </>
              }
              imageUrl={this.state.image.url}
              defaultImage={images.noImage}
              alt="Logo pagina web"
              inputId="fileImage"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileImage}
              onClear={this.handleClearImage}
              onDownload={() => this.handleDownload(this.state.image.url)}
            />
          </Column>

          <Column className={'col-md-4 col-12'} formGroup={true}>
            <ImageUpload
              label="Icono"
              subtitle={
                <>
                  Para mostrar como favicon de la página web.{' '}
                  <b className="text-danger">
                    La imagen no debe superar los 50KB(Kilobytes).
                  </b>
                </>
              }
              imageUrl={this.state.icon.url}
              defaultImage={images.noImage}
              alt="Icono de la empresa"
              inputId="fileIcon"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileIcon}
              onClear={this.handleClearIcono}
              onDownload={() => this.handleDownload(this.state.icon.url)}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">6</span> Imagenes para el
              banner de la página web
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className="col-12" formGroup={true}>
            <label>
              Agregar las imagenes para el banner.{' '}
              <b className="text-danger">
                Las imagenes no debe superar los 1MB(Megabyte).
              </b>
            </label>
            <label>
              Las imágenes deben tener un tamaño de <b>1440 x 800 píxeles</b>{' '}
              para que se visualicen correctamente en la página web (formato
              recomendado *.webp).
            </label>
          </Column>

          <Column className="col-12" formGroup={true}>
            <MultiImages
              maxSizeKB={1024}
              width={1440}
              height={800}
              images={this.state.banners}
              handleSelectImages={this.handleSelectBanners}
              handleRemoveImages={this.handleRemoveBanners}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">7</span> Datos para
              comunicación con la platadorma Whatsapp
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={
                <>
                  Número de WhatsApp:
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="51999000999"
              value={this.state.numeroWhatsapp}
              onChange={(event) =>
                this.setState({ numeroWhatsapp: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={
                <>
                  Título del modal WhatsApp:
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Hola, ¿podemos hacer algo?"
              value={this.state.tituloWhatsapp}
              onChange={(event) =>
                this.setState({ tituloWhatsapp: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-12'} formGroup={true}>
            <TextArea
              label={<>Mensaje de WhatsApp:</>}
              rows={4}
              placeholder="Mensaje de WhatsApp que acompañará a la solicitud"
              value={this.state.mensajeWhatsapp}
              onChange={(event) =>
                this.setState({ mensajeWhatsapp: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <h6>
              <span className="badge badge-primary">8</span> Información para
              mostrar en la pagina web
            </h6>
          </Column>
          <div className="dropdown-divider"></div>

          <Column className={'col-12'} formGroup={true}>
            <TextArea
              label={<>Información:</>}
              rows={4}
              placeholder="Ingrese un resumen de la empresa"
              value={this.state.informacion}
              onChange={(event) =>
                this.setState({ informacion: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6 col-12'} formGroup={true}>
            <ImageUpload
              label="Banner de portada"
              subtitle={
                <>
                  Para mostrar en la página web y debe tener un tamaño de 1200 ×
                  1200 pixele.{' '}
                  <b className="text-danger">
                    La imagen no debe superar los 1MB(Megabytes).
                  </b>
                </>
              }
              imageUrl={this.state.banner.url}
              defaultImage={images.noImage}
              alt="Banner de portada"
              inputId="fileBanner"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileBanner}
              onClear={this.handleClearBanner}
              onDownload={() => this.handleDownload(this.state.banner.url)}
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <ImageUpload
              label="Imagen de portada"
              subtitle={
                <>
                  Para mostrar en la página web y debe tener un tamaño de 1200 ×
                  1200 pixele.{' '}
                  <b className="text-danger">
                    La imagen no debe superar los 1MB(Megabytes).
                  </b>
                </>
              }
              imageUrl={this.state.portada.url}
              defaultImage={images.noImage}
              alt="Imagen de portada"
              inputId="filePortada"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFilePortada}
              onClear={this.handleClearPortada}
              onDownload={() => this.handleDownload(this.state.portada.url)}
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-12'} formGroup={true}>
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
          <Column className={'col-md-6 col-12'} formGroup={true}>
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

          <Column className={'col-md-6 col-12'} formGroup={true}>
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
          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Página Web:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refPaginaWeb}
              value={this.state.paginaWeb}
              onChange={(event) =>
                this.setState({ paginaWeb: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Cuetan de YouTube:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refYouTube}
              value={this.state.youTubePagina}
              onChange={(event) =>
                this.setState({ youTubePagina: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Cuenta de Facebook:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refFacebook}
              value={this.state.facebookPagina}
              onChange={(event) =>
                this.setState({ facebookPagina: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Cuenta de Twitter:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refTwitter}
              value={this.state.twitterPagina}
              onChange={(event) =>
                this.setState({ twitterPagina: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Cuenta de Instagram:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refInstagram}
              value={this.state.instagramPagina}
              onChange={(event) =>
                this.setState({ instagramPagina: event.target.value })
              }
            />
          </Column>

          <Column className={'col-md-6 col-12'} formGroup={true}>
            <Input
              label={<>Cuenta de TikTok:</>}
              placeholder="Ingrese la url de la cuenta"
              ref={this.refTiktok}
              value={this.state.tiktokPagina}
              onChange={(event) =>
                this.setState({ tiktokPagina: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button className="btn-warning" onClick={this.handleGuardar}>
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
    search: PropTypes.string,
  }),
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { downloadFileAsync };

const ConnectedEmpresaProceso = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmpresaProceso);

export default ConnectedEmpresaProceso;
