import React from 'react';
import './Principal.css';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut, selectProject } from '../../redux/actions';
import { spinnerLoading } from '../tools/Tools';

import noImage from '../../recursos/images/noimage.jpg'
import logoInmobiliaria from './INMOBILIARIA.png';

class Principal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loadModal: true,
            msgModal: "Cargando proyectos...",
        }

        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        try {
            let result = await axios.get("/api/proyecto/inicio", {
                signal: this.abortControllerTable.signal
            });

            await this.setStateAsync({
                data: result.data,
                loadModal: false
            });

        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgModal: "Se produjo un error interno, intente nuevamente."
                });
            }
        }
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    onEventSignIn = async (event) => {
        try {
            window.localStorage.removeItem('login');
            window.localStorage.removeItem('project');
            this.props.restore();
            this.props.history.push("login");
        } catch (e) {
            this.props.restore();
            this.props.history.push("login");
        }
    }

    onEventIngresar(item) {
        const proyect = {
            "idProyecto": item.idProyecto,
            "nombre": item.nombre,
            "ubicacion": item.ubicacion
        }
        window.localStorage.setItem("project", JSON.stringify(proyect));
        this.props.project(JSON.parse(window.localStorage.getItem('project')));
    }

    render() {
        if (this.props.token.userToken == null) {
            return <Redirect to="/login" />
        }

        if (this.props.token.project !== null) {
            return <Redirect to="/inicio" />
        }

        return (
            <>
                <div className='container'>

                    {this.state.loadModal ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgModal)}
                        </div>
                        : null
                    }

                    <div className='row'>
                        <div className='col-md-3 col-12' >
                            <div className='d-flex h-100 justify-content-start align-items-center'>
                                <div className="form-group">
                                    <img className="img-fluid" src={logoInmobiliaria} alt="logo" width="140" />
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6 col-12' >
                            <div className='d-flex h-100 flex-column justify-content-center align-items-center'>
                                <div className="form-group text-center">
                                    <h3 className="text-dark">Empresa Inmobiliaria sac</h3>
                                    <h5 className="text-secondary">Ruc: 12345678952</h5>
                                </div>
                            </div>
                        </div>

                        <div className='col-md-3 col-12' >
                            <div className='d-flex h-100 justify-content-end align-items-center'>
                                <div className="form-group">
                                    <button onClick={this.onEventSignIn} className="btn btn-outline-success" type="button">
                                        <i className="bi bi-box-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-9 col-sm-8 col-12">
                            <div className="form-group">
                                <input className="form-control mr-sm-2 bg-transparent" placeholder="filtar por proyecto o nombre del proyecto" aria-label="Search" />
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-12">
                            <div className="form-group">
                                <button className="w-100 btn btn-outline-success my-2 my-sm-0" type="button" >Filtrar proyecto</button>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {
                            this.state.data.map((item, index) => (
                                <div key={index} className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <div className="card">
                                            <img src={item.imagen === "" ? noImage : `data:image/${item.extensionimagen};base64,${item.imagen}`} alt="" className="card-img-top" />
                                            <div className="card-body m-2">
                                                <h6 className='text-info font-weight-bold'>{item.nombre}</h6>
                                                <h6 className='text-secondary'>{item.ubicacion}</h6>
                                                <button onClick={() => this.onEventIngresar(item)} type="button" className="btn btn-block btn-outline-primary text-info" >
                                                    <i className="bi bi-arrow-right-circle-fill"></i> Ingresar
                                                </button>
                                            </div>
                                            <hr className="m-0" />
                                            <div className="card-body m-2">
                                                <ul className="list-group text-left pt-0">
                                                    <li className="list-group-item border-0 px-0 pt-0"><i className="bi bi-geo-fill"></i> Moneda {item.moneda}({item.simbolo})</li>
                                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Total de lotes {item.lotes.length}</li>
                                                    <li className="list-group-item border-0 px-0"><i className="bi bi-geo-fill"></i> Lotes disponibles {item.lotes.filter(lote => lote.estado === 1).length}</li>
                                                    <li className="list-group-item border-0 px-0"><i className="bi bi-grid-1x2-fill"></i>
                                                        {
                                                            item.estado === 1 ? <span className='text-success'> Estado en Venta</span> : <span className='text-danger'> Estado en Litigio</span>
                                                        }</li>
                                                </ul>
                                                {/* <div className="row pt-3">
                                                    <div className="col-12">
                                                        <div className="progress">
                                                            <div className="progress-bar bg-info w-10" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100">50%</div>
                                                        </div>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
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

const mapDispatchToProps = (dispatch) => {
    return {
        restore: () => dispatch(signOut()),
        project: (idProyecto) => dispatch(selectProject(idProyecto))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Principal);