import React from 'react';
import FileDownloader from '../../../components/FileDownloader';
// import { apiComprobanteListcombo } from '../../../network/api';
import { spinnerLoading, currentDate, alertWarning } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import printJS from 'print-js';
import { pdfFinanzas } from '../../../helper/lista-pdf.helper';
import { comboSucursal, comboUsuario } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';

class RepFinanciero extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      isFechaActive: false,
      isDetallado: false,

      sucursalCheck: true,

      idUsuario: '',
      usuarios: [],

      sucursales: [],
      usuarioCheck: true,

      idSucursal: this.props.token.project.idSucursal,
    };

    this.refFechaInicio = React.createRef();
    this.refFechaFinal = React.createRef();

    this.refCliente = React.createRef();
    this.refBanco = React.createRef();

    this.refSucursal = React.createRef();
    this.refComprobante = React.createRef();
    this.refUsuario = React.createRef();
    this.refBancoGasto = React.createRef();
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    await this.loadData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadData = async () => {

    const [sucursales, usuarios] = await Promise.all([
      this.fetchComboSucursal(),
      this.fetchComboUsuario(),
    ]);

    this.setState({
      sucursales,
      usuarios,
      loading: false,
    });
  }

  async fetchComboSucursal() {
    const response = await comboSucursal();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboUsuario() {
    const response = await comboUsuario();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async handlePdf() {
    if (this.state.fechaFinal < this.state.fechaInicio) {
      alertWarning("Finanzas", 'La Fecha inicial no puede ser mayor a la fecha final.', () => {
        this.refFechaInicio.current.focus();
      })
      return;
    }

    window.open(pdfFinanzas(this.state.fechaInicio, this.state.fechaFinal, this.state.idSucursal, this.state.idUsuario), '_blank');

    // printJS({
    //   printable: pdfFinanzas(this.state.fechaInicio, this.state.fechaFinal, this.state.idSucursal, this.state.idUsuario),
    //   type: 'pdf',
    //   showModal: true,
    //   modalMessage: "Recuperando documento...",
    //   onPrintDialogClose: () => {
    //     console.log("onPrintDialogClose")
    //   }
    // })
  }

  async onEventExcel() {
    // if (this.state.fechaFinal < this.state.fechaInicio) {
    //   this.setState({
    //     messageWarning: 'La Fecha inicial no puede ser mayor a la fecha final.',
    //   });
    //   this.refFechaInicio.current.focus();
    //   return;
    // }

    // const data = {
    //   idEmpresa: 'EM0001',
    //   fechaInicio: this.state.fechaInicio,
    //   fechaFinal: this.state.fechaFinal,
    //   isDetallado: this.state.isDetallado,
    //   idUsuario: this.state.idUsuario,
    //   idSucursal: this.state.idSucursal,
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();

    // this.refUseFile.current.download({
    //   name: 'Reporte Financiero',
    //   file: '/api/cobro/excelgeneralcobros',
    //   filename: 'financiero.xlsx',
    //   params: ciphertext,
    // });
  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="card my-1">
          <h6 className="card-header">Reporte de Ingreso y Egresos</h6>
          <div className="card-body">

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label className="col-form-label">Filtro por fechas: </label>
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customSwitch1"
                      checked={this.state.isFechaActive}
                      onChange={(event) => {
                        this.setState({
                          isFechaActive: event.target.checked,
                          fechaInicio: currentDate(),
                          fechaFinal: currentDate(),
                        });
                      }}
                    ></input>
                    <label
                      className="custom-control-label"
                      htmlFor="customSwitch1"
                    >
                      {this.state.isFechaActive ? 'Activo' : 'Inactivo'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>
                    Fecha inicial: <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      disabled={!this.state.isFechaActive}
                      ref={this.refFechaInicio}
                      value={this.state.fechaInicio}
                      onChange={(event) => {
                        this.setState({
                          fechaInicio: event.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>
                    Fecha final: <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      disabled={!this.state.isFechaActive}
                      ref={this.refFechaFinal}
                      value={this.state.fechaFinal}
                      onChange={(event) =>
                        this.setState({ fechaFinal: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label className="col-form-label">Detallado: </label>
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customSwitch2"
                      checked={this.state.isDetallado}
                      onChange={(event) => {
                        this.setState({ isDetallado: event.target.checked });
                      }}
                    ></input>
                    <label
                      className="custom-control-label"
                      htmlFor="customSwitch2"
                    >
                      {this.state.isDetallado ? 'Si' : 'No'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>Sucursal</label>
                  <div className="input-group">
                    <select
                      title="Lista de Sucursales"
                      className="form-control"
                      ref={this.refSucursal}
                      value={this.state.idSucursal}
                      disabled={this.state.sucursalCheck}
                      onChange={async (event) => {
                        await this.setStateAsync({
                          idSucursal: event.target.value,
                        });
                        if (this.state.idSucursal === '') {
                          await this.setStateAsync({ sucursalCheck: true });
                        }
                      }}
                    >
                      <option value="">-- Todos --</option>
                      {this.state.sucursales.map((item, index) => (
                        <option key={index} value={item.idSucursal}>
                          {index + 1 + '.- ' + item.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.sucursalCheck}
                            onChange={async (event) => {
                              this.setStateAsync({
                                sucursalCheck: event.target.checked,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label>Usuario(s)</label>
                  <div className="input-group">
                    <select
                      title="Lista de usuarios"
                      className="form-control"
                      ref={this.refUsuario}
                      value={this.state.idUsuario}
                      disabled={this.state.usuarioCheck}
                      onChange={async (event) => {
                        this.setState({
                          idUsuario: event.target.value,
                        });
                      }}
                    >
                      <option value="">-- Todos --</option>
                      {this.state.usuarios.map((item, index) => (
                        <option key={index} value={item.idUsuario}>
                          {item.nombres + ' ' + item.apellidos}
                        </option>
                      ))}
                    </select>
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <div className="form-check form-check-inline m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={this.state.usuarioCheck}
                            onChange={async (event) => {
                              await this.setStateAsync({
                                usuarioCheck: event.target.checked,
                              });
                              if (this.state.usuarioCheck) {
                                await this.setStateAsync({ idUsuario: '' });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col"></div>
              <div className="col">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.handlePdf()}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i> Reporte Pdf
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.onEventExcel()}
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

export default connect(mapStateToProps, null)(RepFinanciero);
