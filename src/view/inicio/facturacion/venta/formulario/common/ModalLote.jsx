import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isNumeric, rounded } from '../../../../../../helper/utils.helper';
import { VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Button from '../../../../../../components/Button';
import { images } from '../../../../../../helper';
import { SpinnerView } from '../../../../../../components/Spinner';
import { getLotesProducto } from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import Image from '../../../../../../components/Image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../../../components/Table';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '../../../../../../components/Card';
import {
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  ShoppingCart,
} from 'lucide-react';
import ProgressBar from '../../../../../../components/ProgressBar';
import { alertKit } from 'alert-kit';

class ModalLote extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Cargando datos...',
      producto: null,
      lotes: [],
      lotesSeleccionados: [],
      cantidadTotal: 0,
      cantidadRequerida: '',
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refCantidadRequerida = React.createRef();

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

      this.setState(
        {
          lotes: response.data,
          loading: false,
        },
        () => {
          this.refCantidadRequerida.current.focus();
        },
      );
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

  // Manejar cambio en cantidad requerida
  handleCantidadRequeridaChange = (event) => {
    const value = event.target.value;
    this.setState({ cantidadRequerida: value });
  };

  // Agregar cantidad a un lote específico
  handleAgregarCantidadLote = (lote, cantidad) => {
    const { lotesSeleccionados } = this.state;
    const cantidadNum = Number(cantidad);

    const lotesActualizados = [...lotesSeleccionados];
    const existingIndex = lotesActualizados.findIndex(
      (item) => item.idLote === lote.idLote,
    );

    if (existingIndex >= 0) {
      lotesActualizados[existingIndex].cantidadSeleccionada = cantidadNum;
    } else {
      lotesActualizados.push({
        ...lote,
        cantidadSeleccionada: cantidadNum,
      });
    }

    // Filtrar lotes con cantidad > 0
    const lotesFiltrados = lotesActualizados.filter(
      (item) => item.cantidadSeleccionada > 0,
    );

    // Calcular total
    const cantidadTotal = lotesFiltrados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      lotesSeleccionados: lotesFiltrados,
      cantidadTotal,
    });
  };

  // Quitar lote de la selección
  handleQuitarLote = (idLote) => {
    const { lotesSeleccionados } = this.state;
    const lotesActualizados = lotesSeleccionados.filter(
      (item) => item.idLote !== idLote,
    );
    const cantidadTotal = lotesActualizados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      lotesSeleccionados: lotesActualizados,
      cantidadTotal,
    });
  };

  // Auto-completar con lotes disponibles
  handleAutoCompletar = () => {
    const { cantidadRequerida, lotes } = this.state;

    if (!isNumeric(cantidadRequerida) || Number(cantidadRequerida) <= 0) {
      alertKit.warning({
        title: 'Venta',
        message: 'Ingrese una cantidad válida para auto-completar.',
      });
      return;
    }

    let cantidadRestante = Number(cantidadRequerida);
    const nuevosLotesSeleccionados = [];

    // Filtrar lotes disponibles (no vencidos y con cantidad > 0)
    const lotesDisponibles = lotes.filter(
      (lote) => lote.cantidad > 0 && lote.diasRestantes > 0,
    );

    // Llenar automáticamente comenzando por los que vencen primero
    for (const lote of lotesDisponibles) {
      if (cantidadRestante <= 0) break;

      const cantidadAUsar = Math.min(cantidadRestante, lote.cantidad);
      nuevosLotesSeleccionados.push({
        ...lote,
        cantidadSeleccionada: cantidadAUsar,
      });

      cantidadRestante -= cantidadAUsar;
    }

    const cantidadTotal = nuevosLotesSeleccionados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      lotesSeleccionados: nuevosLotesSeleccionados,
      cantidadTotal,
    });

    if (cantidadRestante > 0) {
      alertKit.warning({
        title: 'Venta',
        message: `Solo se pudieron completar ${cantidadTotal} de ${cantidadRequerida} unidades con los lotes disponibles.`,
      });
    }
  };

  determinarEstadoLote = (lote) => {
    if (lote.diasRestantes <= 0) {
      return {
        estado: 'Vencido',
        clase: 'bg-danger text-white',
        icono: 'bi bi-x-circle-fill',
        colorBarra: 'bg-danger',
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
    const { lotesSeleccionados, cantidadTotal } = this.state;

    if (lotesSeleccionados.length === 0) {
      alertKit.warning({
        title: 'Venta',
        message: 'Debe seleccionar al menos un lote para continuar.',
      });
      return;
    }

    if (cantidadTotal <= 0) {
      alertKit.warning({
        title: 'Venta',
        message: 'La cantidad total debe ser mayor a 0.',
      });
      return;
    }

    await this.refModal.current.handleOnClose();
    this.props.handleAdd(
      this.state.producto,
      lotesSeleccionados,
      cantidadTotal,
    );
  };

  generarTablaLotes = () => {
    const { lotes, lotesSeleccionados } = this.state;

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
      const loteSeleccionado = lotesSeleccionados.find(
        (item) => item.idLote === lote.idLote,
      );
      const cantidadSeleccionada = loteSeleccionado
        ? loteSeleccionado.cantidadSeleccionada
        : 0;

      return (
        <TableRow
          key={index}
          className={`${cantidadSeleccionada > 0 ? 'table-primary' : ''} ${
            isDisabled ? 'table-secondary' : ''
          }`}
        >
          <TableCell>
            <div>
              <p className="m-0 p-0">{lote.codigoLote}</p>
              <small className="text-muted">Lote #{index + 1}</small>
            </div>
          </TableCell>

          <TableCell>
            <div className="d-flex align-items-center gap-2">
              <strong>{rounded(lote.cantidad)}</strong>
              <span className="text-muted">
                {this.state.producto?.medida || 'unid'}
              </span>
            </div>
            <ProgressBar
              value={rounded(
                (lote.cantidad / this.state.producto?.cantidad) * 100,
                0,
                'number',
              )}
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
              <div className="d-flex align-items-center gap-2">
                <Input
                  role="float"
                  value={cantidadSeleccionada}
                  onChange={(e) =>
                    this.handleAgregarCantidadLote(lote, e.target.value)
                  }
                  placeholder="0"
                />
                <span className="text-muted small">
                  de {rounded(lote.cantidad)}
                </span>
              </div>
          </TableCell>

          <TableCell className="text-center">
            {cantidadSeleccionada > 0 && (
              <Button
                className="btn-sm btn-outline-danger"
                onClick={() => this.handleQuitarLote(lote.idLote)}
                title="Quitar lote"
              >
                <Minus size={16} />
              </Button>
            )}
          </TableCell>
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
      lotesSeleccionados,
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
                      alt={producto?.nombreProducto || ''}
                      width={120}
                      height={120}
                      className="object-contain mb-2"
                    />
                    <h6 className="mb-1 text-center">
                      {producto?.nombreProducto || ''}
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

            {/* Herramientas de selección */}
            <Row>
              <Column className="col-md-6" formGroup={true}>
                <Input
                  ref={this.refCantidadRequerida}
                  label="Cantidad requerida (opcional)"
                  role="float"
                  value={cantidadRequerida}
                  onChange={this.handleCantidadRequeridaChange}
                  placeholder="Ingrese la cantidad total que necesita"
                />
              </Column>
              <Column className="col-md-6" formGroup={true}>
                <label>Opciones:</label>
                <div className="d-flex align-items-end gap-2">
                  <Button
                    className="btn-info me-2"
                    onClick={this.handleAutoCompletar}
                    disabled={!cantidadRequerida}
                  >
                    <i className="fa fa-magic"></i> Auto-completar
                  </Button>
                  <Button
                    className="btn-secondary"
                    onClick={() =>
                      this.setState({
                        lotesSeleccionados: [],
                        cantidadTotal: 0,
                      })
                    }
                    disabled={lotesSeleccionados.length === 0}
                  >
                    <i className="fa fa-times"></i> Limpiar
                  </Button>
                </div>
              </Column>
            </Row>

            {/* Resumen de selección */}
            {lotesSeleccionados.length > 0 && (
              <Row>
                <Column formGroup={true}>
                  <Card className="border-success">
                    <CardHeader className="bg-success text-white">
                      <CardTitle className="text-base m-0">
                        Resumen de Selección
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{lotesSeleccionados.length}</strong> lotes
                          seleccionados
                        </span>
                        <span>
                          Total: <strong>{cantidadTotal}</strong>{' '}
                          {producto?.medida || 'unid'}
                        </span>
                      </div>
                      <div className="mt-2">
                        {lotesSeleccionados.map((lote, index) => (
                          <small key={index} className="d-block text-muted">
                            {lote.codigoLote}: {lote.cantidadSeleccionada}{' '}
                            {producto?.medida || 'unid'}
                          </small>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Column>
              </Row>
            )}

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
                          Cantidad a usar
                        </TableHead>
                        <TableHead width="8%" className="text-center">
                          Acción
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
              disabled={lotesSeleccionados.length === 0 || loading}
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
