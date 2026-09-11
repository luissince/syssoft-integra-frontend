import React from 'react';
import CustomComponent from '@/components/CustomComponent';
import ContainerWrapper from '../../../../../../components/Container';
import { images } from '../../../../../../helper';
import {
  generateEAN13Code,
  imageBase64,
  isEmpty,
  isNumeric,
  isText,
  validateMany,
  validateNumericInputs,
} from '../../../../../../helper/utils.helper';
import {
  comboAlmacen,
  comboMedida,
  comboCategoria,
  getIdProducto,
  updateProducto,
  comboMarca,
  comboAtributoTipos,
} from '../../../../../../network/rest/principal.network';
import PropTypes from 'prop-types';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import { connect } from 'react-redux';
import DetalleImagen from '../component/DetalleImagen';
import {
  TIPO_TRATAMIENTO_PRODUCTO_NINGUNO
} from '../../../../../../model/types/tipo-tratamiento-producto';
import Title from '../../../../../../components/Title';
import { SpinnerView } from '../../../../../../components/Spinner';
import {
  TIPO_PRODUCTO_NORMAL,
  TIPO_PRODUCTO_SERVICIO
} from '../../../../../../model/types/tipo-producto';
import { alertKit } from 'alert-kit';
import DetalleInformacion from '../component/DetalleInformacion';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ProductoEditar extends CustomComponent {
  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTipoProducto: TIPO_PRODUCTO_NORMAL,
      idProducto: '',

      nombre: "",
      codigo: "",
      sku: "",
      codigoBarras: generateEAN13Code(),
      idMarca: "",
      idMedida: "",
      idCategoria: "",

      idTipoTratamientoProducto: TIPO_TRATAMIENTO_PRODUCTO_NINGUNO,
      costo: "",
      precio: "",

      descripcionCorta: "",
      descripcionLarga: "",

      precios: [],
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

      // Atributos
      atributos: [],
      atributosSeleccionados: [],

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
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

    this.abortController = new AbortController();
  }

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  componentDidMount() {
    const url = this.props.location.search;
    const idproducto = new URLSearchParams(url).get('idProducto');

    if (isText(idproducto)) {
      this.loadData(idproducto);
    } else {
      this.handleGoBack()
    }
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

  /**
   * @description Método que se ejecuta después de que el componente se haya montado en el DOM.
   */
  loadData = async (idProducto) => {
    const [medidas, categorias, marcas, atributos, producto] =
      await Promise.all([
        this.fetchComboMedida(),
        this.fetchComboCategoria(),
        this.fetchComboMarca(),
        this.fetchTiposAtributos(),
        this.fetchProducto(idProducto),
      ]);


    if (!producto) {
      alertKit.warning({
        title: 'Producto',
        message: 'No se encontró el producto.',
      });
      return;
    }

    await this.setStateAsync({
      idProducto: idProducto,

      idTipoProducto: producto.idTipoProducto,
      nombre: producto.nombre,
      codigo: producto.codigo,
      sku: producto.sku,
      codigoBarras: producto.codigoBarras,
      codigoSunat: producto.idCodigoSunat,
      idMedida: producto.idMedida,
      idCategoria: producto.idCategoria,
      idMarca: producto.idMarca,
      descripcionCorta: producto.descripcionCorta,
      descripcionLarga: producto.descripcionLarga,
      idTipoTratamientoProducto: producto.idTipoTratamientoProducto,
      precio: String(producto.precio),
      costo: String(producto.costo),
      publicar: producto.publicar === 1 ? true : false,
      negativo: producto.negativo === 1 ? true : false,
      preferido: producto.preferido === 1 ? true : false,
      estado: producto.estado === 1 ? true : false,

      precios: producto.precios,
      detalles: producto.detalles,
      imagenes: producto.imagenes,

      medidas,
      categorias,
      marcas,

      atributos,
      atributosSeleccionados: producto.atributos,

      imagen: producto.imagen ?? {
        url: images.noImage,
      },

      loading: false,
    });
  };

  async fetchProducto(id) {
    const response = await getIdProducto(id, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

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

  async fetchComboAlmacen() {
    const response = await comboAlmacen(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchTiposAtributos() {
    const response = await comboAtributoTipos(this.abortController.signal);

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

  handleSelectAtributo = (atributo) => {
    this.setState((prevState) => {
      const existe = prevState.atributosSeleccionados.some(
        (item) => item.idAtributo === atributo.idAtributo
      );

      if (existe) {
        return {
          atributosSeleccionados:
            prevState.atributosSeleccionados.filter(
              (item) => item.idAtributo !== atributo.idAtributo
            )
        };
      }
      return {
        atributosSeleccionados: [
          ...prevState.atributosSeleccionados,
          atributo
        ]
      };
    },()=>{
          console.log(this.state.atributosSeleccionados);

    });
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
      return;
    }

    const file = files[0];
    let url = URL.createObjectURL(file);
    const imageSend = await imageBase64(file);

    if (!imageSend) {
      alertKit.warning({
        title: 'Producto',
        message: 'Error en obtener la imagen.',
      });
      return;
    }

    if (imageSend.size > 500) {
      alertKit.warning({
        title: 'Producto',
        message: 'La imagen a subir tiene que ser menor a 500 KB.',
      });
      return;
    }

    this.setState({
      imagen: {
        ...imageSend,
        url: url,
      },
    });

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
  handleRegistrar = async () => {
    const {
      idProducto,
      idTipoProducto,
      nombre,
      codigo,
      sku,
      codigoBarras,
      idMedida,
      idCategoria,
      idMarca,
      idTipoTratamientoProducto,
      precio,
      costo,
      precios,
      detalles,
      descripcionCorta,
      descripcionLarga,

      imagenes,

      atributosSeleccionados,

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
        value: [TIPO_PRODUCTO_SERVICIO].includes(idTipoProducto) && precio,
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
      alertKit.loading({
        message: 'Procesando información...',
      });

      const data = {
        idProducto: idProducto,
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
        costo: costo,
        precio: precio,
        precios: precios,
        publicar: publicar,
        negativo: negativo,
        preferido: preferido,
        estado: estado,

        detalles: detalles,
        imagenes: imagenes,

        atributos: atributosSeleccionados,

        imagen: imagen,

        idUsuario: idUsuario,
      };

      const response = await updateProducto(data);
      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Producto',
          message: response.data,
        }, () => {
          this.handleGoBack();
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

  handleGoBack = () => {
    this.props.history.goBack();
  };

  /*
    |--------------------------------------------------------------------------
    | Método de cliclo de vida
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

      idTipoTratamientoProducto,

      costo,
      precio,

      descripcionCorta,
      descripcionLarga,
      detalles,
      imagenes,

      precios,
      medidas,
      categorias,
      marcas,

      atributos,
      atributosSeleccionados,

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
          message={msgLoading} />

        <Title
          title="Producto"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={this.handleGoBack}
        />

        <div className="flex flex-col md:flex-row gap-3">
          {/* Parte de los datos */}
          <DetalleInformacion
            idTipoProducto={idTipoProducto}
            handleOptionTipoProducto={this.handleOptionTipoProducto}

            refNombre={this.refNombre}
            nombre={nombre}
            handleInputNombre={this.handleInputNombre}

            refCodigo={this.refCodigo}
            codigo={codigo}
            handleInputCodigo={this.handleInputCodigo}

            refSku={this.refSku}
            sku={sku}
            handleInputSku={this.handleInputSku}

            refCodigoBarras={this.refCodigoBarras}
            codigoBarras={codigoBarras}
            handleInputCodigoBarras={this.handleInputCodigoBarras}
            handleChangeCodigoBarras={this.handleChangeCodigoBarras}

            refIdMarca={this.refIdMarca}
            idMarca={idMarca}
            marcas={marcas}
            handleSelectIdMarca={this.handleSelectIdMarca}

            refIdMedida={this.refIdMedida}
            idMedida={idMedida}
            medidas={medidas}
            handleSelectIdMedida={this.handleSelectIdMedida}

            refIdCategoria={this.refIdCategoria}
            idCategoria={idCategoria}
            categorias={categorias}
            handleSelectIdCategoria={this.handleSelectIdCategoria}

            idTipoTratamiento={idTipoTratamientoProducto}
            handleOptionTipoTratamiento={this.handleOptionTipoTratamiento}

            refCosto={this.refCosto}
            costo={costo}
            handleInputCosto={this.handleInputCosto}

            refPrecio={this.refPrecio}
            precio={precio}
            handleInputPrecio={this.handleInputPrecio}

            refPrecios={this.refPrecios}
            precios={precios}
            handleAddPrecios={this.handleAddPrecios}
            handleRemovePrecios={this.handleRemovePrecios}
            handleInputNombrePrecios={this.handleInputNombrePrecios}
            handleInputPrecioPrecios={this.handleInputPrecioPrecios}

            refDescripcionCorta={this.refDescripcionCorta}
            descripcionCorta={descripcionCorta}
            handleInputDescripcionCorta={this.handleInputDescripcionCorta}

            refDescripcionLarga={this.refDescripcionLarga}
            descripcionLarga={descripcionLarga}
            handleInputDescripcionLarga={this.handleInputDescripcionLarga}

            refDetalles={this.refDetalles}
            detalles={detalles}
            handleAddDetalles={this.handleAddDetalles}
            handleRemoveDetalles={this.handleRemoveDetalles}
            handleInputNombreDetalles={this.handleInputNombreDetalles}
            handleInputValorDetalles={this.handleInputValorDetalles}

            imagenes={imagenes}
            handleSelectImagenes={this.handleSelectImagenes}
            handleRemoveImagenes={this.handleRemoveImagenes}

            atributos={atributos}
            atributosSeleccionados={atributosSeleccionados}
            handleSelectAtributo={this.handleSelectAtributo}
          />

          {/* Parte de la imagen */}
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

            handleRegistrar={this.handleRegistrar}
          />
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

ProductoEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
const ConnectedProductoEditar = connect(mapStateToProps, null)(ProductoEditar);

export default ConnectedProductoEditar;
