import React, { Component } from 'react';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import {
  alertWarning,
  focusOnFirstInvalidInput,
  handlePasteFloat,
  isNumeric,
  validateNumericInputs
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';

class ModalCantidad extends Component {

  constructor(props) {
    super(props);
    this.state = {
      idProducto: '',
      inventarios: []
    }

    this.refModal = React.createRef();
    this.refContenedor = React.createRef();
  }

  loadDatos = (producto) => {
    this.setState({
      idProducto: producto.idProducto,
      inventarios: producto && producto.inventarios || []
    })
  }

  handleOpenModal = () => {
    focusOnFirstInvalidInput(this.refContenedor)
  }

  handleOnHiddenModal = async () => {
    this.setState({
      producto: null
    })
  }

  handleInputChange = (event, idAlmacen) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      inventarios: prevState.inventarios.map((item) =>
        item.idAlmacen === idAlmacen ? { ...item, cantidad: value } : item,
      ),
    }));
  };

  handleOnSubmit = async () => {
    const { inventarios, idProducto } = this.state;
    const { handleSave } = this.props;

    // Función para validar la cantidad de un inventario
    const isValidInventory = inventario =>
      isNumeric(inventario.cantidad) && Number(inventario.cantidad) > 0;

    // Verificar si todos los inventarios tienen cantidades válidas
    const allValid = inventarios.every(isValidInventory);

    if (!allValid) {
      alertWarning("Venta", "Ingrese la cantidad de cada almacen.", () => {
        validateNumericInputs(this.refContenedor);
      });
      return;
    }

    // Convertir la cantidad de cada inventario a número
    const newInventarios = inventarios.map(inventario => ({
      ...inventario,
      cantidad: Number(inventario.cantidad)
    }));

    // Guardar los inventarios válidos
    handleSave(idProducto, newInventarios);

    // Cerrar el modal
    await this.refModal.current.handleOnClose();
  }

  render() {
    const { producto, inventarios } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOpenModal}
        onHidden={this.handleOnHiddenModal}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Canmbiar cantidad del producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <Row>
              <Column>
                <h5>{producto && producto.nombreProducto}</h5>
              </Column>
            </Row>

            <div
              ref={this.refContenedor}>
              {
                inventarios.map((inventario, index) => {
                  return (
                    <Row key={index}>
                      <Column>
                        <div className="form-group">
                          <label>Ingrese su nueva cantidad del almacen ({inventario.almacen}):</label>
                          <Input
                            placeholder={"0.00"}
                            role={"float"}
                            value={inventario.cantidad}
                            onChange={(event) => this.handleInputChange(event, inventario.idAlmacen)}
                            onPaste={handlePasteFloat}
                          />
                        </div>
                      </Column>
                    </Row>
                  );
                })
              }
            </div>
          </>
        }

        footer={
          <>
            <Button
              type="submit"
              className="btn-primary">
              <i className="fa fa-save"></i> Guardar
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

ModalCantidad.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
}

export default ModalCantidad;