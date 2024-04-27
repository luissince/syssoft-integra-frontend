import React from 'react';
import {
  convertNullText,
  imageBase64,
  keyNumberInteger,
  keyNumberPhone,
  spinnerLoading,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../helper/utils.helper';
import { connect } from 'react-redux';
import { configSave } from '../../redux/actions';
import { images } from '../../helper';
import { saveEmpresa } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import { CANCELED } from '../../model/types/types';
import { getRuc } from '../../network/rest/apisperu.network';
import CustomComponent from '../../model/class/custom-component';

class Configurar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      documento: '',
      razonSocial: '',
      nombreEmpresa: '',
      telefono: '',
      celular: '',
      email: '',
      web: '',
      direccion: '',
      logo: images.noImage,
      image: images.noImage,

      loading: false,
      messageWarning: '',
      msgLoading: 'Cargando datos...',
    };

    this.refDocumento = React.createRef();
    this.refRazonSocial = React.createRef();
    this.refNombreComercial = React.createRef();
    this.refDireccion = React.createRef();

    this.refFileLogo = React.createRef();
    this.refFileImagen = React.createRef();
  }

  componentDidMount() {
    this.refDocumento.current.focus();

    this.refFileLogo.current.addEventListener('change', this.onEventFileLogo);
    this.refFileImagen.current.addEventListener(
      'change',
      this.onEventFileImage,
    );
  }
  componentWillUnmount() {
    this.refFileLogo.current.removeEventListener(
      'change',
      this.onEventFileLogo,
    );
    this.refFileImagen.current.removeEventListener(
      'change',
      this.onEventFileImage,
    );
  }

  onEventFileLogo = async (event) => {
    if (event.target.files.length !== 0) {
      await this.setStateAsync({
        logo: URL.createObjectURL(event.target.files[0]),
      });
    } else {
      await this.setStateAsync({
        logo: images.noImage,
      });
      this.refFileLogo.current.value = '';
    }
  };

  onEventFileImage = async (event) => {
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

  async onEventGetApiSunat() {
    if (!isText(this.state.documento)) {
      this.refDocumento.current.focus();
      return;
    }

    if (this.state.documento.length !== 11) {
      this.refDocumento.current.focus();
      return;
    }

    const response = await getRuc(this.state.documento);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({
        documento: convertNullText(response.data.ruc),
        razonSocial: convertNullText(response.data.razonSocial),
        direccion: convertNullText(response.data.direccion),
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        loading: false,
      });
    }
  }

  onEventSave() {
    if (this.state.documento === '') {
      this.refDocumento.current.focus();
      return;
    }

    if (this.state.razonSocial === '') {
      this.refDocumento.current.focus();
      return;
    }

    alertDialog('Mi Empresa', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
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
          telefono: this.state.telefono.trim(),
          celular: this.state.celular.trim(),
          email: this.state.email.trim(),
          web: this.state.web.trim(),
          direccion: this.state.direccion.trim(),
          logo: baseLogo,
          image: baseImage,
          extlogo: extLogo,
          extimage: extImage,
        };

        alertInfo('Mi Empresa', 'Procesando información...');

        const response = await saveEmpresa(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Mi Empresa', response.data, () => {
            this.props.configSave();
            window.location.href = '/';
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Mi Empresa', response.getMessage());
        }
      }
    });
  }

  render() {
    return (
      <div className="container">
        {this.state.messageWarning === '' ? null : (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-diamond-fill"></i>{' '}
            {this.state.messageWarning}
          </div>
        )}

        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="py-5 text-center">
          <h3>Configuración Básica</h3>
          <p className="lead">
            Rellene los datos requeridos{' '}
            <i className="fa fa-asterisk text-danger small"></i>
          </p>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h5 className="mb-3">Información de tu Empresa</h5>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lblNDocumento">
                  N° de Documento{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <div className="input-group">
                  <input
                    ref={this.refDocumento}
                    type="text"
                    className="form-control"
                    id="lblNDocumento"
                    placeholder="-----------"
                    onKeyDown={keyNumberInteger}
                    value={this.state.documento}
                    onChange={(event) =>
                      this.setState({ documento: event.target.value })
                    }
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      title="Sunat"
                      onClick={() => this.onEventGetApiSunat()}
                    >
                      <img src={images.sunat} alt="Sunat" width="12" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lblRazonSocial">
                  Razón Social{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <input
                  ref={this.refRazonSocial}
                  type="text"
                  className="form-control"
                  id="lblRazonSocial"
                  placeholder="Mi razón social"
                  value={this.state.razonSocial}
                  onChange={(event) =>
                    this.setState({ razonSocial: event.target.value })
                  }
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lblNombreComercial">Nombre Comercial</label>
                <input
                  ref={this.refNombreComercial}
                  type="text"
                  className="form-control"
                  id="lblNombreComercial"
                  placeholder="Mi empresa"
                  value={this.state.nombreEmpresa}
                  onChange={(event) =>
                    this.setState({ nombreEmpresa: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lblNTelefono">N° Teléfono </label>
                <input
                  type="text"
                  className="form-control"
                  id="lblNTelefono"
                  placeholder="064 78456123"
                  onKeyPress={keyNumberPhone}
                  value={this.state.telefono}
                  onChange={(event) =>
                    this.setState({ telefono: event.target.value })
                  }
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lblNCelular">N° Celular </label>
                <input
                  type="text"
                  className="form-control"
                  id="lblNCelular"
                  placeholder="999999999"
                  onKeyPress={keyNumberPhone}
                  value={this.state.celular}
                  onChange={(event) =>
                    this.setState({ celular: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lblCorreoElectronico">
                  Correo Electrónico{' '}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lblCorreoElectronico"
                  placeholder="empresa@mail.com"
                  value={this.state.email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lblPaginaWeb">Página web</label>
                <input
                  type="text"
                  className="form-control"
                  id="lblPaginaWeb"
                  placeholder="www.dominio.com"
                  value={this.state.web}
                  onChange={(event) =>
                    this.setState({ web: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="lblDireccion">Dirección </label>
                <input
                  ref={this.refDireccion}
                  type="text"
                  className="form-control"
                  id="lblDireccion"
                  placeholder="av, calle etc."
                  value={this.state.direccion}
                  onChange={(event) =>
                    this.setState({ direccion: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3 text-center">
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
                  accept="image/png, image/jpeg, image/gif, image/svg"
                  className="display-none"
                  ref={this.refFileLogo}
                />
                <label
                  htmlFor="fileLogo"
                  className="btn btn-outline-secondary m-0"
                >
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

              <div className="col-md-6 mb-3 text-center">
                <label>Imagen</label>
                <br />
                <small>Usuado para mostrar el logo en sistema</small>
                <div className="text-center mb-2 ">
                  <img
                    src={this.state.image}
                    alt=""
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

            <button
              className="btn btn-primary btn-lg btn-block"
              type="button"
              onClick={() => this.onEventSave()}
            >
              <i className="fa fa-save"></i> Guardar Información
            </button>
          </div>
        </div>

        <footer className="my-5 pt-5 text-muted text-center text-small">
          <p>
            &copy; {new Date().getFullYear()} Distribuido por SysSoftIntegra
            &middot;
          </p>
        </footer>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    configSave: () => dispatch(configSave()),
  };
};

const ConnectedConfigurar = connect(mapStateToProps, mapDispatchToProps)(Configurar);

export default ConnectedConfigurar;
