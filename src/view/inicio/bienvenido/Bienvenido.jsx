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
                        <p className="lead mb-4">Centraliza y optimiza tu gestión empresarial con nuestra plataforma integral. Controla ventas, inventario, compras, pagos, gastos y facturación electrónica desde un único lugar. Con módulos intuitivos, seguridad avanzada y reportes detallados, simplificamos tu operativa para potenciar el éxito de tu negocio.</p>
                    </div>
                </div>
            </ContainerWrapper>
        )
    }
}

export default Bienvenido;