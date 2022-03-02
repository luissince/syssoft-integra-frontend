import React from "react";
import "react-pro-sidebar/dist/css/styles.css";
import { connect } from 'react-redux';
import { signOut } from '../../../redux/actions';
import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
import logoEmpresa2 from '../../../recursos/images/inmobiliarianav2.png';
import sidebarBg from '../../../recursos/images/bg2.jpg';

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
                <header style={{ marginBottom: '10px' }}>
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
                                    <form className="form-inline float-lg-right float-md-left float-sm-left float-xs-left" >
                                        <div className="row">
                                            <div className='col-lg-6 col-md-6 col-sm-6 col-xs-12'>
                                                <input className="form-control  bg-transparent" type="search" placeholder="Search" aria-label="Search" />
                                            </div>
                                            <div className='col-lg-3 col-md-3 col-sm-3 col-xs-12'>
                                                <button className="btn btn-outline-success my-2 my-sm-0" type="button">
                                                    Search
                                                </button>
                                            </div>
                                            <div className='col-lg-3 col-md-3 col-sm-3 col-xs-12' >
                                                <button onClick={this.onEventSignIn} className="btn btn-outline-danger my-2 my-sm-0" type="button">
                                                    Sign In
                                                </button>
                                            </div>
                                        </div>

                                    </form>
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