import React from "react";
import {
  hideModal,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  statePrivilegio,
  isText,
} from "../../../../helper/utils.helper";
import { connect } from "react-redux";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import ContainerWrapper from "../../../../components/Container";
import { addCategoria } from "../../../../network/rest/principal.network";

class CategoriaAgregar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nombre: "",

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
  }

  onEventGuardar = async () => {
    if (!isText(this.state.nombre)) {
      this.refNombre.current.focus();
      return;
    }

    const data = {
      nombre: this.state.nombre,
      idUsuario: this.state.idUsuario,
    }

    alertInfo("Categoria", "Procesando información...");

    const response = await addCategoria(data);

    if (response instanceof SuccessReponse) {
      alertSuccess("Categoria", response.data, () => {
        this.props.history.goBack()
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning("Categoria", response.getMessage());
    }
  };


  render() {
    return (
      <ContainerWrapper>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <section className="content-header">
                <h5>
                  <span role="button" onClick={() => this.props.history.goBack()}>
                    <i className="bi bi-arrow-left-short"></i>
                  </span>{" "}
                  Agregar categoría <i className="fa fa-plus"></i>
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
                className="btn btn-primary"
                onClick={() => this.onEventGuardar()}
              >
                Guardar
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
}

export default connect(mapStateToProps, null)(CategoriaAgregar);
