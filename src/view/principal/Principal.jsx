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

  async componentDidMount() {
    await this.loadingData();
    window.addEventListener('focus', this.handleFocused);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleFocused);
    this.abortController.abort();
  }

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
  };

  handleIngresar = (item) => {
    const proyect = item;

    window.localStorage.setItem('project', JSON.stringify(proyect));
    this.props.projectActive({
      project: JSON.parse(window.localStorage.getItem('project'))
    });
  }

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