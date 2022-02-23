import React, { useState } from "react";
import "react-pro-sidebar/dist/css/styles.css";
import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
import logoEmpresa2 from '../../../recursos/images/inmobiliarianav2.png';
import sidebarBg from '../../../recursos/images/bg2.jpg';

import { Menu as Main } from '../../layouts/menu/Menu';

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visibility: true
        }
    }

    visibilityChange = (value) => {
        this.setState({ visibility: value });
    }

    render() {
        return (
            <>
                <header >
                    <div className='row pb-3'>
                        <div className="col-lg-12" navbar-scroll="true">
                            <div className='row'>
                                <div className='col-lg-2 col-md-2 col-sm-2 col-xs-12'>
                                    {/* <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                                        <li className="breadcrumb-item text-sm"><a className="opacity-5 text-dark">Pages</a></li>
                                        <li className="breadcrumb-item text-sm text-dark active" aria-current="page">Dashboard</li>
                                    </ol> 
                                    <h6 className="font-weight-bolder mb-0">Dashboard</h6>*/}
                                    <div className="block d-block d-sm-none d-none d-sm-block d-md-none " onClick={this.props.setOpen}  style={{fontSize: '25px'}}>
                                        <i className="bi bi-list"></i>
                                    </div>
                                    <div className="block d-none d-lg-block d-xl-none d-xl-block d-md-block d-lg-none" onClick={this.props.setMinimun}  style={{fontSize: '25px'}}>
                                        <i className="bi bi-list"></i>
                                    </div>

                                </div>
                                <div className='col-lg-10 col-md-10 col-sm-10 col-xs-12'>
                                    <form className="form-inline float-lg-right float-md-left float-sm-left float-xs-left" >
                                        <div className="row">
                                        <div className='col-lg-6 col-md-6 col-sm-6 col-xs-12'>
                                            <input className="form-control  bg-transparent" type="search" placeholder="Search" aria-label="Search" />
                                        </div>
                                        <div className='col-lg-3 col-md-3 col-sm-3 col-xs-12'>
                                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                                        </div>
                                        <div className='col-lg-3 col-md-3 col-sm-3 col-xs-12' role="button">
                                            <i className="bi bi-person-fill"></i>
                                            <span className="d-sm-inline"> Sign In</span>
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
export default Menu;