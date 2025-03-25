import React, { Component } from 'react';
import { CustomModalForm } from '../../../../../../../components/CustomModal';
import Input from '../../../../../../../components/Input';
import Row from '../../../../../../../components/Row';
import {
  alertWarning,
  isEmpty,
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Button from '../../../../../../../components/Button';
import Column from '../../../../../../../components/Column';

class ModalDatos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      informacion: '',
      producto: null
    }

    this.refModal = React.createRef();
    this.refInformacion = React.createRef();
  }

  loadDatos = (producto) => {
    this.setState({
      informacion: producto.nombreProducto,
      producto
    })
  }

  handleOnOpen = () => {
    this.refInformacion.current.select();
  }

  handleOnHidden = async () => {
    this.setState({
      informacion: '',
      producto: null
    })
  }

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value })
  }

  handleOnSubmit = async () => {
    if (isEmpty(this.state.informacion)) {
      alertWarning("Venta", "Ingrese la nueva descripción del producto.", () => {
        this.refInformacion.current.focus();
      })
      return;
    }

    this.props.handleSave(this.state.producto, this.state.informacion);
    await this.refModal.current.handleOnClose()
  }

  render() {
    const { informacion, producto } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Editar descripción Producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <Row>
              <Column>
                <h5>{producto && producto.nombreProducto}</h5>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={"Ingrese su nueva descripción:"}
                  placeholder={"descripción"}
                  refInput={this.refInformacion}
                  value={informacion}
                  onChange={this.handleInputInformacion}
                />
              </Column>
            </Row>
          </>
        }

        footer={
          <>
            <Button
              type="submit"
              className="btn-success">
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

ModalDatos.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
}

export default ModalDatos;