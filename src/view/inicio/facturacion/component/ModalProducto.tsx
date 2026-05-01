import Button from '@/components/Button';
import { CustomModalForm } from '@/components/CustomModal';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { SpinnerView } from '@/components/Spinner';
import { handlePasteFloat, isEmpty, isNumeric } from '@/helper/utils.helper';
import ErrorResponse from '@/model/class/error-response';
import SuccessResponse from '@/model/class/response';
import { CANCELED } from '@/constants/requestStatus';
import { comboMedida } from '@/network/rest/principal.network';
import { alertKit } from 'alert-kit';
import React, { Component } from 'react';

interface Props {
  title: string;

  isOpen: boolean;
  onClose: () => void;

  idImpuesto: string;
  impuestos: Array<any>;
  detalles: Array<any>;

  handleSave: (detalles: Array<any>, callback: Function) => void;
}

interface State {
  medidas: Array<any>;
  idProducto: string;
  codigo: string;
  cantidad: number | string;
  precio: number | string;
  descripcion: string;
  imagen: string;
  idMedida: string;
  tipoProducto: string;
  loading: boolean;
}

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProducto extends Component<Props, State> {

  private refModal: React.RefObject<any>;
  private refCantidad: React.RefObject<any>;
  private refPrecio: React.RefObject<any>;
  private refDescripcion: React.RefObject<any>;
  private refMedida: React.RefObject<any>;

  private peticion: boolean;
  private abortController: AbortController;

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      idProducto: '',
      codigo: '',
      cantidad: '',
      precio: '',
      descripcion: '',
      imagen: null,
      idMedida: '',
      tipoProducto: '',

      medidas: [],
    };

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
    this.refPrecio = React.createRef();
    this.refDescripcion = React.createRef();
    this.refMedida = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  loadDatos = async (producto: any) => {
    this.abortController = new AbortController();

    const response = await comboMedida(this.abortController.signal);

    if (response instanceof SuccessResponse) {
      this.peticion = true;
      this.abortController = null;

      const cantidad = isNumeric(producto.cantidad) ? producto.cantidad <= 0 ? 1 : producto.cantidad : 1;

      this.setState({
        medidas: response.data,
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        cantidad: cantidad,
        precio: producto.precio,
        descripcion: producto.nombre,
        imagen: producto.imagen,
        idMedida: producto.idMedida,
        tipoProducto: producto.tipoProducto,
        loading: false,
      }, () => {
        if (producto.tipoProducto === 'SERVICIO') {
          this.refPrecio.current.focus();
          this.refPrecio.current.select();
        } else {
          this.refCantidad.current.focus();
          this.refCantidad.current.select();
        }
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;
    }
  };

  handleOnOpen = () => { };

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState({
      loading: true,
      idProducto: '',
      codigo: '',
      cantidad: '',
      precio: '',
      descripcion: '',
      imagen: null,
      idMedida: '',
      tipoProducto: '',

      medidas: [],
    });

    this.peticion = false;
  };

  handleInputCantidad = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ cantidad: event.target.value });
  };

  handleInputPrecio = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ precio: event.target.value });
  };

  handleInputDescripcion = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectMedida = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ idMedida: event.target.value });
  };

  handleOnSubmit = async () => {
    const {
      idProducto,
      codigo,
      descripcion,
      cantidad,
      imagen,
      tipoProducto,
      precio,
      idMedida,
    } = this.state;

    const { title, detalles, idImpuesto, impuestos } = this.props;

    if (!isNumeric(cantidad)) {
      alertKit.warning({
        title: title,
        message: "Ingrese la cantidad.",
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (Number(cantidad) <= 0) {
      alertKit.warning({
        title: title,
        message: "La cantidad no puede ser menor a cero.",
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (!isNumeric(precio)) {
      alertKit.warning({
        title: title,
        message: "Ingrese el precio.",
      }, () => {
        this.refPrecio.current.focus();
      });
      return;
    }

    if (Number(precio) <= 0) {
      alertKit.warning({
        title: title,
        message: "El precio no puede ser menor a cero.",
      }, () => {
        this.refPrecio.current.focus();
      });
      return;
    }

    if (isEmpty(descripcion)) {
      alertKit.warning({
        title: title,
        message: "Ingrese la descripción del producto.",
      }, () => {
        this.refDescripcion.current.focus();
      });
      return;
    }

    if (isEmpty(idMedida)) {
      alertKit.warning({
        title: title,
        message: "Ingrese la unidad de medida",
      }, () => {
        this.refMedida.current.focus();
      });
      return;
    }

    const nuevoDetalles = detalles.map((item) => ({ ...item }));

    const existeDetalle = nuevoDetalles.find(
      (item) => item.idProducto === idProducto,
    );

    const impuesto = impuestos.find((item) => item.idImpuesto === idImpuesto);

    const medida = this.state.medidas.find((item) => item.idMedida == idMedida);

    if (existeDetalle) {
      if (tipoProducto === 'SERVICIO') {
        existeDetalle.precio = Number(precio);
      } else {
        existeDetalle.cantidad = Number(cantidad);
        existeDetalle.precio = Number(precio);
      }

      existeDetalle.nombre = descripcion;
      existeDetalle.idMedida = medida.idMedida;
      existeDetalle.nombreMedida = medida.nombre;
    } else {
      const data = {
        id: detalles.length + 1,
        idProducto: idProducto,
        codigo: codigo,
        nombre: descripcion,
        cantidad: Number(cantidad),
        precio: Number(precio),
        idMedida: medida.idMedida,
        nombreMedida: medida.nombre,
        imagen: imagen,
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
      };

      nuevoDetalles.push(data);
    }

    this.props.handleSave(
      nuevoDetalles,
      await this.refModal.current.handleOnClose(),
    );
  };

  render() {
    const {
      loading,
      cantidad,
      precio,
      descripcion,
      idMedida,
      tipoProducto
    } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Agregar Producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView
              loading={loading}
              message={"Cargando datos..."}
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full md:w-1/2">
                  <Input
                    label={"Cantidad:"}
                    disabled={tipoProducto === 'SERVICIO'}
                    placeholder={"0.00"}
                    role={"float"}
                    ref={this.refCantidad}
                    value={cantidad}
                    onChange={this.handleInputCantidad}
                    onPaste={handlePasteFloat}
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <Input
                    label={"Precio:"}
                    placeholder={"0.00"}
                    role={"float"}
                    ref={this.refPrecio}
                    value={precio}
                    onChange={this.handleInputPrecio}
                    onPaste={handlePasteFloat}
                  />
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full">
                  <Input
                    label={"Descripción:"}
                    placeholder={"Datos del producto..."}
                    ref={this.refDescripcion}
                    value={descripcion}
                    onChange={this.handleInputDescripcion}
                  />
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full">
                  <Select
                    label={"Unidad de Medida:"}
                    ref={this.refMedida}
                    value={idMedida}
                    onChange={this.handleSelectMedida}
                  >
                    <option value={''}>- Seleccione -</option>
                    {this.state.medidas.map((item, index) => (
                      <option key={index} value={item.idMedida}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </>
        }
        footer={
          <>
            <Button type="submit" className="btn-primary">
              <i className="fa fa-plus"></i> Agregar
            </Button>
            <Button
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </>
        }
      />
    );
  }
}

export default ModalProducto;
