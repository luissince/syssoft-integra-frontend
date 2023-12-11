import React from 'react';
import axios from 'axios';
import {
    numberFormat,
    spinnerLoading,
} from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { images } from '../../../helper';
import { Bar, Doughnut, Line, Pie, PolarArea } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale } from 'chart.js';


Chart.register(LinearScale, CategoryScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale);

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: this.props.token.userToken.token,

            totales: {},
            sucursales: [],

            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],            
                datasets: [
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(255, 99, 134)',
                        data: [12, 19, 3, 5, 2],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(255, 206, 86)',
                        data: [12, 19, 3, 5, 2],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(55, 162, 235)',
                        data: [12, 19, 3, 5, 2],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                ],
            },

            codiso: '',
            msgLoading: 'Cargando datos...',
            loading: true
        }

        this.options = {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        };


        this.abortControllerView = new AbortController();
    }


    async componentDidMount() {


        setTimeout(() => {
            const data = {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],             
                datasets: [
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(255, 99, 134)',
                        data: [12, 19, 3, 5, 2,50,60],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(255, 206, 86)',
                        data: [12, 19, 3, 5, 2,20,4],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                    {
                        label: 'Ventas mensuales',
                        backgroundColor: 'rgb(55, 162, 235)',
                        data: [12, 19, 3, 5, 2, 70,2],
                        fill: false,
                        borderColor: 'rgb(45, 45, 45)',
                        tension: 0.1,
                    },
                ],
            }
            this.setState({ data })
        }, 5000)
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }



    render() {

        const { data } = this.state;

        return (
            <ContainerWrapper>
                {/* {
                    this.state.loading && spinnerLoading(this.state.msgLoading)
                } */}

                {/* <div className='col-lg-12 col-md-12 mt-8 mb-12'>
                    <div className="container-fluid py-4 ">

                        <div className="row ">
                            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)', display: 'flex', position: 'relative' }}>
                                    <div className="card-header p-3 pt-2 bg-transparent">
                                        <div className="bg-dark position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)', padding: '15px 20px 15px 20px' }}>
                                            <i className="bi bi-boxes"></i>
                                        </div>
                                        <div className="text-right pt-1">
                                            <p className="text-sm mb-0">Total de Categorias</p>
                                            <h4 className="mb-0">{this.state.totales.totalCategorias}</h4>
                                        </div>
                                    </div>                                 
                                </div>
                            </div>
                            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                    <div className="card-header p-3 pt-2 bg-transparent">
                                        <div className="position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', background: '#ec407a', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(233,30,99,.4)', padding: '15px 20px 15px 20px' }}>
                                            <i className="bi bi-bounding-box-circles"></i>
                                        </div>
                                        <div className="text-right pt-1">
                                            <p className="text-sm mb-0">Total de Productos</p>
                                            <h4 className="mb-0">{this.state.totales.totalProductos}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                <div className="card" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                    <div className="card-header p-3 pt-2 bg-transparent">
                                        <div className="position-absolute" style={{ color: 'white', marginTop: -35, borderRadius: 10, display: 'flex', background: '#66bb6a', fontSize: 20, boxShadow: '0 7px 10px -5px rgba(76,175,80,.4)', padding: '15px 20px 15px 20px' }}>
                                            <i className="bi bi-people-fill" style={{ margin: 'auto' }}></i>
                                        </div>
                                        <div className="text-right pt-1">
                                            <p className="text-sm mb-0">Total de clientes</p>
                                            <h4 className="mb-0">{this.state.totales.totalClientes}</h4>
                                        </div>
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
                                            <p className="text-sm mb-0">Ventas mensuales</p>
                                            <h4 className="mb-0">{numberFormat(this.state.totales.totalVentas, this.state.codiso)}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-4">
                            {
                                this.state.sucursales.length === 0 ?
                                    (
                                        <div className="col-lg-12 col-md-12 mt-4 mb-12">
                                            <div className="text-center">
                                                <span>¡No hay sucursales registrados!</span>
                                            </div>
                                        </div>
                                    )
                                    :
                                    (
                                        this.state.sucursales.map((item, index) => {
                                            return (
                                                <div className="col-lg-4 col-md-6 mt-4 mb-4" key={index}>
                                                    <div className={`card z-index-2 border ${item.idSucursal === this.props.token.project.idSucursal ? 'border-primary' : ''}`} style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(64,64,64,.4)' }}>
                                                        <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-light" style={{ borderRadius: 10 }}>
                                                            <div className="shadow-primary py-1 px-1  pe-1" style={{ borderRadius: 10, boxShadow: '0 7px 10px -5px rgba(153,153,153,.4)', border: '1px solid #999' }}>
                                                                <div className="chart">
                                                                    <img src={item.ruta === "" ? images.noImage : "/" + item.ruta} alt="" className="img-fluid rounded" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body">
                                                            <h6 className="mb-0 ">{item.nombre}</h6>
                                                            <p className="text-sm ">{item.ubicacion}</p>
                                                            <hr className="dark horizontal" />
                                                            <div className="d-flex">
                                                                <p className="mb-0 text-sm">Area: {item.area} m²</p>
                                                                <div className="col text-right pr-0">
                                                                    <p className="mb-0 text-sm">
                                                                        {item.estado === 1 ? <span className="badge badge-success">VENTA</span> : <span className="badge badge-danger">LITIGIO</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col text-center mt-2">
                                                                {item.idSucursal === this.props.token.project.idSucursal ? <span className="text-primary fs-1">Actual</span> : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                            }
                        </div>
                    </div>
                </div> */}

                <div className='row'>
                    <div className='col'>
                        <div className='form-group'>
                            <h2>Gráfico de Ventas Mensuales (Línea)</h2>
                            <Bar data={data} options={this.options} />
                        </div>
                    </div>

                    <div className='col'>
                        <div className='form-group'>
                            <h2>Gráfico de Ventas Mensuales (Línea)</h2>
                            <Line data={data} options={this.options} />

                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col'>
                        <div className='form-group'>
                            <h2>Gráfico de Ventas Mensuales (Torta)</h2>
                            <Pie data={data} />
                        </div>
                    </div>

                    <div className='col'>
                        <div className='form-group'>
                            <h2>Gráfico de Ventas Mensuales (Doughnut)</h2>
                            <Doughnut data={data} />
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col'>
                        <div className='form-group'>
                            <h2>Gráfico de Ventas Mensuales (Área)</h2>
                            <PolarArea data={data} />
                        </div>
                    </div>
                </div>
            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(Dashboard);