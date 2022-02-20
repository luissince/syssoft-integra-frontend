import React from 'react';
import './Principal.css';
import logo from '../../recursos/images/logo.svg';
import casa from './lol.png';
import casa2 from './casa2.png';
import casa3 from './casa3.png';

class Principal extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (
            <>
                <div className="bg-white border-bottom shadow-sm">
                    <div className="container">
                        <div className="d-flex flex-column flex-md-row align-items-center pt-2 pb-2">
                            <h5 className="my-0 mr-md-auto font-weight-normal">
                                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 text-dark text-decoration-none">
                                    <img className="bi mr-2" src={logo} alt="" width="40" />
                                    <span className="fs-4"> Simple header</span>
                                </a>
                            </h5>
                            <nav className="my-2 my-md-0 mr-md-3">
                                <a className="p-2 text-dark active" href="#">Features</a>
                                <a className="p-2 text-dark" href="#">Enterprise</a>
                                <a className="p-2 text-dark" href="#">Support</a>
                                <a className="p-2 text-dark" href="#"><i className="bi-alarm"></i></a>
                            </nav>
                            <a className="btn btn-outline-primary" href="#">Sign up</a>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
                        <h1 className="display-4">Empresa Inmobiliaria Jesley sac</h1>
                        <p className="lead">Ruc 71137690</p>
                    </div>
                </div>

                <div className="container">
                    <div className="card-deck mb-3 text-center">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h4 className="my-0 font-weight-normal">Free</h4>
                            </div>

                            <div className="card-body">
                            <div className="form-group">
                                    <img src={casa3} className="mx-auto d-block " width="100%" height="350px" />
                                </div>
                                <button type="button" className="btn btn-lg btn-block btn-outline-primary text-info"><i className="bi bi-arrow-right-circle-fill"></i> Ingresar</button>

                                <h1 className="card-title pricing-card-title">$0 <small className="text-muted">/ mo</small></h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                    <li>10 users included</li>

                                </ul>

                            </div>
                        </div>
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h4 className="my-0 font-weight-normal">Pro</h4>
                            </div>
                            <div className="card-body">
                            <div className="form-group">
                                    <img src={casa2} className="mx-auto d-block " width="100%" height="350px" />
                                </div>
                                <button type="button" className="bi bi-arrow-right-circle-fill" className="btn btn-lg btn-block btn-outline-primary text-info"><i className="bi bi-arrow-right-circle-fill"></i>  Ingresar</button>
                                <h1 className="card-title pricing-card-title">$30000 <small className="text-muted">/ mo</small></h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                    <li>20 users included</li>
                                    <li>10 GB of storage</li>
                                    <li>Priority email support</li>
                                    <li>Help center access</li>
                                </ul>

                            </div>
                        </div>
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h4 className="my-0 font-weight-normal">Enterprise</h4>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <img src={casa} className="mx-auto d-block " width="100%" height="350px" />
                                </div>

                                <li>SANTA ANITA-LOS NOGALES</li>
                                <div className="form-group mt-3">
                                    <button type="button" className="btn btn-lg btn-block btn-outline-primary text-info"><i className="bi bi-arrow-right-circle-fill"></i>  Ingresar</button>
                                </div>
                                <div className="form-group mt-3">
                                    <h1 className="card-title pricing-card-title">$29 <small className="text-muted">/ mo</small></h1>
                                    <ul className="list-unstyled mt-3 mb-4">
                                        <li>30 users included</li>
                                        

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="pt-4 my-md-5 pt-md-5 border-top">
                        <div className="row">
                            <div className="col-12 col-md">
                                <img className="mb-2" src="https://getbootstrap.com/docs/4.6/assets/brand/bootstrap-solid.svg" alt="" width="24" height="24" />
                                <small className="d-block mb-3 text-muted">© 2017-2021</small>
                            </div>
                            <div className="col-6 col-md">
                                <h5>Features</h5>
                                <ul className="list-unstyled text-small">
                                    <li><a className="text-muted" href="#">Cool stuff</a></li>
                                    <li><a className="text-muted" href="#">Random feature</a></li>
                                    <li><a className="text-muted" href="#">Team feature</a></li>
                                    <li><a className="text-muted" href="#">Stuff for developers</a></li>
                                    <li><a className="text-muted" href="#">Another one</a></li>
                                    <li><a className="text-muted" href="#">Last time</a></li>
                                </ul>
                            </div>
                            <div className="col-6 col-md">
                                <h5>Resources</h5>
                                <ul className="list-unstyled text-small">
                                    <li><a className="text-muted" href="#">Resource</a></li>
                                    <li><a className="text-muted" href="#">Resource name</a></li>
                                    <li><a className="text-muted" href="#">Another resource</a></li>
                                    <li><a className="text-muted" href="#">Final resource</a></li>
                                </ul>
                            </div>
                            <div className="col-6 col-md">
                                <h5>About</h5>
                                <ul className="list-unstyled text-small">
                                    <li><a className="text-muted" href="#">Team</a></li>
                                    <li><a className="text-muted" href="#">Locations</a></li>
                                    <li><a className="text-muted" href="#">Privacy</a></li>
                                    <li><a className="text-muted" href="#">Terms</a></li>
                                </ul>
                            </div>
                        </div>
                    </footer>
                </div>
            </>
        );
    }

}

export default Principal;