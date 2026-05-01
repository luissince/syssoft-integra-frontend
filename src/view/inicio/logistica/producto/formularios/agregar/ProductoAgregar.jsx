import React from 'react';
import CustomComponent from '@/components/CustomComponent';
import ContainerWrapper from '@/components/ui/container-wrapper';
import { images } from '@/helper';
import {
  generateEAN13Code,
  imageBase64,
  isEmpty,
  isNumeric,
  keyNumberFloat,
  validateMany,
  validateNumericInputs,
} from '@/helper/utils.helper';
import {
  addProducto,
  comboMedida,
  comboCategoria,
  comboMarca,
} from '@/network/rest/principal.network';
import PropTypes from 'prop-types';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import { connect } from 'react-redux';
import DetalleImagen from '../component/DetalleImagen';
import {
  A_GRANEL,
  UNIDADES,
  VALOR_MONETARIO,
} from '@/model/types/tipo-tratamiento-producto';
import Title from '@/components/Title';
import { SpinnerView } from '@/components/Spinner';
import ModalProducto from '../component/ModalProducto';
import { TIPO_PRODUCTO_NORMAL, TIPO_PRODUCTO_SERVICIO, TIPO_PRODUCTO_ACTIVO_FIJO, tipoProducto } from '@/model/types/tipo-producto';
import { alertKit } from 'alert-kit';
import RadioButton from '@/components/RadioButton';
import Select from '@/components/Select';
import Input from '@/components/Input';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import ItemImage from '../component/ItemImagen';
import { DIGITOS_DECRECIENTES, LINEA_RECTA, SUMA_DE_DIGITOS } from '@/model/types/metodo-depreciacion';
import { FaAsterisk } from 'react-icons/fa';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ProductoAgregar extends CustomComponent {
  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: "Cargando datos...",

      idTipoProducto: TIPO_PRODUCTO_NORMAL,

      nombre: "",
      codigo: "",
      sku: "",
      codigoBarras: generateEAN13Code(),
      idMarca: "",
      idMedida: "",
      idCategoria: "",

      idTipoTratamientoProducto: UNIDADES,

      costo: "",

      precio: "",

      precios: [],
      combos: [],

      idMetodoDepreciacion: LINEA_RECTA,

      descripcionCorta: "",
      descripcionLarga: "",
      detalles: [],
      imagenes: [],

      imagen: {
        url: images.noImage,
      },

      publicar: false,
      negativo: false,
      preferido: false,
      estado: true,

      // Lista de datos
      medidas: [],
      categorias: [],
      marcas: [],

      // Id principales
      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refCodigo = React.createRef();
    this.refSku = React.createRef();
    this.refCodigoBarras = React.createRef();
    this.refIdMarca = React.createRef();
    this.refIdMedida = React.createRef();
    this.refIdCategoria = React.createRef();
    this.refCosto = React.createRef();
    this.refPrecio = React.createRef();
    this.refPrecios = React.createRef();
    this.refDescripcionCorta = React.createRef();
    this.refDescripcionLarga = React.createRef();
    this.refDetalles = React.createRef();

    // Referencia para el modal inventario
    this.refModalInventario = React.createRef();

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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  componentDidMount() {
    this.loadingData();
  }

  /**
   * @description Método que se ejecuta antes de que el componente se desmonte del DOM.
   */
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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  loadingData = async () => {
    const [medidas, categorias, marcas] =
      await Promise.all([
        this.fetchComboMedida(),
        this.fetchComboCategoria(),
        this.fetchComboMarca(),
      ]);

    await this.setStateAsync({
      medidas,
      categorias,
      marcas,
      loading: false,
    });
  };

  async fetchComboMedida() {
    const response = await comboMedida(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboCategoria() {
    const response = await comboCategoria(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboMarca() {
    const response = await comboMarca(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
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

  handleOptionTipoProducto = (event) => {
    this.setState({
      idTipoProducto: event.target.value,
    });
  }

  handleInputNombre = (event) => {
    this.setState({
      nombre: event.target.value,
    });
  }

  handleInputCodigo = (event) => {
    this.setState({
      codigo: event.target.value,
    });
  }

  handleInputSku = (event) => {
    this.setState({
      sku: event.target.value,
    });
  }

  handleInputCodigoBarras = (event) => {
    this.setState({
      codigoBarras: event.target.value,
    });
  }

  handleChangeCodigoBarras = () => {
    this.setState({
      codigoBarras: generateEAN13Code(),
    });
  };

  handleSelectIdMarca = (event) => {
    this.setState({
      idMarca: event.target.value,
    });
  }

  handleSelectIdMedida = (event) => {
    this.setState({
      idMedida: event.target.value,
    });
  }

  handleSelectIdCategoria = (event) => {
    this.setState({
      idCategoria: event.target.value,
    });
  }

  handleOptionTipoTratamiento = (event) => {
    this.setState({
      idTipoTratamientoProducto: event.target.value,
    });
  }

  handleOptionMetodoDepreciacion = (event) => {
    this.setState({
      idMetodoDepreciacion: event.target.value,
    });
  }

  handleInputCosto = (event) => {
    this.setState({
      costo: event.target.value,
    });
  }

  handleInputPrecio = (event) => {
    this.setState({
      precio: event.target.value,
    });
  }

  handleInputNombrePrecios = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      precios: prevState.precios.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputPrecioPrecios = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      precios: prevState.precios.map((item) =>
        item.id === id ? { ...item, precio: value } : item,
      ),
    }));
  };

  handleAddPrecios = () => {
    const data = {
      id: this.state.precios.length + 1,
      nombre: '',
      precio: '',
    };

    this.setState((prevState) => ({
      precios: [...prevState.precios, data],
    }));
  };

  handleRemovePrecios = (id) => {
    const precios = this.state.precios
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));
    this.setState({ precios });
  };

  handleInputDescripcionCorta = (event) => {
    this.setState({
      descripcionCorta: event.target.value,
    });
  };

  handleInputDescripcionLarga = (event) => {
    this.setState({
      descripcionLarga: event.target.value,
    });
  };


  handleInputNombreDetalles = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalles: prevState.detalles.map((item) =>
        item.id === id ? { ...item, nombre: value } : item,
      ),
    }));
  };

  handleInputValorDetalles = (event, id) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      detalles: prevState.detalles.map((item) =>
        item.id === id ? { ...item, valor: value } : item,
      ),
    }));
  };

  handleRemoveDetalles = (id) => {
    const detalles = this.state.detalles
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));
    this.setState({ detalles });
  };

  handleAddDetalles = () => {
    const data = {
      id: this.state.detalles.length + 1,
      nombre: '',
      valor: '',
    };

    this.setState((prevState) => ({
      detalles: [...prevState.detalles, data],
    }));
  };

  handleSelectImagenes = (newImgsState) => {
    this.setState({ imagenes: newImgsState });
  };

  handleRemoveImagenes = (newImgs) => {
    this.setState({ imagenes: newImgs });
  };

  //------------------------------------------------------------------------------------------
  // Detalle general
  //------------------------------------------------------------------------------------------

  handleInputImagen = async (event) => {
    const files = event.currentTarget.files;

    if (isEmpty(files)) {
      this.setState({
        imagen: {
          url: images.noImage,
        },
      });
    } else {

      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);

      if (!logoSend) {
        alertKit.warning({
          title: 'Producto',
          message: 'La imagen a subir no es válida.',
        });
        return;
      }

      if (logoSend.size > 500) {
        alertKit.warning({
          title: 'Producto',
          message: 'La imagen a subir tiene que ser menor a 500 KB.',
        });
      }
      this.setState({
        imagen: {
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url,
        },
      });
    }

    event.target.value = null;
  };

  handleRemoveImagen = () => {
    this.setState({
      imagen: {
        url: images.noImage,
      },
    });
  };

  handleSelectPreferido = (event) => {
    this.setState({
      preferido: event.target.checked,
    });
  };

  handleSelectEstado = (event) => {
    this.setState({
      estado: event.target.checked,
    });
  };

  handleSelectPublico = (event) => {
    this.setState({
      publicar: event.target.checked,
    });
  };

  handleSelectNegativo = (event) => {
    this.setState({
      negativo: event.target.checked,
    });
  };

  //------------------------------------------------------------------------------------------
  // Registrar
  //------------------------------------------------------------------------------------------

  handleSaveProducto = async () => {
    const {
      idTipoProducto,
      nombre,
      codigo,
      sku,
      codigoBarras,
      idMedida,
      idCategoria,
      idMarca,
      idTipoTratamientoProducto,
      idMetodoDepreciacion,
      precio,
      costo,
      precios,
      detalles,
      descripcionCorta,
      descripcionLarga,
      imagenes,
      publicar,
      negativo,
      preferido,
      estado,
      imagen,
      idUsuario,
    } = this.state;

    const valid = await validateMany([
      {
        value: nombre,
        message: 'Ingrese el nombre del producto.',
        ref: this.refNombre
      },
      {
        value: codigo,
        message: 'Ingrese el código del producto.',
        ref: this.refCodigo
      },
      {
        value: idMedida,
        message: 'Seleccione la medida.',
        ref: this.refIdMedida
      },
      {
        value: idCategoria,
        message: 'Seleccione la categoría.',
        ref: this.refIdCategoria
      },
      {
        value: costo,
        message: 'Ingrese el costo.',
        ref: this.refCosto
      },
      {
        value: ![TIPO_PRODUCTO_SERVICIO].includes(idTipoProducto) && precio,
        message: 'Ingrese el precio.',
        ref: this.refPrecio
      },
      {
        value: parseFloat(this.state.precio) <= parseFloat(this.state.costo),
        message: 'El costo no debe ser mayor o igual al precio.',
        ref: this.refCosto
      },
      {
        value: this.state.precios.filter((item) => isEmpty(item.nombre)).length !== 0,
        message: 'Hay precios sin nombre..',
        callback: () => {
          validateNumericInputs(this.refPrecios, 'string');
        }
      },
      {
        value: this.state.precios.filter((item) => !isNumeric(item.precio)).length !== 0,
        message: 'Hay precios sin valor.',
        callback: () => {
          validateNumericInputs(this.refPrecios);
        }
      },
      {
        value: this.state.detalles.filter((item) => isEmpty(item.nombre)).length !== 0,
        message: 'Hay detalle sin nombre..',
        callback: () => {
          validateNumericInputs(this.refDetalles, 'string');
        }
      },
      {
        value: this.state.detalles.filter((item) => isEmpty(item.valor)).length !== 0,
        message: 'Hay detalle sin valor.',
        callback: () => {
          validateNumericInputs(this.refDetalles);
        }
      }
    ], "Producto");

    if (!valid) return;

    const accept = await alertKit.question({
      title: 'Producto',
      message: '¿Estás seguro de continuar?',
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      alertKit.loading({ message: 'Procesando información...' });

      const data = {
        idTipoProducto: idTipoProducto,
        nombre: nombre,
        codigo: codigo,
        sku: sku,
        codigoBarras: codigoBarras,
        idMedida: idMedida,
        idCategoria: idCategoria,
        idMarca: idMarca,
        descripcionCorta: descripcionCorta,
        descripcionLarga: descripcionLarga,
        idTipoTratamientoProducto: idTipoTratamientoProducto,
        idMetodoDepreciacion: idMetodoDepreciacion,
        costo: costo,
        precio: precio,
        precios: precios,
        publicar: publicar,
        negativo: negativo,
        preferido: preferido,
        estado: estado,

        detalles: detalles,
        imagenes: imagenes,
        imagen: imagen,

        idUsuario: idUsuario,
      };

      const response = await addProducto(data);
      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Producto',
          message: response.data,
          onClose: () => {
            this.props.history.goBack();
          }
        });
      }

      if (response instanceof ErrorResponse) {
        alertKit.warning({
          title: 'Producto',
          message: response.getMessage(),
        });
      }
    }
  };

  handleCerrar = () => {
    this.props.history.goBack();
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
    const {
      loading,
      msgLoading,

      idTipoProducto,

      nombre,
      codigo,
      sku,
      codigoBarras,
      idMarca,
      idMedida,
      idCategoria,

      idTipoTratamiento,
      idMetodoDepreciacion,

      costo,
      precio,

      precios,

      descripcionCorta,
      descripcionLarga,
      detalles,
      imagenes,

      medidas,
      categorias,
      marcas,

      combos,

      imagen,
      publicar,
      negativo,
      preferido,
      estado
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={loading}
          message={msgLoading}
        />

        <Title
          title="Producto"
          subTitle="AGREGAR"
          icon={<i className="fa fa-plus"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="flex flex-col md:flex-row gap-3">
          {/* Parte de los datos */}
          <div className="w-full md:w-3/5 flex flex-col gap-3">

            {/* Seleccion de tipo de producto */}
            <div className="flex flex-row flex-wrap gap-3">
              <h6 className="flex items-center gap-2">
                <span className="badge badge-primary">1</span> TIPO DE PRODUCTO
              </h6>

              <p>
                Selecciona el tipo de producto que deseas crear, esto te ayudará a organizar mejor tu catálogo.
              </p>

              {
                tipoProducto.map((item, index) => (
                  <RadioButton
                    key={`tipo-producto-${index}`}
                    className="form-check-inline"
                    id={item.value}
                    value={item.value}
                    name="ckTipoProducto"
                    checked={idTipoProducto === item.value}
                    onChange={this.handleOptionTipoProducto}
                  >
                    {item.label}
                  </RadioButton>

                ))
              }
            </div>

            {/* Información general */}
            <div className="flex flex-col gap-3">

              <h6 className="flex items-center gap-2">
                <span className="badge badge-primary">2</span> INFORMACIÓN GENERAL
              </h6>

              <p>
                Información básica del producto, servicio, combo o activo que deseas registrar.
              </p>

              {/* Nombre del producto */}
              <div className="flex flex-col gap-2">
                <Input
                  label={
                    <div className="flex items-center gap-1">
                      <p>Nombre del Producto:</p>  <FaAsterisk className="text-red-500" size={8} />
                    </div>
                  }
                  className={`${nombre ? '' : 'is-invalid'}`}
                  placeholder="Dijite un nombre..."
                  ref={this.refNombre}
                  value={nombre}
                  onChange={this.handleInputNombre}
                />
              </div>

              {/* Código y SKU */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full flex flex-col gap-2">
                  <Input
                    label={
                      <div className="flex items-center gap-1">
                        <p>Código:</p>  <FaAsterisk className="text-red-500" size={8} />
                      </div>
                    }
                    className={`${codigo ? '' : 'is-invalid'}`}
                    placeholder="Ejemplo: CAS002 ..."
                    ref={this.refCodigo}
                    value={codigo}
                    onChange={this.handleInputCodigo}
                  />

                </div>

                <div className="w-full flex flex-col gap-2">
                  <Input
                    label={
                      <div className="flex items-center gap-1">
                        <p>SKU:</p>
                      </div>
                    }
                    placeholder="Ejemplo: CAM-NIKE-001 ..."
                    ref={this.refSku}
                    value={sku}
                    onChange={this.handleInputSku}
                  />
                </div>
              </div>

              {/* Código de Barras y Marca */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full flex flex-col gap-2">
                  <Input
                    group
                    label={
                      <div className="flex items-center gap-1">
                        <p>Código de Barras:</p>
                      </div>
                    }
                    placeholder="Ejemplo: 1234567890123 ..."
                    ref={this.refCodigoBarras}
                    value={codigoBarras}
                    onChange={this.handleInputCodigoBarras}
                    buttonRight={
                      <Button
                        className="btn-outline-secondary"
                        title="Generar Código de Barras"
                        onClick={this.handleChangeCodigoBarras}
                      >
                        <i className="bi-arrow-clockwise"></i>
                      </Button>
                    }
                  />
                </div>

                <div className="w-full flex flex-col gap-2">
                  <Select
                    label={
                      <div className="flex items-center gap-1">
                        <p>Marca:</p>
                      </div>
                    }
                    ref={this.refIdMarca}
                    value={idMarca}
                    onChange={this.handleSelectIdMarca}
                  >
                    <option value="">-- Selecciona --</option>
                    {marcas.map((item, index) => (
                      <option key={index} value={item.idMarca}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Unidad de medida y Categoria */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full flex flex-col gap-2">
                  <Select
                    label={
                      <div className="flex items-center gap-1">
                        <p>Unidad de Medida:</p> <FaAsterisk className="text-red-500" size={8} />
                      </div>
                    }
                    className={`${idMedida ? '' : 'is-invalid'}`}
                    ref={this.refIdMedida}
                    value={idMedida}
                    onChange={this.handleSelectIdMedida}
                  >
                    <option value="">-- Selecciona --</option>
                    {medidas.map((item, index) => (
                      <option key={index} value={item.idMedida}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-full flex flex-col gap-2">
                  <Select
                    label={
                      <div className="flex items-center gap-1">
                        <p>Categoría:</p> <FaAsterisk className="text-red-500" size={8} />
                      </div>
                    }
                    className={`form-control ${idCategoria ? '' : 'is-invalid'}`}
                    ref={this.refIdCategoria}
                    value={idCategoria}
                    onChange={this.handleSelectIdCategoria}
                  >
                    <option value="">-- Selecciona --</option>
                    {categorias.map((item, index) => (
                      <option key={index} value={item.idCategoria}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Forma de venta */}
            {
              [TIPO_PRODUCTO_NORMAL].includes(idTipoProducto) && (
                <div className="flex flex-col gap-3">
                  <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">3</span> FORMA DE VENTA
                  </h6>

                  <p>
                    Indica si va ser tratado como unidades, valor monetario o
                    granel(peso).
                  </p>

                  <div>
                    <RadioButton
                      className="form-check-inline"
                      id={UNIDADES}
                      value={UNIDADES}
                      name="ckTipoTratamiento"
                      checked={idTipoTratamiento === UNIDADES}
                      onChange={this.handleOptionTipoTratamiento}
                    >
                      Unidades
                    </RadioButton>

                    <RadioButton
                      className="form-check-inline"
                      id={VALOR_MONETARIO}
                      value={VALOR_MONETARIO}
                      name="ckTipoTratamiento"
                      checked={idTipoTratamiento === VALOR_MONETARIO}
                      onChange={this.handleOptionTipoTratamiento}
                    >
                      Valor monetario
                    </RadioButton>

                    <RadioButton
                      className="form-check-inline"
                      id={A_GRANEL}
                      value={A_GRANEL}
                      name="ckTipoTratamiento"
                      checked={idTipoTratamiento === A_GRANEL}
                      onChange={this.handleOptionTipoTratamiento}
                    >
                      A Granel
                    </RadioButton>
                  </div>
                </div>
              )
            }

            {/* Metodo de depreciación */}
            {
              [TIPO_PRODUCTO_ACTIVO_FIJO].includes(idTipoProducto) && (
                <div className="flex flex-col gap-3">
                  <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">4</span> Método de depreciación
                  </h6>

                  <p>
                    Indica el método de depreciación que se va a utilizar para el activo.
                  </p>

                  <div>
                    <RadioButton
                      className="form-check-inline"
                      id={LINEA_RECTA}
                      value={LINEA_RECTA}
                      name="rbMetodoDepreciacion"
                      checked={idMetodoDepreciacion === LINEA_RECTA}
                      onChange={this.handleOptionMetodoDepreciacion}
                    >
                      📉  Línea recta
                    </RadioButton>

                    <RadioButton
                      className="form-check-inline"
                      id={DIGITOS_DECRECIENTES}
                      value={DIGITOS_DECRECIENTES}
                      name="rbMetodoDepreciacion"
                      checked={idMetodoDepreciacion === DIGITOS_DECRECIENTES}
                      onChange={this.handleOptionMetodoDepreciacion}
                    >
                      📊 Dígitos decimales
                    </RadioButton>

                    <RadioButton
                      className="form-check-inline"
                      id={SUMA_DE_DIGITOS}
                      value={SUMA_DE_DIGITOS}
                      name="rbMetodoDepreciacion"
                      checked={idMetodoDepreciacion === SUMA_DE_DIGITOS}
                      onChange={this.handleOptionMetodoDepreciacion}
                    >
                      ⚡  Suma de dígitos
                    </RadioButton>
                  </div>

                  <div>
                    {idMetodoDepreciacion === LINEA_RECTA && (
                      <div className="flex flex-col gap-3">
                        <p className="text-gray-500">
                          Cuota fija anual igual durante toda la vida útil
                        </p>
                        <p className="text-orange-400">
                          Método seleccionado: Línea Recta (SL) — Depreciación = (Costo - Valor Residual) / Vida Útil
                        </p>
                      </div>
                    )}

                    {idMetodoDepreciacion === DIGITOS_DECRECIENTES && (
                      <div className="flex flex-col gap-3">
                        <p className="text-gray-500">
                          Mayor depreciación en primeros años
                        </p>
                        <p className="text-orange-400">
                          Método seleccionado: Doble Saldo Decreciente (DA) — Depreciación = Valor en Libros × (2 / Vida Útil)
                        </p>
                      </div>
                    )}

                    {idMetodoDepreciacion === SUMA_DE_DIGITOS && (
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
                </div>
              )
            }

            {/* Costo */}
            {
              ![TIPO_PRODUCTO_SERVICIO].includes(idTipoProducto) && (
                <div className="flex flex-col gap-3">
                  <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">4</span> COSTO
                  </h6>

                  <p>Indica el valor de costo de compra de tu producto.</p>

                  <div className="flex flex-col gap-2">
                    <Input
                      label={
                        <div className="flex items-center gap-1">
                          <p>Costo Inicial:</p> <FaAsterisk className="text-red-500" size={8} />
                        </div>
                      }
                      className={`${costo ? '' : 'is-invalid'}`}
                      placeholder="S/ 0.00"
                      ref={this.refCosto}
                      value={costo}
                      onChange={this.handleInputCosto}
                      onKeyDown={keyNumberFloat}
                    />
                  </div>
                </div>
              )
            }

            {/* Precio */}
            {
              ![TIPO_PRODUCTO_SERVICIO].includes(idTipoProducto) && (
                <div className="flex flex-col gap-3">
                  <h6 className="flex items-center gap-2">
                    <span className="badge badge-primary">5</span> PRECIO
                  </h6>

                  <p>Indica el valor de venta de tu producto.</p>

                  <div className="flex flex-col gap-2">
                    <Input
                      label={
                        <div className="flex items-center gap-1">
                          <p>Precio Base:</p> <FaAsterisk className="text-red-500" size={8} />
                        </div>
                      }
                      className={`${precio ? '' : 'is-invalid'}`}
                      placeholder=" S/ 0.00"
                      ref={this.refPrecio}
                      value={precio}
                      onChange={this.handleInputPrecio}
                      onKeyDown={keyNumberFloat}
                    />
                  </div>

                  <div>
                    {
                      precios.length !== 0 && (
                        <div className="bg-white rounded border overflow-hidden">
                          <div className="overflow-x-auto">
                            <table ref={this.refPrecios} className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">#</th>
                                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Quitar</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {
                                  precios.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td className="px-6 py-12 text-center">{item.id}</td>
                                        <td className="px-6 py-12 text-center">
                                          <Input
                                            placeholder="Ingrese el nombre del precio..."
                                            value={item.nombre}
                                            onChange={(event) =>
                                              this.handleInputNombrePrecios(event, item.id)
                                            }
                                          />
                                        </td>
                                        <td className="px-6 py-12 text-center">
                                          <Input
                                            placeholder="0.00"
                                            value={item.precio}
                                            onChange={(event) =>
                                              this.handleInputPrecioPrecios(event, item.id)
                                            }
                                            onKeyDown={keyNumberFloat}
                                          />
                                        </td>
                                        <td className="px-6 py-12 text-center">
                                          <Button
                                            className="btn-danger"
                                            onClick={() => this.handleRemovePrecios(item.id)}
                                          >
                                            <i className="fa fa-remove"></i>
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <Button className="text-success" onClick={this.handleAddPrecios}>
                      <i className="fa fa-plus-circle"></i> Agregar Lista de Precios
                    </Button>
                  </div>
                </div>
              )
            }

            {/* Descripción */}
            <div className="flex flex-col gap-3">
              <h6 className="flex items-center gap-2">
                <span className="badge badge-primary">6</span> DESCRIPCIÓN
              </h6>

              <p>Agregar un resumen del producto</p>

              <div className="flex flex-col gap-2">
                <TextArea
                  label={
                    <div className="flex items-center">
                      <p>Descripción Corta:</p>
                    </div>
                  }
                  rows={3}
                  ref={this.refDescripcionCorta}
                  value={descripcionCorta}
                  onChange={this.handleInputDescripcionCorta}
                />
              </div>

              <div className="flex flex-col gap-2">
                <TextArea
                  label={
                    <div className="flex items-center">
                      <p>Descripción Larga:</p>
                    </div>
                  }
                  rows={6}
                  ref={this.refDescripcionLarga}
                  value={descripcionLarga}
                  onChange={this.handleInputDescripcionLarga}
                />
              </div>
            </div>

            {/* Detalles */}
            <div className="flex flex-col gap-3">
              <h6 className="flex items-center gap-2">
                <span className="badge badge-primary">7</span> DETALLES O
                CARACTERISTICAS
              </h6>

              <p>Agregar la lista de caracteristicas</p>

              <div>
                {
                  detalles.length !== 0 && (
                    <div className="bg-white rounded border overflow-hidden mt-3">
                      <div className="overflow-x-auto">
                        <table ref={this.refDetalles} className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">#</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Nombre</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Valor</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Quitar</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detalles.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <tr className="px-6 py-12 text-center">{item.id}</tr>
                                  <tr className="px-6 py-12 text-center">
                                    <Input
                                      placeholder="Ejemplo (Medida)"
                                      value={item.nombre}
                                      onChange={(event) =>
                                        this.handleInputNombreDetalles(event, item.id)
                                      }
                                    />
                                  </tr>
                                  <tr className="px-6 py-12 text-center">
                                    <TextArea
                                      rows={6}
                                      placeholder="Ejemplo (100m x 200m)"
                                      value={item.valor}
                                      onChange={(event) =>
                                        this.handleInputValorDetalles(event, item.id)
                                      }
                                    />
                                  </tr>
                                  <tr className="px-6 py-12 text-center">
                                    <Button
                                      className="btn-danger"
                                      onClick={() => this.handleRemoveDetalles(item.id)}
                                    >
                                      <i className="fa fa-remove"></i>
                                    </Button>
                                  </tr>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }
              </div>

              <div>
                <Button className="text-success" onClick={this.handleAddDetalles}>
                  <i className="fa fa-plus-circle"></i> Agregar Detalles
                </Button>
              </div>
            </div>

            {/* Imagenes */}
            <div className="flex flex-col gap-3">
              <h6 className="flex items-center gap-2">
                <span className="badge badge-primary">8</span> IMAGENES
              </h6>

              <p>
                Agregar las imagenes que sean mas atractivas para el usuario.
                <b className="text-danger">
                  Las imagenes no debe superar los 500 KB.
                </b>
              </p>
              <p>
                Las imágenes deben tener un tamaño de <b>800 x 800 píxeles</b> para
                que se visualicen correctamente en la página web (formato
                recomendado *.webp).
              </p>

              <div>
                <ItemImage
                  imagenes={imagenes}
                  handleSelectImagenes={this.handleSelectImagenes}
                  handleRemoveImagenes={this.handleRemoveImagenes}
                />
              </div>
            </div>
          </div>

          {/* Parte de la imagen */}
          <div className="w-full md:w-2/5 flex flex-col gap-3">
            <DetalleImagen
              idTipoProducto={idTipoProducto}

              imagen={imagen}
              handleInputImagen={this.handleInputImagen}
              handleRemoveImagen={this.handleRemoveImagen}

              nombre={nombre}
              precio={precio}

              publicar={publicar}
              handleSelectPublico={this.handleSelectPublico}

              negativo={negativo}
              handleSelectNegativo={this.handleSelectNegativo}

              preferido={preferido}
              handleSelectPreferido={this.handleSelectPreferido}

              estado={estado}
              handleSelectEstado={this.handleSelectEstado}

              handleRegistrar={this.handleSaveProducto}
            />
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

ProductoAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedProductoAgregar = connect(
  mapStateToProps,
  null,
)(ProductoAgregar);

export default ConnectedProductoAgregar;
