import React from 'react';
import { PosContainerWrapper } from '../../../../../../components/Container';
import CustomComponent from '../../../../../../model/class/custom-component';
import {
  alertWarning,
  isEmpty,
  isText,
  numberFormat,
} from '../../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import {
  filtrarProducto,
  getIdCatalogo,
  updateCatalogo,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import PropTypes from 'prop-types';
import {
  SpinnerTransparent,
  SpinnerView,
} from '../../../../../../components/Spinner';
import Button from '../../../../../../components/Button';
import { ModalImpresion } from '../../../../../../components/MultiModal';
import Image from '../../../../../../components/Image';
import { images } from '../../../../../../helper';
import Search from '../../../../../../components/Search';
import Input from '../../../../../../components/Input';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class CatalogoEditar extends CustomComponent {
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

      // Atributos principales
      idCatalogo: '',
      nombre: '',

      // Detalle del catálogo
      detalles: [],

      // Filtrar producto
      loadingProducto: false,
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

    const url = this.props.location.search;
    const idCatalogo = new URLSearchParams(url).get('idCatalogo');

    if (isText(idCatalogo)) {
      await this.loadingData(idCatalogo);
    } else {
      this.close();
    }
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

  loadingData = async (id) => {
    const response = await getIdCatalogo(id, this.abortController.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Catálogo', response.getMessage(), () => {
        this.close();
      });
      return;
    }

    response instanceof SuccessReponse;
    const { cabecera, detalles } = response.data;

    this.setState({
      idCatalogo: id,
      nombre: cabecera.nombre,
      detalles,
      loading: false,
    });
  };

  close = () => {
    this.props.history.goBack();
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
      this.handleGuardar();
    }
  };

  //------------------------------------------------------------------------------------------
  // Filtrar productos
  //------------------------------------------------------------------------------------------

  handleClearInputProducto = () => {
    this.setState({
      productos: [],
      loadingProducto: false,
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
    });
  };

  handleRemoverProducto = (idProducto) => {
    const detalles = this.state.detalles.filter(
      (item) => item.idProducto !== idProducto,
    );
    this.setState({
      detalles,
    });
  };

  //------------------------------------------------------------------------------------------
  // Procesos guardar
  //------------------------------------------------------------------------------------------
  handleGuardar = async () => {
    const { idCatalogo, nombre, detalles, idSucursal, idUsuario } = this.state;

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
        idCatalogo: idCatalogo,
        nombre: nombre,
        idSucursal: idSucursal,
        idUsuario: idUsuario,
        productos: detalles,
      };

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await updateCatalogo(data);

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
  // Procesos impresión
  //------------------------------------------------------------------------------------------
  handleOpenImpresion = (idCatalogo) => {
    this.setState({ isOpenImpresion: true, idCatalogo: idCatalogo });
  };

  handleCloseImpresion = async () => {
    this.setState({ isOpenImpresion: false }, this.close());
  };

  //------------------------------------------------------------------------------------------
  // Procesos cerrar
  //------------------------------------------------------------------------------------------
  handleCerrar = () => {
    this.close();
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
            <div
              className="w-100 d-flex flex-column position-relative"
              style={{
                flex: '0 0 60%',
              }}
            >
              <div
                className="d-flex align-items-center px-3"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                <div className="d-flex">
                  <Button className="btn btn-link" onClick={this.handleCerrar}>
                    <i className="bi bi-arrow-left-short text-xl text-dark"></i>
                  </Button>
                </div>

                <div className="py-3 d-flex align-items-center">
                  <p className="h5 my-0 ml-0 mr-1">Editar catálogo</p>
                  <i className="fa fa-edit text-secondary"></i>
                </div>
              </div>

              <div
                className="px-3 py-3"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                <Search
                  ref={this.refProducto}
                  refInput={this.refProductoValue}
                  group={true}
                  iconLeft={<i className="bi bi-search"></i>}
                  onSearch={this.handleFilterProducto}
                  placeholder="Buscar..."
                  buttonRight={
                    <Button
                      className="btn-outline-secondary"
                      title="Limpiar"
                      onClick={() => {
                        this.refProducto.current.restart();
                        this.refProductoValue.current.focus();
                      }}
                    >
                      <i className="fa fa-close"></i>
                    </Button>
                  }
                />
              </div>

              <div
                className={
                  !isEmpty(this.state.productos)
                    ? 'px-3 h-100 overflow-auto p-3'
                    : 'px-3 h-100 overflow-auto d-flex flex-row justify-content-center align-items-center gap-4 p-3'
                }
                style={{
                  backgroundColor: '#f8fafc',
                }}
              >
                {this.state.loadingProducto && (
                  <div className="position-relative w-100 h-100 text-center">
                    <SpinnerTransparent
                      loading={true}
                      message={'Buscando productos...'}
                    />
                  </div>
                )}

                {!this.state.loadingProducto &&
                  isEmpty(this.state.productos) && (
                    <div className="text-center position-relative">
                      <i className="bi bi-list text-secondary text-2xl"></i>
                      <p className="text-secondary text-lg mb-0">
                        Use la barra de busqueda para encontrar su producto.
                      </p>
                    </div>
                  )}

                <div className="d-flex justify-content-center flex-wrap gap-4">
                  {this.state.productos.map((item, index) => (
                    <Button
                      key={index}
                      className="btn-light bg-white"
                      style={{
                        border: '1px solid #e2e8f0',
                        width: '16rem',
                      }}
                      onClick={() => this.handleSelectItemProducto(item)}
                    >
                      <div className="d-flex flex-column justify-content-center align-items-center p-3 text-center">
                        <Image
                          default={images.noImage}
                          src={item.imagen}
                          alt={item.nombre}
                          width={150}
                          height={150}
                          className="mb-2 object-contain"
                        />

                        <div className="d-flex justify-content-center align-items-center flex-column">
                          <p className="m-0 text-lg">{item.nombre}</p>
                          <p className="m-0 text-xl font-weight-bold">
                            {numberFormat(item.precio, this.state.codiso)}{' '}
                            <small>x {item.unidad}</small>
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/*  */}
            <div
              className="d-flex flex-column position-relative bg-white"
              style={{
                flex: '1 1 100%',
                borderLeft: '1px solid #cbd5e1',
              }}
            >
              <div
                className="d-flex justify-content-between align-items-center px-3"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                <div className="py-3">
                  <p className="h5 m-0">Resumen</p>
                </div>
              </div>

              <div
                className="d-flex flex-column px-3 pt-3"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                <div className="form-group">
                  <Input
                    placeholder="Ingrese el nombre del catálogo..."
                    value={this.state.nombre}
                    onChange={(event) => {
                      this.setState({ nombre: event.target.value });
                    }}
                    ref={this.refNombre}
                  />
                </div>
              </div>

              <div
                className={
                  isEmpty(this.state.detalles)
                    ? 'd-flex flex-column justify-content-center align-items-center p-3 text-center rounded h-100'
                    : 'd-flex flex-column text-center rounded h-100 overflow-auto'
                }
                style={{
                  backgroundColor: '#f8fafc',
                }}
              >
                {isEmpty(this.state.detalles) && (
                  <div className="text-center">
                    <i className="fa fa-shopping-basket text-secondary text-2xl"></i>
                    <p className="text-secondary text-lg mb-0">
                      Aquí verás los productos que elijas para tu catálogo
                    </p>
                  </div>
                )}

                {this.state.detalles.map((item, index) => (
                  <div
                    key={index}
                    className="d-grid px-3 position-relative align-items-center bg-white"
                    style={{
                      gridTemplateColumns: '80% 20%',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {/* Primera columna (imagen y texto) */}
                    <div className="d-flex align-items-center py-3">
                      <Image
                        default={images.noImage}
                        src={item.imagen}
                        alt={item.nombre}
                        width={80}
                        height={80}
                        className="object-contain"
                      />

                      <div className="p-3 text-left">
                        <p className="m-0 text-sm"> {item.codigo}</p>
                        <p className="m-0 text-base font-weight-bold text-break">
                          {item.nombre}
                        </p>
                        <p className="m-0">
                          {numberFormat(item.precio, this.state.codiso)}
                        </p>
                      </div>
                    </div>

                    {/* Segunda columna para quitar */}
                    <div className="d-flex flex-column justify-content-end align-items-center">
                      <div className="d-flex align-items-end justify-content-end gap-4">
                        <Button
                          className="btn-danger"
                          onClick={() =>
                            this.handleRemoverProducto(item.idProducto)
                          }
                        >
                          <i className="fa fa-minus"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="text-right text-xl font-bold d-flex flex-column p-3 gap-3"
                style={{ borderTop: '1px solid #e2e8f0' }}
              >
                <Button
                  className="btn-success w-100"
                  onClick={this.handleGuardar}
                >
                  <div className="d-flex justify-content-center align-items-center">
                    <i className="fa fa-save mr-2 text-xl"></i>{' '}
                    <p className="m-0 text-xl">Guardar</p>
                  </div>
                </Button>

                <div className="d-flex justify-content-between align-items-center text-secondary">
                  <p className="m-0 text-secondary">Cantidad:</p>
                  <p className="m-0 text-secondary">
                    {this.state.detalles.length === 1
                      ? this.state.detalles.length + ' Producto'
                      : this.state.detalles.length + ' Productos'}{' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PosContainerWrapper>
    );
  }
}

CatalogoEditar.propTypes = {
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
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  moneda: PropTypes.shape({
    codiso: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */

const ConnectedCatalogoEditar = connect(mapStateToProps, null)(CatalogoEditar);

export default ConnectedCatalogoEditar;
