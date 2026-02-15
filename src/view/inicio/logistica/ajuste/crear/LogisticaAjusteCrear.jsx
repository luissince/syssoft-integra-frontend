import React from 'react';
import {
  getNumber,
  isEmpty,
  validateNumericInputs,
} from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
  comboAlmacen,
  comboMotivoAjuste,
  createAjuste,
  filtrarAlmacenProducto,
} from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import SearchInput from '@/components/SearchInput';
import PropTypes from 'prop-types';
import {
  DECREMENTO,
  INCREMENTO,
} from '@/model/types/forma-ajuste';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Input from '@/components/Input';
import RadioButton from '@/components/RadioButton';
import Image from '@/components/Image';
import { images } from '@/helper';
import { SERVICIO } from '@/model/types/tipo-producto';
import { alertKit } from 'alert-kit';
import GenerarTabla from './component/GenerarTabla';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class LogisticaAjusteCrear extends CustomComponent {
  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      // Atributos de carga
      initialLoad: true,
      initialMessage: "Cargando datos...",

      // Atributos principales
      paso: 1,

      producto: null,
      cantidad: 0,
      costo: 0,

      productos: [],

      idTipoAjuste: "",
      observacion: "S/N",

      idMotivoAjuste: "",
      motivoAjuste: [],

      idAlmacen: "",
      almacenes: [],

      detalles: [],

      nombreMotivoAjuste: "",
      nombreAlmacen: "",

      // Id principales
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.initial = { ...this.state };

    // Referencial al padre
    this.refTableBody = React.createRef();

    // Referencia del formulario principal
    this.refIdTipoAjuste = React.createRef();
    this.refIdMotivoAjuste = React.createRef();
    this.refIdAlmacen = React.createRef();
    this.refProducto = React.createRef();
    this.refValueProducto = React.createRef();

    this.abortController = new AbortController();
  }

  /*
    |--------------------------------------------------------------------------
    | Método de cliclo de vida
    |--------------------------------------------------------------------------
    |
    | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
    | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
    | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
    | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
    | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
    | de la aplicación y optimizar el rendimiento del componente.
    |
    */

  async componentDidMount() {
    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
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

  async loadingData() {
    const [almacenes, motivoAjuste] = await Promise.all([
      this.fetchComboAlmacen({ idSucursal: this.state.idSucursal }),
      this.fetchComboMotivoAjuste(),
    ]);

    await this.setStateAsync({
      almacenes,
      motivoAjuste,
      initialLoad: false,
    });
  }

  async fetchFiltrarProducto(params) {
    const response = await filtrarAlmacenProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  async fetchComboAlmacen(params) {
    const response = await comboAlmacen(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboMotivoAjuste() {
    const response = await comboMotivoAjuste(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  clearView() {
    this.setState(this.initial, async () => {
      await this.loadingData();
      this.refIdTipoAjuste.current.focus();
    });
  }

  addProducto(producto) {
    const exists = this.state.detalles.find(
      (item) => item.idProducto === producto.idProducto,
    );

    if (exists) {
      alertKit.warning({
        title: "Ajuste",
        message: "El producto ya existe en la lista.",
      });
      return;
    }

    const data = {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      imagen: producto.imagen,
      unidad: producto.unidad,
      inventarioDetalles: producto.inventarioDetalles.map((item) => ({
        ...item,
        cantidadAjustar: "",
      })),
    };

    this.setState((prevState) => ({
      detalles: [...prevState.detalles, data],
    }));
  }

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

  handleSelectMetodoAjuste = (event) => {
    this.setState({ idMotivoAjuste: event.target.value });
  };

  handleOptionTipoAjuste = (event) => {
    this.setState({ idTipoAjuste: event.target.value });
  };

  handleSelectAlmacen = (event) => {
    this.setState({ idAlmacen: event.target.value });
  };

  handleSiguiente = () => {
    if (isEmpty(this.state.idTipoAjuste)) {
      alertKit.warning({
        title: "Ajuste",
        message: "Seleccione el tipo de ajuste.",
      },
        () => {
          this.refIdTipoAjuste.current.focus();
        },
      );
      return;
    }

    if (isEmpty(this.state.idMotivoAjuste)) {
      alertKit.warning({
        title: "Ajuste",
        message: "Seleccione el motivo del ajuste.",
      }, () => {
        this.refIdMotivoAjuste.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idAlmacen)) {
      alertKit.warning({
        title: "Ajuste",
        message: "Seleccione el almacen.",
      }, () => {
        this.refIdAlmacen.current.focus();
      });
      return;
    }

    this.setState({
      nombreMotivoAjuste:
        this.refIdMotivoAjuste.current.options[
          this.refIdMotivoAjuste.current.selectedIndex
        ].innerText,
      nombreAlmacen:
        this.refIdAlmacen.current.options[
          this.refIdAlmacen.current.selectedIndex
        ].innerText,
      paso: 2,
    });
  };

  handleInputObservacion = (event) => {
    this.setState({
      observacion: event.target.value,
    });
  };

  handleRemoveDetalle = (idProducto) => {
    const detalles = this.state.detalles.filter(
      (item) => item.idProducto !== idProducto,
    );
    this.setState({ detalles });
  };

  handleInputDetalle = (event, idKardex) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalles: prevState.detalles.map((item) => ({
        ...item,
        inventarioDetalles: item.inventarioDetalles.map((invd) => {
          if (invd.idKardex === idKardex) {
            return {
              ...invd,
              cantidadAjustar: value,
            };
          }
          return invd;
        }),
      })),
    }));
  };

  handleFocusInputTable = (event, isLastRow) => {
    if (event.key === 'Enter' && !isLastRow) {
      const nextInput =
        event.target.parentElement.parentElement.nextElementSibling.querySelector(
          'input',
        );
      nextInput.focus();
      nextInput.select();
    }

    if (event.key === 'Enter' && isLastRow) {
      const firstInput =
        event.target.parentElement.parentElement.parentElement.querySelector(
          'input',
        );
      firstInput.focus();
      firstInput.select();
    }
  };

  //------------------------------------------------------------------------------------------
  // Filtrar producto
  //------------------------------------------------------------------------------------------

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

    const params = {
      idAlmacen: this.state.idAlmacen,
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProducto(params);

    // Filtrar productos por tipoProducto !== "SERVICIO"
    const filteredProductos = productos.filter(
      (item) => item.idTipoProducto !== SERVICIO,
    );

    this.setState({
      productos: filteredProductos,
    });
  };

  handleSelectItemProducto = (value) => {
    this.refProducto.current.initialize(value.nombre);

    this.setState({
      producto: value,
      productos: [],
    }, () => {
      this.addProducto(value);
    });
  };

  //------------------------------------------------------------------------------------------
  // Acciones de proceso de registro
  //------------------------------------------------------------------------------------------
  handleSave = async () => {
    const {
      idTipoAjuste,
      idMotivoAjuste,
      idAlmacen,
      idSucursal,
      observacion,
      idUsuario,
      detalles
    } = this.state;

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: "Ajuste",
        message: "Agregue productos en la lista para continuar.",
      }, () => {
        this.refValueProducto.current.focus();
      });
      return;
    }

    if (!isEmpty(detalles.filter((item) => !item.inventarioDetalles && getNumber(item.cantidad) <= 0))) {
      alertKit.warning({
        title: "Ajuste",
        message: "Hay cantidades en lista de productos con valor 0 o vacío.",
      }, () => {
        validateNumericInputs(this.refTableBody);
      });
      return;
    }

    const detallesFiltrados = detalles
      .map(item => {
        const detallesValidos = item.inventarioDetalles
          .filter(invd => getNumber(invd.cantidadAjustar) > 0)
          .map(invd => ({
            ...invd,
            cantidadAjustar: getNumber(invd.cantidadAjustar)
          }));

        return {
          ...item,
          inventarioDetalles: detallesValidos
        };
      })
      .filter(item => item.inventarioDetalles.length > 0);

    if (isEmpty(detallesFiltrados)) {
      alertKit.warning({
        title: "Ajuste",
        message: "No hay cantidades válidas para el ajuste.",
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Ajuste",
      message: "¿Está seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idTipoAjuste: idTipoAjuste,
        idMotivoAjuste: idMotivoAjuste,
        idAlmacen: idAlmacen,
        idSucursal: idSucursal,
        observacion: observacion,
        idUsuario: idUsuario,
        detalles: detallesFiltrados,
      };

      alertKit.loading({
        message: "Procesando petición...",
      });

      const response = await createAjuste(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Ajuste",
          message: response.data,
          onClose: () => {
            this.clearView();
          },
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Ajuste",
          message: response.getMessage(),
        });
      }
    }
  };

  handleBack = () => {
    this.setState({
      paso: 1,
      detalles: [],
    });
  };

  handleClear = async () => {
    const accept = await alertKit.question({
      title: "Ajuste",
      message: "¿Está seguro de continuar, se va limpiar toda la información?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      this.clearView();
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
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

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        />

        <Title
          title="Ajuste de inventario"
          subTitle="CREAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        {/* Primero paso */}
        {this.state.paso === 1 && (
          <>
            <div className="felx mb-3">
              <p>
                <i className="bi bi-card-list"></i> Defína alguna opciones antes de continuar.
              </p>
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <label>Seleccione el tipo de ajuste:</label>

              <RadioButton
                ref={this.refIdTipoAjuste}
                name="ckTipoAjuste"
                id={INCREMENTO}
                value={INCREMENTO}
                checked={this.state.idTipoAjuste === INCREMENTO}
                onChange={this.handleOptionTipoAjuste}
              >
                <i className="bi bi-plus-circle-fill text-success"></i>{' '}
                Incremento
              </RadioButton>

              <RadioButton
                name="ckTipoAjuste"
                id={DECREMENTO}
                value={DECREMENTO}
                checked={this.state.idTipoAjuste === DECREMENTO}
                onChange={this.handleOptionTipoAjuste}
              >
                <i className="bi bi-dash-circle-fill text-danger"></i>{' '}
                Decremento
              </RadioButton>
            </div>

            <div className="flex flex-col mb-3">
              <Select
                label={'Seleccione el motivo del ajuste:'}
                ref={this.refIdMotivoAjuste}
                value={this.state.idMotivoAjuste}
                onChange={this.handleSelectMetodoAjuste}
              >
                <option value="">-- Motivo Ajuste --</option>
                {this.state.motivoAjuste.map((item, index) => {
                  return (
                    <option key={index} value={item.idMotivoAjuste}>
                      {item.nombre}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div className="flex flex-col mb-3">
              <Select
                label={'Seleccione el almacen:'}
                ref={this.refIdAlmacen}
                value={this.state.idAlmacen}
                onChange={this.handleSelectAlmacen}
              >
                <option value="">-- Almacen --</option>
                {this.state.almacenes.map((item, index) => {
                  return (
                    <option key={index} value={item.idAlmacen}>
                      {item.nombre}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div className="flex gap-3">
              <Button className="btn-primary" onClick={this.handleSiguiente}>
                <i className="fa fa-arrow-right"></i> Siguiente
              </Button>
              <Button
                className="btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cancelar
              </Button>
            </div>
          </>
        )}

        {/* Segundo paso */}
        {this.state.paso === 2 && (
          <>
            <div className="flex flex-col gap-1 mb-3">
              <p>Tipo de Ajuste:</p>
              <div>
                {this.state.idTipoAjuste === INCREMENTO ? (
                  <div className="flex gap-1">
                    <i className="bi bi-plus-circle-fill text-success"></i>
                    <p className="font-bold">INCREMENTO</p>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <i className="bi bi-dash-circle-fill text-danger"></i>{' '}
                    <p className="font-bold">DECREMENTO</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <p>Motivo de Ajuste:</p>
              <div>
                <p className="font-bold">{this.state.nombreMotivoAjuste}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <p>Almacen:</p>
              <div>
                <p className="font-bold">{this.state.nombreAlmacen}</p>
              </div>
            </div>

            <div>
              <SearchInput
                ref={this.refProducto}
                autoFocus={true}
                label={'Filtrar por el código o nombre del producto:'}
                placeholder="Filtrar productos..."
                refValue={this.refValueProducto}
                data={this.state.productos}
                handleClearInput={this.handleClearInputProducto}
                handleFilter={this.handleFilterProducto}
                handleSelectItem={this.handleSelectItemProducto}
                renderItem={(value) => (
                  <div className="flex items-center">
                    <Image
                      default={images.noImage}
                      src={value.imagen}
                      alt={value.nombre}
                      overrideClass="w-20 h-20 object-contain"
                    />

                    <div className="ml-2">
                      {value.codigo}
                      <br />
                      {value.nombre} <small>({value.categoria})</small>
                    </div>
                  </div>
                )}
                renderIconLeft={<i className="bi bi-cart4"></i>}
              />
            </div>

            <div className="mb-3">
              <Input
                label="Ingrese alguna descripción para saber el motivo del ajuste: "
                placeholder="Ingrese una observación"
                value={this.state.observacion}
                onChange={this.handleInputObservacion}
              />
            </div>

            <GenerarTabla
              refTableBody={this.refTableBody}
              idTipoAjuste={this.state.idTipoAjuste}
              detalles={this.state.detalles}
              handleRemoveDetalle={this.handleRemoveDetalle}
              handleInputDetalle={this.handleInputDetalle}
              handleFocusInputTable={this.handleFocusInputTable}
            />

            <div className="flex gap-3">
              <Button className="btn-success" onClick={this.handleSave}>
                <i className="fa fa-save"></i> Guardar
              </Button>
              <Button className="btn-outline-light" onClick={this.handleBack}>
                <i className="fa fa-arrow-left"></i> Atras
              </Button>
              <Button
                className="btn-outline-light"
                onClick={this.handleClear}
              >
                <i className="fa fa-trash"></i> Limpiar
              </Button>
              <Button
                className="btn-outline-danger"
                onClick={() => this.props.history.goBack()}
              >
                <i className="fa fa-close"></i> Cancelar
              </Button>
            </div>
          </>
        )}
      </ContainerWrapper>
    );
  }
}

LogisticaAjusteCrear.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  token: PropTypes.shape({
    project: PropTypes.shape({
      idSucursal: PropTypes.string,
    }),
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string,
      }),
    }),
  }),
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedAjusteCrear = connect(
  mapStateToProps,
  null,
)(LogisticaAjusteCrear);

export default ConnectedAjusteCrear;
