import React from 'react';
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

class EmpresaProceso extends CustomComponent {
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

  async clearLogo() {
    await this.setStateAsync({
      logo: images.noImage,
    });
    this.refFileLogo.current.value = '';
  }

  async clearImage() {
    await this.setStateAsync({
      image: images.noImage,
    });
    this.refFileImagen.current.value = '';
  }

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
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Empresa'
          subTitle='Editar'
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
              </label>{' '}
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.clearLogo()}
              >
                <i className="bi bi-trash"></i>
              </button>
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
                onClick={() => this.clearImage()}
              >
                <i className="bi bi-trash"></i>
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedEmpresaProceso = connect(mapStateToProps, null)(EmpresaProceso);

export default ConnectedEmpresaProceso;