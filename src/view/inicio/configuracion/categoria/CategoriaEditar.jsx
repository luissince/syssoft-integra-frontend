import React from 'react';
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  isEmpty,
  alertDialog,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import {
  getIdCategoria,
  updateCategoria,
} from '../../../../network/rest/principal.network';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import PropTypes from 'prop-types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';

class CategoriaEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: 'Cargando datos...',

      idCategoria: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: false,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCategoria = new URLSearchParams(url).get('idCategoria');

    if (isText(idCategoria)) {
      this.loadingData(idCategoria);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [categoria] = await Promise.all([
      this.fetchObtenerCategoria(id),
    ]);

    this.setState({
      idCategoria: categoria.idCategoria,
      codigo: categoria.codigo,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado === 1 ? true : false,
      loading: false,
    });
  }

  async fetchObtenerCategoria(id) {
    const params = {
      idCategoria: id,
    };

    const response = await getIdCategoria(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  handleInputCodigo = (event) => {
    this.setState({ codigo: event.target.value });
  };

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value });
  };

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  };

  handleEditar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Categoría', 'Ingrese el nombre de la categoría', () => {
        this.refNombre.current.focus();
      });
      return;
    }

    alertDialog('Categoría', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idCategoria: this.state.idCategoria,
          codigo: this.state.codigo,
          nombre: this.state.nombre,
          descripcion: this.state.descripcion,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Categoría', 'Procesando información...');

        const response = await updateCategoria(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Categoría', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Categoría', response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          title='Categoría'
          subTitle='EDITAR'
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Input
              autoFocus
              label={"Código:"}
              placeholder="Ingrese el código"
              value={this.state.codigo}
              onChange={this.handleInputCodigo}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={<>Nombre:<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ingrese el nombre"
              refInput={this.refNombre}
              value={this.state.nombre}
              onChange={this.handleInputNombre}
            />
          </Column>
        </Row>


        <Row>
          <Column formGroup={true}>
            <Input
              label={"Descripción"}
              placeholder="Ingrese la descripción"
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Switches
              id="customSwitchEstado"
              checked={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-warning"
              onClick={() => this.handleEditar()}
            >
              <i className='fa fa-pencil'></i>   Guardar
            </Button>
            {' '}
            <Button
              className="btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className='fa fa-close'></i>  Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CategoriaEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCategoriaEditar = connect(mapStateToProps, null)(CategoriaEditar);

export default ConnectedCategoriaEditar;