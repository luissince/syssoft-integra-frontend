import React from 'react';
import axios from 'axios';
import {
    formatMoney,
    timeForma24,
    spinnerLoading,
} from '../../tools/Tools';
import { connect } from 'react-redux';

class CreditoProceso extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Créditos
                                <small className="text-secondary"> Lista</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-light" onClick={() => { }}><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div>Cliente: </div>
                        <div>Teléfono y celular: </div>
                        <div>Dirección: </div>
                        <div>Email: </div>
                        <div>Comprobante: </div>
                        <div>Observación: </div>
                    </div>
                    <div className="col">
                        <div>Monto Total: </div>
                        <div>Monto Cobrado: </div>
                        <div>Monto Diferencia: </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="10%">N°</th>
                                        <th width="15%"># Transacción</th>
                                        <th width="15%">Fecha de Cobro</th>
                                        <th width="15%">Estado</th>
                                        <th width="15%">Monto</th>
                                        <th width="15%">Observación</th>
                                        <th width="15%">Cobro</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(CreditoProceso);