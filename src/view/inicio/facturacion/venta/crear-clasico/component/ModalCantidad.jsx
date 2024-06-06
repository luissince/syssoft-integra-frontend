import React, { Component } from 'react';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import {
  alertWarning,
  handlePasteFloat,
  isNumeric
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';

class ModalCantidad extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cantidad: '',
      producto: null
    }

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
  }

  loadDatos = (producto) => {
    this.setState({
      producto
    })
  }

  handleOpenModal = () => {

  }

  handleOnHiddenModal = async () => {
    this.setState({
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

    this.props.handleSave(this.state.producto, this.state.cantidad);
    await this.refModal.current.handleOnClose()
  }

  render() {
    const {  cantidad, producto } = this.state;

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

            <Row>
              <Column>
                <div className="form-group">
                  <label>Ingrese su nueva cantidad:</label>
                  <Input
                    autoFocus={true}
                    placeholder={"0.00"}
                    role={"float"}
                    refInput={this.refCantidad}
                    value={cantidad}
                    onChange={this.handleInputCantidad}
                    onPaste={handlePasteFloat}
                  />
                </div>
              </Column>
            </Row>
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