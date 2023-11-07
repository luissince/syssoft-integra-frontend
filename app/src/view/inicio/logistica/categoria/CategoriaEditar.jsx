import React from "react";
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  isText,
} from "../../../../helper/utils.helper";
import { connect } from "react-redux";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";
import ContainerWrapper from "../../../../components/Container";
import { getIdCategoria, updateCategoria } from "../../../../network/rest/principal.network";
import CustomComponent from "../../../../model/class/custom-component";

class CategoriaEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idCategoria: "",
      nombre: "",

      loading: true,
      loadingMessage: "Cargando datos...",

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCategoria = new URLSearchParams(url).get("idCategoria");

    if (isText(idCategoria)) {
      this.loadingData(idCategoria);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }


  async loadingData(id) {
    const params = {
      idCategoria: id,
    }

    const response = await getIdCategoria(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      this.setState({
        idCategoria: response.data.idCategoria,
        nombre: response.data.nombre,
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadingMessage: response.getMessage(),
      });
    }
  }

  handleEditar = async () => {
    if (!isText(this.state.nombre)) {
      this.refNombre.current.focus();
      return;
    }

    const data = {
      idCategoria: this.state.idCategoria,
      nombre: this.state.nombre,
      idSucursal: this.state.idSucursal,
      idUsuario: this.state.idUsuario,
    }

    alertInfo("Categoria", "Procesando información...");

    const response = await updateCategoria(data);

    if (response instanceof SuccessReponse) {
      alertSuccess("Categoria", response.data, () => {
        this.props.history.goBack()
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning("Categoria", response.getMessage());
    }
  }

  render() {
    return (
      <ContainerWrapper>

        {
          this.state.loading && spinnerLoading(this.state.loadingMessage)
        }

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <section className="content-header">
                <h5>
                  <span role="button" onClick={() => this.props.history.goBack()}>
                    <i className="bi bi-arrow-left-short"></i>
                  </span>{" "}
                  Editar categoría <i className="fa fa-edit"></i>
                </h5>
              </section>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="categoria">
                Nombre Categoria{" "}
                <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el nombre de la categoria"
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => this.handleEditar()}
              >
                Editar
              </button>
              {" "}
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
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

export default connect(mapStateToProps, null)(CategoriaEditar);
