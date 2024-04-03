import React from 'react';
import FileDownloader from '../../../components/FileDownloader';
import { currentDate, isEmpty } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { comboSucursal, comboUsuario, obtenerReporteFinanzaExcel, obtenerReporteFinanzaPdf } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';

class RepFinanciero extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicial: currentDate(),
      fechaFinal: currentDate(),

      idUsuario: '',
      usuarios: [],

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],
    };

    this.refFechaInicio = React.createRef();
    this.refFechaFinal = React.createRef();

    this.refSucursal = React.createRef();
    this.refUsuario = React.createRef();
    this.refUseFile = React.createRef();

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadingData = async () => {
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
    const response = await comboSucursal(
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboUsuario() {
    const response = await comboUsuario(
      this.abortControllerView.signal
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleDateFechaInicial = (event) => {
    this.setState({ fechaInicial: event.target.value, });
  }


  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value })
  }

  handleSelectSucursal = (event) => {
    this.setState({
      idSucursal: event.target.value,
    });
  }

  handleSelectUsuario = (event) => {
    this.setState({
      idUsuario: event.target.value,
    });
  }

  handlePdf = async () => {
    window.open(obtenerReporteFinanzaPdf(
      this.props.token.project.idSucursal,
      this.state.fechaInicial,
      this.state.fechaFinal,
      isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
      isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
    ), '_blank');
  }

  handleExcel = async () => {
    this.refUseFile.current.download({
      name: 'Reporte de Financiero',
      url: obtenerReporteFinanzaExcel(
        this.props.token.project.idSucursal,
        this.state.fechaInicial,
        this.state.fechaFinal,
        isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
        isEmpty(this.state.idUsuario) ? "-" : this.state.idUsuario
      ),
      filename: 'ReporteFinanciero.xlsx',
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Reporte General Financiero'
          subTitle='FILTRAR'
        />

        <div className='border rounded p-3'>
          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>
                  Fecha Inicial: <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    ref={this.refFechaInicio}
                    value={this.state.fechaInicial}
                    onChange={this.handleDateFechaInicial}
                  />
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>
                  Fecha Final: <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    ref={this.refFechaFinal}
                    value={this.state.fechaFinal}
                    onChange={this.handleDateFechaFinal}
                  />
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>Sucursal</label>
                <div className="input-group">
                  <select
                    title="Lista de Sucursales"
                    className="form-control"
                    ref={this.refSucursal}
                    value={this.state.idSucursal}
                    onChange={this.handleSelectSucursal}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.sucursales.map((item, index) => (
                        <option key={index} value={item.idSucursal}>
                          {index + 1 + '. ' + item.nombre}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-lg-6 col-md-6 col-sm-6 col-12"}>
              <div className="form-group">
                <label>Usuario(s)</label>
                <div className="input-group">
                  <select
                    title="Lista de usuarios"
                    className="form-control"
                    ref={this.refUsuario}
                    value={this.state.idUsuario}
                    onChange={this.handleSelectUsuario}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.usuarios.map((item, index) => (
                        <option key={index} value={item.idUsuario}>
                          {item.nombres + ' ' + item.apellidos}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </Column>
          </Row>

          <Row>
            <Column>
              <button
                className="btn btn-outline-warning"
                onClick={this.handlePdf}>
                <i className="bi bi-file-earmark-pdf-fill"></i> Generar Pdf
              </button>
              {" "}
              <button
                className="btn btn-outline-success"
                onClick={this.handleExcel}>
                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
              </button>
            </Column>
          </Row>
        </div>

        <FileDownloader ref={this.refUseFile} />
      </ContainerWrapper >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedRepFinanciero = connect(mapStateToProps, null)(RepFinanciero);

export default ConnectedRepFinanciero;
