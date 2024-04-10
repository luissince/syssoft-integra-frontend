import React from 'react';
import FileDownloader from '../../../components/FileDownloader';
import { getFirstDayOfTheMonth, getLastDayOfTheMonth, isEmpty } from '../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../components/Container';
import CustomComponent from '../../../model/class/custom-component';
import { SpinnerView } from '../../../components/Spinner';
import Title from '../../../components/Title';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import { comboSucursal, obtenerReporteCpeSunatExcel } from '../../../network/rest/principal.network';
import SuccessReponse from '../../../model/class/response';
import ErrorResponse from '../../../model/class/error-response';
import { CANCELED } from '../../../model/types/types';
import { VENTA } from '../../../model/types/tipo-comprobante';

class RepCpeSunat extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando información...",

      fechaInicial: getFirstDayOfTheMonth(),
      fechaFinal: getLastDayOfTheMonth(),

      idSucursal: this.props.token.project.idSucursal,
      sucursales: [],
    };

    this.refFechaInicial = React.createRef();
    this.refFechaFinal = React.createRef();
    this.refComprobante = React.createRef();
    this.refIdSucursal = React.createRef();
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
    const [sucursales] = await Promise.all([
      this.fetchComboSucursal(VENTA)
    ]);

    this.setState({
      sucursales,
      loading: false
    })
  }

  async fetchComboSucursal() {
    const response = await comboSucursal(
      this.abortControllerView.signal,
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
    this.setState({ fechaInicial: event.target.value });
  }

  handleDateFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value, });
  }

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value, });
  }

  handleExcel = async () => {
    this.refUseFile.current.download({
      name: 'Reporte CPE Sunat',
      url: obtenerReporteCpeSunatExcel(
        this.props.token.project.idSucursal,
        this.state.fechaInicial,
        this.state.fechaFinal,
        isEmpty(this.state.idSucursal) ? "-" : this.state.idSucursal,
      ),
      filename: 'ReporteCPESunat.xlsx',
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
          title='Reporte de Comprobantes Electrónicos'
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
                    ref={this.refFechaInicial}
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
                <label>Sucursal(s):</label>
                <div className="input-group">
                  <select
                    title="Lista de comprobantes"
                    className="form-control"
                    ref={this.refIdSucursal}
                    value={this.state.idSucursal}
                    onChange={this.handleSelectSucursal}>
                    <option value="">-- Todos --</option>
                    {
                      this.state.sucursales.map((item, index) => (
                        <option key={index} value={item.idSucursal}>
                          {index + 1 + '.- ' + item.nombre}
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
                className="btn btn-outline-success"
                onClick={this.handleExcel}
              >
                <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
              </button>
            </Column>
          </Row>
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

const ConnectedRepCpeSunat = connect(mapStateToProps, null)(RepCpeSunat);

export default ConnectedRepCpeSunat;
