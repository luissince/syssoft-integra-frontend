import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { alertWarning, handlePasteFloat, isNumeric } from '../../../../../../helper/utils.helper';
import { VALOR_MONETARIO } from '../../../../../../model/types/tipo-tratamiento-producto';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Button from '../../../../../../components/Button';

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
      producto: null
    }

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
  }

  loadDatos = (titulo, subTitulo, producto) => {
    this.setState({
      titulo,
      subTitulo,
      producto
    })
  }

  handleOpenModal = () => {

  }

  handleOnHiddenModal = async () => {
    this.setState({
      titulo: '',
      subTitulo: '',
      cantidad: '',
      producto: null
    })
  }

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value })
  }

  handleOnSubmit = async () => {
    if (!isNumeric(this.state.cantidad)) {
      alertWarning("Venta", "Ingrese el valor solicitado.", () => {
        this.refCantidad.current.focus();
      })
      return;
    }

    if (this.state.producto.idTipoTratamientoProducto === VALOR_MONETARIO) {
      const existingItem = this.props.detalleVenta.find((item) => item.idProducto === this.state.producto.idProducto);
      if (existingItem) {
        const existingInventario = existingItem.inventarios.some(item => item.idInventario === this.state.producto.idInventario);
        if (!existingInventario) {
          alertWarning("Venta", "Los productos con valor monetario se trabajan con un solo almacen y sin unidades.");
          return;
        }
      }
    }

    await this.refModal.current.handleOnClose()
    this.props.handleAdd(this.state.producto, this.state.cantidad);
  }

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
            <Row>
              <Column>
                <h5>{titulo}</h5>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={subTitulo}
                  placeholder={"0.00"}
                  role={"float"}
                  refInput={this.refCantidad}
                  value={cantidad}
                  onChange={this.handleInputCantidad}
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

ModalAgregar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalleVenta: PropTypes.array.isRequired,
  handleAdd: PropTypes.func.isRequired,
}

export default ModalAgregar;