import Column from '../../../../../components/Column';
import { CustomModalForm } from '../../../../../components/CustomModal';
import Row from '../../../../../components/Row';
import { SpinnerView } from '../../../../../components/Spinner';
import {
  keyNumberInteger,
  numberFormat,
  isEmpty,
  isNumeric,
  alertWarning,
  validateNumericInputs,
  rounded,
  alertDialog,
  alertInfo,
  alertSuccess,
  formatDecimal,
  alertHTML,
} from '../../../../../helper/utils.helper';
import CustomComponent from '../../../../../model/class/custom-component';
import { ADELANTADO, CONTADO, CREDITO_FIJO, CREDITO_VARIABLE } from '../../../../../model/types/forma-pago';
import PropTypes from 'prop-types';
import { SERVICIO } from '../../../../../model/types/tipo-tratamiento-producto';
import React from 'react';
import { comboBanco, createVenta } from '../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import Select from '../../../../../components/Select';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalCobrar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      formaPago: CONTADO,
      bancos: [],
      bancosAgregados: [],
      numeroCuotas: '',
      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',
      importeTotal: 0.0,
    }

    this.refMetodoPagoContenedor = React.createRef();
    this.refNumeroCuotas = React.createRef();
    this.refFrecuenciaPagoCredito = React.createRef();
    this.refFrecuenciaPago = React.createRef();
    this.refMetodoContado = React.createRef();
    this.abortControllerView = new AbortController();
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
    this.setState({ loading: true })
    const bancos = await this.fetchComboBanco();

    const { detalleVenta } = this.props;

    const importeTotal = detalleVenta.reduce((accumulator, item) => {
      const cantidad = item.idTipoTratamientoProducto === SERVICIO
        ? item.cantidad
        : item.inventarios.reduce((acc, current) => acc + current.cantidad, 0);

      const totalProductPrice = item.precio * cantidad;
      return accumulator + totalProductPrice;
    }, 0)

    const metodo = bancos.find((item) => item.preferido === 1);

    this.refMetodoContado.current.value = metodo ? metodo.idBanco : '';

    if (metodo) {
      const item = {
        idBanco: metodo.idBanco,
        nombre: metodo.nombre,
        monto: '',
        vuelto: metodo.vuelto,
        descripcion: '',
      }

      this.setState((prevState) => ({
        bancosAgregados: [...prevState.bancosAgregados, item],
      }))
    }

    this.setState({ importeTotal, bancos, loading: false });
  }

  onHidden = () => {
    this.setState({
      formaPago: CONTADO,

      frecuenciaPagoCredito: new Date().getDate() > 15 ? '30' : '15',
      numeroCuotas: '',

      frecuenciaPago: new Date().getDate() > 15 ? '30' : '15',

      bancosAgregados: [],
    })
  }

  async fetchComboBanco() {
    const response = await comboBanco(
      this.props.idSucursal,
      this.abortControllerView.signal
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
    this.setState({ formaPago: tipo });
  }

  handleSelectNumeroCuotas = (event) => {
    this.setState({ numeroCuotas: event.target.value });
  }

  handleSelectFrecuenciaPagoCredito = (event) => {
    this.setState({ frecuenciaPagoCredito: event.target.value });
  }

  handleSelectFrecuenciaPago = (event) => {
    this.setState({ frecuenciaPago: event.target.value });
  }

  handleAddBancosAgregados = () => {
    const listAdd = this.state.bancosAgregados.find((item) => item.idBanco === this.refMetodoContado.current.value);

    if (listAdd) {
      return;
    }

    const metodo = this.state.bancos.find((item) => item.idBanco === this.refMetodoContado.current.value,);

    const item = {
      idBanco: metodo.idBanco,
      nombre: metodo.nombre,
      monto: '',
      vuelto: metodo.vuelto,
      descripcion: '',
    };

    this.setState((prevState) => ({
      bancosAgregados: [...prevState.bancosAgregados, item],
    }));
  }

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
  }

  handleProcessContado = async () => {
    const {
      formaPago,
      bancosAgregados,
      importeTotal,
    } = this.state;

    const {
      nuevoCliente,
      comentario,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      detalleVenta
    } = this.props;

    let metodoPagosLista = bancosAgregados.map(item => ({ ...item }));

    if (isEmpty(metodoPagosLista)) {
      alertWarning('Venta', 'Tiene que agregar método de cobro para continuar.');
      return;
    }

    if (metodoPagosLista.some((item) => !isNumeric(item.monto))) {
      alertWarning('Venta', 'Hay montos del metodo de cobro que no tiene valor.', () => {
        validateNumericInputs(this.refMetodoPagoContenedor);
      });
      return;
    }

    const metodoCobroTotal = metodoPagosLista.reduce((accumulator, item) => accumulator += parseFloat(item.monto), 0);

    if (metodoPagosLista.length > 1) {
      if (metodoCobroTotal !== importeTotal) {
        alertWarning('Venta', 'Al tener mas de 2 métodos de cobro el monto debe ser igual al total.', () => {
          validateNumericInputs(this.refMetodoPagoContenedor);
        });
        return;
      }
    } else {
      const metodo = metodoPagosLista[0];
      if (metodo.vuelto === 1) {
        if (metodoCobroTotal < importeTotal) {
          alertWarning('Venta', 'El monto a cobrar es menor que el total.', () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
          return;
        }

        metodoPagosLista.forEach(item => {
          item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
          item.monto = importeTotal;
        });
      } else {
        if (metodoCobroTotal !== importeTotal) {
          alertWarning('Venta', 'El monto a cobrar debe ser igual al total.', () => {
            validateNumericInputs(this.refMetodoPagoContenedor);
          });
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
          bancosAgregados: metodoPagosLista,
        };

        await this.props.refModal.current.handleOnClose()
        alertInfo('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data.message, () => {
            this.props.handleOpenImpresion(response.data.idVenta);
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
    });
  };

  handleProcessCreditoFijo = async () => {
    const {
      formaPago,
      numeroCuotas,
      frecuenciaPagoCredito,
      importeTotal
    } = this.state;


    const {
      nuevoCliente,
      comentario,
      idUsuario,
      idSucursal,
      idCliente,
      idImpuesto,
      idMoneda,
      idComprobante,
      detalleVenta
    } = this.props;

    if (!isNumeric(numeroCuotas)) {
      alertWarning("Venta", "Ingrese el número de cuotas", () => {
        this.refNumeroCuotas.current.focus()
      })
      return;
    }

    if (parseFloat(numeroCuotas) < 1) {
      alertWarning("Venta", "El número de cuotas no puede menor a 0", () => {
        this.refNumeroCuotas.current.focus()
      })
      return;
    }

    if (isEmpty(frecuenciaPagoCredito)) {
      alertWarning("Venta", "Selecciona la frecuencia de cobros.", () => {
        this.refFrecuenciaPagoCredito.current.focus()
      })
      return;
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
          estado: 2,
          nuevoCliente: nuevoCliente,
          detalleVenta: detalleVenta,
          numCuotas: numeroCuotas,
          frecuenciaPagoCredito: frecuenciaPagoCredito,
          importeTotal: importeTotal
        };

        await this.props.refModal.current.handleOnClose()
        alertInfo('Venta', 'Procesando venta...');

        const response = await createVenta(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Venta', response.data.message, () => {
            this.props.handleOpenImpresion(response.data.idVenta);
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
    });
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
              item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
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
              item.descripcion = `Pago con ${rounded(parseFloat(item.monto))} y su vuelto es ${rounded(parseFloat(item.monto) - importeTotal)}`;
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
      return <h5>Agrega algún método de pago.</h5>;
    }

    const currentAmount = bancosAgregados.reduce((accumulator, item) => {
      accumulator += item.monto ? parseFloat(item.monto) : 0;
      return accumulator;
    }, 0);

    if (!bancosAgregados.length > 1) {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codiso)}</span>
            </h5>
            <h6 className="text-danger">
              Más de dos metodos de pago no generan vuelto.
            </h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
            </h5>
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
          <h5>
            SU CAMBIO ES: <span>{numberFormat(currentAmount - total, codiso)}</span>
          </h5>
        );
      } else {
        return (
          <h5 className="text-danger">
            POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
          </h5>
        );
      }
    } else {
      if (currentAmount >= total) {
        return (
          <>
            <h5>
              RESTANTE: <span>{numberFormat(currentAmount - total, codiso)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
          </>
        );
      } else {
        return (
          <>
            <h5>
              POR COBRAR: <span>{numberFormat(total - currentAmount, codiso)}</span>
            </h5>
            <h6 className="text-danger">El método de pago no genera vuelto.</h6>
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
  }

  render() {
    const {
      refModal,
      isOpen,
      onClose,
      codiso,
    } = this.props;

    const {
      loading,
      importeTotal,
      formaPago,
      bancos,
      bancosAgregados,
      numeroCuotas,
      frecuenciaPagoCredito,
      frecuenciaPago
    } = this.state;

    return (
      <CustomModalForm
        contentRef={refModal}
        isOpen={isOpen}
        onOpen={this.onOpen}
        onHidden={this.onHidden}
        onClose={onClose}
        contentLabel="Modal de Cobro"
        titleHeader="Completar Venta"
        onSubmit={this.handleCobrar}
        body={
          <>
            <SpinnerView
              loading={loading}
              message={'Cargando datos...'}
            />

            {/* Titutlo del modal */}
            <Row>
              <Column>
                <div className="text-center">
                  <h5>
                    TOTAL A COBRAR: <span>{numberFormat(importeTotal, codiso)}</span>
                  </h5>
                </div>
              </Column>
            </Row>

            {/* Sun titulo */}
            <Row>
              <Column className="col-md-4 col-sm-4">
                <hr />
              </Column>
              <Column className="col-md-4 col-sm-4 d-flex align-items-center justify-content-center">
                <h6 className="mb-0">Tipos de cobros</h6>
              </Column>
              <Column className="col-md-4 col-sm-4">
                <hr />
              </Column>
            </Row>

            {/* Tipos de venta */}
            <Row>
              {/* Al contado */}
              <Column className="col-md-6 col-sm-12">
                <div className="form-group">
                  <Button
                    className={`${formaPago === CONTADO ? 'btn-primary' : 'btn-light'} btn-block`}
                    title="Pago al contado"
                    onClick={() => this.handleSelectTipoPago(CONTADO)}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <i className="bi bi-cash-coin fa-2x"></i>
                      </div>
                    </div>
                    <div className="text-center">
                      <label>Contado</label>
                    </div>
                  </Button>
                </div>
              </Column>

              {/* Crédito fijo*/}
              <Column className="col-md-6 col-sm-12">
                <Button
                  className={`${formaPago === CREDITO_FIJO ? 'btn-primary' : 'btn-light'} btn-block`}
                  title="Pago al credito"
                  onClick={() => this.handleSelectTipoPago(CREDITO_FIJO)}>
                  <Row>
                    <Column className="col-md-12">
                      <i className="bi bi-boxes fa-2x"></i>
                    </Column>
                  </Row>
                  <div className="text-center">
                    <label>Crédito fijo</label>
                  </div>
                </Button>
              </Column>

              {/* Crédito variable */}
              {/* <div className="col-md-3 col-sm-3">
              <button
                className={`btn ${formaPago === CREDITO_VARIABLE ? 'btn-primary' : 'btn-light'
                  } btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoPago(CREDITO_VARIABLE)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-columns-gap fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Crédito variable</label>
                </div>
              </button>
            </div> */}

              {/* Pago adelantado */}
              {/* <div className="col-md-3 col-sm-3">
              <button
                className={`btn ${formaPago === ADELANTADO ? 'btn-primary' : 'btn-light'
                  } btn-block`}
                type="button"
                title="Pago al credito"
                onClick={() => handleSelectTipoPago(ADELANTADO)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <i className="bi bi-columns-gap fa-2x"></i>
                  </div>
                </div>
                <div className="text-center">
                  <label>Pago Adelantado</label>
                </div>
              </button>
            </div> */}
            </Row>

            {/* contado detalle */}
            {formaPago === CONTADO && (
              <Row >
                <Column refChildren={this.refMetodoPagoContenedor}>
                  <div className="form-group">
                    <h6>Lista de métodos:</h6>
                    {bancosAgregados.map((item, index) => (
                      <MetodoPago
                        key={index}
                        idBanco={item.idBanco}
                        name={item.nombre}
                        monto={item.monto}
                        handleInputMontoBancosAgregados={this.handleInputMontoBancosAgregados}
                        handleRemoveItemBancosAgregados={this.handleRemoveItemBancosAgregados}
                      />
                    ))}
                  </div>
                </Column>

                <Column className="col-12">
                  <div className="form-group">
                    <label>Agregar método de cobro:</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-tag-fill"></i>
                        </div>
                      </div>
                      <Select
                        title="Lista metodo de cobro"
                        refSelect={this.refMetodoContado}>
                        {bancos.map((item, index) => (
                          <option key={index} value={item.idBanco}>
                            {item.nombre}
                          </option>
                        ))}
                      </Select>
                      <div className="input-group-append">
                        <Button
                          className="btn-outline-success d-flex"
                          title="Agregar Pago"
                          onClick={this.handleAddBancosAgregados}
                          icono={<i className="bi bi-plus-circle-fill"></i>}
                        />
                      </div>
                    </div>
                  </div>
                </Column>

                <Column className="col-12">
                  <br />
                </Column>

                <Column className="col-12">
                  <div className="text-center">{this.generarVuelto()}</div>
                </Column>
              </Row>
            )}

            {/* crédito fijo */}
            {formaPago === CREDITO_FIJO && (
              <Row>
                <Column>

                  <div className="form-group">
                    <span className="text-md">
                      <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                      Los pagos se efectúan en función del número de
                      cuotas, con una alerta que indica la frecuencia de
                      los pagos.
                    </span>
                  </div>

                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-hourglass-split"></i>
                        </div>
                      </div>
                      <Input
                        title="Número de cuotas"
                        placeholder="Número de cuotas"
                        reduce={this.refNumeroCuotas}
                        value={numeroCuotas}
                        onChange={this.handleSelectNumeroCuotas}
                        onKeyDown={keyNumberInteger}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-credit-card-2-back"></i>
                        </div>
                      </div>
                      <Select
                        title="Lista frecuencia de pago"
                        refSelect={this.refFrecuenciaPagoCredito}
                        value={frecuenciaPagoCredito}
                        onChange={this.handleSelectFrecuenciaPagoCredito}>
                        <option value="">-- Frecuencia de pago --</option>
                        <option value="15">Quinsenal</option>
                        <option value="30">Mensual</option>
                      </Select>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-coin"></i>
                        </div>
                      </div>
                      <Input
                        placeholder="0.00"
                        value={this.letraMensual()}
                        disabled={true}
                      />
                    </div>
                  </div>
                </Column>
              </Row>
            )}

            {/* crédito variable */}
            {formaPago === CREDITO_VARIABLE && (
              <Row>
                <Column>
                  <div className="form-group">
                    <span className="text-md">
                      <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                      Los pagos se realizan de acuerdo con la frecuencia
                      establecida, con alertas programadas para recordar
                      las fechas de pago.
                    </span>
                  </div>

                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="bi bi-credit-card-2-back"></i>
                        </div>
                      </div>
                      <Select
                        title="Lista frecuencia de pago"
                        ref={this.refFrecuenciaPago}
                        value={frecuenciaPago}
                        onChange={this.handleSelectFrecuenciaPago}
                      >
                        <option value="">-- Frecuencia de pago --</option>
                        <option value="15">Quinsenal</option>
                        <option value="30">Mensual</option>
                      </Select>
                    </div>
                  </div>
                </Column>
              </Row>
            )}

            {/* pago adelantado */}
            {/* {formaPago === ADELANTADO && (
            <div className="row">
              <div className="col">

                <div className="form-group">
                  <span className="text-md">
                    <i className="bi bi-info-circle text-success text-lg"></i>{' '}
                    Los pagos se efectúan de manera habitual; sin embargo, el inventario no se reduce, ya que se trata de un pago anticipado.
                  </span>
                </div>

              </div>
            </div>
          )} */}
          </>
        }
        footer={
          <>
            <Button
              type="submit"
              className="btn-primary"
              text={"Completar venta"}
            />

            <Button
              className="btn-danger"
              onClick={async () => await refModal.current.handleOnClose()}
              text={"Cerrar"}
            />
          </>
        }
      />
    );
  }
};

const MetodoPago = ({
  idBanco,
  name,
  monto,
  handleInputMontoBancosAgregados,
  handleRemoveItemBancosAgregados,
}) => {
  return (
    <div className="input-group mb-2">
      <Input
        autoFocus={true}
        role={"float"}
        placeholder="Monto"
        value={monto}
        onChange={(event) => handleInputMontoBancosAgregados(event, idBanco)}
      />
      <div className="input-group-prepend">
        <div className="input-group-text">
          <span>{name}</span>
        </div>
      </div>
      <div className="input-group-append">
        <Button
          className="btn-outline-danger d-flex"
          title="Agregar Pago"
          onClick={() => handleRemoveItemBancosAgregados(idBanco)}
          icono={<i className="bi bi-trash3-fill"></i>}
        />
      </div>
    </div>
  );
};

ModalCobrar.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idSucursal: PropTypes.string.isRequired,
  nuevoCliente: PropTypes.object,
  comentario: PropTypes.string.isRequired,
  idUsuario: PropTypes.string.isRequired,
  idCliente: PropTypes.string.isRequired,
  idImpuesto: PropTypes.string.isRequired,
  idMoneda: PropTypes.string.isRequired,
  idComprobante: PropTypes.string.isRequired,
  codiso: PropTypes.string.isRequired,
  detalleVenta: PropTypes.array.isRequired,
  handleOpenImpresion: PropTypes.func.isRequired
}

MetodoPago.propTypes = {
  idBanco: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  monto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputMontoBancosAgregados: PropTypes.func.isRequired,
  handleRemoveItemBancosAgregados: PropTypes.func.isRequired,
}

export default ModalCobrar;
