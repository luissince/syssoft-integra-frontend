import PropTypes from 'prop-types';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../../components/Table';
import Paginacion from '../../../../../../components/Paginacion';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentHeader,
  CustomModalContentOverflow,
  CustomModalContentScroll,
} from '../../../../../../components/CustomModal';
import { SpinnerTable } from '../../../../../../components/Spinner';
import {
  currentDate,
  formatNumberWithZeros,
  formatTime,
  isEmpty,
  keyUpSearch,
  numberFormat,
} from '../../../../../../helper/utils.helper';
import CustomComponent from '../../../../../../model/class/custom-component';
import Button from '../../../../../../components/Button';
import Input from '../../../../../../components/Input';
import { listCotizacion } from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalCotizacion extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      buscar: '',
      lista: [],
      restart: false,
      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',
      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
    };

    this.abortController = new AbortController();
  }

  handleOnOpen = async () => {
    await this.loadInit();
  };

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  handleSearchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  handleSearchFecha = async () => {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(2, '', this.state.fechaInicio, this.state.fechaFinal);
    await this.setStateAsync({ opcion: 1 });
  };

  handlePaginacion = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.handlPaginacion();
  };

  handlPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1, this.state.buscar);
        break;
      case 2:
        this.fillTable(2);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idSucursal: this.props.idSucursal,
      ligado: -1,
      estado: 1,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };
    const response = await listCotizacion(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

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

  handleOnHidden = () => {
    this.setState({ lista: [] });
  };

  handleInputBuscar = (event) => {
    this.setState({ buscar: event.target.value });
  };

  handleFechaInicio = (event) => {
    this.setState(
      {
        fechaInicio: event.target.value,
      },
      () => {
        this.handleSearchFecha();
      },
    );
  };

  handleFechaFinal = (event) => {
    this.setState(
      {
        fechaFinal: event.target.value,
      },
      () => {
        this.handleSearchFecha();
      },
    );
  };

  generateBody = () => {
    const { loading, lista } = this.state;
    const { handleSeleccionar } = this.props;

    if (loading) {
      return (
        <SpinnerTable
          colSpan="9"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="9">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return lista.map((item, index) => {
      const estado = (
        <span
          className={`${item.estado === 1 ? 'text-success' : 'text-danger'}`}
        >
          {item.estado === 1 ? 'ACTIVO' : 'ANULADO'}
        </span>
      );

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </TableCell>
          <TableCell>
            {item.documento}
            <br />
            {item.informacion}
          </TableCell>
          <TableCell>
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </TableCell>
          <TableCell className="text-center">{estado}</TableCell>
          <TableCell className="text-center">
            <span
              className={
                item.ligado == 0
                  ? 'badge badge-secondary'
                  : 'badge badge-success'
              }
            >
              {item.ligado}
            </span>
          </TableCell>
          <TableCell className="text-center">
            {numberFormat(item.total, item.codiso)}{' '}
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-primary btn-sm"
              title="Seleccionar"
              onClick={async () => {
                await this.props.refModal.current.handleOnClose();
                handleSeleccionar(item);
              }}
            >
              <i className="fa fa-plus"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const {
      loading,
      buscar,
      lista,
      totalPaginacion,
      paginacion,
      restart,
      fechaInicio,
      fechaFinal,
    } = this.state;

    const { refModal, isOpen, handleClose } = this.props;

    return (
      <CustomModal
        ref={refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={handleClose}
        contentLabel="Modal de Cotización"
        className={'modal-custom-lg'}
      >
        <CustomModalContentScroll>
          <CustomModalContentHeader contentRef={refModal}>
            Cotizaciones
          </CustomModalContentHeader>

          <CustomModalContentBody className={'p-0'}>
            <CustomModalContentOverflow>
              <div className="p-3">
                <Row>
                  <Column className={'col-md-6 col-12'} formGroup={true}>
                    <Input
                      group={true}
                      label={
                        <>
                          <i className="fa fa-search"></i> Buscar por N° de
                          Cotización o Cliente:
                        </>
                      }
                      placeholder="Buscar..."
                      value={buscar}
                      onChange={this.handleInputBuscar}
                      onKeyUp={(event) =>
                        keyUpSearch(event, () => this.handleSearchText(buscar))
                      }
                      buttonRight={
                        <Button
                          className="btn-outline-secondary"
                          title="Recargar"
                          onClick={this.loadInit}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </Button>
                      }
                    />
                  </Column>

                  <Column formGroup={true}>
                    <Input
                      label={
                        <>
                          <i className="fa fa-calendar"></i> Fecha Inicio:
                        </>
                      }
                      type="date"
                      value={fechaInicio}
                      onChange={this.handleFechaInicio}
                    />
                  </Column>

                  <Column formGroup={true}>
                    <Input
                      label={
                        <>
                          <i className="fa fa-calendar"></i> Fecha Final:
                        </>
                      }
                      type="date"
                      value={fechaFinal}
                      onChange={this.handleFechaFinal}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <TableResponsive>
                      <Table className="table-bordered">
                        <TableHeader>
                          <TableRow>
                            <TableHead width="5%" className="text-center">
                              #
                            </TableHead>
                            <TableHead width="10%">Fecha</TableHead>
                            <TableHead width="15%">Comprobante</TableHead>
                            <TableHead width="15%">Cliente</TableHead>
                            <TableHead width="5%">Estado</TableHead>
                            <TableHead width="5%">Ligado</TableHead>
                            <TableHead width="10%" className="text-center">
                              Total
                            </TableHead>
                            <TableHead width="5%" className="text-center">
                              Seleccionar
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{this.generateBody()}</TableBody>
                      </Table>
                    </TableResponsive>
                  </Column>
                </Row>
              </div>
            </CustomModalContentOverflow>
          </CustomModalContentBody>

          <CustomModalContentFooter className={'footer-cm-table'}>
            <Paginacion
              className="w-100"
              loading={loading}
              data={lista}
              totalPaginacion={totalPaginacion}
              paginacion={paginacion}
              fillTable={this.handlePaginacion}
              restart={restart}
            />
          </CustomModalContentFooter>
        </CustomModalContentScroll>
      </CustomModal>
    );
  }
}

ModalCotizacion.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  idSucursal: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSeleccionar: PropTypes.func.isRequired,
};

export default ModalCotizacion;
