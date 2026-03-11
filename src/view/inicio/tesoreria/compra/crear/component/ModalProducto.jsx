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
import { PRODUCTO, ACTIVO_FIJO } from '@/model/types/tipo-producto';
import { DIGITOS_DECRECIENTES, LINEA_RECTA, SUMA_DE_DIGITOS } from '@/model/types/metodo-depreciacion';

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
      idMetodoDepreciacion: LINEA_RECTA,

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

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

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
        idMetodoDepreciacion: producto.idMetodoDepreciacion,
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
        idMetodoDepreciacion: producto.idMetodoDepreciacion,
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
      porDefecto: true,
      cantidad: 1,

      // producto
      idUbicacion: null,
      lote: null,
      fechaVencimiento: null,
      // activo
      serie: null,
      vidaUtil: null,
      valorResidual: null,
    }
    return body;
  };

  updateDetalleField = (id, field, value) => {
    this.setState((prevState) => ({
      inventarioDetalles: prevState.inventarioDetalles.map((detalle) =>
        detalle.id === id
          ? { ...detalle, [field]: value }
          : detalle
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

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
    this.setState({ costo: event.target });
  };

  handleAgregarInventarioDetalle = () => {
    const inventarioDetalle = {
      id: guId(),
      porDefecto: false,
      cantidad: "",
      idUbicacion: "",
      lote: "",
      fechaVencimiento: "",
      //
      serie: "",
      vidaUtil: "",
      valorResidual: "",
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
      idMetodoDepreciacion,
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
    if (inventarioDetalles.some(item => isEmpty(item.cantidad))) {
      alertKit.warning({
        title: "Compra",
        message: "Hay detalle(s) sin cantidad.",
      }, () => {
        validateNumericInputs(this.refInventarioDetalles);
      });
      return;
    }

    if (idTipoProducto === PRODUCTO) {
      if (inventarioDetalles.some((item) => item.porDefecto !== true && isEmpty(item.lote))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin lote.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }

      if (inventarioDetalles.some((item) => item.porDefecto !== true && isEmpty(item.fechaVencimiento))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin fecha de vencimiento.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }
    }

    if (idTipoProducto === ACTIVO_FIJO) {
      if (inventarioDetalles.some((item) => item.porDefecto !== true && isEmpty(item.serie))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin serie.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }

      if (inventarioDetalles.some((item) => item.porDefecto !== true && isEmpty(item.vidaUtil))) {
        alertKit.warning({
          title: "Compra",
          message: "Hay detalle(s) sin vida útil.",
        }, () => {
          validateNumericInputs(this.refInventarioDetalles);
        });
        return;
      }

      if (inventarioDetalles.some((item) => item.porDefecto !== true && isEmpty(item.valorResidual))) {
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

    const existeDetalle = nuevoDetalles.find((item) => item.idProducto === idProducto);

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
        idMetodoDepreciacion: idMetodoDepreciacion,
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

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

  renderPorDefecto = (item) => {
    if (!item.porDefecto) return;

    return (
      <div className="w-full flex flex-row gap-3">
        <div className="w-full">
          <Input
            autoFocus={true}
            label="Cantidad:"
            placeholder="0.00"
            role="float"
            tabIndex={1}
            value={item.cantidad}
            onChange={(e) =>
              this.updateDetalleField(item.id, "cantidad", e.target.value)
            }
            onPaste={handlePasteFloat}
          />
        </div>
      </div>
    );
  }

  renderProducto = (item) => {
    if (this.state.idTipoProducto !== PRODUCTO) return;

    if (item.porDefecto) return;

    const { ubicaciones } = this.state;
    return (
      <>
        <div className="w-full flex flex-row gap-3">
          <div className="w-full">
            <Input
              autoFocus={true}
              label="Cantidad:"
              placeholder="0.00"
              role="float"
              tabIndex={1}
              value={item.cantidad}
              onChange={(e) =>
                this.updateDetalleField(item.id, "cantidad", e.target.value)
              }
              onPaste={handlePasteFloat}
            />
          </div>

          {
            item.idUbicacion !== null && (
              <div className="w-full">
                <Select
                  label="Ubicación en el inventario:"
                  tabIndex={2}
                  value={item.idUbicacion}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "idUbicacion", e.target.value)
                  }
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

        <div className="w-full flex flex-row gap-3">
          {
            item.lote !== null && (
              <div className="w-full">
                <Input
                  label="Lote:"
                  placeholder="LT-0001"
                  tabIndex={3}
                  value={item.lote}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "lote", e.target.value)
                  }
                />
              </div>
            )
          }

          {
            item.fechaVencimiento !== null && (
              <div className="w-full">
                <Input
                  type="date"
                  label="Fecha de Vencimiento:"
                  tabIndex={4}
                  value={item.fechaVencimiento}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "fechaVencimiento", e.target.value)
                  }
                />
              </div>
            )
          }
        </div>
      </>
    );
  }

  renderActivo = (item) => {
    if (this.state.idTipoProducto !== ACTIVO_FIJO) return;

    if (item.porDefecto) return;

    const { ubicaciones } = this.state;
    return (
      <>
        <div className="w-full flex flex-row gap-3">
          <div className="w-full">
            <Input
              autoFocus={true}
              label="Cantidad:"
              placeholder="0.00"
              role="float"
              tabIndex={1}
              value={item.cantidad}
              onChange={(e) =>
                this.updateDetalleField(item.id, "cantidad", e.target.value)
              }
              onPaste={handlePasteFloat}
            />
          </div>

          {
            item.idUbicacion !== null && (
              <div className="w-full">
                <Select
                  label="Ubicación en el inventario:"
                  tabIndex={2}
                  value={item.idUbicacion}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "idUbicacion", e.target.value)
                  }
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

        <div className="w-full flex flex-row gap-3">
          {
            item.serie !== null && (
              <div className="w-full">
                <Input
                  label="Serie:"
                  placeholder="Por ejemplo: SR-0001"
                  tabIndex={2}
                  value={item.serie}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "serie", e.target.value)
                  }
                  onPaste={handlePasteInteger}
                />
              </div>
            )
          }
        </div>
        <div className="w-full flex flex-row gap-3">
          {
            item.vidaUtil !== null && (
              <div className="w-full">
                <Input
                  label="Vida útil:"
                  placeholder="Por ejemplo: 1 año, 5 años..."
                  tabIndex={3}
                  role="integer"
                  value={item.vidaUtil}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "vidaUtil", e.target.value)
                  }
                  onPaste={handlePasteInteger}
                />
              </div>
            )
          }
          {
            item.valorResidual !== null && (
              <div className="w-full">
                <Input
                  label="Valor residual:"
                  placeholder="Por ejemplo: 0, 100, 200..."
                  tabIndex={4}
                  role="float"
                  value={item.valorResidual}
                  onChange={(e) =>
                    this.updateDetalleField(item.id, "valorResidual", e.target.value)
                  }
                  onPaste={handlePasteFloat}
                />
              </div>
            )
          }
        </div>

        <div className="w-full flex flex-row gap-3">
          {this.state.idMetodoDepreciacion === LINEA_RECTA && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-500">
                Cuota fija anual igual durante toda la vida útil
              </p>
              <p className="text-orange-400">
                Método seleccionado: Línea Recta (SL) — Depreciación = (Costo - Valor Residual) / Vida Útil
              </p>
            </div>
          )}

          {this.state.idMetodoDepreciacion === DIGITOS_DECRECIENTES && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-500">
                Mayor depreciación en primeros años
              </p>
              <p className="text-orange-400">
                Método seleccionado: Doble Saldo Decreciente (DA) — Depreciación = Valor en Libros × (2 / Vida Útil)
              </p>
            </div>
          )}

          {this.state.idMetodoDepreciacion === SUMA_DE_DIGITOS && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-500">
                Depreciación acelerada basada en fracción de años
              </p>
              <p className="text-orange-400">
                Método seleccionado: Suma de Dígitos de Años (SY) — Fracción decreciente sobre base depreciable
              </p>
            </div>
          )}
        </div>
      </>
    );
  }

  render() {
    const {
      loading,
      message,

      nombre,
      imagen,
      costo,
      inventarioDetalles,
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
                    (d) => d.porDefecto === true
                  )}
                  onClick={() => {
                    const yaExiste = this.state.inventarioDetalles.some(
                      (d) => d.porDefecto === true
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
                {this.renderPorDefecto(item)}

                {/* Lote y Fecha de vencimiento */}
                {this.renderProducto(item)}

                {/* Vida útil y Valor residual */}
                {
                  this.renderActivo(item)
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
