import React, { Component, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  handlePasteFloat,
  isNumeric,
} from '@/helper/utils.helper';
import { VALOR_MONETARIO } from '@/model/types/tipo-tratamiento-producto';
import CustomModal, { CustomModalContentBody, CustomModalContentFooter, CustomModalContentForm, CustomModalContentHeader, CustomModalForm } from '@/components/CustomModal';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalAgregar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titulo: "",
      subTitulo: "",
      cantidad: "",
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
      titulo: "",
      subTitulo: "",
      cantidad: "",
      producto: null,
    });
  };

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleOnSubmit = async () => {
    if (!isNumeric(this.state.cantidad)) {
      alertKit.warning({
        title: "Venta",
        message: "El valor debe ser numérico.",
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (Number(this.state.cantidad) <= 0) {
      alertKit.warning({
        title: "Venta",
        message: "La cantidad no debe ser menor o igual a 0.",
      }, () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (this.state.producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      const existingItem = this.props.detalleVenta.find(
        (item) => item.idProducto === this.state.producto.idProducto,
      );
      if (existingItem) {
        const existingInventario = existingItem.inventarios.some(
          (item) => item.idInventario === this.state.producto.idInventario,
        );
        if (!existingInventario) {
          alertKit.warning({
            title: "Venta",
            message: "Los productos con valor monetario se trabajan con un solo almacen y sin unidades.",
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
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOpenModal}
        onHidden={this.handleOnHiddenModal}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Agregar Producto"
      >
        <CustomModalContentForm onSubmit={this.handleOnSubmit}>
          <CustomModalContentHeader contentRef={this.refModal}>
            Producto
          </CustomModalContentHeader>

          <CustomModalContentBody>
            <h5 className='mb-2'>{titulo}</h5>

            <Input
              autoFocus={true}
              type="text"
              inputMode="decimal"
              // pattern="[0-9]*" 
              enterKeyHint="done"
              label={subTitulo}
              placeholder={'0.00'}
              role={'float'}
              ref={this.refCantidad}
              value={cantidad}
              onChange={this.handleInputCantidad}
              onPaste={handlePasteFloat}
            />
          </CustomModalContentBody>

          <CustomModalContentFooter>
            <Button type="submit" className="btn-primary">
              <i className="fa fa-plus"></i> Agregar
            </Button>
            <Button
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </CustomModalContentFooter>
        </CustomModalContentForm>
      </CustomModal>
    );
  }
}

ModalAgregar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalleVenta: PropTypes.array.isRequired,
  handleAdd: PropTypes.func.isRequired,
};

export default ModalAgregar;
