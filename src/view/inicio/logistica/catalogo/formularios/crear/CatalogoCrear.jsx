import React from 'react';
import { PosContainerWrapper } from '../../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import { isEmpty } from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import {
  createCatalogo,
  filtrarProducto,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import PropTypes from 'prop-types';
import {
  SpinnerView,
} from '../../../../../../components/Spinner';
import {
  clearCrearCatalogo,
  setCrearCatalogoLocal,
  setCrearCatalogoState,
} from '../../../../../../redux/predeterminadoSlice';
import { ModalImpresion } from '../../../../../../components/MultiModal';
import Input from '../../../../../../components/Input';
import { alertKit } from 'alert-kit';
import ProductSelectorPanel from '@/components/ProductSelectorPanel';
import { Plus } from 'lucide-react';
import ProductTransactionPanel from '@/components/ProductTransactionPanel';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CatalogoCrear extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      // Atributos de carga
      loading: true,
      msgLoading: 'Cargando datos...',

      loadingProducto: false,
      loadingProductoMessage: 'Cargando productos...',
      emptyProductoMessage: 'Use la barra de busqueda para encontrar su producto.',

      // Atributos principales
      idCatalogo: '',
      nombre: '',

      // Detalle del catálogo
      detalles: [],

      // Filtrar producto
      productos: [],

      // Atributos libres
      codiso: this.props.moneda.codiso ?? '',

      // Atributos del modal producto
      isOpenProducto: false,

      // Atributos del modal cliente
      isOpenPersona: false,

      // Atributos del modal impresión
      isOpenImpresion: false,

      // Id principales
      idUsuario: this.props.token.userToken.idUsuario,
      idSucursal: this.props.token.project.idSucursal,
    };

    // Valores iniciales
    this.initial = { ...this.state };

    // Referencias
    this.refNombre = React.createRef();

    // Filtrar producto
    this.refProducto = React.createRef();
    this.refProductoValue = React.createRef();

    // Referencia para el modal impresión
    this.refModalImpresion = React.createRef();

    //Anular las peticiones
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
    document.addEventListener('keydown', this.handleDocumentKeyDown);

    await this.loadData();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);

    this.abortController.abort();

    alertKit.close();
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

  loadData = async () => {
    const catalogoCrear = this.props.catalogoCrear;
    if (catalogoCrear && catalogoCrear.state && catalogoCrear.local) {
      this.setState(catalogoCrear.state, () => {

      });
    } else {
      this.setState({
        loading: false,
      }, () => {
        this.updateReduxState();
      });
    }
  };

  updateReduxState() {
    this.props.setCrearCatalogoState(this.state);
    this.props.setCrearCatalogoLocal({});
  }

  clearView = async () => {
    this.setState(this.initial, async () => {
      await this.refProducto.current.restart();
      await this.props.clearCrearCatalogo();
      await this.loadData();

      this.refProductoValue.current.focus();

      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchFiltrarProductos(params) {
    const response = await filtrarProducto(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
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

  handleDocumentKeyDown = (event) => {
    if (event.key === 'F1') {
      this.handleRegister();
    }

    if (event.key === 'F2') {
      this.handleClear();
    }
  };

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      loadingProducto: false,
    }, () => {
      this.updateReduxState();
    });
  };

  handleFilterProducto = async (text) => {
    const searchWord = text;

    if (isEmpty(searchWord)) {
      this.setState({ productos: [], loadingProducto: false });
      return;
    }

    this.setState({ loadingProducto: true });

    const params = {
      filtrar: searchWord,
    };

    const productos = await this.fetchFiltrarProductos(params);

    this.setState({
      loadingProducto: false,
      productos: productos,
    });
  };

  handleSelectItemProducto = (producto) => {
    const exits = this.state.detalles.some(
      (item) => item.idProducto === producto.idProducto,
    );
    if (exits) {
      return;
    }

    this.setState({
      detalles: [...this.state.detalles, producto],
    }, () => {
      this.updateReduxState();
    });
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter(
      (item) => item.idProducto !== idProducto,
    );
    this.setState({
      detalles,
    }, () => {
      this.updateReduxState();
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleRegister = async () => {
    const { nombre, detalles, idSucursal, idUsuario } = this.state;

    if (isEmpty(nombre)) {
      alertKit.warning({
        title: 'Catálogo',
        message: 'Ingrese el nombre del catálogo.',
      }, () => {
        this.refNombre.current.focus();
      });
      return;
    }

    if (isEmpty(detalles)) {
      alertKit.warning({
        title: 'Catálogo',
        message: 'Agregar algún producto a la lista.',
      }, () => {
        this.refProductoValue.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Catálogo',
      message: '¿Estás seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        nombre: nombre,
        idSucursal: idSucursal,
        idUsuario: idUsuario,
        productos: detalles,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await createCatalogo(data);

      if (response instanceof SuccessReponse) {
        alertKit.close(() => {
          this.handleOpenImpresion(response.data.idCatalogo);
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Catálogo',
          message: response.getMessage(),
        });
      }
    }
  };

  //------------------------------------------------------------------------------------------
  // Procesos limpiar
  //------------------------------------------------------------------------------------------
  handleClear = async () => {
    const accept = await alertKit.question({
      title: 'Catálogo',
      message: '¿Estás seguro de limpiar el catálogo?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      await this.clearView();
    }
  };

  //------------------------------------------------------------------------------------------
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCatalogo) => {
    this.setState({ isOpenImpresion: true, idCatalogo: idCatalogo });
  };


  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false });
  };

  //------------------------------------------------------------------------------------------
  // Procesos cerrar
  //------------------------------------------------------------------------------------------
  handleCerrar = () => {
    this.props.history.goBack();
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

  render() {
    return (
      <PosContainerWrapper className={'flex-column bg-white'}>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <ModalImpresion
          message="Se guardó correctamente su catalogo"
          subTitle="Para imprimir el documento debe hacerlo en la sección de detalle."
          buttonTitle="Terminar proceso"
          refModal={this.refModalImpresion}
          isOpen={this.state.isOpenImpresion}
          clear={this.clearView}
          handleClose={this.handleCloseImpresion}
        />

        <div className="bg-white w-100 h-100 d-flex flex-column overflow-auto">
          <div className="d-flex w-100 h-100">
            {/*  */}
            <ProductSelectorPanel
              type="precio"
              title="Catálogo"
              icon={<Plus className="h-4 w-4" />}
              loadingProducto={this.state.loadingProducto}
              loadingMessage={this.state.loadingProductoMessage}
              emptyMessage={this.state.emptyProductoMessage}
              productos={this.state.productos}
              codiso={this.state.codiso}
              refProducto={this.refProducto}
              refProductoValue={this.refProductoValue}
              handleCerrar={this.handleCerrar}
              handleFilterProducto={this.handleFilterProducto}
              handleSelectItemProducto={this.handleSelectItemProducto}
            />

            {/* PANEL RIGHT */}
            <ProductTransactionPanel
              type="catalog"
              emptyMessage="Aquí verás los productos que elijas en tu próximo catálogo."

              components={[
                <Input
                  placeholder="Ingrese el nombre del catálogo..."
                  value={this.state.nombre}
                  onChange={(event) => {
                    this.setState({ nombre: event.target.value });
                  }}
                  ref={this.refNombre}
                />
              ]}

              detalles={this.state.detalles}
              codiso={this.state.codiso}

              actions={[
                {
                  icon: <i className="bi bi-three-dots-vertical text-xl text-secondary" />,
                  onClick: this.handleClear,
                  title: "Opciones",
                }
              ]}

              handleRemoverProducto={this.handleRemoverProducto}

              handleRegister={this.handleRegister}
            />
          </div>
        </div>
      </PosContainerWrapper>
    );
  }
}

CatalogoCrear.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  moneda: PropTypes.shape({
    codiso: PropTypes.string.isRequired,
  }).isRequired,
  catalogoCrear: PropTypes.shape({
    state: PropTypes.object,
    local: PropTypes.object,
  }),
  setCrearCatalogoState: PropTypes.func,
  setCrearCatalogoLocal: PropTypes.func,
  clearCrearCatalogo: PropTypes.func,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    catalogoCrear: state.predeterminado.catalogoCrear,
    moneda: state.predeterminado.moneda,
  };
};

const mapDispatchToProps = {
  clearCrearCatalogo,
  setCrearCatalogoLocal,
  setCrearCatalogoState,
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCatalogoCrear = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CatalogoCrear);

export default ConnectedCatalogoCrear;
