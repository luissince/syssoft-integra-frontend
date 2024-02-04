import React from 'react';
import {
  convertNullText,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  keyNumberInteger,
  imageBase64,
  isText,
  isEmpty,
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

class EmpresaProceso extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      idEmpresa: '',
      documento: '',
      razonSocial: '',
      nombreEmpresa: '',

      usuarioSolSunat: '',
      claveSolSunat: '',
      idApiSunat: '',
      claveApiSunat: '',

      usuarioEmail: '',
      claveEmail: '',

      logo: images.noImage,
      image: images.noImage,

      lookPasswordEmail: false,
      lookPasswordSol: false,
      lookPasswordClave: false,

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

    this.refFileLogo.current.addEventListener('change', this.handleFileLogo);
    this.refFileImagen.current.addEventListener('change', this.handleFileImage);
  }

  componentWillUnmount() {
    this.abortController.abort();

    this.refFileLogo.current.removeEventListener('change', this.handleFileLogo);
    this.refFileImagen.current.removeEventListener('change', this.handleFileImage);
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

        usuarioSolSunat: empresa.usuarioSolSunat,
        claveSolSunat: empresa.claveSolSunat,

        idApiSunat: empresa.idApiSunat,
        claveApiSunat: empresa.claveApiSunat,

        usuarioEmail: empresa.usuarioEmail,
        claveEmail: empresa.claveEmail,

        logo: empresa.rutaLogo ? empresa.rutaLogo : images.noImage,
        image: empresa.rutaImage ? empresa.rutaImage : images.noImage,

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

  handleFileLogo = async (event) => {
    if (event.target.files.length !== 0) {
      await this.setStateAsync({
        logo: URL.createObjectURL(event.target.files[0]),
      });
    } else {
      await this.setStateAsync({ logo: images.noImage });
      this.refFileLogo.current.value = '';
    }
  };

  handleFileImage = async (event) => {
    if (event.target.files.length !== 0) {
      await this.setStateAsync({
        image: URL.createObjectURL(event.target.files[0]),
      });
    } else {
      await this.setStateAsync({
        image: images.noImage,
      });
      this.refFileImagen.current.value = '';
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

      const logoSend = await imageBase64(this.refFileLogo.current.files);
      const baseLogo = logoSend ? logoSend.base64String : '';
      const extLogo = logoSend ? logoSend.extension : '';

      const imageSend = await imageBase64(this.refFileImagen.current.files);
      const baseImage = imageSend ? imageSend.base64String : '';
      const extImage = imageSend ? imageSend.extension : '';

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

        logo: baseLogo,
        image: baseImage,
        extlogo: extLogo,
        extimage: extImage,

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

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Editar Empresa
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Ruc: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                onKeyDown={keyNumberInteger}
                ref={this.refDocumento}
                value={this.state.documento}
                onChange={(event) =>
                  this.setState({ documento: event.target.value })
                }
                placeholder="-----------"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Sunat"
                  onClick={() => this.handleGetApiSunat()}
                >
                  <img src={images.sunat} alt="Sunat" width="12" />
                </button>
              </div>
            </div>
          </div>

          <div className="form-group col-md-6">
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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
          </div>

          <div className="form-group col-md-6">
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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
          </div>

          <div className="form-group col-md-6">
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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
          </div>

          <div className="form-group col-md-6">
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6 text-center">
            <label>Logo</label>
            <br />
            <small>Usuado para los reportes</small>
            <div className="text-center mb-2 ">
              <img
                src={this.state.logo}
                alt=""
                className="img-fluid border border-primary rounded"
                width={250}
              />
            </div>
            <input
              type="file"
              id="fileLogo"
              accept="image/png, image/jpeg, image/gif, image/svg, image/webp"
              className="display-none"
              ref={this.refFileLogo}
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

          <div className="form-group col-md-6 text-center">
            <label>Imagen</label>
            <br />
            <small>Usuado para mostrar el logo en sistema</small>
            <div className="text-center mb-2 ">
              <img
                src={this.state.image}
                alt="Logo de la empresa"
                className="img-fluid border border-primary rounded"
                width={250}
              />
            </div>
            <input
              type="file"
              id="fileImage"
              accept="image/png, image/jpeg, image/gif, image/svg"
              className="display-none"
              ref={this.refFileImagen}
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
            <button
              className="btn btn-outline-secondary"
              onClick={() => this.clearImage()}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => this.handleGuardar()}
              >
                Guardar
              </button>{' '}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(EmpresaProceso);
