import React from "react";
import { connect } from "react-redux";
import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";
import { alertDialog, alertInfo, alertSuccess, alertWarning, isNumeric, isText, keyNumberInteger, spinnerLoading } from "../../../../helper/utils.helper";
import { editImpuesto, getImpuestoId } from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";

class ImpuestoEditar extends CustomComponent {

    constructor(props) {
        super(props)
        this.state = {
            idImpuesto: '',
            nombre: '',
            porcentaje: '',
            codigo: '',
            preferida: false,
            estado: true,

            loading: true,
            msgLoading: "Cargando datos...",

            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.refNombre = React.createRef();
        this.refPorcentaje = React.createRef();
        this.refCodigo = React.createRef();

        this.abortController = new AbortController();
    }

    async componentDidMount() {
        const url = this.props.location.search;
        const idImpuesto = new URLSearchParams(url).get("idImpuesto");

        if (isText(idImpuesto)) {
            this.loadingData(idImpuesto);
        } else {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    loadingData = async (id) => {
        const [impuesto] = await Promise.all([
            await this.fetchGetIdImpuesto(id)
        ])

        this.setState({
            idImpuesto: impuesto.idImpuesto,
            nombre: impuesto.nombre,
            porcentaje: impuesto.porcentaje.toString(),
            codigo: impuesto.codigo,
            preferida: impuesto.preferida,
            estado: impuesto.estado,
            loading: false
        });
    }

    async fetchGetIdImpuesto(id) {
        const params = {
            idImpuesto: id
        }
        const response = await getImpuestoId(params, this.abortController.signal);

        if (response instanceof SuccessReponse) {
            return response.data;
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            return [];
        }
    }

    handleEditar = () => {
        if (!isText(this.state.nombre)) {
            alertWarning("Impuesto", "Ingrese el nombre.", () => this.refNombre.current.focus());
            return;
        }

        if (!isNumeric(this.state.porcentaje)) {
            alertWarning("Impuesto", "Ingrese el porcentaje.", () => this.refPorcentaje.current.focus());
            return;
        }

        alertDialog("Banco", "¿Estás seguro de continuar?", async (accept) => {
            if (accept) {

                alertInfo("Banco", "Procesando información...");

                const data = {
                    "idImpuesto": this.state.idImpuesto,
                    "nombre": this.state.nombre,
                    "porcentaje": this.state.porcentaje,
                    "codigo": this.state.codigo,
                    "estado": this.state.estado,
                    "preferida": this.state.preferida,
                    "idUsuario": this.state.idUsuario,
                }

                const response = await editImpuesto(data);
                if (response instanceof SuccessReponse) {
                    alertSuccess("Impuesto", response.data, () => {
                        this.props.history.goBack()
                    });
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Impuesto", response.getMessage());
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
                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}>
                                    <i className="bi bi-arrow-left-short"></i>
                                </span>{" "}
                                Agregar Impuesto
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label htmlFor="nombre" className="col-form-label">Nombre: <i className="fa fa-asterisk text-danger small"></i></label>
                            <input
                                type="text"
                                placeholder="Digite..."
                                className="form-control"
                                id="nombre"
                                ref={this.refNombre}
                                value={this.state.nombre}
                                onChange={(event) => this.setState({ nombre: event.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <label htmlFor="serie">Porcentaje: <i className="fa fa-asterisk text-danger small"></i></label>
                        <input
                            type="text"
                            placeholder="Digite..."
                            className="form-control"
                            id="serie"
                            ref={this.refPorcentaje}
                            value={this.state.porcentaje}
                            onChange={(event) => this.setState({ porcentaje: event.target.value })}
                            onKeyDown={keyNumberInteger} />
                    </div>
                    <div className="form-group col-md-6">
                        <label htmlFor="numeracion">Código:</label>
                        <input
                            type="text"
                            placeholder="Digite..."
                            className="form-control"
                            id="numeracion"
                            ref={this.refCodigo}
                            value={this.state.codigo}
                            onChange={(event) => this.setState({ codigo: event.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <div className="custom-control custom-switch">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="switch1"
                                checked={this.state.estado}
                                onChange={(value) => this.setState({ estado: value.target.checked })} />
                            <label className="custom-control-label" htmlFor="switch1">{this.state.estado ? "Activo" : "Inactivo"}</label>
                        </div>
                    </div>

                    <div className="form-group col-md-6">
                        <div className="custom-control custom-switch">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="switch2"
                                checked={this.state.preferida}
                                onChange={(value) => this.setState({ preferida: value.target.checked })} />
                            <label className="custom-control-label" htmlFor="switch2">{this.state.preferida ? "Si" : "No"}</label>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={this.handleEditar}
                            >
                                Editar
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
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer,
    };
};

export default connect(mapStateToProps, null)(ImpuestoEditar);