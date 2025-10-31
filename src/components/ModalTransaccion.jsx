import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader,
} from './CustomModal';
import { TbHandClick } from "react-icons/tb";
import { SpinnerView } from './Spinner';
import {
  keyNumberInteger,
  formatCurrency,
  isEmpty,
  isNumeric,
  validateNumericInputs,
  rounded,
} from '../helper/utils.helper';
import CustomComponent from '../model/class/custom-component';
import {
  ADELANTADO,
  CONTADO,
  CREDITO_FIJO,
  CREDITO_VARIABLE,
} from '../model/types/forma-pago';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { comboBanco } from '../network/rest/principal.network';
import SuccessReponse from '../model/class/response';
import ErrorResponse from '../model/class/error-response';
import { CANCELED } from '../model/types/types';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ModalTransaccion extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tipo: props.tipo || 'Transacción',
      title: props.title || 'Completar Transacción',
      etapa: '1',
      formaPago: null,
      bancos: [],
      bancosAgregados: [],
      numeroCuotas: '',
      frecuenciaPagoFijo: new Date().getDate() > 15 ? '30' : '15',
      frecuenciaPagoVariable: new Date().getDate() > 15 ? '30' : '15',
      importeTotal: 0.0,
      nota: '',
    };

    this.refModal = React.createRef();

    this.refMetodoPagoContenedor = React.createRef();
    this.refNumeroCuotas = React.createRef();
    this.refFrecuenciaPagoFijo = React.createRef();
    this.refFrecuenciaPagoVariable = React.createRef();
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

    this.setState({
      importeTotal: Number(rounded(this.props.importeTotal)),
      bancos,
      loading: false,
    });
  };

  onHidden = () => {
    this.setState({
      etapa: '1',
      formaPago: null,
      numeroCuotas: '',
      frecuenciaPagoFijo: new Date().getDate() > 15 ? '30' : '15',
      frecuenciaPagoVariable: new Date().getDate() > 15 ? '30' : '15',
      bancosAgregados: [],
    });
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

  handleSelectTipoPago = (tipo) => {
    this.setState({ etapa: "2", formaPago: tipo }, () => {
      if (this.state.formaPago === CONTADO) {
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

  handleSelectNumeroCuotas = (event) => {
    this.setState({ numeroCuotas: event.target.value });
  };

  handleSelectFrecuenciaPagoFijo = (event) => {
    this.setState({ frecuenciaPagoFijo: event.target.value });
  };

  handleSelectFrecuenciaPagoVariable = (event) => {
    this.setState({ frecuenciaPagoVariable: event.target.value });
  };

  handleInputNota = (event) => {
    this.setState({ nota: event.target.value });
  };

  handleAddBancosAgregados = (idBanco) => {
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

  handleRemoveItemBancosAgregados = (idBanco) => {
    const bancosAgregados = this.state.bancosAgregados.filter(
      (item) => item.idBanco !== idBanco,
    );
    this.setState({ bancosAgregados });
  };

  handleInputMontoBancosAgregados = (event, idBanco) => {
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

  handleProcessContado = async () => {
    console.log("handleProcessContado");
    const { formaPago, bancosAgregados, importeTotal, nota } = this.state;

    let metodoPagosLista = bancosAgregados.map((item) => ({ ...item }));

    if (isEmpty(metodoPagosLista)) {
      alertKit.warning({
        title: this.state.tipo,
        message: 'Tiene que agregar método de cobro para continuar.',
      });
      return;
    }

    if (metodoPagosLista.some((item) => !isNumeric(item.monto))) {
      alertKit.warning({
        title: this.state.tipo,
        message: 'Hay montos del metodo de cobro que no tiene valor.',
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
          message: 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.',
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
            message: 'El monto a cobrar es menor que el total.',
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
            message: 'El monto a cobrar debe ser igual al total.',
          }, () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }
      }
    }

    this.props.handleProcessContado(
      formaPago,
      metodoPagosLista,
      nota,
      async () => {
        await this.refModal.current.handleOnClose();
      },
    );
  };

  handleProcessCreditoFijo = async () => {
    const { formaPago, numeroCuotas, frecuenciaPagoFijo, importeTotal, nota } =
      this.state;

    if (!isNumeric(numeroCuotas)) {
      alertKit.warning({
        title: this.state.tipo,
        message: 'Ingrese el número de cuotas',
      }, () => {
        this.refNumeroCuotas.current.focus();
      });
      return;
    }

    if (parseFloat(numeroCuotas) < 1) {
      alertKit.warning({
        title: this.state.tipo,
        message: 'El número de cuotas no puede menor a 0',
      }, () => {
        this.refNumeroCuotas.current.focus();
      });
      return;
    }

    if (isEmpty(frecuenciaPagoFijo)) {
      alertKit.warning({
        title: this.state.tipo,
        message: 'Selecciona la frecuencia de cobros.',
      }, () => {
        this.refFrecuenciaPagoFijo.current.focus();
      });
      return;
    }

    this.props.handleProcessCredito(
      formaPago,
      numeroCuotas,
      frecuenciaPagoFijo,
      importeTotal,
      nota,
      async () => {
        await this.refModal.current.handleOnClose();
      },
    );
  };

  handleProcessCreditoVariable = async () => {
    // const {
    //   formaPago,
    //   idComprobante,
    //   idMoneda,
    //   idImpuesto,
    //   idCliente,
    //   idSucursal,
    //   idUsuario,
    //   comentario,
    //   nuevoCliente,
    //   bancosAgregados,
    //   importeTotal,
    // } = this.state;
    // const {detalleVenta} = this.props;
    /*
        let metodoPagoLista = [...bancosAgregados];
    
        if (isEmpty(metodoPagoLista)) {
          alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
          return;
        }
    
        if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
          alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.');
          return;
        }
    
        const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => {
          return (accumulator += parseFloat(item.monto));
        }, 0);
    
        if (metodoPagoLista.length > 1) {
          if (metodoCobroTotal !== importeTotal) {
            alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.');
            return;
          }
        } else {
          const metodo = metodoPagoLista[0];
          if (metodo.vuelto === 1) {
            if (metodoCobroTotal < importeTotal) {
              alertWarning('Venta', 'El monto a cobrar es menor que el total.');
              return;
            }
    
            metodoPagoLista.map((item) => {
              item.observacion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
              item.monto = importeTotal;
              return item;
            });
          } else {
            if (metodoCobroTotal !== importeTotal) {
              alertWarning('Venta', 'El monto a cobrar debe ser igual al total.');
              return;
            }
          }
        }
    
        alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
          if (accept) {
            const data = {
              idFormaPago: formaPago,
              idComprobante: idComprobante,
              idMoneda: idMoneda,
              idImpuesto: idImpuesto,
              idCliente: idCliente,
              idSucursal: idSucursal,
              comentario: comentario,
              idUsuario: idUsuario,
              estado: 1,
              nuevoCliente: nuevoCliente,
              detalleVenta: detalleVenta,
              bancosAgregados: bancosAgregados,
            };
    
            await this.props.refModal.current.handleOnClose()
            alertInfo('Venta', 'Procesando venta...');
    
            const response = await createVenta(data);
    
            if (response instanceof SuccessReponse) {
              alertSuccess('Venta', response.data.message, () => {
                this.handleOpenImpresion(response.data.idVenta);
              });
            }
    
            if (response instanceof ErrorResponse) {
              if (response.getBody() !== '') {
                const body = response.getBody().map((item) =>
                  `<tr>
                      <td>${item.nombre}</td>
                      <td>${formatDecimal(item.cantidadActual)}</td>
                      <td>${formatDecimal(item.cantidadReal)}</td>
                      <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                    </tr>`,
                );
    
                alertHTML('Venta',
                  `<div class="d-flex flex-column align-items-center">
                        <h5>Productos con cantidades faltantes</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad a Vender</th>
                                    <th>Cantidad de Inventario</th>
                                    <th>Cantidad Faltante</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${body}
                            </tbody>
                        </table>
                    </div>`,
                );
              } else {
                alertWarning('Venta', response.getMessage());
              }
            }
          }
        });*/
  };

  handleProcessAdelantado = async () => {
    // const {
    //   formaPago,
    //   idComprobante,
    //   idMoneda,
    //   idImpuesto,
    //   idCliente,
    //   idSucursal,
    //   idUsuario,
    //   comentario,
    //   nuevoCliente,
    //   bancosAgregados,
    //   importeTotal,
    // } = this.state;
    // const {detalleVenta} = this.props;
    /*
        let metodoPagoLista = [...bancosAgregados];
    
        if (isEmpty(metodoPagoLista)) {
          alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
          return;
        }
    
        if (metodoPagoLista.filter((item) => !isNumeric(item.monto)).length !== 0) {
          alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.');
          return;
        }
    
        const metodoCobroTotal = metodoPagoLista.reduce((accumulator, item) => {
          return (accumulator += parseFloat(item.monto));
        }, 0);
    
        if (metodoPagoLista.length > 1) {
          if (metodoCobroTotal !== importeTotal) {
            alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.');
            return;
          }
        } else {
          const metodo = metodoPagoLista[0];
          if (metodo.vuelto === 1) {
            if (metodoCobroTotal < importeTotal) {
              alertWarning('Venta', 'El monto a cobrar es menor que el total.');
              return;
            }
    
            metodoPagoLista.map((item) => {
              item.observacion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
              item.monto = importeTotal;
              return item;
            });
          } else {
            if (metodoCobroTotal !== importeTotal) {
              alertWarning('Venta', 'El monto a cobrar debe ser igual al total.');
              return;
            }
          }
        }
    
        alertDialog('Venta', '¿Estás seguro de continuar?', async (accept) => {
          if (accept) {
            const data = {
              idFormaPago: formaPago,
              idComprobante: idComprobante,
              idMoneda: idMoneda,
              idImpuesto: idImpuesto,
              idCliente: idCliente,
              idSucursal: idSucursal,
              comentario: comentario,
              idUsuario: idUsuario,
              estado: 1,
              nuevoCliente: nuevoCliente,
              detalleVenta: detalleVenta,
              bancosAgregados: bancosAgregados,
            };
    
            await this.props.refModal.current.handleOnClose()
            alertInfo('Venta', 'Procesando venta...');
    
            const response = await createVenta(data);
    
            if (response instanceof SuccessReponse) {
              alertSuccess('Venta', response.data.message, () => {
                this.handleOpenImpresion(response.data.idVenta);
              });
            }
    
            if (response instanceof ErrorResponse) {
              if (response.getBody() !== '') {
                const body = response.getBody().map((item) =>
                  `<tr>
                      <td>${item.nombre}</td>
                      <td>${formatDecimal(item.cantidadActual)}</td>
                      <td>${formatDecimal(item.cantidadReal)}</td>
                      <td>${formatDecimal(item.cantidadActual - item.cantidadReal)}</td>
                    </tr>`,
                );
    
                alertHTML('Venta',
                  `<div class="d-flex flex-column align-items-center">
                        <h5>Productos con cantidades faltantes</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad a Vender</th>
                                    <th>Cantidad de Inventario</th>
                                    <th>Cantidad Faltante</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${body}
                            </tbody>
                        </table>
                    </div>`,
                );
              } else {
                alertWarning('Venta', response.getMessage());
              }
            }
          }
        });*/
  };

  handleCobrar = () => {
    if (this.state.formaPago === CONTADO) {
      this.handleProcessContado();
    }

    if (this.state.formaPago === CREDITO_FIJO) {
      this.handleProcessCreditoFijo();
    }

    if (this.state.formaPago === CREDITO_VARIABLE) {
      this.handleProcessCreditoVariable();
    }

    if (this.state.formaPago === ADELANTADO) {
      this.handleProcessAdelantado();
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

    const total = parseFloat(importeTotal);

    if (isEmpty(bancosAgregados)) {
      return <h5 className="text-red-500">Agrega algún método de pago.</h5>;
    }

    const currentAmount = bancosAgregados.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    if (!bancosAgregados.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <div>
              <p className="text-gray-700">RESTANTE</p>
              <h4 className="text-green-700">{formatCurrency(currentAmount - total, codiso)}</h4>
            </div>
            <h6 className="text-danger">
              Más de dos metodos de pago no generan vuelto.
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
              Más de dos metodos de pago no generan vuelto.
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
            <h6 className="text-red-500">El método de pago no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <div>
              <p className="text-gray-700">POR COBRAR</p>
              <h4>{formatCurrency(total - currentAmount, codiso)}</h4>
            </div>
            <h6 className="text-red-500">El método de pago no genera vuelto.</h6>
          </>
        );
      }
    }
  };

  letraMensual = () => {
    const { importeTotal, numeroCuotas } = this.state;

    const total = parseFloat(importeTotal);
    if (!isNumeric(numeroCuotas) || numeroCuotas <= 0) return 0;
    return total / numeroCuotas;
  };

  render() {
    const { isOpen, disabledContado, disabledCreditoFijo, onClose, codiso } =
      this.props;

    const {
      loading,
      importeTotal,
      etapa,
      formaPago,
      bancos,
      bancosAgregados,
      numeroCuotas,
      frecuenciaPagoFijo,
      frecuenciaPagoVariable,
    } = this.state;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.onOpen}
        onHidden={this.onHidden}
        onClose={onClose}
        contentLabel={this.state.title}
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
                    <h6>Tipos de cobros</h6>
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
                    onClick={() => this.handleSelectTipoPago(CONTADO)}
                  >
                    <div>
                      <i className="bi bi-cash-coin fa-2x"></i>
                      <p>Contado</p>
                    </div>
                  </ButtonTipoPago>

                  {/* Crédito fijo*/}
                  <ButtonTipoPago
                    title="Pago al credito"
                    disabled={disabledCreditoFijo}
                    onClick={() => this.handleSelectTipoPago(CREDITO_FIJO)}
                  >
                    <div>
                      <i className="bi bi-boxes fa-2x"></i>
                      <p>Crédito Fijo</p>
                    </div>
                  </ButtonTipoPago>

                  {/* Crédito variable */}
                  {/* <ButtonTipoPago
                    title="Pago al credito"
                    onClick={() => handleSelectTipoPago(CREDITO_VARIABLE)}
                  >
                    <div>
                      <i className="bi bi-columns-gap fa-2x"></i>
                      <p>Crédito Variable</p>
                    </div>
                  </ButtonTipoPago> */}

                  {/* Pago adelantado */}
                  {/* <ButtonTipoPago
                    title="Pago al credito"
                    onClick={() => handleSelectTipoPago(ADELANTADO)}
                  >
                    <div>
                      <i className="bi bi-columns-gap fa-2x"></i>
                      <p>Pago Adelantado</p>
                    </div>
                  </ButtonTipoPago> */}
                </div>
              )
            }

            {
              etapa === '2' && (
                <>
                  {/* contado detalle */}
                  {formaPago === CONTADO && (
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
                  {formaPago === CREDITO_FIJO && (
                    <CreditoFijoView
                      refNumeroCuotas={this.refNumeroCuotas}
                      numeroCuotas={numeroCuotas}
                      handleSelectNumeroCuotas={this.handleSelectNumeroCuotas}

                      refFrecuenciaPagoFijo={this.refFrecuenciaPagoFijo}
                      frecuenciaPagoFijo={frecuenciaPagoFijo}
                      handleSelectFrecuenciaPagoFijo={this.handleSelectFrecuenciaPagoFijo}

                      letraMensual={this.letraMensual}
                    />
                  )}

                  {/* crédito variable */}
                  {formaPago === CREDITO_VARIABLE && (
                    <CreditoViableView
                      ref={this.refFrecuenciaPagoVariable}
                      value={frecuenciaPagoVariable}
                      onChange={this.handleSelectFrecuenciaPagoVariable}
                    />
                  )}

                  {/* <Row>
                    <Column className="col-12">
                      <TextArea
                        label={'Notas internas:'}
                        placeholder={'Ingrese alguna nota interna.'}
                        value={this.state.nota}
                        onChange={this.handleInputNota}
                      />
                    </Column>
                  </Row> */}
                </>
              )
            }

            {/* pago adelantado */}
            {/* {formaPago === ADELANTADO && (
            <div className="row">
              <div className="col">

                <div className="mb-3">
                  <span className="text-md">
                    <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                    Los pagos se efectúan de manera habitual; sin embargo, el inventario no se reduce, ya que se trata de un pago anticipado.
                  </span>
                </div>

              </div>
            </div>
          )} */}
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
                  onClick={this.onHidden}>
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

ModalTransaccion.propTypes = {
  tipo: PropTypes.string.isRequired,
  title: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  idSucursal: PropTypes.string.isRequired,
  disabledContado: PropTypes.bool,
  disabledCreditoFijo: PropTypes.bool,
  codiso: PropTypes.string.isRequired,
  importeTotal: PropTypes.number,

  onClose: PropTypes.func.isRequired,
  handleProcessContado: PropTypes.func,
  handleProcessCredito: PropTypes.func,
};

const ButtonTipoPago = ({ className, title, disabled, onClick, children }) => {
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
        {/* Botones para agregar métodos de pago */}
        <div className="w-full flex flex-col gap-3">
          <h6>Añadir Método de Pago</h6>

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

        {/* Lista de métodos de pago */}
        <div className="w-full flex flex-col gap-3" ref={refMetodoPagoContenedor}>
          <h6>Pagos Aplicados</h6>

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

const CreditoFijoView = ({
  refNumeroCuotas,
  numeroCuotas,
  handleSelectNumeroCuotas,

  refFrecuenciaPagoFijo,
  frecuenciaPagoFijo,
  handleSelectFrecuenciaPagoFijo,

  letraMensual
}) => {

  return (
    <div className="flex flex-col flex-wrap gap-3">
      <div>
        <span className="text-sm text-danger text-center">
          Los pagos se efectúan en función del número de cuotas, con
          una alerta que indica la frecuencia de los pagos.
        </span>
      </div>

      <div className="flex flex-row gap-3">
        <Input
          group={true}
          iconLeft={<i className="bi bi-hourglass-split"></i>}
          role={'float'}
          placeholder="Número de cuotas"
          ref={refNumeroCuotas}
          value={numeroCuotas}
          onChange={handleSelectNumeroCuotas}
          onKeyDown={keyNumberInteger}
        />

        <Select
          group={true}
          iconLeft={<i className="bi bi-credit-card-2-back"></i>}
          title="Lista frecuencia de pago"
          ref={refFrecuenciaPagoFijo}
          value={frecuenciaPagoFijo}
          onChange={handleSelectFrecuenciaPagoFijo}
        >
          <option value="">-- Frecuencia de pago --</option>
          <option value="15">Quinsenal</option>
          <option value="30">Mensual</option>
        </Select>
      </div>

      <div className="w-full text-center text-xl">
        {letraMensual()} {frecuenciaPagoFijo === '30'
          ? <><span className="text-xs text-gray-500">x MES</span></>
          : <><span className="text-xs text-gray-500">x SEMANA</span></>}
      </div>
    </div>
  );
};

const CreditoViableView = forwardRef(({ value, onChange }, ref) => {

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-3">
        <span className="text-sm">
          <i className="bi bi-info-circle text-success text-lg"></i>{' '}
          Los pagos se realizan de acuerdo con la frecuencia
          establecida, con alertas programadas para recordar las
          fechas de pago.
        </span>
      </div>

      <div className="mb-3">
        <Select
          group={true}
          iconLeft={<i className="bi bi-credit-card-2-back"></i>}
          title="Lista frecuencia de pago"
          ref={ref}
          value={value}
          onChange={onChange}
        >
          <option value="">-- Frecuencia de pago --</option>
          <option value="15">Quinsenal</option>
          <option value="30">Mensual</option>
        </Select>
      </div>
    </div>
  );
});

const MetodoPago = ({
  idBanco,
  name,
  monto,
  handleInputMontoBancosAgregados,
  handleRemoveItemBancosAgregados,
}) => {

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs">{name}:</span>
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

MetodoPago.propTypes = {
  idBanco: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  monto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputMontoBancosAgregados: PropTypes.func.isRequired,
  handleRemoveItemBancosAgregados: PropTypes.func.isRequired,
};

export default ModalTransaccion;
