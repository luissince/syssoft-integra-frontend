import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from '../../helper/utils.helper';
import CustomComponent from '../../model/class/custom-component';
import { configEmpresa, initSucursales } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import { CANCELED } from '../../model/types/types';
import Row from '../../components/Row';
import ItemCard from './component/ItemCard';
import Title from './component/Title';
import { SpinnerView } from '../../components/Spinner';
import { projectActive, signOut } from '../../redux/principalSlice';
import PropTypes from 'prop-types';
import { clearNoticacion } from '../../redux/noticacionSlice';
import { clearPredeterminado } from '../../redux/predeterminadoSlice';
import Column from '../../components/Column';
import Input from '../../components/Input';
import { images } from '../../helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Principal extends CustomComponent {

  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      documento: '',
      razonSocial: '',
      nombreEmpresa: '',
      rutaLogo: images.logo,
      sucursales: [],
      cache: [],

      loading: true,
      loadingMessage: 'Cargando sucursales...',
    };

    this.refTxtSearch = React.createRef();

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
    await this.loadingData();
    window.addEventListener('focus', this.handleFocused);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleFocused);
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
    const empresa = await configEmpresa(this.abortController.signal);

    if (empresa instanceof ErrorResponse) {
      if (empresa.type === CANCELED) return;

      return;
    }

    const response = await initSucursales(this.abortController.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return;
    }

    if (response instanceof SuccessReponse) {
      this.setState({
        documento: empresa.data.documento,
        razonSocial: empresa.data.razonSocial,
        nombreEmpresa: empresa.data.nombreEmpresa,
        rutaLogo: empresa.data.rutaLogo,
        sucursales: response.data,
        cache: response.data,
        loading: false,
      });
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

  handleFocused = () => {
    const userToken = window.localStorage.getItem('login');
    if (userToken === null) {
      this.props.signOut();
    } else {
      const projectToken = window.localStorage.getItem('project');
      if (projectToken !== null) {
        this.props.projectActive({
          project: JSON.parse(projectToken)
        });
      }
    }
  };

  handleSearch = (value) => {
    if (isEmpty(value)) {
      this.setState({ sucursales: this.state.cache });
      return;
    }

    const sucursales = this.state.cache.filter((item) => item.nombre.toUpperCase().includes(value.toUpperCase()),);
    this.setState({ sucursales });
  }

  handleSignOut = async () => {
    window.localStorage.removeItem('login');
    window.localStorage.removeItem('project');
    window.location.href = '/';
  }

  handleIngresar = (item) => {
    const proyect = item;

    window.localStorage.setItem('project', JSON.stringify(proyect));
    this.props.projectActive({
      project: JSON.parse(window.localStorage.getItem('project'))
    });
  }

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
    const { token } = this.props;

    if (token.userToken == null) {
      return <Redirect to="/login" />;
    }

    if (token.project !== null) {
      return <Redirect to="/inicio" />;
    }

    if (this.state.loading) {
      return (
        <div className="container pt-5">
          <SpinnerView
            loading={this.state.loading}
            message={this.state.loadingMessage}
          />
        </div>
      );
    }

    return (
      <div className="container pt-5">
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          rutaImage={this.state.rutaLogo}
          razonSocial={this.state.razonSocial}
          nombreEmpresa={this.state.nombreEmpresa}
          documento={"RUC: " + this.state.documento}
          handleSignOut={this.handleSignOut}
        />

        <Row>
          <Column className="col-md-12 col-sm-12 col-12" formGroup={true}>
            <Input
              group={true}
              iconLeft={<i className="bi bi-search"></i>}
              className="bg-transparent"
              type="search"
              placeholder="Filtar por nombre de sucursal"
              refInput={this.refTxtSearch}
              onKeyUp={(event) => this.handleSearch(event.target.value)}
            />
          </Column>
        </Row>

        <Row>
          {this.state.sucursales.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              handleIngresar={this.handleIngresar}
            />
          ))}
          {isEmpty(this.state.sucursales) && (
            <div className="col-12 d-flex justify-content-center">
              <p className="text-center">No hay datos para mostrar.</p>
            </div>
          )}
        </Row>
      </div>
    );
  }
}

Principal.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.object,
    project: PropTypes.object,
  }),
  signOut: PropTypes.func,
  projectActive: PropTypes.func,
  clearPredeterminado: PropTypes.func,
  clearNoticacion: PropTypes.func,
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const mapDispatchToProps = { signOut, projectActive, clearPredeterminado, clearNoticacion };

const ConnectedPrincipal = connect(mapStateToProps, mapDispatchToProps)(Principal);

export default ConnectedPrincipal;