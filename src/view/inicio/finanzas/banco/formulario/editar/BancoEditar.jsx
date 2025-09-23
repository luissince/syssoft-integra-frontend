import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../../components/Container';
import CustomComponent from '../../../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isText,
} from '../../../../../../helper/utils.helper';
import {
  getIdBando,
  comboMoneda,
  updateBanco,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import Title from '../../../../../../components/Title';
import Button from '../../../../../../components/Button';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import { SpinnerView } from '../../../../../../components/Spinner';
import Select from '../../../../../../components/Select';
import Input from '../../../../../../components/Input';
import { Switches } from '../../../../../../components/Checks';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class BancoEditar extends CustomComponent {

  /**
   * Inicializa un nuevo componente.
   * @param {Object} props - Las propiedades pasadas al componente.
   */
  constructor(props) {
    super(props);
    this.state = {
      idBanco: '',
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
    const url = this.props.location.search;
    const idBanco = new URLSearchParams(url).get('idBanco');

    if (isText(idBanco)) {
      this.loadingData(idBanco);
    } else {
      this.props.history.goBack();
    }
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
  async loadingData(idBanco) {
    const [monedas, banco] = await Promise.all([
      this.fetchMonedaCombo(),
      this.fetchObtenerBanco(idBanco),
    ]);

    this.setState({
      monedas,
      nombre: banco.nombre,
      tipoCuenta: banco.tipoCuenta,
      idMoneda: banco.idMoneda,
      numCuenta: banco.numCuenta,
      cci: banco.cci,
      preferido: banco.preferido === 1 ? true : false,
      vuelto: banco.vuelto === 1 ? true : false,
      reporte: banco.reporte === 1 ? true : false,
      compartir: banco.compartir === 1 ? true : false,
      estado: banco.estado === 1 ? true : false,
      idBanco: banco.idBanco,
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

  async fetchObtenerBanco(id) {
    const params = {
      idBanco: id,
    };

    const result = await getIdBando(params, this.abortController.signal);

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

  handleGuardar = () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Banco', 'Ingrese el nombre del banco.', () => {
        this.refTxtNombre.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.tipoCuenta)) {
      alertWarning('Banco', 'Seleccione el tipo de cuenta.', () => {
        this.tipoCuenta.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idMoneda)) {
      alertWarning('Banco', 'Seleccione el tipo de moneda.', () => {
        this.refTxtMoneda.current.focus();
      });
      return;
    }

    alertDialog('Banco', '¿Estás seguro de continuar?', async (event) => {
      if (event) {
        const data = {
          nombre: this.state.nombre.trim().toUpperCase(),
          tipoCuenta: this.state.tipoCuenta,
          idMoneda: this.state.idMoneda.trim().toUpperCase(),
          numCuenta: this.state.numCuenta.trim().toUpperCase(),
          cci: this.state.cci.trim().toUpperCase(),
          preferido: this.state.preferido,
          vuelto: this.state.vuelto,
          reporte: this.state.reporte,
          compartir: this.state.compartir,
          estado: this.state.estado,

          idUsuario: this.state.idUsuario,
          idBanco: this.state.idBanco,
        };

        alertInfo('Banco', 'Procesando información...');

        const response = await updateBanco(data, this.abortController.signal);
        if (response instanceof SuccessReponse) {
          alertSuccess('Banco', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Banco', response.getMessage());
        }
      }
    });
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
          subTitle="EDITAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  Nombre Banco:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTxtNombre}
              placeholder="BCP, BBVA, etc"
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Select
              group={true}
              label={
                <>
                  Tipo de Cuenta:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTipoCuenta}
              value={this.state.tipoCuenta}
              onChange={(event) =>
                this.setState({ tipoCuenta: event.target.value })
              }
            >
              <option value="">- Seleccione -</option>
              <option value="1">Banco</option>
              <option value="2">Tarjeta</option>
              <option value="3">Efectivo</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Select
              group={true}
              label={
                <>
                  Moneda: <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTxtMoneda}
              value={this.state.idMoneda}
              onChange={(event) =>
                this.setState({ idMoneda: event.target.value })
              }
            >
              <option value="">- Seleccione -</option>
              {this.state.monedas.map((item, index) => (
                <option key={index} value={item.idMoneda}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>Número de cuenta:</>}
              placeholder="##############"
              ref={this.refTxtNumCuenta}
              value={this.state.numCuenta}
              onChange={(event) =>
                this.setState({ numCuenta: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>CCI:</>}
              placeholder="##############"
              ref={this.refTxtCci}
              value={this.state.cci}
              onChange={(event) => this.setState({ cci: event.target.value })}
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Vuelto:'}
              id={'vueltoChecked'}
              checked={this.state.vuelto}
              onChange={(value) =>
                this.setState({ vuelto: value.target.checked })
              }
            >
              {this.state.vuelto ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Estado:'}
              id={'estadoChecked'}
              checked={this.state.estado}
              onChange={(value) =>
                this.setState({ estado: value.target.checked })
              }
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Preferido:'}
              id={'preferidoChecked'}
              checked={this.state.preferido}
              onChange={(value) =>
                this.setState({ preferido: value.target.checked })
              }
            >
              {this.state.preferido ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Mostrar en Reporte:'}
              id={'reporteChecked'}
              checked={this.state.reporte}
              onChange={(value) =>
                this.setState({ reporte: value.target.checked })
              }
            >
              {this.state.reporte ? 'Si' : 'No'}
            </Switches>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Compartir Cuenta:'}
              id={'compartirChecked'}
              checked={this.state.compartir}
              onChange={(value) =>
                this.setState({ compartir: value.target.checked })
              }
            >
              {this.state.compartir ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button className="btn-warning" onClick={this.handleGuardar}>
              <i className="fa fa-save"></i> Guardar
            </Button>{' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedBancoAgregar = connect(mapStateToProps, null)(BancoEditar);

export default ConnectedBancoAgregar;
