import React from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { signOut } from '../../redux/actions';

class Ventas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    onEventNuevaVenta = () => {
        // console.log(this.props.location.pathname)
        this.props.history.push(`${this.props.location.pathname}/proceso`)
    }

    render() {
        return (
            <>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Ventas <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input type="search" className="form-control" placeholder="Buscar..." onKeyUp={(event) => console.log(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">

                            <button className="btn btn-outline-info" onClick={this.onEventNuevaVenta}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="17%" className="text-center">Cliente</th>
                                        <th width="10%" className="text-center">DNI/RUC</th>
                                        <th width="10%" className="text-center">Comprobante</th>
                                        <th width="10%" className="text-center">Fecha</th>
                                        <th width="10%" className="text-center">T. de Venta</th>
                                        <th width="7%" className="text-center">Total</th>
                                        <th width="5%" className="text-center">Estado</th>
                                        <th width="8%" className="text-center">Contrato</th>
                                        <th width="15%" colSpan="2" className="text-center">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>

                            </table>
                        </div>
                        {/* <div className="col-md-12" style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div> */}

                    </div>
                </div>
            </>
        );
    }
}

export default Ventas;