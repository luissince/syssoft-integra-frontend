import React, { Component } from 'react';
import Button from '../../../../../components/Button';
import Column from '../../../../../components/Column';
import { CustomModalForm } from '../../../../../components/CustomModal';
import Input from '../../../../../components/Input';
import Row from '../../../../../components/Row';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';
import { alertKit } from 'alert-kit';
import { isNumeric } from '../../../../../helper/utils.helper';
import {
  getStockInventario,
  updateStockInventario,
} from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import { images } from '../../../../../helper';
import Image from '@/components/Image';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CustomModalStock extends Component {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Cargando datos...',

      nombre: '',
      imagen: null,
      stockMinimo: '',
      stockMaximo: '',
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refStockMaximo = React.createRef();
    this.refStockMinimo = React.createRef();
    this.refLote = React.createRef();

    this.peticion = false;
    this.abortController = null;
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

  loadDatos = async (producto) => {
    this.abortController = new AbortController();

    const params = {
      idInventario: producto.idInventario,
    };

    const response = await getStockInventario(
      params,
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState(
        {
          nombre: producto.producto,
          imagen: producto.imagen,
          stockMinimo: response.data.cantidadMinima,
          stockMaximo: response.data.cantidadMaxima,
          loading: false,
        },
        () => {
          this.refStockMinimo.current.focus();
        },
      );
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;
    }
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

  handleOnOpen = () => {};

  handleOnHidden = () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState(this.initial);
    this.peticion = false;
  };

  handleInputStockMinimo = (event) => {
    this.setState({ stockMinimo: event.target.value });
  };

  handleInputStockMaximo = (event) => {
    this.setState({ stockMaximo: event.target.value });
  };

  handleOnSubmit = () => {
    if (!isNumeric(this.state.stockMinimo)) {
      alertKit.warning(
        {
          title: 'Inventario',
          message: 'Ingrese el stock mínimo.',
        },
        () => {
          this.refStockMinimo.current.focus();
        },
      );
      return;
    }

    if (!isNumeric(this.state.stockMaximo)) {
      alertKit.warning(
        {
          title: 'Inventario',
          message: 'Ingrese el stock máximo.',
        },
        () => {
          this.refStockMaximo.current.focus();
        },
      );
      return;
    }

    alertKit.question(
      {
        title: 'Inventario',
        message: '¿Estás seguro de continuar?',
      },
      async (accept) => {
        if (accept) {
          const data = {
            stockMinimo: this.state.stockMinimo,
            stockMaximo: this.state.stockMaximo,
            idInventario: this.idInventario,
          };

          await this.refModal.current.handleOnClose();

          alertKit.loading({
            message: 'Procesando información...',
          });

          const response = await updateStockInventario(data);

          if (response instanceof SuccessReponse) {
            alertKit.success(
              {
                title: 'Inventario',
                message: response.data,
              },
              () => {
                this.props.handleSave();
              },
            );
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertKit.warning({
              title: 'Inventario',
              message: response.getMessage(),
            });
          }
        }
      },
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

  render() {
    const {
      loading,
      message,

      nombre,
      imagen,
      stockMinimo,
      stockMaximo,
    } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Stock"
        titleHeader="Actualizar Stock"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView loading={loading} message={message} />

            {/* Producto + Imagen */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {nombre}
              </h2>
              <Image
                default={images.noImage}
                src={imagen}
                alt={nombre}
                width={100}
                height={100}
                className="object-contain rounded-md border"
              />
            </div>

            {/* Formulario Stock */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese..."
                    ref={this.refStockMinimo}
                    value={stockMinimo}
                    onChange={this.handleInputStockMinimo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Máximo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese..."
                    ref={this.refStockMaximo}
                    value={stockMaximo}
                    onChange={this.handleInputStockMaximo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </>
        }
        footer={
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <i className="fa fa-save mr-2"></i> Guardar
            </button>
            <button
              type="button"
              onClick={async () => await this.refModal.current.handleOnClose()}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <i className="fa fa-close mr-2"></i> Cerrar
            </button>
          </div>
        }
      />
    );
  }
}

CustomModalStock.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
};

export default CustomModalStock;
