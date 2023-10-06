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
                        <section className="content-header">
                            {/* <div className="form-group"> */}
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Almacen
                                <small className="text-secondary"> Agregar</small>
                            </h5>
                        </section>
                        {/* </div> */}
                    </div>
                </div>

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
                                    ref=""
                                    value=""
                                    onChange=""
                                    placeholder="Ingrese el nombre del almacen" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Dirección: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                    placeholder="Ingrese una dirección" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Distrito: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
                                    placeholder="Ingrese un distrito" />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Código SUNAT: <i className="fa fa-asterisk text-danger small"></i></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    ref=""
                                    value=""
                                    onChange=""
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
                                <textarea className="form-control " id="exampleFormControlTextarea1" rows="13"></textarea>
                            </div>
                            <div className="form-group col-md-12">
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <button type="button" className="btn btn-primary btn-block" >
                                            Guardar
                                        </button>
                                    </div>
                                    <div className="form-group col-md-6">
                                        <button type="button" className="btn btn-secondary btn-block ml-2" >
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

export default AlmaceneAgregar;