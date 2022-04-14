import React from 'react';
import axios from 'axios';
import { spinnerLoading } from '../tools/Tools';
import repVentas from '../../recursos/images/repventas.png'

class RepVentas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Reporte de <small className="text-secondary">ventas</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-3 col-md-3 col-sm-12 col-12">
                        <div className="card mb-3 card-default">
                            <button className="btn btn-link" id="btnFacturados">
                                <h5 className="card-title">Op. Ventas</h5>
                                <div className="card-body">
                                    <img src={repVentas} alt="Vender" width="54"/>
                                    {/* <i className="bi bi-person fa-3x" alt="Vender"></i> */}
                                </div>
                                <div className="card-footer border-0">Documentos</div>
                            </button>
                        </div>
                    </div>

                    {/* <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                        <div class="card mb-3 card-default">
                            <button class="btn btn-link" id="btnVentaLibre">
                                <h5 class="card-title">Ope. Venta/Libre</h5>
                                <div class="card-body">
                                    <img src="./images/sales.png" alt="Vender" width="54">
                                </div>
                                <div class="card-footer border-0">Documento</div>
                            </button>
                        </div>
                    </div>

                    <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                        <div class="card mb-3 card-default">
                            <button class="btn btn-link" id="btnVentaPos">
                                <h5 class="card-title">Ope. Venta/Pos</h5>
                                <div class="card-body">
                                    <img src="./images/caja_registradora.png" alt="Vender" width="54">
                                </div>
                                <div class="card-footer border-0">Documento</div>
                            </button>
                        </div>
                    </div>

                    <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                        <div class="card mb-3 card-default">
                            <button class="btn btn-link" id="btnIngresosEgresos">
                                <h5 class="card-title">Ingresos/Egresos</h5>
                                <div class="card-body">
                                    <img src="./images/movimiento.png" alt="Vender" width="54">
                                </div>
                                <div class="card-footer border-0">Documento</div>
                            </button>
                        </div>
                    </div> */}

                    
                    {/* <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                        <div class="card mb-3 card-default">
                            <button class="btn btn-link" id="">
                                <h5 class="card-title">Compras</h5>
                                <div class="card-body">
                                    <img src="./images/purchases.png" alt="Vender" width="54">
                                </div>
                                <div class="card-footer border-0">Documento</div>
                            </button>
                        </div>
                    </div> */}
                 
                </div>
            </>
        )
    }
}

export default RepVentas