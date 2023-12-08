import React from "react";
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
} from "../../../../helper/utils.helper";
import { connect } from "react-redux";
import ContainerWrapper from "../../../../components/Container";
import { images } from "../../../../helper";
import { getIdEmpresa, updateEmpresa } from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";
import { getRuc } from "../../../../network/rest/apisperu.network";
import CustomComponent from "../../../../model/class/custom-component";

class EmpresaProceso extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      idEmpresa: "",
      documento: "",
      razonSocial: "",
      nombreEmpresa: "",
      telefono: "",
      celular: "",
      email: "",
      web: "",
      direccion: "",
      useSol: "",
      claveSol: "",
      usuarioEmail: "",
      claveEmail: "",
      logo: images.noImage,
      image: images.noImage,

      lookPasswordEmail: false,
      lookPasswordSol: false,

      loading: true,
      messageWarning: "",
      msgLoading: "Cargando datos...",
    };

    this.refDocumento = React.createRef();
    this.refRazonSocial = React.createRef();

    this.refDireccion = React.createRef();
    this.refUbigeo = React.createRef();

    this.refPasswordEmail = React.createRef();
    this.refPasswordSol = React.createRef();

    this.refFileLogo = React.createRef();
    this.refFileImagen = React.createRef();

    this.abortController = new AbortController();
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idEmpresa = new URLSearchParams(url).get("idEmpresa");
    if (idEmpresa !== null) {
      this.loadingData(idEmpresa);
    } else {
      this.props.history.goBack();
    }

    this.refDocumento.current.focus();

    this.refFileLogo.current.addEventListener("change", this.onEventFileLogo);
    this.refFileImagen.current.addEventListener(
      "change",
      this.onEventFileImage
    );
  }

  componentWillUnmount() {
    this.abortController.abort();

    this.refFileLogo.current.removeEventListener("change", this.onEventFileLogo);
    this.refFileImagen.current.removeEventListener("change", this.onEventFileImage);
  }

  onEventFileLogo = async (event) => {  
    if (event.target.files.length !== 0) {
      await this.setStateAsync({ logo: URL.createObjectURL(event.target.files[0]), });
    } else {
      await this.setStateAsync({ logo: images.noImage, });
      this.refFileLogo.current.value = "";
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
      this.refFileImagen.current.value = "";
    }
  };

  async clearLogo() {
    await this.setStateAsync({
      logo: images.noImage,
    });
    this.refFileLogo.current.value = "";
  }

  async clearImage() {
    await this.setStateAsync({
      image: images.noImage,
    });
    this.refFileImagen.current.value = "";
  }

  loadingData = async (id) => {
    const params = {
      idEmpresa: id,
    }

    const response = await getIdEmpresa(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {

      const empresa = response.data;

      this.setState({
        idEmpresa: empresa.idEmpresa,

        documento: empresa.documento,
        razonSocial: empresa.razonSocial,
        nombreEmpresa: empresa.nombreEmpresa,
        direccion: empresa.direccion,

        useSol: empresa.useSol,
        claveSol: empresa.claveSol,

        usuarioEmail: empresa.usuarioEmail,
        claveEmail: empresa.claveEmail,

        logo: empresa.rutaLogo !== "" ? "/" + empresa.rutaLogo : images.noImage,
        image: empresa.rutaImage !== "" ? "/" + empresa.rutaImage : images.noImage,

        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        msgModal: response.getMessage()
      });
    }
  };

  async onEventGetApiSunat() {
    if (this.state.documento === "") {
      this.refDocumento.current.focus();
      return;
    }

    if (this.state.documento.length !== 11) {
      this.refDocumento.current.focus();
      return;
    }

    this.setState({
      loading: true,
      msgLoading: "Consultando número de RUC...",
    });

    const response = await getRuc(this.state.documento);

    if (response instanceof SuccessReponse) {
      this.setState({
        documento: convertNullText(response.data.ruc),
        razonSocial: convertNullText(response.data.razonSocial),
        direccion: convertNullText(response.data.direccion),
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning("Empresa", response.getMessage(), () => {
        this.setState({
          loading: false,
        });
      })
    }
  }

  async onEventGuardar() {
    if (!isText(this.state.documento)) {
      alertWarning("Empresa", "Ingrese el número de documento.", () => this.refDocumento.current.focus())
      return;
    }

    if (this.state.razonSocial === "") {
      alertWarning("Empresa", "Ingrese la razón social.", () => this.refRazonSocial.current.focus())
      return;
    }

    alertDialog("Empresa", "¿Está seguro de continuar?", async () => {
      alertInfo("Empresa", "Procesando información...");

      const logoSend = await imageBase64(this.refFileLogo.current.files);
      const baseLogo = logoSend ? logoSend.base64String : "";
      const extLogo = logoSend ? logoSend.extension : "";

      const imageSend = await imageBase64(this.refFileImagen.current.files);
      const baseImage = imageSend ? imageSend.base64String : "";
      const extImage = imageSend ? imageSend.extension : "";

      const data = {
        documento: this.state.documento.trim(),
        razonSocial: this.state.razonSocial.trim(),
        nombreEmpresa: this.state.nombreEmpresa.trim(),
        direccion: this.state.direccion.trim(),

        useSol: this.state.useSol.trim(),
        claveSol: this.state.claveSol.trim(),

        usuarioEmail: this.state.usuarioEmail.trim(),
        claveEmail: this.state.claveEmail.trim(),

        logo: baseLogo,
        image: baseImage,
        extlogo: extLogo,
        extimage: extImage,

        idEmpresa: this.state.idEmpresa,
      }

      const response = await updateEmpresa(data);

      if (response instanceof SuccessReponse) {
        alertSuccess("Empresa", response.data, () => {
          this.props.history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertWarning("Empresa", response.getMessage());
      }
    });
  }

  handleLookPasswordEmail = () => {
    this.setState({
      lookPasswordEmail: !this.state.lookPasswordEmail,
    });
    this.refPasswordEmail.current.focus();
  };

  handleLookPasswordSol = () => {
    this.setState({
      lookPasswordSol: !this.state.lookPasswordSol,
    });
    this.refPasswordSol.current.focus();
  };

  render() {
    return (
      <ContainerWrapper>
        {
          this.state.loading && spinnerLoading(this.state.msgLoading)
        }

        <div className="row">
          <div className="col-12">
            <section className="content-header">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{" "}
                Editar Empresa
              </h5>
            </section>
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
                  onClick={() => this.onEventGetApiSunat()}
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
          <div className="form-group col-md-12">
            <label>Dirección Fiscal: </label>
            <input
              type="text"
              className="form-control"
              value={this.state.direccion}
              onChange={(event) =>
                this.setState({ direccion: event.target.value })
              }
              placeholder="Ingrese el nombre comercial"
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Usuario Email (<small>Para el envío del correo</small>):{" "}
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
              Contraseña Email (<small>Para el envío del correo</small>):{" "}
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordEmail}
                type={this.state.lookPasswordEmail ? "text" : "password"}
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
                  <i
                    className={
                      this.state.lookPasswordEmail
                        ? "fa fa-eye"
                        : "fa fa-eye-slash"
                    }
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Usuario Sol(<small>Para el envío a Sunat</small>):{" "}
            </label>
            <input
              type="text"
              className="form-control"
              value={this.state.useSol}
              onChange={(event) =>
                this.setState({ useSol: event.target.value })
              }
              placeholder="usuario"
            />
          </div>

          <div className="form-group col-md-6">
            <label>
              Clave Sol(<small>Para el envío a Sunat</small>):{" "}
            </label>
            <div className="input-group">
              <input
                ref={this.refPasswordSol}
                type={this.state.lookPasswordSol ? "text" : "password"}
                className="form-control"
                value={this.state.claveSol}
                onChange={(event) =>
                  this.setState({ claveSol: event.target.value })
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
                  <i
                    className={
                      this.state.lookPasswordSol
                        ? "fa fa-eye"
                        : "fa fa-eye-slash"
                    }
                  ></i>
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
              accept="image/png, image/jpeg, image/gif, image/svg"
              className="display-none"
              ref={this.refFileLogo}
            />
            <label htmlFor="fileLogo" className="btn btn-outline-secondary m-0">
              <div className="content-button">
                <i className="bi bi-image"></i>
                <span></span>
              </div>
            </label>{" "}
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
            </label>{" "}
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
                onClick={() => this.onEventGuardar()}
              >
                Guardar
              </button>{" "}
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
