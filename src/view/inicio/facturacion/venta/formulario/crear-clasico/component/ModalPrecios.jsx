import React, { Component } from 'react';
import { CustomModalForm } from '../../../../../../../components/CustomModal';
import Row from '../../../../../../../components/Row';
import {
  alertWarning,
  isNumeric
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import Button from '../../../../../../../components/Button';
import Column from '../../../../../../../components/Column';
import SuccessReponse from '../../../../../../../model/class/response';
import ErrorResponse from '../../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../../model/types/types';
import { obtenerListaPrecioProducto } from '../../../../../../../network/rest/principal.network';
import { SpinnerView } from '../../../../../../../components/Spinner';

class ModalPrecios extends Component {

  constructor(props) {
    super(props);
    this.state = {
      precio: '',
      precios: [],
      loading: true,
      producto: null
    }

    this.peticion = false;
    this.abortController = null;

    this.refModal = React.createRef();

    this.index = -1;
  }

  loadDatos = async (producto) => {
    this.abortController = new AbortController();

    const params = {
      idProducto: producto.idProducto,
    };

    const response = await obtenerListaPrecioProducto(
      params,
      this.abortController.signal
    );

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;
      
      this.setState({
        loading: false,
        precios: response.data,
        producto: producto
      })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;
    }
  }

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState({
      precio: 0,
      producto: null,
      precios: [],
      loading: true,
    });
    this.index = -1;
    this.peticion = false;
  }

  handleOnSubmit = async () => {
    if (!isNumeric(this.state.precio)) {
      alertWarning("Venta", "Seleccione un precio.")
      return;
    }

    this.props.handleSave(this.state.producto, Number(this.state.precio));
    await this.refModal.current.handleOnClose()
  }

  render() {
    const { loading, precios, producto } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Cambiar de precio al producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView
              loading={loading}
              message={"Cargando datos..."}
            />

            <Row>
              <Column>
                <h5>{producto && producto.nombreProducto}</h5>
              </Column>
            </Row>

            <Row>
              <Column>
                <div className="form-group">
                  <label>Lista de Precios:</label>
                  <ul className="list-group">
                    {producto && precios.map((item, index) => (
                      <Button
                        key={index}
                        contentClassName={`list-group-item list-group-item-action ${this.index === index ? "active": ""}`}
                        onClick={() => {
                          this.index = index;
                          this.setState({ precio: parseFloat(item.valor) })
                        }}
                      >
                        {item.nombre} - {item.valor}
                      </Button>
                    ))}
                  </ul>
                </div>
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

ModalPrecios.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
}

export default ModalPrecios;