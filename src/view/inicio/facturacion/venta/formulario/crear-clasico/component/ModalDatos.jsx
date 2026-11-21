import React, { Component } from 'react';
import CustomModal, { CustomModalContentBody, CustomModalContentFooter, CustomModalContentForm, CustomModalContentHeader, CustomModalForm } from '../../../../../../../components/CustomModal';
import Input from '../../../../../../../components/Input';
import {
  isEmpty,
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Button from '../../../../../../../components/Button';
import { alertKit } from 'alert-kit';

class ModalDatos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      informacion: '',
      producto: null,
    };

    this.refModal = React.createRef();
    this.refInformacion = React.createRef();
  }

  loadDatos = (producto) => {
    this.setState({
      informacion: producto.nombreProducto,
      producto,
    });
  };

  handleOnOpen = () => {
    this.refInformacion.current.select();
  };

  handleOnHidden = async () => {
    this.setState({
      informacion: '',
      producto: null,
    });
  };

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value });
  };

  handleOnSubmit = async () => {
    if (isEmpty(this.state.informacion)) {
      alertKit.warning({
        title: 'Venta',
        message: 'Ingrese la nueva descripción del producto.',
      }, () => {
        this.refInformacion.current.focus();
      });
      return;
    }

    this.props.handleSave(this.state.producto, this.state.informacion);
    await this.refModal.current.handleOnClose();
  };

  render() {
    const { informacion, producto } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Editar descripción Producto"
      >
        <CustomModalContentForm onSubmit={this.handleOnSubmit}>
          <CustomModalContentHeader contentRef={this.refModal}>
            {producto && producto.nombreProducto}
          </CustomModalContentHeader>

          <CustomModalContentBody>
            <Input
              autoFocus={true}
              ref={this.refInformacion}
              label="Ingrese su nueva descripción:"
              placeholder="descripción"
              value={informacion}
              onChange={this.handleInputInformacion}
            />
          </CustomModalContentBody>

          <CustomModalContentFooter>
            <Button type="submit" className="btn-success">
              <i className="fa fa-save"></i> Guardar
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

ModalDatos.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
};

export default ModalDatos;
