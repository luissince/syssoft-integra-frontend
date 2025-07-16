import {
  numberFormat,
  isText,
  isEmpty,
  formatTime,
  formatNumberWithZeros,
  getPathNavigation,
} from '../../../../../helper/utils.helper';
import Paginacion from '../../../../../components/Paginacion';
import ContainerWrapper from '../../../../../components/Container';
import { detailBanco, detailListBanco } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Button from '../../../../../components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow, TableTitle } from '../../../../../components/Table';
import { SpinnerTable, SpinnerView } from '../../../../../components/Spinner';

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

    const response = await detailBanco(params, this.abortControllerView.signal);
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

    const response = await detailListBanco(data, this.abortControllerTable.signal);

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
    // const data = {
    //   idBanco: this.state.idBanco,
    //   idEmpresa: 'EM0001',
    // };

    // let ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   'key-report-inmobiliaria',
    // ).toString();
    // let params = new URLSearchParams({ params: ciphertext });
    // window.open('/api/banco/repdetallebanco?' + params, '_blank');
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='6'
          message={'Cargando información de la tabla...'}
        />
      );
    }

    if (isEmpty(this.state.lista)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="6">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.lista.map((item, index) => {
      const estado = item.estado === 1
        ? <span className="badge badge-success">ACTIVO</span>
        : <span className="badge badge-danger">ANULADO</span>;

      return (
        <TableRow key={index}>
          <TableCell>{item.id}</TableCell>
          <TableCell>{item.fecha} <br /> {formatTime(item.hora)} </TableCell>
          <TableCell>
            <Link className='btn-link' to={getPathNavigation(item.tipo, item.idComprobante)}>
              {item.comprobante}
              <br />
              {item.serie}-{formatNumberWithZeros(item.numeracion)}
            </Link>
          </TableCell>
          <TableCell>{estado}</TableCell>
          <TableCell className="text-right">{item.ingreso == 0 ? "" : <span><i className='fa fa-plus text-success'></i> {numberFormat(item.ingreso, item.codiso)}</span>}</TableCell>
          <TableCell className="text-right">{item.egreso == 0 ? "" : <span><i className='fa fa-minus text-danger'></i> {numberFormat(item.egreso, item.codiso)}</span>}</TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView 
          loading={this.state.initial}
          message={this.state.messageLoading}
        />

        <Title
          title='Banco'
          subTitle='DETALLE'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-light"
              onClick={this.onEventImprimir}
            >
              <i className="fa fa-print"></i> Imprimir
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.loadingInit}
            >
              <i className="fa fa-plus"></i>  Agregar dinero
            </Button>
            {' '}
            <Button
              className="btn-light"
              onClick={this.loadingInit}
            >
              <i className="fa fa-minus"></i> Disminuir dinero
            </Button>
          </Column>
        </Row>

        <Row>
          <Column>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Caja / Banco</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.nombre}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Tipo de cuenta</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.tipoCuenta}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Número de cuenta</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.numCuenta}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>CCI:</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.cci}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Moneda</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    {this.state.moneda}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="table-secondary w-25 p-1 font-weight-normal ">
                    <span>Saldo</span>
                  </TableHead>
                  <TableHead className="table-light border-bottom w-75 pl-2 pr-2 pt-1 pb-1 font-weight-normal">
                    <strong
                      className={
                        this.state.saldo <= 0
                          ? 'text-danger'
                          : 'text-success'
                      }
                    >
                      {numberFormat(this.state.saldo, this.state.codiso)}
                    </strong>
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <TableTitle>Detalles</TableTitle>
              <Table className="table table-light table-striped">
                <TableHeader>
                  <TableRow>
                    <TableHead width="5%">#</TableHead>
                    <TableHead width="15%">Fecha</TableHead>
                    <TableHead width="20%">Comprobante</TableHead>
                    <TableHead width="10%">Estado</TableHead>
                    <TableHead width="10%">Ingreso</TableHead>
                    <TableHead width="10%">Egreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generarBody()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

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
