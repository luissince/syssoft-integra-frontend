import React from "react";
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  alertDialog,
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
      descripcion: "",
      estado: false,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
  }

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value })
  }


  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  }

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  }

  handleGuardar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning("Categoría", "Ingrese el nombre de la categoría", () => {
        this.refNombre.current.focus();
      })
      return;
    }

    alertDialog("Categoría", "¿Está seguro de continuar?", async (accept) => {
      if (accept) {
        const data = {
          nombre: this.state.nombre,
          descripcion: this.state.descripcion,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        }

        alertInfo("Categoría", "Procesando información...");

        const response = await addCategoria(data);

        if (response instanceof SuccessReponse) {
          alertSuccess("Categoría", response.data, () => {
            this.props.history.goBack()
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Categoría", response.getMessage());
        }
      }
    })
  }

  render() {
    return (
      <ContainerWrapper>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}> <i className="bi bi-arrow-left-short"></i> </span>
                Agregar <small>categoría</small> <i className="fa fa-plus"></i>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">Nombre:<i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el nombre"
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={this.handleInputNombre}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">Descripción:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese la descripción"
                value={this.state.descripcion}
                onChange={this.handleInputDescripcion}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Estado:</label>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="customSwitchEstado"
                  checked={this.state.estado}
                  onChange={this.handleSelectEstado} />
                <label className="custom-control-label" htmlFor="customSwitchEstado">{this.state.estado ? "Activo" : "Inactivo"}</label>
              </div>
            </div>
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
              </button>
              {" "}
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
}

export default connect(mapStateToProps, null)(CategoriaAgregar);
