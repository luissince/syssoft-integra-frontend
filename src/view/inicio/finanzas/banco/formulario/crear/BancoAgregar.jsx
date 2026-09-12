import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '@/components/CustomComponent';
import {
  isEmpty,
} from '../../../../../../helper/utils.helper';
import {
  addBanco,
  comboMoneda,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import Title from '../../../../../../components/Title';
import { SpinnerView } from '../../../../../../components/Spinner';
import Formulario from '../components/Formulario';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class BancoAgregar extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);
    this.state = {
      nombre: '',
      tipoCuenta: '',
      idMoneda: '',
      monedas: [],
      numCuenta: '',
      cci: '',
      preferido: false,
      vuelto: false,
      reporte: false,
      compartir: false,
      estado: false,

      loading: true,
      msgLoading: 'Cargando datos...',

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTipoCuenta = React.createRef();
    this.refTxtMoneda = React.createRef();
    this.refTxtNumCuenta = React.createRef();
    this.refTxtCci = React.createRef();

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
    this.loadingData();
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
  async loadingData() {
    const [monedas] = await Promise.all([this.fetchMonedaCombo()]);

    this.setState({
      monedas,
      loading: false,
    });
  }

  async fetchMonedaCombo() {
    const result = await comboMoneda(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

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

  handleGuardar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: 'Banco',
        message: 'Ingrese el nombre del banco.',
        onClose: () => {
          this.refTxtNombre.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.tipoCuenta)) {
      alertKit.warning({
        title: 'Banco',
        message: 'Seleccione el tipo de cuenta.',
        onClose: () => {
          this.refTipoCuenta.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertKit.warning({
        title: 'Banco',
        message: 'Seleccione el tipo de moneda.',
        onClose: () => {
          this.refTxtMoneda.current.focus();
        },
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Banco',
      message: '¿Estás seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: 'Procesando información...',
      });

      const data = {
        nombre: this.state.nombre.trim().toUpperCase(),
        tipoCuenta: this.state.tipoCuenta,
        idMoneda: this.state.idMoneda.trim().toUpperCase(),
        numCuenta: this.state.numCuenta.trim().toUpperCase(),
        idSucursal: this.state.idSucursal,
        cci: this.state.cci.trim().toUpperCase(),
        preferido: this.state.preferido,
        vuelto: this.state.vuelto,
        reporte: this.state.reporte,
        compartir: this.state.compartir,
        estado: this.state.estado,

        idUsuario: this.state.idUsuario,
      };

      const response = await addBanco(data, this.abortController.signal);
      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Banco',
          message: response.data,
        }, () => {
          this.props.history.goBack();
        });       
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: 'Banco',
          message: response.getMessage(),
        });
      }
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
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
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Banco"
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Formulario
          type="crear"

          refTxtNombre={this.refTxtNombre}
          nombre={this.state.nombre}
          handleChangeNombre={(event) => this.setState({ nombre: event.target.value })}

          refTipoCuenta={this.refTipoCuenta}
          tipoCuenta={this.state.tipoCuenta}
          handleChangeTipoCuenta={(event) => this.setState({ tipoCuenta: event.target.value })}

          monedas={this.state.monedas}
          refTxtMoneda={this.refTxtMoneda}
          idMoneda={this.state.idMoneda}
          handleChangeIdMoneda={(event) => this.setState({ idMoneda: event.target.value })}

          refTxtNumCuenta={this.refTxtNumCuenta}
          numCuenta={this.state.numCuenta}
          handleChangeNumCuenta={(event) => this.setState({ numCuenta: event.target.value })}

          refTxtCci={this.refTxtCci}
          cci={this.state.cci}
          handleChangeCci={(event) => this.setState({ cci: event.target.value })}

          vuelto={this.state.vuelto}
          handleChangeVuelto={(event) => this.setState({ vuelto: event.target.value })}

          estado={this.state.estado}
          handleChangeEstado={(event) => this.setState({ estado: event.target.value })}

          preferido={this.state.preferido}
          handleChangePrefereido={(event) => this.setState({ preferido: event.target.value })}

          reporte={this.state.reporte}
          handleChangeReporte={(event) => this.setState({ reporte: event.target.value })}

          compartir={this.state.compartir}
          handleChangeCompartir={(event) => this.setState({ compartir: event.target.value })}

          handleSave={this.handleGuardar}
          handleGoBack={() => this.props.history.goBack()}
        />

      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedBancoAgregar = connect(mapStateToProps, null)(BancoAgregar);

export default ConnectedBancoAgregar;
