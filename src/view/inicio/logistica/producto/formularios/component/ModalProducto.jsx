import React from 'react';
import { isEmpty } from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import Row from '@/components/Row';
import Column from '@/components/Column';
import Input from '@/components/Input';
import { CustomModalForm } from '@/components/CustomModal';
import { filtrarProducto } from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import SearchInput from '@/components/SearchInput';
import CustomComponent from '@/components/CustomComponent';
import Image from '@/components/Image';
import { images } from '@/helper';
import { alertKit } from 'alert-kit';
import Button from '@/components/Button';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ModalProducto extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      cantidad: '',
      unidadMedida: '',
      costo: '',

      producto: null,
      productos: [],
    };

    this.refModal = React.createRef();
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();
    this.refCantidad = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  handleOnOpen = () => { };

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

      producto: null,
      productos: [],
    });

    this.peticion = false;
    this.abortController = null;
  };

  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      producto: null,
    });
  };

  handleFilterProducto = async (value) => {
    const searchWord = value;
    this.setState({ producto: null });

    if (isEmpty(searchWord)) {
      this.setState({ productos: [] });
      return;
    }

    this.abortController = new AbortController();

    const params = {
      filtrar: searchWord,
    };

    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState({
        productos: response.data,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;

      this.setState({
        productos: [],
      });
    }
  };

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);
    this.setState(
      {
        producto: value,
        productos: [],
        unidadMedida: value.unidad,
        costo: value.costo,
      },
      () => {
        this.refCantidad.current.focus();
      },
    );
  };

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleOnSubmit = async () => {
    if (isEmpty(this.state.producto)) {
      alertKit.warning({
        title: "Producto - Combo",
        message: "Seleccione un producto.",
        onClose: () => {
          this.refValueProducto.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.cantidad)) {
      alertKit.warning({
        title: "Producto - Combo",
        message: "Ingrese su cantidad..",
        onClose: () => {
          this.refCantidad.current.focus();
        },
      });
      return;
    }

    if (Number(this.state.cantidad) <= 0) {
      alertKit.warning({
        title: "Producto - Combo",
        message: "Su cantidad tiene que se mayor a cero(0).",
        onClose: () => {
          this.refCantidad.current.focus();
        },
      });
      return;
    }

    if (
      this.props.combos.find(
        (item) => item.idProducto === this.state.producto.idProducto,
      )
    ) {
      alertKit.warning({
        title: "Producto - Combo",
        message: "Ya se encuentra agregado el producto a la lista.",
        onClose: () => {
          this.refValueProducto.current.focus();
        },
      });
      return;
    }

    const item = {
      idProducto: this.state.producto.idProducto,
      nombre: this.state.producto.nombre,
      cantidad: Number(this.state.cantidad),
      costo: Number(this.state.producto.costo),
    };

    this.props.handleAddProducto(
      item,
      await this.refModal.current.handleOnClose(),
    );
  };

  render() {
    const {
      cantidad,
      unidadMedida,
      costo,

      productos,
    } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal de Producto"
        titleHeader="Seleccione un producto"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <Row>
              <Column formGroup={true}>
                <SearchInput
                  ref={this.refProducto}
                  autoFocus={true}
                  label={'Filtrar por el código o nombre del producto:'}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueProducto}
                  data={productos}
                  handleClearInput={this.handleClearInputProducto}
                  handleFilter={this.handleFilterProducto}
                  handleSelectItem={this.handleSelectItemProducto}
                  // renderItem={(value) => (
                  //   <>
                  //     {value.codigo} / {value.nombre}  <small>({value.categoria})</small>
                  //   </>
                  // )}
                  renderItem={(value) => (
                    <div className="d-flex align-items-center">
                      <Image
                        default={images.noImage}
                        src={value.imagen}
                        alt={value.nombre}
                        width={60}
                      />

                      <div className="ml-2">
                        {value.codigo}
                        <br />
                        {value.nombre} <small>({value.categoria})</small>
                      </div>
                    </div>
                  )}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={
                    <>
                      {' '}
                      Cantidad{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  placeholder="0"
                  role={'float'}
                  ref={this.refCantidad}
                  value={cantidad}
                  onChange={this.handleInputCantidad}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={
                    <>
                      {' '}
                      Unidad de Medida{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  disabled
                  value={unidadMedida}
                />
              </Column>
              <Column formGroup={true}>
                <Input
                  label={
                    <>
                      {' '}
                      Costo <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  disabled
                  value={costo}
                />
              </Column>
            </Row>
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

ModalProducto.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,

  combos: PropTypes.array,

  handleAddProducto: PropTypes.func,
};

export default ModalProducto;
