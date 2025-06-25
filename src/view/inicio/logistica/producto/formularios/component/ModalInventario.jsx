import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../../../components/Button';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Select from '../../../../../../components/Select';
import { SpinnerView } from '../../../../../../components/Spinner';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import SuccessReponse from '../../../../../../model/class/response';
import { comboAlmacen } from '../../../../../../network/rest/principal.network';
import { alertWarning, isEmpty } from '../../../../../../helper/utils.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalInventario extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,

      almacenes: [],

      idAlmacen: '',
      cantidad: '',
      cantidadMaxima: '',
      cantidadMinima: ''
    }

    this.refModal = React.createRef();
    this.refIdAlmacen = React.createRef();
    this.refCantidad = React.createRef();
    this.refCantidadMaxima = React.createRef();
    this.refCantidadMinima = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  loadDatos = async () => {
    this.abortController = new AbortController();

    const response = await comboAlmacen(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState({
        almacenes: response.data,
        loading: false
      }, () => {
        this.refIdAlmacen.current.focus();
      });
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
      cantidad: '',
      unidadMedida: '',
      costo: '',

      filtrar: '',
      producto: null,
      productos: [],
      loading: false,
    })

    this.peticion = false;
  }

  handleSelectIdAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value })
  }

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value })
  }

  handleInputCantidadMaxima = (event) => {
    this.setState({ cantidadMaxima: event.target.value })
  }

  handleInputCantidadMinima = (event) => {
    this.setState({ cantidadMinima: event.target.value })
  }

  handleOnSubmit = async () => {
    if (isEmpty(this.state.idAlmacen)) {
      alertWarning('Producto', 'Seleccione el almacen.', () => {
        this.refIdAlmacen.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.cantidad)) {
      alertWarning('Producto', 'Ingrese la cantidad inicial.', () => {
        this.refCantidad.current.focus();
      });
      return;
    }

    if (Number(this.state.cantidad) <= 0) {
      alertWarning(
        'Producto',
        'Su cantidad tiene que se mayor a cero(0).',
        () => {
          this.refCantidad.current.focus();
        },
      );
      return;
    }

    if (isEmpty(this.state.cantidadMaxima)) {
      alertWarning('Producto', 'Ingrese la cantidad máxima.', () => {
        this.refCantidadMaxima.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.cantidadMinima)) {
      alertWarning('Producto', 'Ingrese la cantidad mínima.', () => {
        this.refCantidadMinima.current.focus();
      });
      return;
    }

    if (this.props.inventarios.find((item) => item.idAlmacen === this.state.idAlmacen)) {
      alertWarning('Producto', 'El almacen ya se encuentra agregado.', () => {
        this.refIdAlmacenProducto.current.focus();
      });
      return;
    }

    const item = {
      idAlmacen: this.state.idAlmacen,
      nombreAlmacen: this.refIdAlmacen.current.options[this.refIdAlmacen.current.selectedIndex].innerText,
      cantidad: this.state.cantidad,
      cantidadMaxima: this.state.cantidadMaxima,
      cantidadMinima: this.state.cantidadMinima,
    };

    this.props.handleAddInventario(item, await this.refModal.current.handleOnClose())
  }

  render() {
    const {
      loading,
      almacenes,
      idAlmacen,
      cantidad,
      cantidadMaxima,
      cantidadMinima
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
        contentLabel="Modal de Almacen"
        titleHeader="Seleccione un almacen"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView
              loading={loading}
              message={"Cargando datos..."} />

            <Row>
              <Column formGroup={true}>
                <Select
                  autoFocus={true}
                  label={<>Nombre Almacen: <i className="fa fa-asterisk text-danger small"></i></>}
                  className="form-control"
                  ref={this.refIdAlmacen}
                  value={idAlmacen}
                  onChange={this.handleSelectIdAlmacen}
                >
                  <option value={''}>-- Seleccione --</option>
                  {
                    almacenes.map((item, index) => (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre} / {item.sucursal}
                      </option>
                    ))
                  }
                </Select>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={<>Cantidad Inicial: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="0"
                  role={"float"}
                  ref={this.refCantidad}
                  value={cantidad}
                  onChange={this.handleInputCantidad}
                />
              </Column>

              <Column formGroup={true}>
                <Input
                  label={<>Cantidad Máxima: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="0"
                  role={"float"}
                  ref={this.refCantidadMaxima}
                  value={cantidadMaxima}
                  onChange={this.handleInputCantidadMaxima}
                />
              </Column>

              <Column formGroup={true}>
                <Input
                  label={<>Cantidad Mínima: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="0"
                  role={"float"}
                  ref={this.refCantidadMinima}
                  value={cantidadMinima}
                  onChange={this.handleInputCantidadMinima}
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

ModalInventario.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,

  inventarios: PropTypes.array,

  handleAddInventario: PropTypes.func
};

export default ModalInventario;