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
import { addMedida } from "../../../../network/rest/principal.network";

class MedidaAgregar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      codigo: "",
      nombre: "",
      descripcion: "",
      estado: false,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refCodigo = React.createRef();
    this.refNombre = React.createRef();
  }

  handleInputCodigo = (event) => {
    this.setState({ codigo: event.target.value })
  }

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value })
  }

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value })
  }

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  }

  handleGuardar = async () => {
    if (isEmpty(this.state.codigo)) {
      alertWarning("Medida", "Ingrese el codigo de la medida", () => {
        this.refCodigo.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.nombre)) {
      alertWarning("Medida", "Ingrese el nombre de la medida", () => {
        this.refNombre.current.focus();
      })
      return;
    }

    alertDialog("Categoría", "¿Está seguro de continuar?", async (accept) => {
      if (accept) {
        const data = {
          codigo: this.state.codigo,
          nombre: this.state.nombre,
          descripcion: this.state.descripcion,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        }

        alertInfo("Categoria", "Procesando información...");

        const response = await addMedida(data);

        if (response instanceof SuccessReponse) {
          alertSuccess("Categoria", response.data, () => {
            this.props.history.goBack()
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Categoria", response.getMessage());
        }
      }
    });
  }

  render() {
    return (
      <ContainerWrapper>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{" "}
                Agregar <small>medida</small> <i className="fa fa-plus"></i>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">
                Código: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el código"
                ref={this.refCodigo}
                value={this.state.codigo}
                onChange={this.handleInputCodigo}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="categoria">
                Nombre: <i className="fa fa-asterisk text-danger small"></i>
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
              <label htmlFor="categoria">
                Descripción:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese el descripción"
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

export default connect(mapStateToProps, null)(MedidaAgregar);
