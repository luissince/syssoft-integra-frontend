import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Column from '../../../../../../components/Column';
import Select from '../../../../../../components/Select';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import { alertWarning, handlePasteFloat, isEmpty, isNumeric } from '../../../../../../helper/utils.helper';
import { SpinnerView } from '../../../../../../components/Spinner';
import Button from '../../../../../../components/Button';
import { comboMedida } from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProducto extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      idProducto: '',
      codigo: '',
      cantidad: '',
      costo: '',
      descripcion: '',
      imagen: null,
      idMedida: '',
      tipoProducto: '',

      medidas: []
    }

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
    this.refCosto = React.createRef();
    this.refDescripcion = React.createRef();
    this.refMedida = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  loadDatos = async (producto) => {
    this.abortController = new AbortController();

    const response = await comboMedida(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState({
        medidas: response.data,
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        // cantidad: producto.cantidad ?? 1,
        cantidad: 1,
        costo: producto.costo,
        descripcion: producto.nombre,
        imagen: producto.imagen,
        idMedida: producto.idMedida,
        tipoProducto: producto.tipoProducto,
        loading: false
      }, () => {
        if (producto.tipoProducto === "SERVICIO") {
          this.refCosto.current.focus();
          this.refCosto.current.select();
        } else {
          this.refCantidad.current.focus();
          this.refCantidad.current.select();
        }
      })
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;
    }
  }

  handleOnOpen = () => {

  }

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
      costo: '',
      descripcion: '',
      imagen: null,
      idMedida: '',
      tipoProducto: '',

      medidas: []
    })

    this.peticion = false;
  }

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleInputCosto = (event) => {
    this.setState({ costo: event.target.value });
  };

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectMedida = (event) => {
    this.setState({ idMedida: event.target.value });
  }

  handleOnSubmit = async () => {
    const { idProducto, codigo, descripcion, imagen, cantidad, tipoProducto, costo, idMedida } = this.state;

    const { detalles, idImpuesto, impuestos } = this.props;

    if (!isNumeric(cantidad)) {
      alertWarning('Orden de Compra', 'Ingrese la cantidad.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (parseFloat(cantidad) <= 0) {
      alertWarning('Orden de Compra', 'La cantidad no puede ser menor a cero.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (!isNumeric(costo)) {
      alertWarning('Orden de Compra', 'Ingrese el costo.', () => {
        this.refCosto.current.focus();
      });
      return;
    }

    if (parseFloat(costo) <= 0) {
      alertWarning('Orden de Compra', 'El costo no puede ser menor a cero.', () => {
        this.refCosto.current.focus();
      });
      return;
    }

    if (isEmpty(descripcion)) {
      alertWarning('Orden de Compra', 'Ingrese la descripción del producto.', () => {
        this.refDescripcion.current.focus();
      });
      return;
    }

    if (isEmpty(idMedida)) {
      alertWarning('Orden de Compra', 'Ingrese la unidad de medida', () => {
        this.refMedida.current.focus();
      });
      return;
    }

    const nuevoDetalles = detalles.map(item => ({ ...item }));

    const existeDetalle = nuevoDetalles.find((item) => item.idProducto === idProducto);

    const impuesto = impuestos.find((item) => item.idImpuesto === idImpuesto);

    const medida = this.state.medidas.find((item) => item.idMedida == idMedida);

    if (existeDetalle) {
      if (tipoProducto === "SERVICIO") {
        existeDetalle.costo = Number(costo);
      } else {
        existeDetalle.cantidad = Number(cantidad);
        existeDetalle.costo = Number(costo);
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
        imagen: imagen,
        cantidad: Number(cantidad),
        costo: Number(costo),
        idMedida: medida.idMedida,
        nombreMedida: medida.nombre,
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
      };

      nuevoDetalles.push(data);
    }

    this.props.handleSave(nuevoDetalles, await this.refModal.current.handleOnClose());
  };

  render() {
    const {
      loading,
      cantidad,
      costo,
      descripcion,
      idMedida,
      tipoProducto
    } = this.state;

    const {
      isOpen,
      onClose,
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
              message={"Cargando datos..."} />

            <Row>
              <Column formGroup={true}>
                <Input
                  label={"Cantidad:"}
                  disabled={tipoProducto === "SERVICIO"}
                  placeholder={"0.00"}
                  role={"float"}
                  refInput={this.refCantidad}
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
                  refInput={this.refCosto}
                  value={costo}
                  onChange={this.handleInputCosto}
                  onPaste={handlePasteFloat}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={"Descripción:"}
                  placeholder={"Datos del producto..."}
                  refInput={this.refDescripcion}
                  value={descripcion}
                  onChange={this.handleInputDescripcion}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Select
                  label={"Unidad de Medida:"}
                  refSelect={this.refMedida}
                  value={idMedida}
                  onChange={this.handleSelectMedida}>
                  <option value={""}>- Seleccione -</option>
                  {
                    this.state.medidas.map((item, index) => (
                      <option key={index} value={item.idMedida}>{item.nombre}</option>
                    ))
                  }
                </Select>
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
              type="button"
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
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,

  idImpuesto: PropTypes.string,
  impuestos: PropTypes.array,
  detalles: PropTypes.array,

  handleSave: PropTypes.func
};

export default ModalProducto;
