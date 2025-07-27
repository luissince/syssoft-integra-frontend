import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import { SpinnerView } from '../../../../../../components/Spinner';
import {
  guId,
  handlePasteFloat,
  isEmpty,
  isNumeric,
  validateNumericInputs,
} from '../../../../../../helper/utils.helper';
import { images } from '../../../../../../helper';
import Image from '../../../../../../components/Image';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProducto extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Cargando datos...',

      idProducto: '',
      codigo: '',
      nombre: '',
      imagen: null,
      costo: '',
      cantidad: '',
      tipoProducto: '',
      lote: false,

      lotes: [],
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refCantidad = React.createRef();
    this.refCosto = React.createRef();
    this.refLote = React.createRef();
  }

  loadDatos = async (producto, type) => {
    if (type === 'edit') {
      this.setState({
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        cantidad: producto.cantidad,
        costo: producto.costo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        tipoProducto: producto.tipoProducto,
        lote: producto.lote,
        lotes: producto.lotes,
        loading: false,
      });
    } else {
      this.setState({
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        cantidad: 1,
        costo: producto.costo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        tipoProducto: producto.tipoProducto,
        lote: producto.lote === 1 ? true : false,

        loading: false,
      });
    }
  };

  handleOnOpen = () => {
    if (!this.state.lote) {
      this.refCantidad.current.focus();
      this.refCantidad.current.select();
    } else {
      this.refCosto.current.focus();
      this.refCosto.current.select();
    }
  };

  handleOnHidden = () => {
    this.setState(this.initial);
  };

  handleInputCantidad = (event) => {
    this.setState({ cantidad: event.target.value });
  };

  handleInputCosto = (event) => {
    this.setState({ costo: event.target.value });
  };

  handleAddLote = () => {
    const lote = {
      id: guId(),

      cantidad: {
        type: 'number',
        value: '',
      },
      serie: {
        type: 'text',
        value: '',
      },
      fechaVencimiento: {
        type: 'date',
        value: '',
      },
    };
    const lotes = [...this.state.lotes, lote];
    this.setState({
      lotes,
    });
  };

  handleOnSubmit = async () => {
    const { idProducto, codigo, nombre, imagen, cantidad, costo, lote, lotes } =
      this.state;

    const { detalles, idImpuesto, impuestos } = this.props;

    if (!lote && !isNumeric(cantidad)) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'Ingrese la cantidad.',
        },
        () => {
          this.refCantidad.current.focus();
        },
      );
      return;
    }

    if (!lote && parseFloat(cantidad) <= 0) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'La cantidad no puede ser menor a cero.',
        },
        () => {
          this.refCantidad.current.focus();
        },
      );
      return;
    }

    if (lote && isEmpty(lotes)) {
      alertKit.warning({
        title: 'Compra',
        message: 'Debes agregar al menos un lote.',
      });
      return;
    }

    if (
      lote &&
      !isEmpty(lotes.filter((item) => isEmpty(item.cantidad.value)))
    ) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'Hay lotes sin cantidad.',
        },
        () => {
          validateNumericInputs(this.refLote);
        },
      );
      return;
    }

    if (lote && !isEmpty(lotes.filter((item) => isEmpty(item.serie.value)))) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'Hay lotes sin serie.',
        },
        () => {
          validateNumericInputs(this.refLote, 'string');
        },
      );
      return;
    }

    if (
      lote &&
      !isEmpty(lotes.filter((item) => isEmpty(item.fechaVencimiento.value)))
    ) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'Hay lotes sin fecha de vencimiento.',
        },
        () => {
          validateNumericInputs(this.refLote, 'string');
        },
      );
      return;
    }

    if (!isNumeric(costo)) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'Ingrese el costo.',
        },
        () => {
          this.refCosto.current.focus();
        },
      );
      return;
    }

    if (parseFloat(costo) <= 0) {
      alertKit.warning(
        {
          title: 'Compra',
          message: 'El costo no puede ser menor a cero.',
        },
        () => {
          this.refCosto.current.focus();
        },
      );
      return;
    }

    const nuevoDetalles = detalles.map((item) => ({ ...item }));

    const existeDetalle = nuevoDetalles.find(
      (item) => item.idProducto === idProducto,
    );

    const impuesto = impuestos.find((item) => item.idImpuesto === idImpuesto);

    if (existeDetalle) {
      existeDetalle.cantidad = Number(cantidad);
      existeDetalle.lotes = lotes;
      existeDetalle.costo = Number(costo);
    } else {
      const data = {
        id: detalles.length + 1,
        idProducto: idProducto,
        codigo: codigo,
        nombre: nombre,
        imagen: imagen,
        cantidad: lote ? 0 : Number(cantidad),
        costo: Number(costo),
        lote: lote,
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
        lotes: lotes,
      };
      nuevoDetalles.push(data);
    }

    this.props.handleSave(
      nuevoDetalles,
      await this.refModal.current.handleOnClose(),
    );
  };

  render() {
    const {
      loading,
      message,

      nombre,
      imagen,
      cantidad,
      costo,
      lote,
      lotes,
    } = this.state;

    const { isOpen, onClose } = this.props;

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
            <SpinnerView loading={loading} message={message} />

            <Row>
              <Column formGroup={true}>
                <h6>{nombre}</h6>
                <Image
                  default={images.noImage}
                  src={imagen}
                  alt={nombre}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={'Costo:'}
                  placeholder={'0.00'}
                  role={'float'}
                  ref={this.refCosto}
                  value={costo}
                  onChange={this.handleInputCosto}
                  onPaste={handlePasteFloat}
                />
              </Column>

              {!lote && (
                <Column formGroup={true}>
                  <Input
                    autoFocus={true}
                    label={'Cantidad:'}
                    placeholder={'0.00'}
                    role={'float'}
                    ref={this.refCantidad}
                    value={cantidad}
                    onChange={this.handleInputCantidad}
                    onPaste={handlePasteFloat}
                  />
                </Column>
              )}
            </Row>

            {lote ? (
              <>
                <Row>
                  <Column formGroup={true}>
                    <div className="d-flex justify-content-start align-items-center">
                      <h6 className="mr-2">Agregar mas lotes</h6>
                      <Button
                        className={'btn-light'}
                        onClick={this.handleAddLote}
                      >
                        <i className="bi bi-plus-circle"></i>
                      </Button>
                    </div>
                  </Column>
                </Row>

                {lotes.map((item, index) => (
                  <Row key={index} ref={this.refLote}>
                    <Column formGroup={true}>
                      <Input
                        autoFocus={true}
                        label={'Cantidad:'}
                        placeholder={'0.00'}
                        role={'float'}
                        value={item.cantidad.value}
                        onChange={(e) => {
                          const updatedLotes = lotes.map((lote) => {
                            if (lote.id === item.id) {
                              return {
                                ...lote,
                                cantidad: {
                                  ...lote.cantidad,
                                  value: e.target.value,
                                },
                              };
                            }
                            return lote;
                          });
                          this.setState({ lotes: updatedLotes });
                        }}
                        onPaste={handlePasteFloat}
                      />
                    </Column>

                    <Column formGroup={true}>
                      <Input
                        label={'Lote:'}
                        placeholder={'LT-0001'}
                        value={item.serie.value}
                        onChange={(e) => {
                          const updatedLotes = lotes.map((lote) => {
                            if (lote.id === item.id) {
                              return {
                                ...lote,
                                serie: {
                                  ...lote.serie,
                                  value: e.target.value,
                                },
                              };
                            }
                            return lote;
                          });
                          this.setState({ lotes: updatedLotes });
                        }}
                      />
                    </Column>

                    <Column formGroup={true}>
                      <Input
                        type="date"
                        label={'Fecha de Vencimiento:'}
                        value={item.fechaVencimiento.value}
                        onChange={(e) => {
                          const updatedLotes = lotes.map((lote) => {
                            if (lote.id === item.id) {
                              return {
                                ...lote,
                                fechaVencimiento: {
                                  ...lote.fechaVencimiento,
                                  value: e.target.value,
                                },
                              };
                            }
                            return lote;
                          });
                          this.setState({ lotes: updatedLotes });
                        }}
                      />
                    </Column>
                  </Row>
                ))}
              </>
            ) : null}
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
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  idImpuesto: PropTypes.string,
  impuestos: PropTypes.array,
  detalles: PropTypes.array,

  handleSave: PropTypes.func,
};

export default ModalProducto;
