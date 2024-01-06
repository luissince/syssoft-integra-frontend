import { connect } from "react-redux";
import ContainerWrapper from "../../../../../components/Container";
import CustomComponent from "../../../../../model/class/custom-component";

class CuentasPorPagarAmbonar extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,
        };
    }

    render() {
        return (
            <ContainerWrapper>

            </ContainerWrapper>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer,
    };
};

export default connect(mapStateToProps, null)(CuentasPorPagarAmbonar);