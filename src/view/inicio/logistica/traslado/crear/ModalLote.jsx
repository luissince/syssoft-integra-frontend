import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  getNumber,
  isEmpty,
  isNumeric,
  rounded,
} from '../../../../../helper/utils.helper';
import { VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import { CustomModalForm } from '../../../../../components/CustomModal';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Input from '../../../../../components/Input';
import Button from '../../../../../components/Button';
import { images } from '../../../../../helper';
import { SpinnerView } from '../../../../../components/Spinner';
import { getLotesProducto } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import Image from '../../../../../components/Image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../components/Table';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '../../../../../components/Card';
import {
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  ShoppingCart,
} from 'lucide-react';
import ProgressBar from '../../../../../components/ProgressBar';
import { alertKit } from 'alert-kit';
import { INCREMENTO } from '@/model/types/forma-ajuste';

class ModalLote extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Cargando datos...',
      producto: null,
      lotes: [],
      cantidadTotal: 0,
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  loadDatos = async (producto) => {
    this.abortController = new AbortController();

    this.setState({
      loading: true,
      message: 'Cargando lotes del producto...',
      producto,
    });

    const response = await getLotesProducto(
      producto.idInventario,
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      const lotes = response.data.map((lote, index) => {
        return {
          ...lote,
          cantidadAjustar: '',
        };
      });

      this.setState({
        lotes: lotes,
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;
      this.setState({
        loading: false,
        message: response.getMessage(),
        lotes: [],
      });
    }
  };

  handleOnHiddenModal = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }
    this.setState(this.initial);
    this.peticion = false;
  };

  // Agregar cantidad a un lote específico
  handleAgregarCantidadLote = (lote, cantidad) => {
    const lotes = this.state.lotes.map((l) => {
      if (l.idLote === lote.idLote) {
        return {
          ...l,
          cantidadAjustar: cantidad,
        };
      }
      return l;
    });

    this.setState({ lotes });
  };

  determinarEstadoLote = (lote) => {
    if (lote.diasRestantes <= 0) {
      return {
        estado: 'Vencido',
        clase: 'bg-dark text-white',
        icono: 'bi bi-x-circle-fill',
        colorBarra: 'bg-dark',
      };
    } else if (lote.diasRestantes > 0 && lote.diasRestantes <= 30) {
      return {
        estado: 'Próximo',
        clase: 'bg-warning text-dark',
        icono: 'bi bi-clock-fill',
        colorBarra: 'bg-warning',
      };
    } else if (lote.diasRestantes <= 90) {
      return {
        estado: 'Vigilar',
        clase: 'bg-info text-white',
        icono: 'bi bi-eye-fill',
        colorBarra: 'bg-info',
      };
    } else {
      return {
        estado: 'Óptimo',
        clase: 'bg-success text-white',
        icono: 'bi bi-check-circle-fill',
        colorBarra: 'bg-success',
      };
    }
  };

  handleOnSubmit = async () => {
    const lotes = this.state.lotes.filter((lote) => {
      if (getNumber(lote.cantidadAjustar) > 0) {
        return {
          ...lote,
        };
      }
    });

    if (isEmpty(lotes)) {
      alertKit.warning({
        title: 'Ajuste',
        message: 'Debe seleccionar al menos un lote para continuar.',
      });
      return;
    }

    await this.refModal.current.handleOnClose();
    this.props.handleAdd(this.state.producto, lotes);
  };

  generarTablaLotes = () => {
    const { lotes } = this.state;

    if (!lotes || lotes.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan="6" className="text-center">
            <div className="d-flex flex-column align-items-center py-4">
              <Package className="text-muted mb-2" size={48} />
              <span className="text-muted">No hay lotes disponibles</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return lotes.map((lote, index) => {
      const estadoLote = this.determinarEstadoLote(lote);

      const cantidad = getNumber(lote.cantidad);

      const isDisabled = cantidad <= 0 || lote.diasRestantes <= 0;

      const accountPorcent = (cantidad / this.state.producto?.cantidad) * 100;

      const diferencia = cantidad - getNumber(lote.cantidadAjustar);

      return (
        <TableRow key={index}>
          <TableCell>
            <div>
              <p className="m-0 p-0">{lote.codigoLote}</p>
              <small className="text-muted">Lote #{index + 1}</small>
            </div>
          </TableCell>

          <TableCell>
            <div className="d-flex align-items-center gap-2">
              <strong>{rounded(cantidad)}</strong>
              <span className="text-muted">
                {this.state.producto?.medida || 'unid'}
              </span>
            </div>
            <ProgressBar
              value={rounded(accountPorcent, 0, 'number')}
              className={estadoLote.colorBarra}
              style={{ height: '4px' }}
            />
          </TableCell>

          <TableCell>
            <div className="d-flex flex-column">
              <span>Venc: {lote.fechaVencimiento}</span>
              <small
                className={`${
                  lote.diasRestantes <= 30
                    ? 'text-danger'
                    : lote.diasRestantes <= 90
                      ? 'text-warning'
                      : 'text-muted'
                }`}
              >
                {lote.diasRestantes} días restantes
              </small>
            </div>
          </TableCell>

          <TableCell className="text-center">
            <span
              className={`badge rounded-pill ${estadoLote.clase} d-flex align-items-center justify-content-center gap-1`}
            >
              <i className={estadoLote.icono}></i>
              {estadoLote.estado}
            </span>
          </TableCell>

          <TableCell>
            {!isDisabled && (
              <Input
                role="float"
                value={lote.cantidadAjustar}
                onChange={(e) =>
                  this.handleAgregarCantidadLote(lote, e.target.value)
                }
                placeholder="0"
              />
            )}
          </TableCell>

          <TableCell className="text-center">{rounded(diferencia)}</TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const {
      loading,
      message,
      producto,
      lotes,
      cantidadTotal,
      cantidadRequerida,
    } = this.state;

    const { isOpen, onClose } = this.props;

    const totalLotes = lotes.length;
    const lotesVencidos = lotes.filter(
      (lote) => lote.diasRestantes <= 0,
    ).length;
    const lotesCriticos = lotes.filter(
      (lote) => lote.diasRestantes > 0 && lote.diasRestantes <= 30,
    ).length;

    const idDisabled =
      lotes.reduce((acum, item) => {
        if (getNumber(item.cantidadAjustar) > 0) {
          return acum + 1;
        }
        return acum;
      }, 0) <= 0;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOpenModal}
        onHidden={this.handleOnHiddenModal}
        onClose={onClose}
        contentLabel="Modal Producto - Selección de Lotes"
        titleHeader="Seleccionar Lotes del Producto"
        className={'modal-custom-lg'}
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView loading={loading} message={message} />

            {/* Información del producto */}
            <Row>
              <Column className="col-md-3" formGroup={true}>
                <Card>
                  <CardBody className="flex flex-col justify-center items-center">
                    <Image
                      default={images.noImage}
                      src={producto?.imagen || null}
                      alt={producto?.nombre || ''}
                      width={120}
                      height={120}
                      className="object-contain mb-2"
                    />
                    <h6 className="mb-1 text-center">
                      {producto?.nombre || ''}
                    </h6>
                    <small className="text-muted">
                      {producto?.codigo || ''}
                    </small>
                  </CardBody>
                </Card>
              </Column>

              <Column className="col-md-9" formGroup={true}>
                <Row>
                  <Column className="col-md-3" formGroup={true}>
                    <Card>
                      <CardHeader className="d-flex align-items-center gap-2">
                        <Package size={20} className="text-info" />
                        <CardTitle className="text-base m-0">
                          Total Lotes
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <h4 className="text-info">{totalLotes}</h4>
                      </CardBody>
                    </Card>
                  </Column>
                  <Column className="col-md-3" formGroup={true}>
                    <Card>
                      <CardHeader className="d-flex align-items-center gap-2">
                        <AlertTriangle size={20} className="text-warning" />
                        <CardTitle className="text-base m-0">
                          Críticos
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <h4 className="text-warning">{lotesCriticos}</h4>
                      </CardBody>
                    </Card>
                  </Column>
                  <Column className="col-md-3" formGroup={true}>
                    <Card>
                      <CardHeader className="d-flex align-items-center gap-2">
                        <XCircle size={20} className="text-danger" />
                        <CardTitle className="text-base m-0">
                          Vencidos
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <h4 className="text-danger">{lotesVencidos}</h4>
                      </CardBody>
                    </Card>
                  </Column>
                  <Column className="col-md-3" formGroup={true}>
                    <Card>
                      <CardHeader className="d-flex align-items-center gap-2">
                        <ShoppingCart size={20} className="text-success" />
                        <CardTitle className="text-base m-0">
                          Seleccionado
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <h4 className="text-success">{cantidadTotal}</h4>
                      </CardBody>
                    </Card>
                  </Column>
                </Row>
              </Column>
            </Row>

            {/* Tabla de lotes */}
            <Row>
              <Column formGroup={true}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Lotes disponibles</h6>
                  <small className="text-muted">
                    Ingrese la cantidad en cada lote que desea usar
                  </small>
                </div>
                <TableResponsive>
                  <Table className="table-bordered table-hover">
                    <TableHeader className="thead-light">
                      <TableRow>
                        <TableHead width="20%">Lote</TableHead>
                        <TableHead width="15%">Disponible</TableHead>
                        <TableHead width="20%">Vencimiento</TableHead>
                        <TableHead width="12%" className="text-center">
                          Estado
                        </TableHead>
                        <TableHead width="20%" className="text-center">
                          Cantidad Ajustar
                        </TableHead>
                        <TableHead width="10%" className="text-center">
                          Diferencia
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{this.generarTablaLotes()}</TableBody>
                  </Table>
                </TableResponsive>
              </Column>
            </Row>
          </>
        }
        footer={
          <>
            <Button
              type="submit"
              className="btn-primary"
              disabled={idDisabled || loading}
            >
              <i className="fa fa-plus"></i> Agregar al carrito ({cantidadTotal}
              )
            </Button>
            <Button
              className="btn-secondary"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-times"></i> Cancelar
            </Button>
          </>
        }
      />
    );
  }
}

ModalLote.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired,
};

export default ModalLote;
