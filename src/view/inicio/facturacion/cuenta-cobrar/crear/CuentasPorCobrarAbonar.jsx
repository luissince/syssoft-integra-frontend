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
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}>
                                    <i className="bi bi-arrow-left-short"></i>
                                </span>{' '}
                                Cuentas por Cobrar
                                <small className="text-secondary"> detalle</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={this.handlePrintA4}
                            >
                                <i className="fa fa-print"></i> A4
                            </button>
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={this.handlePrintTicket}
                            >
                                <i className="fa fa-print"></i> Ticket
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <div className="table-responsive">
                                <table width="100%">
                                    <thead>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Comprobante
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Cliente
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Fecha
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Notas
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Forma de venta
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Estado
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Usuario
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="table-secondary w-25 p-1 font-weight-normal ">
                                                Total
                                            </th>
                                            <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">

                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <p className="lead">Detalle</p>
                            <div className="table-responsive">
                                <table className="table table-light table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Concepto</th>
                                            <th>Unidad</th>
                                            <th>Categoría</th>
                                            <th>Cantidad</th>
                                            <th>Impuesto</th>
                                            <th>Precio</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8 col-md-8 col-sm-12 col-12"></div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                        <table width="100%">
                            <thead></thead>
                        </table>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <p className="lead">Ingresos asociado</p>
                        <div className="table-responsive">
                            <table className="table table-light table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Fecha y Hora</th>
                                        <th>Metodo</th>
                                        <th>Descripción</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

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