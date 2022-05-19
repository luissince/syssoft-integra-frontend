import React from "react";
import { connect } from 'react-redux';
import { closeProject } from '../../../redux/actions';

class Menu extends React.Component {

    onEventCloseProject() {
        window.localStorage.removeItem('project');
        this.props.restore();
    }

    render() {
        return (
            <>
                <header className="mb-1">
                    <div className='row'>
                        <div className="col-lg-12" navbar-scroll="true">
                            <div className='row'>
                                <div className='col-lg-3 col-md-3 col-sm-4 col-xs-12'>
                                    <div className='form-group'>
                                        <div className="block d-block">
                                            <button className="btn btn-dark" onClick={this.props.openAndClose} >
                                                <i className="bi bi-list" id="btnMenu"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-9 col-md-9 col-sm-8 col-xs-12'>
                                    <div className="form-inline float-lg-right float-md-right float-sm-right float-xs-left" >
                                        {/* <div className="form-group">
                                            <div className="input-group">
                                                <input className="form-control  bg-transparent" type="search" placeholder="Buscar modulos" aria-label="Search" />
                                                <div className="input-group-append">
                                                    <button className="btn btn-outline-success" type="button">
                                                        <i className="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div> */}

                                        <div className="form-group ml-xl-2 ml-lg-2 ml-md-2 ml-sm-2 ml-0">
                                            <button type="button" onClick={() => this.onEventCloseProject()} className="btn btn-outline-light" >Regresar</button>
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
        restore: () => dispatch(closeProject())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);