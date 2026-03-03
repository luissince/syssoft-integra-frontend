import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/Button';
import CustomModal,
{
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader
} from '@/components/CustomModal';
import Input from '@/components/Input';
import { SpinnerView } from '@/components/Spinner';
import {
  guId,
  handlePasteFloat,
  handlePasteInteger,
  isEmpty,
  isNumeric,
  validateNumericInputs,
} from '@/helper/utils.helper';
import { images } from '@/helper';
import Image from '@/components/Image';
import { alertKit } from 'alert-kit';
import { comboUbicacion } from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import Select from '@/components/Select';
import { cn } from '@/lib/utils';
import { ACTIVO } from '@/model/types/tipo-producto';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProducto extends Component {

  /**
   * 
   * @param {*} props 
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: "Cargando datos...",

      idProducto: "",
      codigo: "",
      nombre: "",
      imagen: null,
      costo: "",
      idTipoProducto: "",

      inventarioDetalles: [],

      // colores: [],
      // tallas: [],
      // sabores: [],

      ubicaciones: [],
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refCosto = React.createRef();
    this.refInventarioDetalles = React.createRef();

    this.peticion = false;
    this.abortController = null;
  }

  loadDatos = async (producto, type) => {
    this.abortController = new AbortController();

    // const { success: successColores, message: messageColores, type: typeColores, data: dataColores } = await comboAtributo(TIPO_ATRIBUTO_COLOR, this.abortController.signal);
    // const { success: successTallas, message: messageTallas, type: typeTallas, data: dataTallas } = await comboAtributo(TIPO_ATRIBUTO_TALLA, this.abortController.signal);
    // const { success: successSabores, message: messageSabores, type: typeSabores, data: dataSabores } = await comboAtributo(TIPO_ATRIBUTO_SABOR, this.abortController.signal);
    const {
      success: successUbicacion,
      message: messageUbicacion,
      type: typeUbicacion,
      data: dataUbicacion
    } = await comboUbicacion(this.abortController.signal);

    if (!successUbicacion) {
      if (typeUbicacion === CANCELED) return;

      this.setState({
        message: messageUbicacion
      })

      this.peticion = false;
      this.abortController = null;
      return;
    }

    const ubicaciones = dataUbicacion;

    if (type === "edit") {
      this.setState({
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        costo: producto.costo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        idTipoProducto: producto.idTipoProducto,
        inventarioDetalles: producto.inventarioDetalles,

        ubicaciones: ubicaciones,

        loading: false,
      });
    } else {
      this.setState({
        idProducto: producto.idProducto,
        codigo: producto.codigo,
        costo: producto.costo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        idTipoProducto: producto.idTipoProducto,
        inventarioDetalles: [
          ...this.state.inventarioDetalles,
          this.loadDetalleInventarioPorDefecto(),
        ],
        ubicaciones: ubicaciones,

        loading: false,
      });
    }
  };

  loadDetalleInventarioPorDefecto = () => {
    const body = {
      id: guId(),
      cantidad: { type: "number", value: 1 },
      idUbicacion: { type: "text", value: null },
      lote: { type: "text", value: null },
      fechaVencimiento: { type: "date", value: null },
      vidaUtil: { type: "number", value: null },
      valorResidual: { type: "number", value: null },
      porDefecto: { type: "boolean", value: true }
    }
    return body;
  };


  handleOnOpen = () => {
    this.refCosto.current.focus();
    this.refCosto.current.select();
  };

  handleOnHidden = () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState(this.initial);
    this.peticion = false;
  };


  handleInputCosto = (event) => {
    this.setState({ costo: event.target.value });
  };

  handleAgregarInventarioDetalle = () => {
    const inventarioDetalle = {
      id: guId(),

      cantidad: {
        type: 'number',
        value: '',
      },
      idUbicacion: {
        type: 'text',
        value: '',
      },
      lote: {
        type: 'text',
        value: '',
      },
      fechaVencimiento: {
        type: 'date',
        value: '',
      },
      porDefecto: {
        type: 'boolean',
        value: false,
      },
      vidaUtil: {
        type: 'number',
        value: '',
      },
      valorResidual: {
        type: 'number',
        value: '',
      },
    };

    const inventarioDetalles = [...this.state.inventarioDetalles, inventarioDetalle];

    this.setState({
      inventarioDetalles,
    });
  };

  handleEliminarInventarioDetalle = (id) => {
    const { inventarioDetalles } = this.state;
    const nuevosDetalles = inventarioDetalles.filter(item => item.id !== id);
    this.setState({ inventarioDetalles: nuevosDetalles });
  };

  handleOnSubmit = async () => {
    const {
      idProducto,
      codigo,
      nombre,
      imagen,
      costo,
      idTipoProducto,
      inventarioDetalles
    } = this.state;

    const { detalles, idImpuesto, impuestos } = this.props;

    if (!isNumeric(costo) || Number(costo) <= 0) {
      alertKit.warning({
        title: "Compra",
        message: "El costo no puede ser menor a cero.",
      }, () => {
        this.refCosto.current.focus();
      });
      return;
    }

    if (!isEmpty(inventarioDetalles.filter((item) => isEmpty(item.cantidad.value)))) {
      alertKit.warning({
        title: "Compra",
        message: "Hay detalle(s) sin cantidad.",
      }, () => {
        validateNumericInputs(this.refInventarioDetalles);
      });
      return;
    }

    if (inventarioDetalles.some((item) => item.porDefecto.value !== true && isEmpty(item.lote.value))) {
      alertKit.warning({
        title: "Compra",
        message: "Hay detalle(s) sin lote.",
      }, () => {
        validateNumericInputs(this.refInventarioDetalles);
      });
      return;
    }

    if (idTipoProducto === ACTIVO) {
      if (inventarioDetalles.some((item) => item.porDefecto.value !== true && isEmpty(item.vidaUtil.value))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin vida útil.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }

      if (inventarioDetalles.some((item) => item.porDefecto.value !== true && isEmpty(item.valorResidual.value))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin valor residual.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }
    }


    const nuevoDetalles = detalles.map((item) => ({ ...item }));

    const existeDetalle = nuevoDetalles.find(
      (item) => item.idProducto === idProducto,
    );

    const impuesto = impuestos.find((item) => item.idImpuesto === idImpuesto);

    if (existeDetalle) {
      existeDetalle.inventarioDetalles = inventarioDetalles;
      existeDetalle.costo = Number(costo);
    } else {
      const data = {
        id: detalles.length + 1,
        idProducto: idProducto,
        codigo: codigo,
        nombre: nombre,
        imagen: imagen,
        costo: Number(costo),
        idTipoProducto: idTipoProducto,
        idImpuesto: impuesto.idImpuesto,
        nombreImpuesto: impuesto.nombre,
        porcentajeImpuesto: impuesto.porcentaje,
        inventarioDetalles: inventarioDetalles,
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
      costo,
      inventarioDetalles,
      ubicaciones
    } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        className={cn(
          "modal-custom-sm ",
          !isEmpty(inventarioDetalles) && "h-[80%]"
        )}
      >
        <CustomModalContentForm onSubmit={this.handleOnSubmit}>
          <CustomModalContentHeader contentRef={this.refModal}>
            Producto
          </CustomModalContentHeader>

          <CustomModalContentBody className="flex flex-col gap-3">
            <SpinnerView loading={loading} message={message} />

            <div className="flex flex-col gap-3">
              <h6>{nombre}</h6>
              <Image
                default={images.noImage}
                src={imagen}
                alt={nombre}
                overrideClass="mb-2 h-40 object-contain rounded border border-solid border-[#e2e8f0]"
              />
            </div>

            <div className="flex gap-3">
              <div className="w-full md:w-1/2">
                <Input
                  label="Costo:"
                  placeholder="0.00"
                  role={'float'}
                  ref={this.refCosto}
                  value={costo}
                  onChange={this.handleInputCosto}
                  onPaste={handlePasteFloat}
                />
              </div>
            </div>

            <div className="d-flex justify-content-start align-items-center">
              <h6 className="mr-2">Agregar detalles</h6>
              <div className="flex gap-3">
                {/* Botón agregar detalle normal */}
                <Button
                  className="btn-light"
                  title="Agregar detalle"
                  onClick={this.handleAgregarInventarioDetalle}
                >
                  <i className="bi bi-plus-circle"></i>
                </Button>

                {/* Botón agregar detalle por defecto */}
                <Button
                  className="btn-warning"
                  title="Agregar detalle por defecto"
                  disabled={this.state.inventarioDetalles.some(
                    (d) => d.porDefecto.value === true
                  )}
                  onClick={() => {
                    const yaExiste = this.state.inventarioDetalles.some(
                      (d) => d.porDefecto.value === true
                    );

                    if (yaExiste) {
                      alertKit.warning({
                        title: "Detalle",
                        message: "Ya existe un inventario por defecto."
                      });
                      return;
                    }

                    const nuevo = this.loadDetalleInventarioPorDefecto();
                    this.setState({
                      inventarioDetalles: [...this.state.inventarioDetalles, nuevo]
                    });
                  }}
                >
                  <i className="bi bi-stars"></i>
                </Button>
              </div>
            </div>

            {inventarioDetalles.map((item, index) => (
              <div
                key={index}
                ref={this.refInventarioDetalles}
                className="flex flex-col gap-3 p-3 mb-3 border border-gray-300 rounded"
              >
                {/* Cantidad y Ubicación */}
                <div className="w-full flex flex-row gap-3">
                  <div className="w-full">
                    <Input
                      autoFocus={true}
                      label="Cantidad:"
                      placeholder="0.00"
                      role="float"
                      tabIndex={1}
                      value={item.cantidad.value}
                      onChange={(e) => {
                        const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                          if (inventarioDetalle.id === item.id) {
                            return {
                              ...inventarioDetalle,
                              cantidad: {
                                ...inventarioDetalle.cantidad,
                                value: e.target.value,
                              },
                            };
                          }
                          return inventarioDetalle;
                        });
                        this.setState({ inventarioDetalles: updatedInventarioDetalles });
                      }}
                      onPaste={handlePasteFloat}
                    />
                  </div>
                  {
                    item.idUbicacion.value !== null && (
                      <div className="w-full">
                        <Select
                          label="Ubicación en el inventario:"
                          tabIndex={2}
                          value={item.idUbicacion.value}
                          onChange={(e) => {
                            const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                              if (inventarioDetalle.id === item.id) {
                                return {
                                  ...inventarioDetalle,
                                  idUbicacion: {
                                    ...inventarioDetalle.idUbicacion,
                                    value: e.target.value,
                                  },
                                };
                              }
                              return inventarioDetalle;
                            });
                            this.setState({ inventarioDetalles: updatedInventarioDetalles });
                          }}
                        >
                          <option value="">-- Seleccione --</option>
                          {
                            ubicaciones.map((ubicacion, idx) => (
                              <option key={idx} value={ubicacion.idUbicacion}>
                                {ubicacion.descripcion}
                              </option>
                            ))
                          }
                        </Select>
                      </div>
                    )
                  }
                </div>

                {/* Lote y Fecha de vencimiento */}
                <div className="w-full flex flex-row gap-3">
                  {
                    item.lote.value !== null && (
                      <div className="w-full">
                        <Input
                          label="Lote:"
                          placeholder="LT-0001"
                          tabIndex={3}
                          value={item.lote.value}
                          onChange={(e) => {
                            const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                              if (inventarioDetalle.id === item.id) {
                                return {
                                  ...inventarioDetalle,
                                  lote: {
                                    ...inventarioDetalle.lote,
                                    value: e.target.value,
                                  },
                                };
                              }
                              return inventarioDetalle;
                            });
                            this.setState({ inventarioDetalles: updatedInventarioDetalles });
                          }}
                        />
                      </div>
                    )
                  }
                  {
                    item.fechaVencimiento.value !== null && (
                      <div className="w-full">
                        <Input
                          type="date"
                          label="Fecha de Vencimiento:"
                          tabIndex={4}
                          value={item.fechaVencimiento.value}
                          onChange={(e) => {
                            const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                              if (inventarioDetalle.id === item.id) {
                                return {
                                  ...inventarioDetalle,
                                  fechaVencimiento: {
                                    ...inventarioDetalle.fechaVencimiento,
                                    value: e.target.value,
                                  },
                                };
                              }
                              return inventarioDetalle;
                            });
                            this.setState({ inventarioDetalles: updatedInventarioDetalles });
                          }}
                        />
                      </div>
                    )
                  }
                </div>

                {/* Vida útil y Valor residual */}
                {
                  this.state.idTipoProducto === ACTIVO && (
                    <div className="w-full flex flex-row gap-3">
                      {
                        item.vidaUtil.value !== null && (
                          <div className="w-full">
                            <Input
                              label="Vida útil:"
                              placeholder="Por ejemplo: 1 año, 5 años..."
                              tabIndex={5}
                              role="integer"
                              value={item.vidaUtil.value}
                              onChange={(e) => {
                                const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                                  if (inventarioDetalle.id === item.id) {
                                    return {
                                      ...inventarioDetalle,
                                      vidaUtil: {
                                        ...inventarioDetalle.vidaUtil,
                                        value: e.target.value,
                                      },
                                    };
                                  }
                                  return inventarioDetalle;
                                });
                                this.setState({ inventarioDetalles: updatedInventarioDetalles });
                              }}
                              onPaste={handlePasteInteger}
                            />
                          </div>
                        )
                      }
                      {
                        item.valorResidual.value !== null && (
                          <div className="w-full">
                            <Input
                              label="Valor residual:"
                              placeholder="Por ejemplo: 0, 100, 200..."
                              tabIndex={6}
                              role="float"
                              value={item.valorResidual.value}
                              onChange={(e) => {
                                const updatedInventarioDetalles = inventarioDetalles.map((inventarioDetalle) => {
                                  if (inventarioDetalle.id === item.id) {
                                    return {
                                      ...inventarioDetalle,
                                      valorResidual: {
                                        ...inventarioDetalle.valorResidual,
                                        value: e.target.value,
                                      },
                                    };
                                  }
                                  return inventarioDetalle;
                                });
                                this.setState({ inventarioDetalles: updatedInventarioDetalles });
                              }}
                              onPaste={handlePasteFloat}
                            />
                          </div>
                        )
                      }
                    </div>
                  )
                }


                <div className="flex justify-end">
                  <Button
                    className="btn-danger"
                    onClick={() => this.handleEliminarInventarioDetalle(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </CustomModalContentBody>

          <CustomModalContentFooter>
            <Button type="submit" className="btn-primary">
              <i className="fa fa-plus"></i> Agregar
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

ModalProducto.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  idImpuesto: PropTypes.string,
  impuestos: PropTypes.array,
  detalles: PropTypes.array,

  handleSave: PropTypes.func,
};

export default ModalProducto;
