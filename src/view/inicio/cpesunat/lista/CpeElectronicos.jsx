import React from 'react';
import {
  formatTime,
  currentDate,
  limitarCadena,
  isEmpty,
  formatNumberWithZeros,
  isText,
  guId,
  getPathNavigation,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  anularBoletaCpeSunat,
  anularFacturaCpeSunat,
  comboComprobante,
  comboSucursal,
  documentsPdfInvoicesGuiaRemision,
  documentsPdfInvoicesVenta,
  enviarEmail,
  facturarCpeSunat,
  guiaRemisionCpeSunat,
  listCpeSunat,
  obtenerXmlSunat,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import {
  VENTA,
  GUIA_DE_REMISION,
  NOTA_DE_CREDITO,
} from '../../../../model/types/tipo-comprobante';
import { SpinnerTable, SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableResponsive,
  TableRow,
} from '../../../../components/Table';
import Select from '../../../../components/Select';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import Search from '../../../../components/Search';
import {
  setListaCpeSunatData,
  setListaCpeSunatPaginacion,
} from '../../../../redux/predeterminadoSlice';
import pdfVisualizer from 'pdf-visualizer';
import { downloadFileAsync } from '../../../../redux/downloadSlice';
import { toastKit, ToastStyle } from 'toast-kit';
import { Link } from 'react-router-dom';
import DropdownActions from '../../../../components/DropdownActions';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class CpeElectronicos extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      initialLoad: true,
      initialMessage: 'Cargando datos...',

      loading: false,
      lista: [],
      restart: false,

      // viewPdf: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[0].estado,
      // ),
      // viewXml: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[1].estado,
      // ),
      // viewEmail: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[2].estado,
      // ),
      // ViewResumenDiario: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[3].estado,
      // ),
      // viewDeclarar: statePrivilegio(
      //   this.props.token.userToken.menus[7].submenu[0].privilegio[4].estado,
      // ),

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
      idComprobante: '',
      estado: '0',

      comprobantes: [],
      sucursales: [],

      buscar: '',

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: 'Cargando información...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refPaginacion = React.createRef();

    this.refSearch = React.createRef();

    this.abortControllerTable = new AbortController();
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
    const url = this.props.location.search;
    const comprobante = new URLSearchParams(url).get('comprobante');
    if (isText(comprobante)) {
      this.setState({ buscar: comprobante });
    }

    await this.loadingData();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
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

  loadingData = async () => {
    if (
      this.props.cpeSunatLista &&
      this.props.cpeSunatLista.data &&
      this.props.cpeSunatLista.paginacion
    ) {
      this.setState(this.props.cpeSunatLista.data);
      this.refPaginacion.current.upperPageBound =
        this.props.cpeSunatLista.paginacion.upperPageBound;
      this.refPaginacion.current.lowerPageBound =
        this.props.cpeSunatLista.paginacion.lowerPageBound;
      this.refPaginacion.current.isPrevBtnActive =
        this.props.cpeSunatLista.paginacion.isPrevBtnActive;
      this.refPaginacion.current.isNextBtnActive =
        this.props.cpeSunatLista.paginacion.isNextBtnActive;
      this.refPaginacion.current.pageBound =
        this.props.cpeSunatLista.paginacion.pageBound;
      this.refPaginacion.current.messagePaginacion =
        this.props.cpeSunatLista.paginacion.messagePaginacion;

      this.refSearch.current.initialize(this.props.cpeSunatLista.data.buscar);
    } else {
      const [facturado, notaCredito, guiaRemision, sucursales] =
        await Promise.all([
          this.fetchComprobante(VENTA),
          this.fetchComprobante(NOTA_DE_CREDITO),
          this.fetchComprobante(GUIA_DE_REMISION),
          this.fetchSucursal(),
        ]);

      const comprobantes = [...facturado, ...notaCredito, ...guiaRemision];

      const sucursal = sucursales.find(
        (item) => item.idSucursal === this.props.token.project.idSucursal,
      );

      this.setState(
        {
          idSucursal: sucursal.idSucursal,
          comprobantes: comprobantes,
          sucursales: sucursales,
          initialLoad: false,
        },
        async () => {
          this.loadingInit();
          this.updateReduxState();
        },
      );
    }
  };

  updateReduxState() {
    this.props.setListaCpeSunatData(this.state);
    this.props.setListaCpeSunatPaginacion({
      upperPageBound: this.refPaginacion.current.upperPageBound,
      lowerPageBound: this.refPaginacion.current.lowerPageBound,
      isPrevBtnActive: this.refPaginacion.current.isPrevBtnActive,
      isNextBtnActive: this.refPaginacion.current.isNextBtnActive,
      pageBound: this.refPaginacion.current.pageBound,
      messagePaginacion: this.refPaginacion.current.messagePaginacion,
    });
  }

  async fetchComprobante(tipo) {
    const params = {
      tipo: tipo,
      idSucursal: this.state.idSucursal,
    };

    const response = await comboComprobante(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchSucursal() {
    const response = await comboSucursal(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  loadingInit = async () => {
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

    await this.setStateAsync({ paginacion: 1, restart: false });
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
        this.fillTable(1, this.state.buscar);
        break;
      case 2:
        this.fillTable(2);
        break;
      default:
        this.fillTable(0);
    }
  };

  fillTable = async (opcion, buscar = '') => {
    this.setState({
      loading: true,
      lista: [],
      messageTable: 'Cargando información...',
    });

    const params = {
      opcion: opcion,
      buscar: buscar.trim(),
      fechaInicio: this.state.fechaInicio,
      fechaFinal: this.state.fechaFinal,
      idComprobante: this.state.idComprobante,
      estado: this.state.estado,
      idSucursal: this.state.idSucursal,
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    const response = await listCpeSunat(
      params,
      this.abortControllerTable.signal,
    );

    if (response instanceof SuccessReponse) {
      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
      );

      this.setState(
        {
          loading: false,
          lista: response.data.result,
          totalPaginacion: totalPaginacion,
        },
        () => {
          this.updateReduxState();
        },
      );
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

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

  handleInputFechaInicio = (event) => {
    this.setState({ fechaInicio: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleInputFechaFinal = (event) => {
    this.setState({ fechaFinal: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectComprobante = (event) => {
    this.setState({ idComprobante: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.value }, () => {
      this.searchOpciones();
    });
  };

  handleSelectSucursal = (event) => {
    this.setState({ idSucursal: event.target.value }, async () => {
      const facturado = await this.fetchComprobante(VENTA);
      const notaCredito = await this.fetchComprobante(NOTA_DE_CREDITO);
      const guiaRemision = await this.fetchComprobante(GUIA_DE_REMISION);

      const comprobantes = [...facturado, ...notaCredito, ...guiaRemision];

      this.setState({ comprobantes });
      this.loadingInit();
    });
  };

  handleSendFacturar = (idVenta) => {
    alertKit.question({
      title: 'Cpe Sunat',
      message: '¿Está seguro de enviar el comprobante electrónico?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await facturarCpeSunat(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertKit.success({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description
              }, () => {
                this.onEventPaginacion();
              });
            } else {
              alertKit.warning({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              });
            }
          } else {
            alertKit.warning({
              title: 'Cpe Sunat',
              message: 'Código ' + code + ' ' + description,
            });
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: 'Cpe Sunat',
            message: response.getMessage()
          });
        }
      }
    },
    );
  };

  handleSendResumenDiario = (idVenta, comprobante) => {
    alertKit.question({
      title: 'Cpe Sunat',
      message: `¿Está seguro de anular el comprobante electrónico ${comprobante}, se va hacer un resumen diario?`,
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await anularBoletaCpeSunat(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertKit.success({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              }, () => {
                this.onEventPaginacion();
              },
              );
            } else {
              alertKit.warning({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              });
            }
          } else {
            alertKit.warning({
              title: 'Cpe Sunat',
              message: 'Código ' + code + ' ' + description,
            });
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.warning({
            title: 'Cpe Sunat',
            message: response.getMessage()
          });
        }
      }
    },
    );
  };

  handleSendComunicacionDeBaja = (idVenta, comprobante) => {
    alertKit.question({
      title: 'Cpe Sunat',
      message: `¿Está seguro de anular el comprobante electrónico ${comprobante}, se va hacer una comunicación de baja?`,
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await anularFacturaCpeSunat(idVenta);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertKit.success({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              }, () => {
                this.onEventPaginacion();
              },
              );
            } else {
              alertKit.warning({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              });
            }
          } else {
            alertKit.warning({
              title: 'Cpe Sunat',
              message: 'Código ' + code + ' ' + description,
            });
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.error({
            title: 'Cpe Sunat',
            message: response.getMessage()
          });
        }
      }
    },
    );
  };

  handleSendGuiaRemision = (idGuiaRemision) => {
    alertKit.question({
      title: 'Cpe Sunat',
      message: '¿Está seguro de enviar el comprobante electrónico?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await guiaRemisionCpeSunat(idGuiaRemision);

        if (response instanceof SuccessReponse) {
          const { state, accept, code, description } = response.data;

          if (state) {
            if (accept) {
              alertKit.success({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              }, () => {
                this.onEventPaginacion();
              },
              );
            } else {
              alertKit.warning({
                title: 'Cpe Sunat',
                message: 'Código ' + code + ' ' + description,
              });
            }
          } else {
            alertKit.warning({
              title: 'Cpe Sunat',
              message: 'Código ' + code + ' ' + description,
            });
          }
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertKit.error({
            title: 'Cpe Sunat',
            message: response.getMessage()
          });
        }
      }
    },
    );
  };

  handleOpenPrinter = async (idComprobante, tipo, size) => {
    let url = '';
    if (tipo === 'fac') {
      url = documentsPdfInvoicesVenta(idComprobante, size);
    } else {
      url = documentsPdfInvoicesGuiaRemision(idComprobante, size);
    }

    await pdfVisualizer.init({
      url,
      title: 'CPE Sunat',
      titlePageNumber: 'Página',
      titleLoading: 'Cargando...',
    });
  };

  handleDownloadXml = (idComprobante) => {
    const id = guId();
    const url = obtenerXmlSunat(idComprobante);
    this.props.downloadFileAsync({ id, url });
  };

  handleSendEmail = async (idComprobante, tipo) => {
    toastKit.info({
      title: 'Enviando...',
      message: 'Por favor espere...',
      duration: 5000,
      style: ToastStyle.light,
    });

    const response = await enviarEmail(idComprobante, tipo);

    if (response instanceof SuccessReponse) {
      toastKit.success({
        title: 'Excelente!',
        message: response.data,
        duration: 5000,
        style: ToastStyle.light,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      toastKit.warning({
        title: 'Que mal!',
        message: response.getMessage(),
        duration: 5000,
        style: ToastStyle.light,
      });
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

  opcionButtonEnvio(image, alt, onClick) {
    return (
      <Button className="btn-light btn-sm" onClick={onClick}>
        <img src={image} alt={alt} width="22" />
      </Button>
    );
  }

  renderEstado(item) {
    if (item.tipo === 'fac') {
      if (item.estado === 0) {
        return this.opcionButtonEnvio(images.unable, 'Error', () => {
          this.handleSendFacturar(item.idComprobante);
        });
      }

      if (isEmpty(item.xmlSunat)) {
        return this.opcionButtonEnvio(images.reuse, 'Reutilizar', () => {
          this.handleSendFacturar(item.idComprobante);
        });
      }

      if (item.xmlSunat === '0') {
        return this.opcionButtonEnvio(images.accept, 'Aceptar');
      }

      if (item.xmlSunat === '2987' || item.xmlSunat === '1032') {
        return this.opcionButtonEnvio(images.error, 'Anulado');
      }

      return this.opcionButtonEnvio(images.unable, 'Incapaz', () => {
        this.handleSendFacturar(item.idComprobante);
      });
    } else {
      if (item.estado === 0) {
        return this.opcionButtonEnvio(images.unable, 'Error', () => {
          this.handleSendGuiaRemision(item.idComprobante);
        });
      }

      if (isEmpty(item.xmlSunat)) {
        return this.opcionButtonEnvio(images.reuse, 'Reutilizar', () => {
          this.handleSendGuiaRemision(item.idComprobante);
        });
      }

      if (item.xmlSunat === '2987' || item.xmlSunat === '1032') {
        return this.opcionButtonEnvio(images.error, 'Anulado');
      }

      if (item.xmlSunat === '0') {
        return this.opcionButtonEnvio(images.accept, 'Aceptar');
      }

      return this.opcionButtonEnvio(images.unable, 'Incapaz', () => {
        this.handleSendGuiaRemision(item.idComprobante);
      });
    }
  }

  generateBody() {
    const { loading, lista } = this.state;

    if (loading) {
      return (
        <SpinnerTable
          colSpan="8"
          message="Cargando información de la tabla..."
        />
      );
    }

    if (isEmpty(lista)) {
      return (
        <TableRow>
          <TableCell className="text-center" colSpan="8">
            ¡No hay datos registrados!
          </TableCell>
        </TableRow>
      );
    }

    return lista.map((item, index) => {
      const descripcion =
        item.xmlDescripcion === ''
          ? 'Por Generar Xml'
          : limitarCadena(item.xmlDescripcion, 90, '...');

      return (
        <TableRow key={index}>
          <TableCell className={`text-center`}>{item.id}</TableCell>
          <TableCell>
            <DropdownActions
              options={[
                {
                  image: images.pdf,
                  tooltip: 'Archivo Pdf A4',
                  label: 'Pdf A4',
                  onClick: () =>
                    this.handleOpenPrinter(item.idComprobante, item.tipo, 'A4'),
                },
                {
                  image: images.invoice,
                  tooltip: 'Archivo Pdf 80mm',
                  label: 'Pdf Ticket',
                  onClick: () =>
                    this.handleOpenPrinter(
                      item.idComprobante,
                      item.tipo,
                      '80mm',
                    ),
                },
                {
                  image: images.invoice,
                  tooltip: 'Archivo Pdf 58mm',
                  label: 'Pdf Ticket',
                  onClick: () =>
                    this.handleOpenPrinter(
                      item.idComprobante,
                      item.tipo,
                      '58mm',
                    ),
                },
                {
                  image: images.xml,
                  tooltip: 'Archivo Xml',
                  label: 'Xml',
                  onClick: () => this.handleDownloadXml(item.idComprobante),
                },
                {
                  image: images.email,
                  tooltip: 'Enviar Correo',
                  label: 'Email',
                  onClick: () =>
                    this.handleSendEmail(item.idComprobante, item.tipo),
                },
                ...(item.tipo === 'fac' && item.anulacion !== 0
                  ? [
                    {
                      image: images.error,
                      tooltip:
                        item.anulacion === 1
                          ? 'Comunicación de Baja'
                          : 'Resumen Diario',
                      label: item.anulacion === 1
                      ? 'Comunicación de Baja'
                      : 'Resumen Diario',
                      onClick: () => {
                        const id = item.idComprobante;
                        const num =
                          item.serie +
                          '-' +
                          formatNumberWithZeros(item.numeracion);
                        item.anulacion === 1
                          ? this.handleSendComunicacionDeBaja(id, num)
                          : this.handleSendResumenDiario(id, num);
                      },
                    },
                  ]
                  : []),
              ]}
            />
          </TableCell>
          <TableCell>
            <span>
              {item.fecha}
              <br />
              {formatTime(item.hora)}
            </span>
          </TableCell>
          <TableCell>
            <Link
              to={getPathNavigation(item.tipo, item.idComprobante)}
              className="btn-link"
            >
              {item.comprobante}
              <br />
              {item.serie + '-' + formatNumberWithZeros(item.numeracion)}
            </Link>
          </TableCell>
          <TableCell>
            {`${item.tipoDocumento} - ${item.documento}`}
            <br />
            {item.informacion}
          </TableCell>
          <TableCell className="text-center">
            {item.estado !== 3 ? (
              <span className="text-success">DECLARAR</span>
            ) : (
              <span className="text-danger">DAR DE BAJA</span>
            )}
          </TableCell>
          <TableCell className="text-center">
            {this.renderEstado(item)}
          </TableCell>
          <TableCell>{descripcion}</TableCell>
        </TableRow>
      );
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.initialLoad}
          message={this.state.initialMessage}
        >
          {/* <div className='d-flex flex-column align-items-center'>
            <p>No se pudo obtener los datos requeridos, comuníquese con su proveedor del sistema.</p>
            <Button
              className='btn-danger'>
              <i className='fa fa-refresh'></i> Recargar
            </Button>
          </div> */}
        </SpinnerView>

        <Title
          title="Comprobante de Pago Electrónico"
          subTitle="LISTA"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <span>Resumen de Boletas/Facturas/Nota Crédito/Nota Débito</span>
          </Column>
        </Row>

        <Row>
          <Column
            className="col-lg-2 col-md-2 col-sm-12 col-xs-12"
            formGroup={true}
          >
            <img src={images.sunat} alt="Estado Sunat" width="24" />{' '}
            <span>Estados SUNAT:</span>
          </Column>

          <Column
            className="col-lg-2 col-md-2 col-sm-12 col-xs-12"
            formGroup={true}
          >
            <img src={images.accept} alt="Aceptado" width="24" />{' '}
            <span>Aceptado</span>
          </Column>

          <Column
            className="col-lg-2 col-md-2 col-sm-12 col-xs-12"
            formGroup={true}
          >
            <img src={images.unable} alt="Rechazo" width="24" />{' '}
            <span>Rechazado</span>
          </Column>

          <Column
            className="col-lg-2 col-md-2 col-sm-12 col-xs-12"
            formGroup={true}
          >
            <img src={images.reuse} alt="Pendiende de envío" width="24" />{' '}
            <span>Pendiente de Envío</span>
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-xs-12"
            formGroup={true}
          >
            <img src={images.error} alt="Comunicación de baja" width="24" />{' '}
            <span> Comunicación de Baja (Anulado)</span>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button className="btn-outline-light" onClick={this.loadingInit}>
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input
              label={'Fecha de Inicio:'}
              type="date"
              value={this.state.fechaInicio}
              onChange={this.handleInputFechaInicio}
            />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Input
              label={'Fecha de Final:'}
              type="date"
              value={this.state.fechaFinal}
              onChange={this.handleInputFechaFinal}
            />
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select
              label={'Comprobantes:'}
              value={this.state.idComprobante}
              onChange={this.handleSelectComprobante}
            >
              <option value="">TODOS</option>
              {this.state.comprobantes.map((item, index) => (
                <option key={index} value={item.idComprobante}>
                  {item.nombre} - {item.serie}
                </option>
              ))}
            </Select>
          </Column>

          <Column
            className="col-lg-3 col-md-3 col-sm-12 col-12"
            formGroup={true}
          >
            <Select
              label={'Estados:'}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value="0">TODOS</option>
              <option value="1">POR DECLARAR</option>
              <option value="2">POR ANULAR</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Search
              group={true}
              label={'Buscar:'}
              iconLeft={<i className="bi bi-search"></i>}
              ref={this.refSearch}
              onSearch={this.searchText}
              placeholder="Ingrese los datos requeridos...."
            />
          </Column>

          <Column className="col-md-6 col-sm-12" formGroup={true}>
            <Select
              label={'Sucursal:'}
              value={this.state.idSucursal}
              onChange={this.handleSelectSucursal}
            >
              {this.state.sucursales.map((item, index) => (
                <option key={index} value={item.idSucursal}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>
        </Row>

        <Row>
          <Column>
            <TableResponsive>
              <Table className={'table-bordered'}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="5%">Opciones</TableHead>
                    <TableHead width="10%">Fecha</TableHead>
                    <TableHead width="10%">Comprobante</TableHead>
                    <TableHead width="15%">Cliente</TableHead>
                    <TableHead width="10%">Estado</TableHead>
                    <TableHead width="5%">Estado </TableHead>
                    <TableHead width="15%">Observación SUNAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
                </TableBody>
              </Table>
            </TableResponsive>
          </Column>
        </Row>

        <Paginacion
          ref={this.refPaginacion}
          loading={this.state.loading}
          data={this.state.lista}
          totalPaginacion={this.state.totalPaginacion}
          paginacion={this.state.paginacion}
          fillTable={this.paginacionContext}
          restart={this.state.restart}
        />
      </ContainerWrapper>
    );
  }
}

CpeElectronicos.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  cpeSunatLista: PropTypes.shape({
    data: PropTypes.object,
    paginacion: PropTypes.object,
  }),
  setListaCpeSunatData: PropTypes.func,
  setListaCpeSunatPaginacion: PropTypes.func,
  history: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  location: PropTypes.object,
  downloadFileAsync: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
    cpeSunatLista: state.predeterminado.cpeSunatLista,
  };
};

const mapDispatchToProps = {
  setListaCpeSunatData,
  setListaCpeSunatPaginacion,
  downloadFileAsync,
};

const ConnectedCpeElectronicos = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CpeElectronicos);

export default ConnectedCpeElectronicos;
