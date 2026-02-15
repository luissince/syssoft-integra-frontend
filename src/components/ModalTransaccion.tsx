import React from 'react';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader,
} from './CustomModal';
import { TbHandClick } from "react-icons/tb";
import { SpinnerView } from './Spinner';
import {
  formatCurrency,
  isEmpty,
  isNumeric,
  validateNumericInputs,
  rounded,
} from '../helper/utils.helper';
import CustomComponent from '@/components/CustomComponent';
import {
  CONTADO,
  CREDITO,
} from '../model/types/forma-transaccion';
import { comboBanco } from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';
import ErrorResponse from '../model/class/error-response';
import { CANCELED } from '../constants/requestStatus';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { comboPlazo } from '@/network/rest/api-client';
import { FaRegHandPointDown } from 'react-icons/fa';

interface ModalTransaccionProps {
  tipo: string;
  title: string,
  isOpen: boolean,
  idSucursal: string,
  disabledContado?: boolean,
  disabledCredito?: boolean,
  codiso: string,
  importeTotal: number,

  onClose: () => void,
  handleProcessContado: (idFormaPago: string, metodoPagosLista: Array<any>, notaTransacion: string, callback: () => Promise<void>) => Promise<void>,
  handleProcessCredito: (idFormaPago: string, idPlazo: string, notaTransacion: string, callback: () => Promise<void>) => Promise<void>,
}

interface ModalTransaccionState {
  loading: boolean;
  tipo: string;
  title: string;
  etapa: string;
  idFormaPago: null | string;
  bancos: Array<any>,
  bancosAgregados: Array<any>,
  idPlazo: string,
  plazos: Array<any>,
  importeTotal: number,
  nota: string,
}

class ModalTransaccion extends CustomComponent<ModalTransaccionProps, ModalTransaccionState> {

  private initial: ModalTransaccionState;
  private refModal: React.RefObject<CustomModal>;
  private refMetodoPagoContenedor: React.RefObject<HTMLDivElement>;
  private refPlazo: React.RefObject<HTMLSelectElement>;
  private abortControllerView: AbortController;

  constructor(props: ModalTransaccionProps) {
    super(props);
    this.state = {
      loading: true,
      tipo: props.tipo || 'Transacción',
      title: props.title || 'Completar Transacción',
      etapa: '1',
      idFormaPago: null,
      bancos: [],
      bancosAgregados: [],
      idPlazo: '',
      plazos: [],
      importeTotal: 0.0,
      nota: '',
    };

    this.initial = { ...this.state };

    this.refModal = React.createRef();
    this.refMetodoPagoContenedor = React.createRef();
    this.refPlazo = React.createRef();

    this.abortControllerView = new AbortController();
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

  onOpen = async () => {
    this.setState({ loading: true });
    const bancos = await this.fetchComboBanco();
    const plazos = await this.fetchComboPlazo();

    this.setState({
      importeTotal: Number(rounded(this.props.importeTotal)),
      bancos,
      plazos,
      loading: false,
    });
  };

  onHidden = () => {
    this.setState(this.initial);
  };

  async fetchComboBanco() {
    const response = await comboBanco(
      this.props.idSucursal,
      this.abortControllerView.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchComboPlazo() {
    const response = await comboPlazo(this.abortControllerView.signal);

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

  handleSelectFormaTransaccion = (idFormaPago) => {
    this.setState({ etapa: "2", idFormaPago: idFormaPago }, () => {
      if (this.state.idFormaPago === CONTADO) {
        const metodo = this.state.bancos.find((item) => item.preferido === 1);

        if (metodo) {
          const item = {
            idBanco: metodo.idBanco,
            nombre: metodo.nombre,
            monto: '',
            vuelto: metodo.vuelto,
            observacion: '',
          };

          this.setState((prevState) => ({
            bancosAgregados: [...prevState.bancosAgregados, item],
          }));
        }
      }
    });
  };

  handleSelectPlazo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ idPlazo: event.target.value });
  };

  handleInputNota = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nota: event.target.value });
  };

  handleAddBancosAgregados = (idBanco: string) => {
    const listAdd = this.state.bancosAgregados.find(
      (item) => item.idBanco === idBanco,
    );

    if (listAdd) {
      return;
    }

    const metodo = this.state.bancos.find(
      (item) => item.idBanco === idBanco,
    );

    const item = {
      idBanco: metodo.idBanco,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      observacion: '',
    };

    this.setState((prevState) => ({
      bancosAgregados: [...prevState.bancosAgregados, item],
    }));
  };

  handleRemoveItemBancosAgregados = (idBanco: string) => {
    const bancosAgregados = this.state.bancosAgregados.filter(
      (item) => item.idBanco !== idBanco,
    );
    this.setState({ bancosAgregados });
  };

  handleInputMontoBancosAgregados = (event: React.ChangeEvent<HTMLInputElement>, idBanco: string) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      bancosAgregados: prevState.bancosAgregados.map((item) => {
        if (item.idBanco === idBanco) {
          return { ...item, monto: value ? value : '' };
        } else {
          return item;
        }
      }),
    }));
  };

  handleGoBack = () => {
    this.setState({
      etapa: '1',
      idFormaPago: null,
      bancosAgregados: [],
      idPlazo: '',
    });
  }

  handleProcessContado = async () => {
    const { idFormaPago, bancosAgregados, importeTotal, nota } = this.state;

    let metodoPagosLista = bancosAgregados.map((item) => ({ ...item }));

    if (isEmpty(metodoPagosLista)) {
      alertKit.warning({
        title: this.state.tipo,
        message: "Tiene que agregar método de transacción para continuar.",
      });
      return;
    }

    if (metodoPagosLista.some((item) => !isNumeric(item.monto))) {
      alertKit.warning({
        title: this.state.tipo,
        message: "Hay montos del metodo de transacción que no tiene valor.",
        primaryButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
      }, () => {
        validateNumericInputs(this.refMetodoPagoContenedor);
      });
      return;
    }

    const metodoCobroTotal = metodoPagosLista.reduce((accumulator, item) => (accumulator += Number(item.monto)), 0);

    if (metodoPagosLista.length > 1) {
      if (metodoCobroTotal !== importeTotal) {
        alertKit.warning({
          title: this.state.tipo,
          message: "Al tener mas de 2 métodos de transacción el monto debe ser igual al total.",
        }, () => {
          validateNumericInputs(this.refMetodoPagoContenedor);
        });
        return;
      }
    } else {
      const metodo = metodoPagosLista[0];
      if (metodo.vuelto === 1) {
        if (metodoCobroTotal < importeTotal) {
          alertKit.warning({
            title: this.state.tipo,
            message: "El monto a cobrar es menor que el total.",
          }, () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }

        metodoPagosLista.forEach((item) => {
          item.observacion = `Pago con ${rounded(Number(item.monto))} y su vuelto es ${rounded(Number(item.monto) - importeTotal)}`;
          item.monto = importeTotal;
        });
      } else {
        if (metodoCobroTotal !== importeTotal) {
          alertKit.warning({
            title: this.state.tipo,
            message: "El monto a cobrar debe ser igual al total.",
          }, () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }
      }
    }

    this.props.handleProcessContado(
      idFormaPago,
      metodoPagosLista,
      nota,
      async () => {
        await this.refModal.current.handleOnClose();
      },
    );
  };

  handleProcessCredito = async () => {
    const { idFormaPago, idPlazo, nota } =
      this.state;

    if (isEmpty(idPlazo)) {
      alertKit.warning({
        title: this.state.tipo,
        message: "Seleccione el plazo",
      }, () => {
        this.refPlazo.current.focus();
      });
      return;
    }

    this.props.handleProcessCredito(
      idFormaPago,
      idPlazo,
      nota,
      async () => {
        await this.refModal.current.handleOnClose();
      },
    );
  };

  handleCobrar = () => {
    if (this.state.idFormaPago === CONTADO) {
      this.handleProcessContado();
    }

    if (this.state.idFormaPago === CREDITO) {
      this.handleProcessCredito();
    }
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

  generarVuelto = () => {
    const { importeTotal, bancosAgregados } = this.state;
    const { codiso } = this.props;

    const total = importeTotal;

    if (isEmpty(bancosAgregados)) {
      return <h5 className="text-red-500">Agrega algún método de transacción.</h5>;
    }

    const currentAmount = bancosAgregados.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    if (bancosAgregados.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <div>
              <p className="text-gray-700">RESTANTE</p>
              <h4 className="text-green-700">{formatCurrency(currentAmount - total, codiso)}</h4>
            </div>
            <h6 className="text-danger">
              Más de dos metodos de transacción no generan vuelto.
            </h6>
          </>
        );
      } else {
        return (
          <>
            <div>
              <p className="text-gray-700">POR COBRAR</p>
              <h4 className="text-red-500">{formatCurrency(total - currentAmount, codiso)}</h4>
            </div>
            <h6 className="text-danger">
              Más de dos metodos de transacciones no generan vuelto.
            </h6>
          </>
        );
      }
    }

    const metodo = bancosAgregados[0];
    if (metodo.vuelto === 1) {
      if (currentAmount >= total) {
        return (
          <div>
            <p className="text-gray-700"> SU CAMBIO ES</p>
            <h4 className="text-green-700">{formatCurrency(currentAmount - total, codiso)}</h4>
          </div>
        );
      } else {
        return (
          <div>
            <p className="text-gray-700"> POR COBRAR</p>
            <h4 className="text-red-500">{formatCurrency(total - currentAmount, codiso)}</h4>
          </div>
        );
      }
    } else {
      if (currentAmount >= total) {
        return (
          <>
            <div>
              <p className="text-gray-700">RESTANTE</p>
              <h4>{formatCurrency(currentAmount - total, codiso)}</h4>
            </div>
            <h6 className="text-red-500">El método de transacción no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <div>
              <p className="text-gray-700">POR COBRAR</p>
              <h4>{formatCurrency(total - currentAmount, codiso)}</h4>
            </div>
            <h6 className="text-red-500">El método de transacción no genera vuelto.</h6>
          </>
        );
      }
    }
  };

  render() {
    const { isOpen, disabledContado, disabledCredito, onClose, codiso } =
      this.props;

    const { idPlazo, plazos } = this.state;

    const {
      loading,
      importeTotal,
      etapa,
      idFormaPago,
      bancos,
      bancosAgregados,
    } = this.state;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.onOpen}
        onHidden={this.onHidden}
        onClose={onClose}
        contentLabel={this.state.title}
        titleHeader={this.state.title}
        className="modal-custom-sm"
      >
        <CustomModalContentForm onSubmit={this.handleCobrar}>
          <CustomModalContentHeader contentRef={this.refModal}>
            {this.state.title}
          </CustomModalContentHeader>

          <CustomModalContentBody>
            <SpinnerView
              loading={loading}
              message={'Cargando datos...'}
            />

            {/* Título del total a cobrar */}
            {
              etapa === '2' && (
                <div className="text-center mb-3">
                  <h3 className="text-lg font-medium text-gray-700">
                    TOTAL
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(importeTotal, codiso)}
                  </p>
                </div>
              )
            }

            {/* Sun titulo */}
            {
              etapa === '1' && (
                <div className="flex flex-wrap">
                  <div className="w-3/12">
                    <hr />
                  </div>
                  <div className="w-1/2 flex items-center justify-center">
                    <h6>Tipos de Transacción</h6>
                  </div>
                  <div className="w-3/12">
                    <hr />
                  </div>
                </div>
              )
            }

            {/* Tipos de venta */}
            {
              etapa === '1' && (
                <div className="flex  gap-2">
                  {/* Al contado */}
                  <ButtonTipoPago
                    title={"Pago al contado"}
                    disabled={disabledContado}
                    onClick={() => this.handleSelectFormaTransaccion(CONTADO)}
                  >
                    <div>
                      <i className="bi bi-cash-coin fa-2x"></i>
                      <p>Contado</p>
                    </div>
                  </ButtonTipoPago>

                  {/* Crédito fijo*/}
                  <ButtonTipoPago
                    title="Pago al credito"
                    disabled={disabledCredito}
                    onClick={() => this.handleSelectFormaTransaccion(CREDITO)}
                  >
                    <div>
                      <i className="bi bi-boxes fa-2x"></i>
                      <p>Crédito</p>
                    </div>
                  </ButtonTipoPago>
                </div>
              )
            }

            {
              etapa === '2' && (
                <>
                  {/* contado detalle */}
                  {idFormaPago === CONTADO && (
                    <ContadoView
                      refMetodoPagoContenedor={this.refMetodoPagoContenedor}
                      bancosAgregados={bancosAgregados}
                      handleInputMontoBancosAgregados={this.handleInputMontoBancosAgregados}
                      handleRemoveItemBancosAgregados={this.handleRemoveItemBancosAgregados}

                      handleAddBancosAgregados={this.handleAddBancosAgregados}
                      bancos={bancos}
                      generarVuelto={this.generarVuelto}
                    />
                  )}

                  {/* crédito fijo */}
                  {idFormaPago === CREDITO && (
                    <CreditoView
                      plazos={plazos}
                      refPlazo={this.refPlazo}
                      idPlazo={idPlazo}
                      handleSelectPlazo={this.handleSelectPlazo}
                    />
                  )}
                </>
              )
            }
          </CustomModalContentBody>

          <CustomModalContentFooter
            className={
              cn(
                "flex p-3 border-t border-solid border-[#dee2e6]",
                etapa === '1' ? "justify-end" : "justify-between",
              )
            }
          >
            {
              etapa === '2' && (
                <Button
                  className="btn-light"
                  onClick={this.handleGoBack}>
                  <i className="fa fa-arrow-left"></i> Atras
                </Button>
              )
            }

            <div className="flex gap-x-3">
              {
                etapa === '2' && (
                  <Button
                    type="submit"
                    className="btn-success">
                    <i className="fa fa-save"></i> Registrar
                  </Button>
                )
              }
              <Button
                className="btn-danger"
                onClick={async () => await this.refModal.current.handleOnClose()}
              >
                <i className="fa fa-close"></i> Cancelar
              </Button>
            </div>
          </CustomModalContentFooter>
        </CustomModalContentForm>
      </CustomModal>
    );
  }
}

const ButtonTipoPago = ({ className, title, disabled, onClick, children }: {
  className?: string,
  title: string,
  disabled: boolean,
  onClick: () => void,
  children: React.ReactNode,
}) => {
  return (
    <Button
      className={cn(
        "btn-block btn-light w-full",
        className
      )}
      title={title}
      disabled={disabled}
      onClick={onClick} >
      {children}
    </Button>
  );
};

const ContadoView = ({
  refMetodoPagoContenedor,
  bancosAgregados,
  handleInputMontoBancosAgregados,
  handleRemoveItemBancosAgregados,

  handleAddBancosAgregados,

  bancos,
  generarVuelto,
}) => {

  return (
    <div className="flex flex-col gap-6">

      <div className="flex gap-3">
        {/* Botones para agregar métodos de transacción */}
        <div className="w-full flex flex-col gap-3">
          <h6>Añadir Método de Transacción</h6>

          <div className="flex flex-col gap-3">
            {bancos
              .filter(
                (item) => !bancosAgregados.map(b => b.idBanco).includes(item.idBanco)
              )
              .map((item, index) => (
                <Button
                  key={index}
                  className="btn-info !flex items-center justify-center gap-2"
                  onClick={() => handleAddBancosAgregados(item.idBanco)}
                >
                  <TbHandClick className="w-5 h-5" />
                  {item.nombre}
                </Button>
              ))}
          </div>
        </div>

        {/* Lista de métodos de transacción */}
        <div className="w-full flex flex-col gap-3" ref={refMetodoPagoContenedor}>
          <h6>Métodos de Transacción Aplicados</h6>

          {bancosAgregados.map((item, index) => (
            <MetodoPago
              key={index}
              idBanco={item.idBanco}
              name={item.nombre}
              monto={item.monto}
              handleInputMontoBancosAgregados={handleInputMontoBancosAgregados}
              handleRemoveItemBancosAgregados={handleRemoveItemBancosAgregados}
            />
          ))}
        </div>
      </div>

      <div className="w-full text-center">
        {generarVuelto()}
      </div>
    </div>
  );
};

const CreditoView = ({
  plazos,
  refPlazo,
  idPlazo,
  handleSelectPlazo,
}) => {

  return (
    <div className="flex flex-col flex-wrap gap-3">
      <div>
        <span className="text-sm text-danger text-center">
          Selecciona el plazo
        </span>
      </div>

      <div className="flex flex-row gap-3">
        <Select
          group={true}
          iconLeft={<i className="bi bi-credit-card-2-back"></i>}
          title="Lista plazos"
          ref={refPlazo}
          value={idPlazo}
          onChange={handleSelectPlazo}
        >
          <option value="">-- Plazo --</option>
          {plazos.map((item, index) => (
            <option key={index} value={item.idPlazo}>
              {item.nombre}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

const MetodoPago = ({
  idBanco,
  name,
  monto,
  handleInputMontoBancosAgregados,
  handleRemoveItemBancosAgregados,
}: {
  idBanco: string,
  name: string,
  monto: number,
  handleInputMontoBancosAgregados: (event: React.ChangeEvent<HTMLInputElement>, idBanco: string) => void,
  handleRemoveItemBancosAgregados: (idBanco: string) => void,
}) => {

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{name}</span>
        <FaRegHandPointDown />:
      </div>
      <Input
        autoFocus
        group={true}
        type="text"
        inputMode="decimal"
        // pattern="[0-9]*"
        enterKeyHint="done"
        role={'float'}
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoBancosAgregados(event, idBanco)}
        contentRight={
          <>
            <div className="input-group-append">
              <Button
                className="btn-outline-danger d-flex"
                title="Agregar Pago"
                onClick={() => handleRemoveItemBancosAgregados(idBanco)}
              >
                <i className="bi bi-trash3-fill"></i>
              </Button>
            </div>
          </>
        }
      />
    </div>
  );
};

export default ModalTransaccion;
