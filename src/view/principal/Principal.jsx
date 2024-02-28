import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signOut, selectProject } from '../../redux/actions';
import { isEmpty, spinnerLoading } from '../../helper/utils.helper';
import CustomComponent from '../../model/class/custom-component';
import { initSucursales } from '../../network/rest/principal.network';
import SuccessReponse from '../../model/class/response';
import ErrorResponse from '../../model/class/error-response';
import { CANCELED } from '../../model/types/types';
import Row from '../../components/Row';
import ItemCard from './component/ItemCard';
import Search from './component/Search';
import Title from './component/Title';

class Principal extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      sucursales: [],
      data: [],
      loading: true,
      loadMessage: 'Cargando sucursales...',
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
    await this.fetchSucursales()
  }

  async fetchSucursales() {
    const response = await initSucursales(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      this.setState({
        sucursales: response.data,
        data: response.data,
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({
        loadMessage: response.getMessage()
      })
    }
  }

  handleFocused = () => {
    const userToken = window.localStorage.getItem('login');
    if (userToken === null) {
      this.props.restore();
    } else {
      const projectToken = window.localStorage.getItem('project');
      if (projectToken !== null) {
        this.props.project(JSON.parse(projectToken));
      }
    }
  };

  handleSearch = (value) => {
    if (isEmpty(value)) {
      this.setState({ data: this.state.sucursales });
      return;
    }

    const sucursales = this.state.data.filter((item) => item.nombre.toUpperCase().indexOf(value.toUpperCase()) > -1,);
    this.setState({ data: sucursales });
  }

  handleSignIn = async () => {
    try {
      window.localStorage.removeItem('login');
      window.localStorage.removeItem('project');
      this.props.restore();
      this.props.history.push('login');
    } catch (e) {
      this.props.restore();
      this.props.history.push('login');
    }
  };

  handleIngresar = (item) => {
    const proyect = {
      idSucursal: item.idSucursal,
      nombre: item.nombre,
      direccion: item.direccion,
    };

    window.localStorage.setItem('project', JSON.stringify(proyect));
    this.props.project(JSON.parse(window.localStorage.getItem('project')));
  }

  render() {
    if (this.props.token.userToken == null) {
      return <Redirect to="/login" />;
    }

    if (this.props.token.project !== null) {
      return <Redirect to="/inicio" />;
    }

    const { documento, razonSocial, nombreEmpresa } = this.props.token.empresa;

    return (
      <div className="container pt-5">
        {this.state.loading && spinnerLoading(this.state.loadMessage)}

        <Title
          razonSocial={razonSocial}
          nombreEmpresa={nombreEmpresa}
          documento={documento}
          handleSignIn={this.handleSignIn}
        />

        <Search
          refTxtSearch={this.refTxtSearch}
          handleSearch={this.handleSearch}
        />

        <Row>
          {this.state.data.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              handleIngresar={this.handleIngresar}
            />
          ))}
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    restore: () => dispatch(signOut()),
    project: (idSucursal) => dispatch(selectProject(idSucursal)),
  };
};

const ConnectedPrincipal = connect(mapStateToProps, mapDispatchToProps)(Principal);

export default ConnectedPrincipal;
