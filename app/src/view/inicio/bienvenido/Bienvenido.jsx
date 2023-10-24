import React from 'react';
import ContainerWrapper from '../../../components/Container';
import { images } from '../../../helper';

class Bienvenido extends React.Component {


    render() {
        return (
            <ContainerWrapper>
                <div className="px-4 py-5 my-5 text-center">
                    <img className="d-block mx-auto mb-4" src={images.icono} alt="Logo" width="240" />
                
                    <div className="col-lg-6 mx-auto">
                        <p className="lead mb-4">Administra los procesos de la venta de terrenos desde una sola plataforma, con los modulos dashboard, seguridad, facturación, logística, tesorería, ajuste y reportes.</p>
                    </div>
                </div>
            </ContainerWrapper>
        )
    }
}

export default Bienvenido;