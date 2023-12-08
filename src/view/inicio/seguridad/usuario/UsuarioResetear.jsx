import React from 'react';
import {
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    isEmpty,
    isText
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { resetUsuario } from '../../../../network/rest/principal.network';

class UsuarioResetear extends CustomComponent {

    constructor(props) {

        super(props);
        this.state = {
            resetClave: '', 
        }

        this.refResetClave = React.createRef();
    }

    componentDidMount() {
        const url = this.props.location.search;
        const idUsuario = new URLSearchParams(url).get("idUsuario");
        if (isText(idUsuario)) {
            this.loadDataId(idUsuario)
        } else {
            this.props.history.goBack();
        }
    }

    loadDataId = async (id) => {
        this.setState({
            idUsuario: id,
        })
    }

    handleGuardar() {
        if (isEmpty(this.state.resetClave)) {
            alertWarning("Usuario", "Ingrese la nueva clave.", () => {
                this.refResetClave.current.focus();
            })
            return;
        }

        alertDialog("Usuario", "¿Está seguro de continuar?", async (accept) => {
            if (accept) {
                const data = {
                    "clave": this.state.resetClave,
                    "idUsuario": this.state.idUsuario
                }

                alertInfo("Usuario", "Procesando información...");

                const response = await resetUsuario(data);

                if (response instanceof SuccessReponse) {
                    alertSuccess("Usuario", response.data, () => {
                        this.props.history.goBack();
                    })
                }

                if (response instanceof ErrorResponse) {
                    alertWarning("Usuario", response.getMessage())
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span>
                                Cambiar contraseña - Usuario
                            </h5>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col'> 
                        <div className='form-group'>
                            <label>Nueva Clave: </label>
                            <input
                                type="text"
                                placeholder='Nueva clave.'
                                className="form-control"
                                ref={this.refResetClave}
                                value={this.state.resetClave}
                                onChange={(event) => this.setState({ resetClave: event.target.value })}
                            />
                        </div>
                    </div>
                </div> 

                <div className='row'>
                    <div className='col'>
                        <button type="button" className="btn btn-primary" onClick={() => this.handleGuardar()}>Aceptar</button>
                        {" "}
                        <button type="button" className="btn btn-danger" onClick={() => this.props.history.goBack()}>Cerrar</button>
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

export default connect(mapStateToProps, null)(UsuarioResetear);