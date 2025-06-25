import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import { SpinnerView } from '../../../../../../components/Spinner';
import {
  alertWarning,
  handlePasteFloat,
  isNumeric,
} from '../../../../../../helper/utils.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProducto extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Cargando datos...',

      idProducto: '',
      codigo: '',
      descripcion: '',
      imagen: null,
      cantidad: '',
      costo: '',
      tipoProducto: '',
    }

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
    this.refCosto = React.createRef();
  }

  loadDatos = async (producto) => {
    this.setState({
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      // cantidad: producto.cantidad ?? 1,
      cantidad: 1,
      costo: producto.costo,
      descripcion: producto.nombre,
      imagen: producto.imagen,
      tipoProducto: producto.tipoProducto,
      loading: false
    });
  }

  handleOnOpen = () => {
    this.refCantidad.current.focus();
    this.refCantidad.current.select();
  }

  handleOnHidden = () => {
    this.setState({
      loading: true,
      idProducto: '',
      codigo: '',
      cantidad: '',
      descripcion: '',
      imagen: null,
      tipoProducto: '',
    });
  }

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleInputCosto = (event) => {
    this.setState({ costo: event.target.value });
  };

  handleOnSubmit = async () => {
    const { idProducto, codigo, descripcion, imagen, cantidad, costo, tipoProducto } = this.state

    const { detalles, idImpuesto, impuestos } = this.props;

    if (!isNumeric(cantidad)) {
      alertWarning('Compra', 'Ingrese la cantidad.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (parseFloat(cantidad) <= 0) {
      alertWarning('Compra', 'La cantidad no puede ser menor a cero.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (!isNumeric(costo)) {
      alertWarning('Compra', 'Ingrese el costo.', () => {
        this.refCosto.current.focus();
      });
      return;
    }

    if (parseFloat(costo) <= 0) {
      alertWarning('Compra', 'El costo no puede ser menor a cero.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    const nuevoDetalles = detalles.map(item => ({ ...item }));

    const existeDetalle = nuevoDetalles.find((item) => item.idProducto === idProducto);

    const impuesto = impuestos.find((item) => item.idImpuesto === idImpuesto);

    if (existeDetalle) {
      if (tipoProducto === "SERVICIO") {
        existeDetalle.costo = Number(costo);
      } else {
        existeDetalle.cantidad = Number(cantidad);
        existeDetalle.costo = Number(costo);
      }
      existeDetalle.nombre = descripcion;
    } else {
      const data = {
        id: detalles.length + 1,
        idProducto: idProducto,
        codigo: codigo,
        nombre: descripcion,
        imagen: imagen,
        cantidad: Number(cantidad),
        costo: Number(costo),
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
      };
      nuevoDetalles.push(data);
    }

    this.props.handleSave(nuevoDetalles, await this.refModal.current.handleOnClose());
  }

  render() {
    const {
      loading,
      message,

      cantidad,
      costo
    } = this.state;

    const {
      isOpen,
      onClose
    } = this.props;

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
              message={message}
            />

            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={"Cantidad:"}
                  placeholder={"0.00"}
                  role={"float"}
                  ref={this.refCantidad}
                  value={cantidad}
                  onChange={this.handleInputCantidad}
                  onPaste={handlePasteFloat}
                />
              </Column>

              <Column formGroup={true}>
                <Input
                  label={"Costo:"}
                  placeholder={"0.00"}
                  role={"float"}
                  ref={this.refCosto}
                  value={costo}
                  onChange={this.handleInputCosto}
                  onPaste={handlePasteFloat}
                />
              </Column>
            </Row>
          </>
        }
        footer={
          <>
            <Button
              type="submit"
              className="btn-primary">
              <i className="fa fa-plus"></i> Agregar
            </Button>
            <Button
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}>
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </>
        }
      />
    );
  }
}

ModalProducto.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  idImpuesto: PropTypes.string,
  impuestos: PropTypes.array,
  detalles: PropTypes.array,

  handleSave: PropTypes.func
};

export default ModalProducto;