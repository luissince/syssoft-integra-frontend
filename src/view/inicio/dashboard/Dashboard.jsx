import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import { defaults } from "chart.js/auto";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";


const sourceData1 = [
    {
        "label": "ENE",
        "value": 32
    },
    {
        "label": "FEB",
        "value": 45
    },
    {
        "label": "MAR",
        "value": 23
    },
    {
        "label": "ABR",
        "value": 23
    },
    {
        "label": "MAY",
        "value": 23
    },
    {
        "label": "JUN",
        "value": 23
    },
    {
        "label": "JUL",
        "value": 23
    },
    {
        "label": "AGO",
        "value": 23
    },
    {
        "label": "SET",
        "value": 23
    },
    {
        "label": "OCT",
        "value": 23
    },
    {
        "label": "NOV",
        "value": 23
    },
    {
        "label": "DIC",
        "value": 23
    },
]

const sourceData2 = [
    {
        "label": "Ads",
        "value": 32
    },
    {
        "label": "Subscriptions",
        "value": 45
    },
    {
        "label": "Sponsorships",
        "value": 23
    },
    {
        "label": "Sponsorships",
        "value": 23
    },
]

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: this.props.token.userToken.token,

            totales: {},
            sucursales: [],

            dataBar: {
                labels: sourceData1.map((data) => data.label),
                datasets: [
                    {
                        label: new Date().getFullYear(),
                        data: sourceData1.map((data) => data.value),
                        backgroundColor: [
                            "rgba(43, 63, 229, 0.8)",
                            "rgba(250, 192, 19, 0.8)",
                            "rgba(253, 135, 135, 0.8)",
                        ],
                        borderRadius: 1,
                    },
                ],
            },

            dataDoughnut: {
                labels: sourceData2.map((data) => data.label),
                datasets: [
                    {
                        label: "Count",
                        data: sourceData2.map((data) => data.value),
                        backgroundColor: [
                            "rgba(43, 63, 229, 0.8)",
                            "rgba(250, 192, 19, 0.8)",
                            "rgba(253, 135, 135, 0.8)",
                        ],
                        borderColor: [
                            "rgba(43, 63, 229, 0.8)",
                            "rgba(250, 192, 19, 0.8)",
                            "rgba(253, 135, 135, 0.8)",
                        ],
                    },
                ],
            },

            codiso: '',
            msgLoading: 'Cargando datos...',
            loading: true
        }

        this.abortControllerView = new AbortController();
    }


    async componentDidMount() {
    }

    componentWillUnmount() {
        this.abortControllerView.abort();
    }

    render() {

        const { dataBar, dataDoughnut } = this.state;

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
                        <div className="form-group">
                            <h5>
                                Dashboard <small className="text-secondary"> detalle</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col'>
                        <div className="card text-white bg-primary mb-3">
                            <div className="card-body">
                                <h5 className="card-title">0.00</h5>
                                <p className="card-text">VENTAS DEL DÍA</p>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        <div className="card text-white bg-danger mb-3">
                            <div className="card-body">
                                <h5 className="card-title">0.00</h5>
                                <p className="card-text">COMPRAS DEL DÍA</p>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        <div className="card text-white bg-warning mb-3">
                            <div className="card-body">
                                <h5 className="card-title">0</h5>
                                <p className="card-text">CUENTAS POR COBRAR</p>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        <div className="card text-white bg-success mb-3">
                            <div className="card-body">
                                <h5 className="card-title">0</h5>
                                <p className="card-text">CUENTAS POR PAGAR</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-lg-6 col-md-12 col-sm-12 col-12'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-body p-0'>
                                    <div className='p-2' style={{ height: '400px' }}>
                                        <Bar
                                            data={dataBar}
                                            options={{
                                                plugins: {
                                                    title: {
                                                        align: 'center',
                                                        fullSize: false,
                                                        display: true,
                                                        text: "VENTAS POR AÑO",
                                                        color: "#020203",
                                                        font: {
                                                            size: 14
                                                        }
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-lg-6 col-md-12 col-sm-12 col-12'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-body p-0'>
                                    <div className='p-2' style={{ height: '400px' }}>
                                        <Pie
                                            data={dataDoughnut}
                                            options={{
                                                plugins: {
                                                    title: {
                                                        align: 'center',
                                                        fullSize: false,
                                                        display: true,
                                                        text: "INVENTARIO",
                                                        color: "#020203",
                                                        font: {
                                                            size: 14
                                                        }
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-lg-6 col-md-12 col-sm-12 col-12'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-body p-0'>
                                    <div className='p-2' style={{ height: '400px' }}>

                                        {/* <div className='table-responsive'>
                                        <table className='table table-striped border-0'>
                                            <thead className='bg-white'>
                                                <tr>
                                                    <th>Mes</th>
                                                    <th>Venta Sunat</th>
                                                    <th>Venta Libre</th>
                                                    <th>Venta Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Enero</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Febrero</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Marzo</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Abril</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Mayo</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Junio</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Julio</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Agosto</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Setiembre</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Octubre</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Noviembre</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                                <tr>
                                                    <td>Diciembre</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                    <td>0.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div> */}
                                        <Line
                                            data={
                                                {
                                                    labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'],
                                                    datasets: [
                                                        {
                                                            label: 'Venta Sunat',
                                                            data: [0.00, 0.00, 500, 800, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
                                                            borderColor: 'rgba(255, 99, 132, 1)',
                                                            borderWidth: 2,
                                                            fill: false,
                                                        },
                                                        {
                                                            label: 'Venta Libre',
                                                            data: [0.00, 0.00, 300, 200, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
                                                            borderColor: 'rgba(54, 162, 235, 1)',
                                                            borderWidth: 2,
                                                            fill: false,
                                                        },
                                                        {
                                                            label: 'Venta Total',
                                                            data: [0.00, 0.00, 900, 1000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
                                                            borderColor: 'rgba(75, 192, 192, 1)',
                                                            borderWidth: 2,
                                                            fill: false,
                                                        },
                                                    ],
                                                }
                                            }
                                            options={{
                                                scales: {
                                                    x: { stacked: true },
                                                    y: { stacked: true },
                                                },
                                                plugins: {
                                                    title: {
                                                        align: 'center',
                                                        fullSize: false,
                                                        display: true,
                                                        text: "VENTAS POR AÑO",
                                                        color: "#020203",
                                                        font: {
                                                            size: 14
                                                        }
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `Monto: ${context.parsed.y.toFixed(2)}`,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-lg-6 col-md-12 col-sm-12 col-12'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-body p-0'>
                                    <div className='p-2' style={{ height: '400px' }}>
                                        <Doughnut
                                            data={dataDoughnut}
                                            options={{
                                                plugins: {
                                                    title: {
                                                        align: 'center',
                                                        fullSize: false,
                                                        display: true,
                                                        text: "TIPOS DE VENTA",
                                                        color: "#020203",
                                                        font: {
                                                            size: 14
                                                        }
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-title text-center text-dark font-weight-bold text-base pt-2'>Productos más veces vendidos</div>
                                <div className='card-body p-0'>
                                    <div className='table-responsive'>
                                        <table className='table table-striped border-0'>
                                            <thead className='bg-white'>
                                                <tr>
                                                    <th>N°</th>
                                                    <th>Producto</th>
                                                    <th>Categoría/Marca</th>
                                                    <th>Veces</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        <div className='form-group'>
                            <div className='card'>
                                <div className='card-title text-center text-dark font-weight-bold text-base pt-2'>Productos con más cantidades vendidas</div>
                                <div className='card-body p-0'>
                                    <div className='table-responsive'>
                                        <table className='table table-striped border-0'>
                                            <thead className='bg-white'>
                                                <tr>
                                                    <th>N°</th>
                                                    <th>Producto</th>
                                                    <th>Categoría/Marca</th>
                                                    <th>Cantidad</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>
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