import React from 'react';
import {
    alertInfo,
    alertSuccess,
    alertWarning
} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { getAlmacenId, updateAlmacen } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';

class AlmaceneEditar extends CustomComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            idAlmacen: '',
            nombreAlmacen: '',
            direccion: '',
            distrito: '',
            codigoSunat: '',
            observacion: '',
            idUsuario: this.props.token.userToken.idUsuario,

            messageWarning: '',
        }

        this.abortControllerTable = new AbortController();

        this.refNombreAlmacen = React.createRef();
        this.refDireccion = React.createRef();
        this.refDistrito = React.createRef();
        this.refCodigoSunat = React.createRef();
        this.refObservacion = React.createRef();
    }


    async componentDidMount() {
        const url = this.props.location.search;
        const idResult = new URLSearchParams(url).get("idAlmacen");
        if (idResult !== null) {
            this.loadDataId(idResult);
        } else {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    async loadDataId(id) {
        const params = {
            "idAlmacen": id
        }

        const response = await getAlmacenId(params, this.abortControllerTable.signal);

        if (response instanceof SuccessReponse) {
            const almacen = response.data.result;

            this.setState({
                idAlmacen: id,
                nombreAlmacen: almacen.nombre,
                direccion: almacen.direccion,
                distrito: almacen.distrito,
                codigoSunat: almacen.codigoSunat,
                observacion: almacen.observacion,

                loading: false
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.props.history.goBack();
        }
    }

    handleSave() {
        if (this.state.nombreAlmacen === "") {
            this.setState({ messageWarning: "ingrese un nombre para el almacén." });
            this.refNombreAlmacen.current.focus();
            return;
        }

        if (this.state.direccion === "") {
            this.setState({ messageWarning: "ingrese una dirección para el almacén." });
            this.refDireccion.current.focus();
            return;
        }

        if (this.state.distrito === "") {
            this.setState({ messageWarning: "ingrese un distrito para el almacén." });
            this.refDistrito.current.focus();
            return;
        }

        if (this.state.codigoSunat === "") {
            this.setState({ messageWarning: "ingrese un codigoSunat para el almacén." });
            this.refCodigoSunat.current.focus();
            return;
        }

        alertInfo("Almacen", "Procesando información...");


        this.handleAdd();
    }

    async handleAdd() {

        const data = {
            nombreAlmacen: this.state.nombreAlmacen.toString().trim().toUpperCase(),
            direccion: this.state.direccion.trim().toUpperCase(),
            distrito: this.state.distrito.toString().trim().toUpperCase(),
            codigoSunat: this.state.codigoSunat.toString().trim().toUpperCase(),
            observacion: this.state.observacion,
            idUsuario: this.state.idUsuario,
            idAlmacen: this.state.idAlmacen
        }

        const response = await updateAlmacen(data);
        if (response instanceof SuccessReponse) {
            alertSuccess("Almacen", response.data, () => {
                this.props.history.goBack();
            });
        }

        if (response instanceof ErrorResponse) {
            alertWarning("Almacen", response.getMessage(), () => {
                this.refNombreAlmacen.current.focus();
            });
        }
    }

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Editar
                                <small className="text-secondary"> Agregar</small>
                            </h5>
                        </div>
                    </div>
                </div>

                {
                    this.state.messageWarning === '' ? null :
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                        </div>
                }

                <div className="dropdown-divider"></div>

                <div className="form-group pb-2">
                    <label>
                        Crea los puntos de almacenamiento y distribución de tus productos
                    </label>
                </div>

                <div className="form-row">
                    <div className="form-group col-md-6">
                        <div className="form-row">
                            <div className="form-group col-md-12">
                                <label>Nombre del Almacén: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref={this.refNombreAlmacen}
                                    value={this.state.nombreAlmacen}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                nombreAlmacen: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                nombreAlmacen: event.target.value,
                                                messageWarning: 'Ingrese un nombre para el almacén',
                                            });
                                        }
                                    }}
                                    placeholder="Ingrese el nombre del almacen" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Dirección: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    // ref={this.refDireccion}
                                    value={this.state.direccion}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                direccion: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                direccion: event.target.value,
                                                messageWarning: 'Ingrese una dirección para el almacén',
                                            });
                                        }
                                    }}
                                    placeholder="Ingrese una dirección" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Distrito: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    // ref={this.refDistrito}
                                    value={this.state.distrito}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                distrito: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                distrito: event.target.value,
                                                messageWarning: 'Ingrese una dirección para el almacén',
                                            });
                                        }
                                    }}
                                    placeholder="Ingrese un distrito" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Código SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    // ref={this.refCodigoSunat}
                                    value={this.state.codigoSunat}
                                    onChange={(event) => {
                                        if (event.target.value.trim().length > 0) {
                                            this.setState({
                                                codigoSunat: event.target.value,
                                                messageWarning: '',
                                            });
                                        } else {
                                            this.setState({
                                                codigoSunat: event.target.value,
                                                messageWarning: 'Ingrese una dirección para el almacén',
                                            });
                                        }
                                    }}
                                    placeholder="" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Los campos marcados con <i className="fa fa-asterisk text-danger small"></i> son obligatorios</label>
                            </div>
                        </div>

                    </div>
                    <div className="form-group col-md-6">
                        <div className="form-row h-100">
                            <div className="form-group col-md-12">
                                <label>Observaciones: </label>
                                <textarea className="form-control "
                                    id="exampleFormControlTextarea1"
                                    rows="13"
                                    ref={this.refObservacion}
                                    value={this.state.observacion}
                                    onChange={(event) => this.setState({
                                        observacion: event.target.value
                                    })}
                                ></textarea>
                            </div>
                            <div className="form-group col-md-12">
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <button type="button" className="btn btn-primary btn-block" onClick={() => this.handleSave()}>
                                            Guardar
                                        </button>
                                    </div>
                                    <div className="form-group col-md-6">
                                        <button type="button" className="btn btn-secondary btn-block ml-2" onClick={() => this.props.history.goBack()}>
                                            Cerrar
                                        </button>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

            </ContainerWrapper>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(AlmaceneEditar);