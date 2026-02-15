import React, { Component } from 'react';
import { formatDate, isEmpty, isNumeric, rounded } from '@/helper/utils.helper';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader
} from '@/components/CustomModal';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { images } from '@/helper';
import { SpinnerView } from '@/components/Spinner';
import Image from '@/components/Image';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@/components/Card';
import {
  Package,
  AlertTriangle,
  XCircle,
  Minus,
  ShoppingCart,
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleAdd: (producto: any, inventarioDetalles: Array<any>, cantidadTotal: number) => void;
}

interface State {
  loading: boolean;
  message: string;
  producto: any;
  inventarioDetalles: Array<{
    idKardex: string;
    idAlmacen: string;
    lote: string;
    fechaVencimiento: string;
    idUbicacion: string;
    ubicacion: string;
    diasRestantes: number;
    cantidad: number;
  }>;
  inventarioDetallesSeleccionados: Array<any>;
  cantidadTotal: number;
  cantidadRequerida: string;
}

class ModalInventarioDetalle extends Component<Props, State> {

  private initial: State;
  private refModal: React.RefObject<CustomModal>;
  private refCantidadRequerida: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      message: "Cargando datos...",
      producto: null,
      inventarioDetalles: [],
      inventarioDetallesSeleccionados: [],
      cantidadTotal: 0,
      cantidadRequerida: "",
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refCantidadRequerida = React.createRef();
  }

  loadDatos = async (producto) => {
    this.setState({
      loading: false,
      message: "Cargando detalles de inventario del producto...",
      producto,
      inventarioDetalles: producto.inventarioDetalles,
    });
  };

  handleOpenModal = () => {

  };

  handleOnHiddenModal = async () => {
    this.setState(this.initial);
  };

  // Manejar cambio en cantidad requerida
  cantidadRequeridaChange = (event) => {
    const value = event.target.value;
    this.setState({ cantidadRequerida: value });
  };

  // Agregar cantidad a un lote específico
  agregarCantidadLote = (inventarioDetalle, cantidad) => {
    const { inventarioDetallesSeleccionados } = this.state;
    const cantidadNum = Math.max(0, Math.min(Number(cantidad), inventarioDetalle.cantidad));

    const inventarioDetallesActualizados = [...inventarioDetallesSeleccionados];
    const existingIndex = inventarioDetallesActualizados.findIndex(
      (item) => item.idKardex === inventarioDetalle.idKardex,
    );

    if (existingIndex >= 0) {
      inventarioDetallesActualizados[existingIndex].cantidadSeleccionada = cantidadNum;
    } else {
      inventarioDetallesActualizados.push({
        ...inventarioDetalle,
        cantidadSeleccionada: cantidadNum,
      });
    }

    // Filtrar detalles de inventario con cantidad > 0
    const inventarioDetallesFiltrados = inventarioDetallesActualizados.filter(
      (item) => item.cantidadSeleccionada > 0,
    );

    // Calcular total
    const cantidadTotal = inventarioDetallesFiltrados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      inventarioDetallesSeleccionados: inventarioDetallesFiltrados,
      cantidadTotal,
    });
  };

  // Quitar detalle de la selección
  quitarLote = (idKardex) => {
    const { inventarioDetallesSeleccionados } = this.state;
    const inventarioDetallesActualizados = inventarioDetallesSeleccionados.filter(
      (item) => item.idKardex !== idKardex,
    );
    const cantidadTotal = inventarioDetallesActualizados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      inventarioDetallesSeleccionados: inventarioDetallesActualizados,
      cantidadTotal,
    });
  };

  // Auto-completar con detalles de inventario disponibles
  manejarAutoCompletar = () => {
    const { cantidadRequerida, inventarioDetalles } = this.state;

    if (!isNumeric(cantidadRequerida) || Number(cantidadRequerida) <= 0) {
      alertKit.warning({
        title: "Venta",
        message: "Ingrese una cantidad válida para auto-completar.",
      });
      return;
    }

    let cantidadRestante = Number(cantidadRequerida);
    const nuevosLotesSeleccionados = [];

    // Filtrar detalles de inventario disponibles (no vencidos y con cantidad > 0)
    const inventarioDetallesDisponibles = inventarioDetalles.filter(
      (invd) => invd.cantidad > 0 && invd.diasRestantes > 0,
    );

    // Llenar automáticamente comenzando por los que vencen primero
    for (const invd of inventarioDetallesDisponibles) {
      if (cantidadRestante <= 0) break;

      const cantidadAUsar = Math.min(cantidadRestante, invd.cantidad);
      nuevosLotesSeleccionados.push({
        ...invd,
        cantidadSeleccionada: cantidadAUsar,
      });

      cantidadRestante -= cantidadAUsar;
    }

    const cantidadTotal = nuevosLotesSeleccionados.reduce(
      (total, item) => total + item.cantidadSeleccionada,
      0,
    );

    this.setState({
      inventarioDetallesSeleccionados: nuevosLotesSeleccionados,
      cantidadTotal,
    });

    if (cantidadRestante > 0) {
      alertKit.warning({
        title: "Venta",
        message: `Solo se pudieron completar ${cantidadTotal} de ${cantidadRequerida} unidades con los detalles de inventario disponibles.`,
      });
    }
  };

  determinarEstadoLote = (invd) => {
    if (invd.diasRestantes <= 0) {
      return {
        estado: "Vencido",
        clase: "bg-danger text-white",
        icono: "bi bi-x-circle-fill",
        colorBarra: "bg-danger",
      };
    } else if (invd.diasRestantes > 0 && invd.diasRestantes <= 30) {
      return {
        estado: "Próximo",
        clase: "bg-warning text-dark",
        icono: "bi bi-clock-fill",
        colorBarra: 'bg-warning',
      };
    } else if (invd.diasRestantes <= 90) {
      return {
        estado: "Vigilar",
        clase: "bg-info text-white",
        icono: "bi bi-eye-fill",
        colorBarra: 'bg-info',
      };
    } else {
      return {
        estado: "Óptimo",
        clase: "bg-success text-white",
        icono: "bi bi-check-circle-fill",
        colorBarra: "bg-success",
      };
    }
  };

  guardarFormulario = async () => {
    const { producto, inventarioDetallesSeleccionados, cantidadTotal } = this.state;

    if (inventarioDetallesSeleccionados.length === 0) {
      alertKit.warning({
        title: "Venta",
        message: "Debe seleccionar al menos un detalle de inventario para continuar.",
      });
      return;
    }

    if (cantidadTotal <= 0) {
      alertKit.warning({
        title: "Venta",
        message: "La cantidad total debe ser mayor a 0.",
      });
      return;
    }

    const inventarioDetalles = inventarioDetallesSeleccionados.map(({ cantidadSeleccionada, ...item }) => ({
      ...item,
      cantidad: cantidadSeleccionada
    }));

    await this.refModal.current.handleOnClose();
    this.props.handleAdd(
      producto,
      inventarioDetalles,
      cantidadTotal,
    );
  };

  generarTablaLotes = () => {
    const { inventarioDetalles, inventarioDetallesSeleccionados } = this.state;

    if (isEmpty(inventarioDetalles) && inventarioDetallesSeleccionados.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="text-center">
            <div className="flex flex-col items-center py-4">
              <Package className="text-muted mb-2" size={48} />
              <span className="text-muted">No hay detalles de inventario disponibles</span>
            </div>
          </td>
        </tr>
      );
    }

    return inventarioDetalles.map((inventarioDetalle, index) => {
      const estadoLote = this.determinarEstadoLote(inventarioDetalle);
      const loteSeleccionado = inventarioDetallesSeleccionados.find(
        (item) => item.idKardex === inventarioDetalle.idKardex
      );
      const cantidadSeleccionada = loteSeleccionado
        ? loteSeleccionado.cantidadSeleccionada
        : 0;

      const progreso = Number(rounded(
        (inventarioDetalle.cantidad / this.state.producto?.cantidad) * 100,
        0,
      ));

      return (
        <tr
          key={inventarioDetalle.idKardex}
          className={`${cantidadSeleccionada > 0 ? 'table-primary' : ''}`}
        >
          <td className="px-4 py-3">
            <div>
              <p>{inventarioDetalle.lote || 'SIN LOTE'}</p>
              <small className="text-muted">
                {
                  inventarioDetalle.lote ? `Lote #${index + 1}` : ''
                }
              </small>
            </div>
          </td>

          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <strong>{rounded(inventarioDetalle.cantidad)}</strong>
              <span className="text-muted">
                {this.state.producto?.medida || 'unid'}
              </span>
            </div>
            {
              inventarioDetalle.lote && (
                <ProgressBar
                  value={progreso}
                  className={cn(
                    estadoLote.colorBarra,
                    "!h-10"
                  )}
                />
              )
            }
          </td>

          <td className="px-4 py-3">
            <div className="flex flex-col">
              {
                inventarioDetalle.lote && (
                  <>
                    <span>
                      Venc: {inventarioDetalle.fechaVencimiento ?
                        formatDate(inventarioDetalle.fechaVencimiento)
                        : '-'}
                    </span>
                    <small
                      className={cn(
                        inventarioDetalle.diasRestantes <= 30 ? "text-danger" :
                          inventarioDetalle.diasRestantes <= 90 ? "text-warning" : "text-muted",
                      )}
                    >
                      {inventarioDetalle.diasRestantes} días restantes
                    </small>
                  </>
                )
              }

            </div>
          </td>

          <td className="text-center px-4 py-3">
            {
              inventarioDetalle.lote && (
                <div
                  className={
                    cn(
                      "badge rounded-pill",
                      "flex items-center justify-center gap-2",
                      estadoLote.clase,
                    )
                  }
                >
                  <i className={estadoLote.icono}></i>
                  <span>{estadoLote.estado}</span>
                </div>
              )
            }
          </td>

          <td className="px-4 py-3">
            <Input
              role="float"
              value={cantidadSeleccionada}
              onChange={(e) =>
                this.agregarCantidadLote(inventarioDetalle, e.target.value)
              }
              placeholder="0"
            />
          </td>

          <td className="px-4 py-3">
            <div className="text-muted small">
              de {rounded(inventarioDetalle.cantidad)}
            </div>
          </td>

          <td className="text-center px-4 py-3">
            {
              cantidadSeleccionada > 0 && (
                <Button
                  className="btn-sm btn-outline-danger"
                  onClick={() => this.quitarLote(inventarioDetalle.idKardex)}
                  title="Quitar lote"
                >
                  <Minus size={16} />
                </Button>
              )
            }
          </td>
        </tr>
      );
    });
  };

  render() {
    const {
      loading,
      message,
      producto,
      inventarioDetalles,
      inventarioDetallesSeleccionados,
      cantidadTotal,
      cantidadRequerida,
    } = this.state;

    const { isOpen, onClose } = this.props;

    const totalInventarioDetalles = inventarioDetalles.length;
    const inventarioDetallesVencidos = inventarioDetalles.filter((inventarioDetalle) => inventarioDetalle.diasRestantes <= 0,).length;
    const inventarioDetallesCriticos = inventarioDetalles.filter((inventarioDetalle) => inventarioDetalle.diasRestantes > 0 && inventarioDetalle.diasRestantes <= 30,).length;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOpenModal}
        onHidden={this.handleOnHiddenModal}
        onClose={onClose}
        contentLabel="Modal Producto - Selección de Lotes"
        titleHeader="Seleccionar Lotes del Producto"
        className="modal-custom-lg h-[80%]">
        <CustomModalContentForm onSubmit={this.guardarFormulario}>
          <CustomModalContentHeader contentRef={this.refModal}>
            Modal Producto - Selección de Lotes
          </CustomModalContentHeader>

          <CustomModalContentBody>
            <SpinnerView loading={loading} message={message} />

            {/* Información del producto */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <div className="w-full md:w-1/4">
                <Card>
                  <CardBody className="flex flex-col justify-center items-center">
                    <div className='w-40 h-40 mb-2 border-none'>
                      <Image
                        default={images.noImage}
                        src={producto?.imagen || null}
                        alt={producto?.nombreProducto || ''}
                        overrideClass="w-full h-full object-contain"
                      />
                    </div>
                    <small className="text-muted">
                      {producto?.codigo || ''}
                    </small>
                    <h6 className="mb-1 text-center">
                      {producto?.nombreProducto || ''}
                    </h6>
                  </CardBody>
                </Card>
              </div>

              <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Total Lotes */}
                  <div className="bg-white border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={20} className="text-blue-500" />
                      <h2 className="text-base font-semibold m-0">Total Lotes</h2>
                    </div>
                    <h4 className="text-blue-500 text-xl font-bold">{totalInventarioDetalles}</h4>
                  </div>

                  {/* Críticos */}
                  <div className="bg-white border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={20} className="text-yellow-500" />
                      <h2 className="text-base font-semibold m-0">Críticos</h2>
                    </div>
                    <h4 className="text-yellow-500 text-xl font-bold">{inventarioDetallesCriticos}</h4>
                  </div>

                  {/* Vencidos */}
                  <div className="bg-white border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={20} className="text-red-500" />
                      <h2 className="text-base font-semibold m-0">Vencidos</h2>
                    </div>
                    <h4 className="text-red-500 text-xl font-bold">{inventarioDetallesVencidos}</h4>
                  </div>

                  {/* Seleccionado */}
                  <div className="bg-white border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart size={20} className="text-green-500" />
                      <h2 className="text-base font-semibold m-0">Seleccionado</h2>
                    </div>
                    <h4 className="text-green-500 text-xl font-bold">{cantidadTotal}</h4>
                  </div>

                </div>
              </div>
            </div>

            {/* Herramientas de selección */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <div className="w-full md:w-1/2">
                <Input
                  ref={this.refCantidadRequerida}
                  label="Cantidad requerida (opcional)"
                  role="float"
                  value={cantidadRequerida}
                  onChange={this.cantidadRequeridaChange}
                  placeholder="Ingrese la cantidad total que necesita"
                />
              </div>

              <div className="w-full md:w-1/2">
                <label>Opciones:</label>
                <div className="flex gap-2">
                  <Button
                    className="btn-info me-2"
                    onClick={this.manejarAutoCompletar}
                    disabled={!cantidadRequerida}
                  >
                    <i className="fa fa-magic"></i> Auto-completar
                  </Button>
                  <Button
                    className="btn-secondary"
                    onClick={() =>
                      this.setState({
                        inventarioDetallesSeleccionados: [],
                        cantidadTotal: 0,
                      })
                    }
                    disabled={inventarioDetallesSeleccionados.length === 0}
                  >
                    <i className="fa fa-times"></i> Limpiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Resumen de selección */}
            {
              inventarioDetallesSeleccionados.length > 0 && (
                <div className="flex flex-col gap-3 mb-3">
                  <Card className="border-success">
                    <CardHeader className="bg-success text-white">
                      <CardTitle className="text-base">
                        Resumen de Selección
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>{inventarioDetallesSeleccionados.length}</strong> detalles de inventario
                          seleccionados
                        </span>
                        <span>
                          Total: <strong>{cantidadTotal}</strong>{' '}
                          {producto?.medida || 'unid'}
                        </span>
                      </div>
                      <div className="mt-2">
                        {inventarioDetallesSeleccionados.map((invd, index) => (
                          <small key={index} className="block text-muted">
                            {invd.lote}: {invd.cantidadSeleccionada} {' '}
                            {producto?.medida || 'unid'}
                          </small>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )
            }

            {/* Tabla de inventario detalles */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                <h6 className="mb-0">Lotes disponibles</h6>
                <small className="text-muted">
                  Ingrese la cantidad en cada lote que desea usar
                </small>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Lote</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Disponible</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Vencimiento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Estado</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Cantidad</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Usar</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {this.generarTablaLotes()}
                  </tbody>
                </table>
              </div>
            </div>
          </CustomModalContentBody>

          <CustomModalContentFooter>
            <Button
              type="submit"
              className="btn-primary"
              disabled={inventarioDetallesSeleccionados.length === 0 || loading}
            >
              <i className="fa fa-plus"></i>
              Agregar al carrito ({cantidadTotal})
            </Button>
            <Button
              className="btn-secondary"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-times"></i> Cancelar
            </Button>
          </CustomModalContentFooter>
        </CustomModalContentForm>
      </CustomModal>
    );
  }
}

export default ModalInventarioDetalle;
