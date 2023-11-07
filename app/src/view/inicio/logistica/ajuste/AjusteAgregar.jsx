import React from 'react';
import {
    spinnerLoading,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning
} from '../../../../helper/utils.helper';
import ContainerWrapper from "../../../../components/Container";
import Paginacion from "../../../../components/Paginacion";
import { keyUpSearch } from "../../../../helper/utils.helper";
import CustomComponent from "../../../../model/class/custom-component";
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { deleteAlmacen, listAlmacen } from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import { connect } from 'react-redux';

class AjusteAgregar extends CustomComponent {

    constructor(props) {
        super(props);
        
        this.state = {
            

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        }

    }


    async componentDidMount() {
   
    }

    componentWillUnmount() {
    
    }


    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ajuste agregar <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

            
            </ContainerWrapper>
        );
    }
}

/**
 * 
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

/**
 * 
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(AjusteAgregar);