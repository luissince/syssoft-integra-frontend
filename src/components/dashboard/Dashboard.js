import React from 'react';
import logoxd from '../../recursos/images/small-logos/logo-xd.svg';
import logoasana from '../../recursos/images/small-logos/logo-asana.svg';
import logoatlassian from '../../recursos/images/small-logos/logo-atlassian.svg';
import logoinvision from '../../recursos/images/small-logos/logo-invision.svg';
import logojira from '../../recursos/images/small-logos/logo-jira.svg';
import logoslack from '../../recursos/images/small-logos/logo-slack.svg';
import logospotify from '../../recursos/images/small-logos/logo-spotify.svg';
import team1 from '../../recursos/images/team-1.jpg';
import team2 from '../../recursos/images/team-2.jpg';
import team3 from '../../recursos/images/team-3.jpg';
import team4 from '../../recursos/images/team-4.jpg';
import team5 from '../../recursos/images/team-5.jpg';

import Menu from '../layouts/menu/Menu';
import Head from '../layouts/head/Head';
import Footer from '../layouts/footer/Footer';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModal: false,
            visibility: true
        }
        this.menuRef = React.createRef();
    }

    onClickeToogle = () => {

        // this.menuRef.handleToggleSidebar(true)
    }

    setOpen = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleToggleSidebar(this.state.isModal);
        });
    }

    setMinimun = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleCollapsedSidebar(this.state.isModal);
        });
    }

    render() {
        return (
            <>
                <div className='app  toggled'>

                    <Menu ref={this.menuRef} />

                    <main>

                        <Head setOpen={this.setOpen} setMinimun={this.setMinimun} />

                        <div className='col-lg-12 col-md-12 mt-8 mb-12'>
                            <div className="container-fluid py-4 ">
                                <div className="row ">
                                    <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                        <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)', display: 'flex', position: 'relative' }}>
                                            <div className="card-header p-3 pt-2 bg-transparent">
                                                <div className="bg-dark position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)', padding: '15px 20px 15px 20px' }}>
                                                    <i className="bi bi-calendar-week-fill"></i>
                                                </div>
                                                <div className="text-right pt-1">
                                                    <p className="text-sm mb-0 text-capitalize">Today's Money</p>
                                                    <h4 className="mb-0">$53k</h4>
                                                </div>
                                            </div>
                                            <hr className="dark horizontal my-0" />
                                            <div className="card-footer p-3 bg-transparent">
                                                <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+55% </span>than lask week</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                        <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-3 pt-2 bg-transparent">
                                                <div className="position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', background: '#ec407a', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(233,30,99,.4)', padding: '15px 20px 15px 20px' }}>
                                                    <i className="bi bi-person-fill"></i>
                                                </div>
                                                <div className="text-right pt-1">
                                                    <p className="text-sm mb-0 text-capitalize">Today's User</p>
                                                    <h4 className="mb-0">2,300</h4>
                                                </div>
                                            </div>
                                            <hr className="dark horizontal my-0" />
                                            <div className="card-footer p-3 bg-transparent">
                                                <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+3% </span>than lask month</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                        <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-3 pt-2 bg-transparent">
                                                <div className="position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', background: '#66bb6a', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(76,175,80,.4)', padding: '15px 20px 15px 20px' }}>
                                                    <i className="bi bi-person-fill" style={{ margin: 'auto' }}></i>
                                                </div>
                                                <div className="text-right pt-1">
                                                    <p className="text-sm mb-0 text-capitalize">New Clients</p>
                                                    <h4 className="mb-0">3,462</h4>
                                                </div>
                                            </div>
                                            <hr className="dark horizontal my-0" />
                                            <div className="card-footer p-3 bg-transparent">
                                                <p className="mb-0"><span className="text-danger text-sm font-weight-bolder">+2% </span>than lask yesterday</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                        <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-3 pt-2 bg-transparent">
                                                <div className="position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', background: '#49a3f1', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(0,188,212,.4)', padding: '15px 20px 15px 20px' }}>
                                                    <i className="bi bi-clipboard-data-fill"></i>
                                                </div>
                                                <div className="text-right pt-1">
                                                    <p className="text-sm mb-0 text-capitalize">Sales</p>
                                                    <h4 className="mb-0">$103,430</h4>
                                                </div>
                                            </div>
                                            <hr className="dark horizontal my-0" />
                                            <div className="card-footer p-3 bg-transparent">
                                                <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+5% </span>than lask yesterday</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-lg-4 col-md-6 mt-4 mb-4">
                                        <div className="card z-index-2" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent" style={{ borderRadius: 10 }}>
                                                <div className="shadow-primary py-3 pe-1" style={{ backgroundImage: 'linear-gradient(195deg,#ec407a,#d81b60)', borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(233,30,99,.4)' }}>
                                                    <div className="chart">
                                                        <canvas id="chart-bars" className="chart-canvas" height="170"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <h6 className="mb-0 ">Website Views</h6>
                                                <p className="text-sm ">Last Campaign Performance</p>
                                                <hr className="dark horizontal" />
                                                <div className="d-flex ">
                                                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                                                    <p className="mb-0 text-sm"> campaign sent 2 days ago </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 mt-4 mb-4">
                                        <div className="card z-index-2 " style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent" style={{ borderRadius: 10 }}>
                                                <div className="shadow-primary py-3 pe-1" style={{ backgroundImage: 'linear-gradient(195deg,#66bb6a,#43a047)', borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(76,175,80,.4)' }}>
                                                    <div className="chart">
                                                        <canvas id="chart-line" className="chart-canvas" height="170"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <h6 className="mb-0 ">Website Views</h6>
                                                <p className="text-sm ">Last Campaign Performance</p>
                                                <hr className="dark horizontal" />
                                                <div className="d-flex ">
                                                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                                                    <p className="mb-0 text-sm"> campaign sent 2 days ago </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 mt-4 mb-4">
                                        <div className="card z-index-2 " style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent" style={{ borderRadius: 10 }}>
                                                <div className="shadow-primary py-3 pe-1" style={{ backgroundImage: 'linear-gradient(195deg,#42424a,#191919)', borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                                    <div className="chart">
                                                        <canvas id="chart-line-tasks" className="chart-canvas" height="170"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <h6 className="mb-0 ">Website Views</h6>
                                                <p className="text-sm ">Last Campaign Performance</p>
                                                <hr className="dark horizontal" />
                                                <div className="d-flex ">
                                                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                                                    <p className="mb-0 text-sm"> campaign sent 2 days ago </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
                                        <div className="card">
                                            <div className="card-header pb-0 bg-transparent">
                                                <div className="row">
                                                    <div className="col-lg-6 col-7">
                                                        <h6>Projects</h6>
                                                        <p className="text-sm mb-0">
                                                            <i className="bi bi-check text-primary " aria-hidden="true" style={{ fontSize: 20 }}></i>
                                                            <span className="font-weight-bold ms-1">30 done</span> this month
                                                        </p>
                                                    </div>
                                                    <div className="col-lg-6 col-5 my-auto text-right">
                                                        <div className="dropdown">
                                                            <button className="btn btn-secondary dropdown-toggle bg-transparent mr-4" type="button" data-toggle="dropdown" aria-expanded="false" style={{ color: 'black', border: 'none', fontSize: 25 }}>
                                                                <i className="bi bi-list-ul"></i>
                                                            </button>
                                                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                                <a className="dropdown-item" href="#">Action</a>
                                                                <a className="dropdown-item" href="#">Another action</a>
                                                                <a className="dropdown-item" href="#">Something else here</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body px-0 pb-2">
                                                <div className="table-responsive">
                                                    <table className="table align-items-center mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Companies</th>
                                                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Members</th>
                                                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Budget</th>
                                                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Completion</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logoxd} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Material XD Version</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom">
                                                                            <img src={team1} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Romina Hadid">
                                                                            <img src={team2} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Alexander Smith">
                                                                            <img src={team3} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Jessica Doe">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> $14,000 </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">60%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar  w-60" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logoatlassian} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Add Progress Track</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Romina Hadid">
                                                                            <img src={team2} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Jessica Doe">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> $3,000 </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">10%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar bg-gradient-info w-10" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logoslack} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Fix Platform Errors</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Romina Hadid">
                                                                            <img src={team3} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Jessica Doe">
                                                                            <img src={team1} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> Not set </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">100%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar progress-bar bg-success w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logospotify} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Launch our Mobile App</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Ryan Tompson">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Romina Hadid">
                                                                            <img src={team3} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Alexander Smith">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Jessica Doe">
                                                                            <img src={team1} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> $20,500 </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">100%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar bg-success w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logojira} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Add the New Pricing Page</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Ryan Tompson">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> $500 </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">25%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar bg-gradient-info w-25" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="25"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={logoinvision} width="40" />
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">Redesign New Online Shop</h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="avatar-group mt-2">
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Ryan Tompson">
                                                                            <img src={team1} width="40" style={{ borderRadius: "100%", border: "2px solid white" }} />
                                                                        </a>
                                                                        <a className="avatar avatar-xs rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Jessica Doe">
                                                                            <img src={team4} width="40" style={{ borderRadius: "100%", marginLeft: '-20px', border: "2px solid white" }} />
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle text-center text-sm">
                                                                    <span className="text-xs font-weight-bold"> $2,000 </span>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="progress-wrapper w-75 mx-auto">
                                                                        <div className="progress-info">
                                                                            <div className="progress-percentage">
                                                                                <span className="text-xs font-weight-bold">40%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="progress" style={{ height: '5px' }}>
                                                                            <div className="progress-bar w-50" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="40"></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6">
                                        <div className="card h-100">
                                            <div className="card-header pb-0">
                                                <h6>Orders overview</h6>
                                                <p className="text-sm">
                                                    <i className="bi bi-arrow-up" aria-hidden="true" style={{ color: 'green' }}></i>
                                                    <span className="font-weight-bold"> 24%</span> this month
                                                </p>
                                            </div>
                                            <div className="card-body p-3">
                                                <div className="timeline ">
                                                    <div className="timeline-block mb-3">
                                                        <span className="timeline-step">
                                                            <i className="bi bi-bell-fill text-success text-gradient"></i>
                                                        </span>
                                                        <div className="timeline-content">
                                                            <h6 className="text-dark text-sm font-weight-bold mb-0">$2400, Design changes</h6>
                                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">22 DEC 7:20 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="timeline-block mb-3">
                                                        <span className="timeline-step">
                                                            <i className="bi bi-code text-danger text-gradient"></i>
                                                        </span>
                                                        <div className="timeline-content">
                                                            <h6 className="text-dark text-sm font-weight-bold mb-0">New order #1832412</h6>
                                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">21 DEC 11 PM</p>
                                                        </div>
                                                    </div>
                                                    {/* <div className="timeline-block mb-3">
                                        <span className="timeline-step">
                                            <i className="material-icons text-info text-gradient">shopping_cart</i>
                                        </span>
                                        <div className="timeline-content">
                                            <h6 className="text-dark text-sm font-weight-bold mb-0">Server payments for April</h6>
                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">21 DEC 9:34 PM</p>
                                        </div>
                                    </div> */}
                                                    {/* <div className="timeline-block mb-3">
                                        <span className="timeline-step">
                                            <i className="material-icons text-warning text-gradient">credit_card</i>
                                        </span>
                                        <div className="timeline-content">
                                            <h6 className="text-dark text-sm font-weight-bold mb-0">New card added for order #4395133</h6>
                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">20 DEC 2:20 AM</p>
                                        </div>
                                    </div> */}
                                                    {/* <div className="timeline-block mb-3">
                                        <span className="timeline-step">
                                            <i className="material-icons text-primary text-gradient">key</i>
                                        </span>
                                        <div className="timeline-content">
                                            <h6 className="text-dark text-sm font-weight-bold mb-0">Unlock packages for development</h6>
                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">18 DEC 4:54 AM</p>
                                        </div>
                                    </div> */}
                                                    {/* <div className="timeline-block">
                                        <span className="timeline-step">
                                            <i className="material-icons text-dark text-gradient">payments</i>
                                        </span>
                                        <div className="timeline-content">
                                            <h6 className="text-dark text-sm font-weight-bold mb-0">New order #9583120</h6>
                                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">17 DEC</p>
                                        </div>
                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Footer />
                    </main>
                </div>

                {/* <nav className="navbar navbar-main px-0 mx-4" navbar-scroll="true">
                        
                    </nav> */}

            </>
        );
    }
}

export default Dashboard;