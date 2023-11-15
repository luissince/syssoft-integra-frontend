import React from "react";
import { connect } from "react-redux";
import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";
import { alertDialog, alertInfo, alertSuccess, alertWarning, isText, spinnerLoading } from "../../../../helper/utils.helper";
import { addBanco, listMonedaCombo } from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";

class BancoAgregar extends CustomComponent {
    constructor(props) {
        super(props)
        this.state = {
            nombre: "",
            tipoCuenta: "",
            idMoneda: "",
            monedas: [],
            numCuenta: "",
            cci: "",

            loading: true,
            msgLoading: "Cargando datos...",

            idUsuario: this.props.token.userToken.idUsuario,
        }

        this.refTxtNombre = React.createRef();
        this.refTipoCuenta = React.createRef();
        this.refTxtMoneda = React.createRef();
        this.refTxtNumCuenta = React.createRef();
        this.refTxtCci = React.createRef();

        this.abortController = new AbortController();
    }

    async componentDidMount() {
        this.loadingData();
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    async loadingData() {
        const [monedas] = await Promise.all([
            await this.fetchMonedaCombo(),
        ])

        this.setState({
            monedas,
            loading: false,
        })
    }

    async fetchMonedaCombo() {
        const result = await listMonedaCombo(this.abortController.signal)

        if (result instanceof SuccessReponse) {
            return result.data;
        }

        if (result instanceof ErrorResponse) {
            if (result.getType() === CANCELED) return;

            return [];
        }
    }

    handleGuardar = () => {
        if (!isText(this.state.nombre)) {
            this.refTxtNombre.current.focus();
            return;
        }

        if (!isText(this.state.tipoCuenta)) {
            this.tipoCuenta.current.focus();
            return;
        }

        if (!isText(this.state.idMoneda)) {
            this.refTxtMoneda.current.focus();
            return;
        }

        alertDialog("Banco", "¿Estás seguro de continuar?", async (accept) => {
            if (accept) {

                alertInfo("Banco", "Procesando información...");

                const data = {
                    nombre: this.state.nombre.trim().toUpperCase(),
                    tipoCuenta: this.state.tipoCuenta,
                    idMoneda: this.state.idMoneda.trim().toUpperCase(),
                    numCuenta: this.state.numCuenta.trim().toUpperCase(),
                    cci: this.state.cci.trim().toUpperCase(),
                    idUsuario: this.state.idUsuario,
                }

                const response = await addBanco(data, this.abortController.signal)
                if (response instanceof SuccessReponse) {
                    alertSuccess("Banco", response.data, () => {
                        this.props.history.goBack();
                    });
                }

                if (response instanceof ErrorResponse) {
                    if (response.getType() === CANCELED) return;

                    alertWarning("Banco", response.getMessage());
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
                                Editar Banco
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <label>
                            Nombre Banco{" "}
                            <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            ref={this.refTxtNombre}
                            value={this.state.nombre}
                            onChange={(event) =>
                                this.setState({ nombre: event.target.value })
                            }
                            placeholder="BCP, BBVA, etc"
                        />
                    </div>

                    <div className="form-group col-md-6">
                        <label>
                            Tipo de Cuenta: <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                        <select
                            className="form-control"
                            ref={this.refTipoCuenta}
                            value={this.state.tipoCuenta}
                            onChange={(event) =>
                                this.setState({ tipoCuenta: event.target.value })
                            }
                        >
                            <option value="">- Seleccione -</option>
                            <option value="1">Banco</option>
                            <option value="2">Tarjeta</option>
                            <option value="3">Efectivo</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <label>
                            Moneda: <i className="fa fa-asterisk text-danger small"></i>
                        </label>
                        <select
                            className="form-control"
                            ref={this.refTxtMoneda}
                            value={this.state.idMoneda}
                            onChange={(event) =>
                                this.setState({ idMoneda: event.target.value })
                            }
                        >
                            <option value="">- Seleccione -</option>
                            {
                                this.state.monedas.map((item, index) => (
                                    <option key={index} value={item.idMoneda}>
                                        {item.nombre}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-group col-md-6">
                        <label>
                            Número de cuenta
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            ref={this.refTxtNumCuenta}
                            value={this.state.numCuenta}
                            onChange={(event) =>
                                this.setState({ numCuenta: event.target.value })
                            }
                            placeholder="##############"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6">
                        <label>CCI </label>
                        <input
                            type="text"
                            className="form-control"
                            ref={this.refTxtCci}
                            value={this.state.cci}
                            onChange={(event) =>
                                this.setState({ cci: event.target.value })
                            }
                            placeholder="####################"
                        />

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

export default connect(mapStateToProps, null)(BancoAgregar);