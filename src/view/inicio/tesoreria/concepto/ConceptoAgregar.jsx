import React from "react";
import { connect } from "react-redux";
import CustomComponent from "../../../../model/class/custom-component";
import ContainerWrapper from "../../../../components/Container";
import { alertDialog, alertInfo, alertSuccess, alertWarning, isText, spinnerLoading } from "../../../../helper/utils.helper";
import { addConcepto } from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";

class ConceptoAgregar extends CustomComponent {

    constructor(props) {
        super(props)
        this.state = {
            nombre: '',
            tipo: 0,
            codigo: '',

            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.refNombre = React.createRef();
        this.refTipo = React.createRef();
    }

    handleGuardar = async () => {
        if (!isText(this.state.nombre)) {
            alertWarning("Concepto", "Ingrese el nombre del concepto.", () => this.refNombre.current.focus())
            return;
        }

        if (this.state.tipo === 0) {
            alertWarning("Concepto", "Seleccione el tipo de concepto.", () => this.refTipo.current.focus())
            return;
        }

        alertDialog("Concepto", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                const data = {
                    "nombre": this.state.nombre,
                    "tipo": this.state.tipo,
                    "codigo": this.state.codigo,
                    "idUsuario": this.state.idUsuario,
                }

                alertInfo("Concepto", "Procesando información...")

                const response = await addConcepto(data);

                if (response instanceof SuccessReponse) {
                    alertSuccess("Concepto", response.data, () => {
                        this.props.history.goBack()
                    });
                }

                if (response instanceof ErrorResponse) {
                    if (response.getType() === CANCELED) return;

                    alertWarning("Concepto", response.getMessage());
                }
            }
        });
    }

    render() {
        return (
            <ContainerWrapper>
                {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                }

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <section className="content-header">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}>
                                    <i className="bi bi-arrow-left-short"></i>
                                </span>{" "}
                                Agregar concepto
                            </h5>
                        </section>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label>Nombre <i className="fa fa-asterisk text-danger small"></i></label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.nombre}
                                ref={this.refNombre}
                                onChange={(event) => this.setState({ nombre: event.target.value, })}
                                placeholder="Ingrese el nombre del concepto" />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label>Tipo de Concepto <i className="fa fa-asterisk text-danger small"></i></label>
                            <div className="input-group">
                                <select
                                    className="form-control"
                                    value={this.state.tipo}
                                    ref={this.refTipo}
                                    onChange={(event) => this.setState({ tipo: event.target.value })}>
                                    <option value={0}>-- Seleccione --</option>
                                    <option value={1}>CONCEPTO DE GASTO</option>
                                    <option value={2}>CONCEPTO DE COBRO</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label>Código</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.codigo}
                                    onChange={(event) => this.setState({ codigo: event.target.value })}
                                    placeholder="Código" />
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
                                onClick={this.handleGuardar}
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
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer,
    };
};

export default connect(mapStateToProps, null)(ConceptoAgregar);