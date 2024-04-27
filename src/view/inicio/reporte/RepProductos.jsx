import React from 'react';
import CryptoJS from 'crypto-js';
import FileDownloader from '../../../components/FileDownloader';
import { connect } from 'react-redux';
import { spinnerLoading } from '../../../helper/utils.helper';
import ContainerWrapper from '../../../components/Container';

class RepProductos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idSucursal: this.props.token.project.idSucursal,
      nombreSucursal: this.props.token.project.nombre,

      producto: '',
      productoCheck: true,

      loading: true,
      msgLoading: '',

      porSucursal: '0',
      sucursalCkeck: true,
    };
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadData = async () => {
    try {
      await this.setStateAsync({
        loading: false,
      });
    } catch (error) {
      if (error.message !== 'canceled') {
        await this.setStateAsync({
          msgLoading: 'Se produjo un error interno, intente nuevamente.',
        });
      }
    }
  };

  async onEventImprimir() {
    const data = {
      // "idProducto": this.state.idProducto,
      idSucursal: this.state.idSucursal,
      estadoProducto: this.state.producto === '' ? 0 : this.state.producto,
      idEmpresa: 'EM0001',
    };

    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'key-report-inmobiliaria',
    ).toString();
    let params = new URLSearchParams({ params: ciphertext });
    window.open('/api/producto/reptipoProductos?' + params, '_blank');

    //Despliegue
    // window.open("/api/producto/repproductodetalle?idProducto=" + this.state.idProducto + "&idEmpresa=EM0001", "_blank");

    //Desarrollo
    // try {

    //     let result = await axios.get("/api/producto/repproductodetalle", {
    //         responseType: "blob",
    //         params: {
    //             "idProducto": this.state.idProducto,
    //             "idEmpresa": 'EM0001'
    //         }
    //     });

    //     const file = new Blob([result.data], { type: "application/pdf" });
    //     const fileURL = URL.createObjectURL(file);
    //     window.open(fileURL, "_blank");

    // } catch (error) {
    //     console.log(error)
    // }
  }

  async onEventPdfProductoCobrar() {
    const data = {
      idEmpresa: 'EM0001',
      idSucursal: this.state.idSucursal,
      nombreSucursal: this.state.nombreSucursal,
      porSucursal: this.state.porSucursal,
    };
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'key-report-inmobiliaria',
    ).toString();
    let params = new URLSearchParams({ params: ciphertext });
    window.open('/api/producto/replistardeudasproducto?' + params, '_blank');
  }

  async onEventExcelProductoCobrar() {
    const data = {
      idEmpresa: 'EM0001',
      idSucursal: this.state.idSucursal,
      nombreSucursal: this.state.nombreSucursal,
      porSucursal: this.state.porSucursal,
    };
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'key-report-inmobiliaria',
    ).toString();

    this.refUseFile.current.download({
      name: 'Listar de Productos con Deuda',
      file: '/api/producto/exacellistardeudasproducto',
      filename: 'Listar de Productos con Deuda.xlsx',
      params: ciphertext,
    });
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="card my-1">
          <h6 className="card-header">Reporte de Productos</h6>
          <div className="card-body">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  {/* <label>Metodo de pago(s)</label> */}
                  <div className="input-group">
                    <select
                      title="Lista de productos"
                      className="form-control"
                      value={this.state.producto}
                      disabled={this.state.productoCheck}
                      onChange={async (event) => {
                        await this.setStateAsync({
                          producto: event.target.value,
                        });
                        if (this.state.producto === '') {
                          await this.setStateAsync({ productoCheck: true });
                        }
                      }}
                    >
                      <option value="">Todos los Productos</option>
                      <option value="1">PRODUCTOS DISPONIBLES</option>
                      <option value="2">PRODUCTOS RESERVADOS</option>
                      <option value="3">PRODUCTOS VENDIDOS</option>
                      <option value="4">PRODUCTOS INACTIVOS</option>
                    </select>

                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.productoCheck}
                            onChange={async (event) => {
                              await this.setStateAsync({
                                productoCheck: event.target.checked,
                              });
                              if (this.state.productoCheck) {
                                await this.setStateAsync({ producto: '' });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col text-center">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventImprimir()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card my-1">
          <h6 className="card-header">Reporte de Productos por Cobrar</h6>
          <div className="card-body">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>
                    Sucursal<i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <select
                      title="Año"
                      className="form-control"
                      disabled={this.state.sucursalCkeck}
                      value={this.state.porSucursal}
                      onChange={(event) =>
                        this.setState({ porSucursal: event.target.value })
                      }
                    >
                      <option value={'0'}>{'Por sucursal'}</option>
                      <option value={'1'}>{'Todos'}</option>
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.sucursalCkeck}
                            onChange={async (event) =>
                              await this.setStateAsync({
                                sucursalCkeck: event.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col"></div>
            </div>

            <div className="row">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.onEventPdfProductoCobrar()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcelProductoCobrar()}
                >
                  <i className="bi bi-file-earmark-excel-fill"></i> Reporte
                  Excel
                </button>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>

        <FileDownloader ref={this.refUseFile} />
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedRepProductos = connect(mapStateToProps, null)(RepProductos);

export default ConnectedRepProductos;