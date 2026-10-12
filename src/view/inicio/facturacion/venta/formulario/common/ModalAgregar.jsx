import React, { Component, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  handlePasteFloat,
  isNumeric,
} from '../../../../../../helper/utils.helper';
import { TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Button from '../../../../../../components/Button';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalAgregar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titulo: '',
      subTitulo: '',
      cantidad: '',
      producto: null,
    };

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
  }

  loadDatos = (titulo, subTitulo, producto) => {
    this.setState({
      titulo,
      subTitulo,
      producto,
    });
  };

  handleOpenModal = () => { };

  handleOnHiddenModal = async () => {
    this.setState({
      titulo: '',
      subTitulo: '',
      cantidad: '',
      producto: null,
    });
  };

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleOnSubmit = async () => {
    if (!isNumeric(this.state.cantidad)) {
      alertKit.warning({
        title: 'Venta',
        message: 'Ingrese el valor solicitado.',
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (Number(this.state.cantidad) <= 0) {
      alertKit.warning({
        title: 'Venta',
        message: 'La cantidad no puede ser menor a 0 o igual a 0.',
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (this.state.producto.idTipoTratamientoProducto === TIPO_TRATAMIENTO_PRODUCTO_VALOR_MONETARIO) {
      const existingItem = this.props.detalleVenta.find(
        (item) => item.idProducto === this.state.producto.idProducto,
      );
      if (existingItem) {
        const existingInventario = existingItem.inventarios.some(
          (item) => item.idInventario === this.state.producto.idInventario,
        );
        if (!existingInventario) {
          alertKit.warning({
            title: 'Venta',
            message: 'Los productos con valor monetario se trabajan con un solo almacen y sin unidades.',
          });
          return;
        }
      }
    }

    await this.refModal.current.handleOnClose();
    this.props.handleAdd(this.state.producto, this.state.cantidad);
  };

  render() {
    const { titulo, subTitulo, cantidad } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOpenModal}
        onHidden={this.handleOnHiddenModal}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Agregar Producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <h5 className='mb-2'>{titulo}</h5>

            <InputCantidad
              ref={this.refCantidad}
              label={subTitulo}
              value={cantidad}
              onChange={this.handleInputCantidad}
              onPaste={handlePasteFloat}
            />
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

const InputCantidad = forwardRef(({ label ,value, onChange, onPaste }, ref) => {
  return (
    <Input
      autoFocus={true}
      type="text"
      inputMode="decimal"
      // pattern="[0-9]*" 
      enterKeyHint="done" 
      label={label}
      placeholder={'0.00'}
      role={'float'}
      ref={ref}
      value={value}
      onChange={onChange}
      onPaste={onPaste}
    />
  );
});


ModalAgregar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalleVenta: PropTypes.array.isRequired,
  handleAdd: PropTypes.func.isRequired,
};

export default ModalAgregar;
