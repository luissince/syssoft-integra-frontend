import React from 'react';
import { connect } from 'react-redux';
const axios = require('axios').default;

class Comprobante extends React.Component {

    constructor(props) {
        super(props);

        console.log("Comprobante constructor");
        console.log(props);
    }

    async componentDidMount() {
        console.log("Comprobante componentDidMount");
        console.log(this.props);

        try {
            const result = await axios.get('/api/comprobante', {
                params: {
                    name: 'Sherlock',
                    apellido: 'Jackson'
                }
            });
            console.log(result);
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <h5>Comprobantes de pago <small>LISTA</small></h5>
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
                                <input type="text" className="form-control" placeholder="Buscar..." />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info">
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Nombre</th>
                                        <th scope="col">Serie</th>
                                        <th scope="col">Numeración</th>
                                        <th scope="col">Creación</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Edición</th>
                                        <th scope="col">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                        <td>@mdo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info mt-2" role="status" aria-live="polite">Showing 51 to 57 of 57 entries</div>
                    </div>
                    <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <button className="page-link"><i className="bi bi-arrow-left"></i></button>
                                    </li>
                                    <li className="page-item"><button className="page-link" >1</button></li>
                                    <li className="page-item active" aria-current="page">
                                        <span className="page-link">2</span>
                                    </li>
                                    <li className="page-item"><button className="page-link">3</button></li>
                                    <li className="page-item">
                                        <button className="page-link"><i className="bi bi-arrow-right"></i></button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}


export default connect(mapStateToProps, null)(Comprobante);