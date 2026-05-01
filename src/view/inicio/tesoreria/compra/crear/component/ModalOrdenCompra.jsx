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
import Button from '@/components/Button';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import { listOrdenCompra } from '@/network/rest/principal.network';
import { cn } from '@/lib/utils';
import React from 'react';
import Search from '@/components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ModalOrdenCompra extends CustomComponent {

  /**
  * Inicializa un nuevo componente.
  * @param {Object} props - Las propiedades pasadas al componente.
  */
  constructor(props) {

    /**
     * Inicializa un nuevo componente.
     * @param {Object} props - Las propiedades pasadas al componente.
     */
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

    // Guardar el estado inicial para poder restablecerlo cuando se cierre el modal
    this.initial = { ...this.state };

    // Referencia al modal
    this.refModal = React.createRef();

    // Anular las peticiones
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

    await this.setStateAsync({ paginacion: 1, restart: true, buscar: text });
    this.fillTable(1);
    await this.setStateAsync({ opcion: 1 });
  };

  searchOpciones = async () => {
    if (this.state.loading) return;

    if (this.state.fechaInicio > this.state.fechaFinal) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(2);
    await this.setStateAsync({ opcion: 2 });
  };

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

  fillTable = async (opcion) => {
    this.abortController = new AbortController();

    this.setState({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
    });

    const params = {
      opcion: opcion,
      buscar: this.state.buscar,
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idSucursal: this.props.idSucursal,
      ligado: -1,
      estado: 1,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const { success, data, message, type } = await listOrdenCompra(params, this.abortController.signal);


    if (!success) {
      if (type === CANCELED) return;

      this.peticion = false;
      this.abortController = null;

      this.setState({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: message,
      });
    }
    const totalPaginacion = parseInt(
      String(Math.ceil(Number(data.total) / this.state.filasPorPagina)),
    );

    this.peticion = true;
    this.abortController = null;

    this.setState({
      loading: false,
      lista: data.result,
      totalPaginacion: totalPaginacion,
    });
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

  handleFechaInicio = (event) => {
    this.setState({
      fechaInicio: event.target.value,
    }, () => {
      this.searchOpciones();
    });
  };

  handleFechaFinal = (event) => {
    this.setState({
      fechaFinal: event.target.value,
    }, () => {
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
          <td colSpan={9} className="px-6 py-12 text-center">
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
          <td colSpan={9} className="px-6 py-12 text-center">
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
      return (
        <tr key={index} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
            {item.id}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {item.fecha}
            <br />
            {formatTime(item.hora)}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            <div className="text-xs text-gray-500">{item.tipoDocumento} - {item.documento}</div>
            <div className="text-sm  uppercase">{item.informacion}</div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {item.comprobante}
            <br />
            <span className="font-mono">{item.serie}-{formatNumberWithZeros(item.numeracion)}</span>
          </td>
          <td className="px-6 py-4 text-center">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                item.estado === 1 && "bg-green-100 text-green-800",
                item.estado === 0 && "bg-red-100 text-red-800",
              )}
            >
              {
                item.estado === 1 ? "ACTIVO" : "ANULADO"
              }
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                item.ligado === 0 ? "bg-gray-500 text-white" : "bg-green-500 text-white",
              )}
            >
              {item.ligado}
            </span>
          </td>
          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
            {formatCurrency(item.total, item.codiso)}
          </td>
          <td className="px-6 py-4 text-center">
            <button
              className={
                cn(
                  "p-2 rounded-md text-sm font-medium transition",
                  "text-blue-600 bg-white",
                  "hover:bg-blue-50 hover:text-blue-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "active:bg-blue-100 active:scale-[0.97]",
                  "disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed",
                )
              }
              title="Seleccionar"
              onClick={async () => {
                await this.refModal.current.handleOnClose();
                handleSeleccionar(item);
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
            Orden de Compras
          </CustomModalContentHeader>

          <CustomModalContentSubHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-gray-600">
                  Puedes ver las ordenes de compra echas con diferentes filtros, por ejemplo: fechas de emisión, comprobante y estado.
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
                      <button
                        onClick={this.loadInit}
                        className="flex items-center justify-center px-3 h-full border-gray-300 hover:bg-gray-400 rounded-e"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
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
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">#</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-widerw-[10%] ">Fecha</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Comprobante</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Proveedor</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Estado</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Ligado</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Total</th>
                      <th className="px-6 py-3 ttext-xs font-medium text-gray-500 uppercase tracking-wider w-[5%] text-center">Seleccionar</th>
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

ModalOrdenCompra.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  idSucursal: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSeleccionar: PropTypes.func.isRequired,
};

export default ModalOrdenCompra;
