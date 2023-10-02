import ContainerWrapper from "../../../../components/Container";
import CustomComponent from "../../../../model/class/custom-component";

class AlmaceneAgregar extends CustomComponent {

    constructor(props) {
        super(props);
    }


    componentDidMount() {

    }

    componentWillUnmount() {

    }


    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Almacen
                                <small className="text-secondary"> Agregar</small>
                            </h5>
                        </div>
                    </div>
                </div>

            </ContainerWrapper>
        );
    }

}

export default AlmaceneAgregar;