import PropTypes from 'prop-types';
import Paginacion from '@/components/Paginacion';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentHeader,
  CustomModalContentScroll,
  CustomModalContentSubHeader,
} from '@/components/CustomModal';
import {
  currentDate,
  formatNumberWithZeros,
  formatTime,
  isEmpty,
  formatCurrency,
} from '@/helper/utils.helper';
import CustomComponent from '@/components/CustomComponent';
import { listVenta } from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';
import React from 'react';
import Search from '@/components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ModalVenta extends CustomComponent {

  /**
    * Inicializa un nuevo componente.
    * @param {Object} props - Las propiedades pasadas al componente.
    */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,

      buscar: "",
      lista: [],
      restart: false,
      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();

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

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0);
    await this.setStateAsync({ opcion: 0 });
  };

  searchText = async (text) => {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  };

  async searchOpciones() {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0);
        break;
      case 1:
        this.fillTable(1);
        break;
      case 2:
        this.fillTable(2);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '',) => {
    this.abortController = new AbortController();

    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: buscar,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idComprobante: '',
      estado: '0',
      idSucursal: this.props.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };
    const response = await listVenta(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        String(Math.ceil(Number(response.data.total) / this.state.filasPorPagina)),
      );

      this.peticion = true;
      this.abortController = null;

      this.setState({
        loading: false,
        lista: response.data.result,
        totalPaginacion: totalPaginacion,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
      });
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

  handleOnOpen = async () => {
    await this.loadInit();
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

  handleInputBuscar = (event) => {
    this.setState({ buscar: event.target.value });
  };

  handleFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value, }, () => {
      this.searchOpciones();
    });
  };

  handleFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value, }, () => {
      this.searchOpciones();
    });
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

  generateBody = () => {
    const { loading, lista } = this.state;
    const { handleSeleccionar } = this.props;

    if (loading) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Cargando información...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty(lista)) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <i className="bi bi-box text-4xl mb-3 block"></i>
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </td>
        </tr>
      );
    }

    return lista.map((item, index) => {
      const estado = <span className={cn(
        item.estado === 1 ? "text-success" :
          item.estado === 2 ? "text-warning" :
            item.estado === 3 ? "text-danger" :
              "text-primary"
      )}>
        {
          item.estado === 1 ? "COBRADO" :
            item.estado === 2 ? "POR COBRAR" :
              item.estado === 3 ? "ANULADO" :
                "POR LLEVAR"
        }
      </span>;

      return (
        <tr key={index} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.id}</td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {item.documento}
            <br />
            {item.informacion}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {item.comprobante}
            <br />
            {item.serie}-{formatNumberWithZeros(item.numeracion)}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900 text-center">{estado}</td>
          <td className="px-6 py-4 text-sm text-gray-900 text-center">
            {formatCurrency(item.total, item.codiso)}{' '}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900 text-center">
            <button
              className={
                cn(
                  "inline-flex items-center gap-2 px-3 py-1",
                  "bg-blue-600 text-white text-sm font-medium rounded",
                  "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition",
                )
              }
              title="Agregar Detalle"
              onClick={async () => {
                await this.refModal.current.handleOnClose();
                handleSeleccionar(item.idVenta)
              }}
            >
              <i className="fa fa-plus !text-lg"></i>
            </button>
          </td>
        </tr>
      );
    });
  };

  render() {
    const {
      loading,
      lista,
      totalPaginacion,
      paginacion,
      restart,
      fechaInicio,
      fechaFinal,
    } = this.state;

    const { isOpen, handleClose } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={handleClose}
        contentLabel="Modal de Venta"
        className={'modal-custom-lg h-[80%]'}
      >
        <CustomModalContentScroll>
          <CustomModalContentHeader contentRef={this.refModal}>
            Lista de Ventas
          </CustomModalContentHeader>

          <CustomModalContentSubHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-gray-600">
                  Puedes ver las ventas echas con diferentes filtros, por ejemplo: fechas de emisión, comprobante y estado.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full md:w-6/12">
                  <Search
                    group={true}
                    iconLeft={<i className="bi bi-search text-gray-400"></i>}
                    onSearch={this.searchText}
                    placeholder="Buscar por N° de Venta o Cliente..."
                    theme="modern"
                    buttonRight={
                      <Button
                        className="btn-outline-secondary"
                        title="Recargar"
                        onClick={this.loadInit}
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </Button>
                    }
                  />
                </div>

                <div className="w-full md:w-3/12">
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={this.handleFechaInicio}
                    className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="w-full md:w-3/12">
                  <input
                    type="date"
                    value={fechaFinal}
                    onChange={this.handleFechaFinal}
                    className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </CustomModalContentSubHeader>

          <CustomModalContentBody>
            <div className="bg-white rounded border overflow-auto h-full">
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[5%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                      <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="w-[5%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="w-[5%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {this.generateBody()}
                  </tbody>
                </table>
              </div>
            </div>
          </CustomModalContentBody>

          <CustomModalContentFooter className="footer-cm-table">
            <Paginacion
              loading={loading}
              data={lista}
              totalPaginacion={totalPaginacion}
              paginacion={paginacion}
              fillTable={this.paginacionContext}
              restart={restart}
              className="w-full md:px-4 py-2  overflow-auto"
              theme="modern"
            />
          </CustomModalContentFooter>
        </CustomModalContentScroll>
      </CustomModal>
    );
  }
}

ModalVenta.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  idSucursal: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSeleccionar: PropTypes.func.isRequired,
};

export default ModalVenta;
