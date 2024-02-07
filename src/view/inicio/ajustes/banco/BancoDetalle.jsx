import CryptoJS from 'crypto-js';
import {
  rounded,
  numberFormat,
  spinnerLoading,
  isText,
  isEmpty,
  formatTime,
  formatNumberWithZeros,
  getPathNavigation,
} from '../../../../helper/utils.helper';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import { detailtBanco, detailtListBanco } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

class BancoDetalle extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idBanco: '',
      nombre: '',
      cci: '',
      tipoCuenta: '',
      numCuenta: '',
      moneda: '',
      saldo: '',
      codiso: '',

      initial: true,

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
      messageLoading: 'Cargando datos...',
    };

    this.abortControllerView = new AbortController();
    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idBanco = new URLSearchParams(url).get('idBanco');
    if (isText(idBanco)) {
      await this.loadDataId(idBanco);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
    this.abortControllerTable.abort();
  }

  async loadDataId(id) {
    const params = {
      idBanco: id
    }

    const response = await detailtBanco(params, this.abortControllerView.signal);
    if (response instanceof SuccessReponse) {

      const banco = response.data.banco;
      const monto = response.data.monto;

      this.setState({
        idBanco: id,
        nombre: banco.nombre,
        cci: banco.cci,
        tipoCuenta: banco.tipoCuenta === 1 ? "BANCO" : banco.tipoCuenta === 2 ? "TARJETA" : "EFECTIVO",
        numCuenta: banco.numCuenta,
        moneda: banco.moneda,
        codiso: banco.codiso,
        saldo: monto,
        initial: false,
      }, async () => {
        await this.loadingData()
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.props.history.goBack();
    }
  }

  loadingData = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable();
    }
  };

  fillTable = async () => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const data = {
      idBanco: this.state.idBanco,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await detailtListBanco(data, this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),);

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
    }
  };


  async onEventImprimir() {
    const data = {
      idBanco: this.state.idBanco,
      idEmpresa: 'EM0001',
    };

    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'key-report-inmobiliaria',
    ).toString();
    let params = new URLSearchParams({ params: ciphertext });
    window.open('/api/banco/repdetallebanco?' + params, '_blank');
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="6">
            {spinnerLoading(
              'Cargando información de la tabla...',
              true,
            )}
          </td>
        </tr>
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <tr className="text-center">
          <td colSpan="6">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.lista.map((item, index) => (
      <tr key={index}>
        <td>{++index}</td>
        <td>{item.fecha} <br /> {formatTime(item.hora)} </td>
        <td>
          <Link className='btn-link' to={getPathNavigation(item.opcion, item.idComprobante)}>
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </Link>
        </td>
        <td className={`text-left ${item.estado === 1 ? "" : "text-danger"}`}>{item.estado === 1 ? "ACTIVO" : "ANULADO"}</td>
        <td className={`text-right ${item.estado === 0 ? "" : "text-danger"}`}>
          {item.estado === 0 && item.tipo == 2 ? rounded(item.monto) : item.tipo == 2 ? `- ${rounded(item.monto)}` : ''}
        </td>
        <td className={`text-right ${item.estado === 0 ? "" : "text-success"}`}>
          {item.estado === 0 && item.tipo == 1 ? rounded(item.monto) : item.tipo === 1 ? `+ ${rounded(item.monto)}` : ''}
        </td>
      </tr>
    ))

  }

  render() {
    return (
      <ContainerWrapper>
        {this.state.initial && spinnerLoading(this.state.messageLoading)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Banco
                <small className="text-secondary"> detalle</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => this.onEventImprimir()}
              >
                <i className="fa fa-print"></i> Imprimir
              </button>{' '}
              <button type="button" className="btn btn-light">
                <i className="fa fa-plus"></i> Agregar dinero
              </button>{' '}
              <button type="button" className="btn btn-light">
                <i className="fa fa-minus"></i> Disminuir dinero
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <div className="table-responsive">
                <table width="100%">
                  <thead>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Caja / Banco</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.nombre}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Tipo de cuenta</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.tipoCuenta}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Número de cuenta</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.numCuenta}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>CCI:</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.cci}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Moneda</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        {this.state.moneda}
                      </th>
                    </tr>
                    <tr>
                      <th className="table-secondary w-25 p-1 font-weight-normal ">
                        <span>Saldo</span>
                      </th>
                      <th className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                        <strong
                          className={
                            this.state.saldo <= 0
                              ? 'text-danger'
                              : 'text-success'
                          }
                        >
                          {numberFormat(this.state.saldo, this.state.codiso)}
                        </strong>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <div className="table-responsive">
                <table className="table table-light table-striped">
                  <thead>
                    <tr>
                      <th width="5%">#</th>
                      <th width="15%">Fecha</th>
                      <th width="20%">Comprobante</th>
                      <th width="10%">Estado</th>
                      <th width="10%">Salidas</th>
                      <th width="10%">Entradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.generarBody()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <Paginacion
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
        />
      </ContainerWrapper>
    );
  }
}

export default BancoDetalle;
