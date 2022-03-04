import React from "react";
import { connect } from 'react-redux';
import { signOut } from '../../../redux/actions';

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        console.log(this.props)
    }

    onEventSignIn = async (event) => {
        try {
            await localStorage.removeItem('login');
            this.props.restore();
        } catch (e) {
            this.props.restore();
        }
    }

    render() {
        return (
            <>
                <header className="mb-1">
                    <div className='row'>
                        <div className="col-lg-12" navbar-scroll="true">
                            <div className='row'>
                                <div className='col-lg-2 col-md-2 col-sm-2 col-xs-12'>
                                    <div className='form-group'>
                                        <div className="block d-block d-sm-none d-none d-sm-block d-md-none ">
                                            <button className="btn btn-dark" onClick={this.props.setOpen} >
                                                <i className="bi bi-list"></i>
                                            </button>
                                        </div>
                                        <div className="block d-none d-lg-block d-xl-none d-xl-block d-md-block d-lg-none">
                                            <button className="btn btn-dark" onClick={this.props.setMinimun}>
                                                <i className="bi bi-list"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-10 col-md-10 col-sm-10 col-xs-12'>
                                    <div className="form-inline float-lg-right float-md-right float-sm-right float-xs-left" >
                                        <div className="form-group">
                                            <div className="input-group">
                                                <input className="form-control  bg-transparent" type="search" placeholder="Buscar modulos" aria-label="Search" />
                                                <div className="input-group-append">
                                                    <button className="btn btn-outline-success" type="button">
                                                        <i className="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group ml-xl-2 ml-lg-2 ml-md-2 ml-sm-2 ml-0">
                                            <button onClick={this.onEventSignIn} className="btn btn-outline-danger" type="button">
                                                Regresar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
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
        restore: () => dispatch(signOut())
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Menu);