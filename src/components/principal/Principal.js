import React from 'react';
import './Principal.css';
import logo from '../../recursos/images/logo.svg';
import casa from './lol.png';
import casa2 from './casa2.png';
import casa3 from './casa3.png';
import logoInmobiliaria from './INMOBILIARIA.png';

class Principal extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (
            <>
                <div className='container'>
                    <div className='row'>
                        <div className='col-3' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column' }}>
                            <img className="mb-1" src={logoInmobiliaria} alt="" width="100" height="100" />
                        </div>
                        <div className='col-6 text-center' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column' }}>
                            <h3 className="text-dark">Empresa Inmobiliaria sac</h3>
                            <h5 className="text-secondary">Ruc: 12345678952</h5>
                        </div>
                        <div className='col-3 text-right text-info' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column', fontSize: '40px' }}>
                            <i class="bi bi-box-arrow-right"></i>
                        </div>
                    </div>
                </div>

                <div className="container pt-2 pb-2">
                    <div className="row p-3">
                        <div className="col-10" style={{ width: '100%' }}>
                            <input className="form-control mr-sm-2 bg-transparent" placeholder="filtar por proyecto o nombre del proyecto" aria-label="Search" />
                        </div>
                        <div className="col-2">
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit" style={{width:'100%'}}>Filtrar proyecto</button>
                        </div>
                    </div>
                </div>


                <div className="container">
                    <div className="card-deck mb-3">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header p-0" style={{ height: "350px" }}>
                                <img src={casa3} className="mx-auto d-block " width="100%" height="100%" />
                            </div>
                            <div className="card-body m-2">
                                <h6 className='text-info font-weight-bold'>RESIDENCIAL VILLA SAN JUAN</h6>
                                <h6 className='text-secondary'>CENTRO POBLADO SAN JUAN</h6>
                                <button type="button" className="btn btn-lg btn-block btn-outline-primary text-info" style={{ width: '50%' }}><i className="bi bi-arrow-right-circle-fill"></i> Ingresar</button>
                            </div>
                            <hr className="m-0" />
                            <div className="card-body m-2">
                                <ul className="list-group text-left pt-0">
                                    <li className="list-group-item border-0 px-0 pt-0"><i className="bi bi-geo-fill"></i> Moneda SOLES(S/)</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Total de lotes 26</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Lotes disponibles 19</li>
                                </ul>
                                <div className='row'>
                                    <div className='col-2 text-left'><i class="bi bi-grid-1x2-fill"></i></div>
                                    <div className='col-6 bg-warning' style={{ borderRadius: '7px' }}>Estado en venta</div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-12">
                                        <div className="progress" style={{ height: '15px' }}>
                                            <div className="progress-bar bg-info w-50" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="40">50.00%</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header p-0" style={{ height: "350px" }}>
                                <img src={casa2} className="mx-auto d-block " width="100%" height="100%" />
                            </div>
                            <div className="card-body m-2">
                                <h6 className='text-info font-weight-bold'>HABILITACION URBANA LAS LOMAS</h6>
                                <h6 className='text-secondary'>KM23 CARRETERA CENTRAL</h6>
                                <button type="button" className="btn btn-lg btn-block btn-outline-primary text-info" style={{ width: '50%' }}><i className="bi bi-arrow-right-circle-fill"></i> Ingresar</button>
                            </div>
                            <hr className="m-0" />
                            <div className="card-body m-2">
                                <ul className="list-group text-left pt-0">
                                    <li className="list-group-item border-0 px-0 pt-0"><i className="bi bi-geo-fill"></i> Moneda SOLES(S/)</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Total de lotes 26</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Lotes disponibles 19</li>
                                </ul>
                                <div className='row'>
                                    <div className='col-2 text-left'><i class="bi bi-grid-1x2-fill"></i></div>
                                    <div className='col-6 bg-info' style={{ borderRadius: '7px', color: 'white' }}>Estado en venta</div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-12">
                                        <div className="progress" style={{ height: '15px' }}>
                                            <div className="progress-bar bg-info w-75" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="40">75.00%</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header p-0" style={{ height: "350px" }}>
                                <img src={casa} className="mx-auto d-block " width="100%" height="100%" />
                            </div>
                            <div className="card-body m-2">
                                <h6 className='text-info font-weight-bold'>LOTIZACION LOS CEDROS</h6>
                                <h6 className='text-secondary'>HACIENDA LOS CEDROS KM45</h6>
                                <button type="button" className="btn btn-lg btn-block btn-outline-primary text-info" style={{ width: '50%' }}><i className="bi bi-arrow-right-circle-fill"></i> Ingresar</button>
                            </div>
                            <hr className="m-0" />
                            <div className="card-body m-2">
                                <ul className="list-group text-left pt-0">
                                    <li className="list-group-item border-0 px-0 pt-0"><i className="bi bi-geo-fill"></i> Moneda SOLES(S/)</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Total de lotes 26</li>
                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Lotes disponibles 19</li>
                                </ul>
                                <div className='row'>
                                    <div className='col-2 text-left'><i class="bi bi-grid-1x2-fill"></i></div>
                                    <div className='col-6 bg-primary' style={{ borderRadius: '7px', color: 'white' }}>Estado en venta</div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-12">
                                        <div className="progress" style={{ height: '15px' }}>
                                            <div className="progress-bar bg-info w-100" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="40">100.00%</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default Principal;