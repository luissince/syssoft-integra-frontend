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
  comboTipoAtributo,
  getIdAtributo,
  updateAtributo,
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
import Select from '../../../../components/Select';
import { TIPO_ATRIBUTO_COLOR, TIPO_ATRIBUTO_TALLA } from '../../../../model/types/tipo-atributo';

class AtributosEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: 'Cargando datos...',

      idAtributo: '',
      idTipoAtributo: '',
      nombre: '',
      hexadecimal: '#000000',
      valor: '',
      estado: false,

      tipoAtributos: [],

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTipoAtributo = React.createRef();
    this.refNombre = React.createRef();
    this.refHexadecimal = React.createRef();
    this.refValor = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idAtributo = new URLSearchParams(url).get('idAtributo');

    if (isText(idAtributo)) {
      this.loadingData(idAtributo);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [tipoAtributos, atributo] = await Promise.all([
      this.fetchComboTipoAtributo(),
      this.fetchObtenerAtributo(id),
    ]);

    this.setState({
      tipoAtributos,

      idAtributo: atributo.idAtributo,
      idTipoAtributo: atributo.idTipoAtributo,
      nombre: atributo.nombre,
      hexadecimal: atributo.hexadecimal,
      valor: atributo.valor,
      estado: atributo.estado === 1 ? true : false,

      loading: false,
    });
  }

  async fetchObtenerAtributo(id) {
    const params = {
      idAtributo: id,
    };

    const response = await getIdAtributo(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  async fetchComboTipoAtributo() {
    const result = await comboTipoAtributo(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleSelectTipoAtributo = (event) => {
    this.setState({ idTipoAtributo: event.target.value });
  };

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value });
  };

  handleInputHexacimal = (event) => {
    this.setState({ hexadecimal: event.target.value });
  };

  handleInputValor = (event) => {
    this.setState({ valor: event.target.value });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  };

  handleGuardar = async () => {
    if (isEmpty(this.state.idTipoAtributo)) {
      alertWarning('Atributo', 'Selecciona el tipo de atributo.', () => {
        this.refTipoAtributo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.nombre)) {
      alertWarning('Atributo', 'Ingrese el nombre de la color', () => {
        this.refNombre.current.focus();
      });
      return;
    }

    if (this.state.idTipoAtributo === TIPO_ATRIBUTO_COLOR && isEmpty(this.state.hexadecimal)) {
      alertWarning('Atributo', 'Ingrese su color', () => {
        this.refHexadecimal.current.focus();
      });
      return;
    }

    if (this.state.idTipoAtributo === TIPO_ATRIBUTO_TALLA && isEmpty(this.state.valor)) {
      alertWarning('Atributo', 'Ingrese su valor', () => {
        this.refValor.current.focus();
      });
      return;
    }

    alertDialog('Atributo', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idAtributo: this.state.idAtributo,
          idTipoAtributo: this.state.idTipoAtributo,
          nombre: this.state.nombre,
          hexadecimal: this.state.hexadecimal,
          valor: this.state.valor,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Atributo', 'Procesando información...');

        const response = await updateAtributo(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Atributo', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Atributo', response.getMessage());
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
          title='Atributo'
          subTitle='EDITAR'
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Select
              label={<>Tipo Atributo:<i className="fa fa-asterisk text-danger small"></i></>}
              ref={this.refTipoAtributo}
              value={this.state.idTipoAtributo}
              onChange={this.handleSelectTipoAtributo}
              disabled
            >
              <option value="">-- Seleccione un tipo de atributo --</option>
              {
                this.state.tipoAtributos.map((item, index) => (
                  <option key={index} value={item.idTipoAtributo}>{item.nombre}</option>
                ))
              }
            </Select>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={<>Nombre:<i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Ingrese el nombre"
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={this.handleInputNombre}
            />
          </Column>
        </Row>

        {
          this.state.idTipoAtributo === TIPO_ATRIBUTO_COLOR && (
            <Row>
              <Column formGroup={true}>
                <Input
                  label={"Color"}
                  type='color'
                  placeholder="Ingrese su color"
                  ref={this.refHexadecimal}
                  value={this.state.hexadecimal}
                  onChange={this.handleInputHexacimal}
                />
              </Column>
            </Row>
          )
        }

        {
          this.state.idTipoAtributo === TIPO_ATRIBUTO_TALLA && (
            <Row>
              <Column formGroup={true}>
                <Input
                  label={<>Valor:<i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="Ingrese su valor"
                  ref={this.refValor}
                  value={this.state.valor}
                  onChange={this.handleInputValor}
                />
              </Column>
            </Row>
          )
        }

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
              onClick={() => this.handleGuardar()}
            >
              <i className='fa fa-save'></i> Guardar
            </Button>
            {' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className='fa fa-close'></i> Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

AtributosEditar.propTypes = {
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

const ConnectedAtributosEditar = connect(mapStateToProps, null)(AtributosEditar);

export default ConnectedAtributosEditar;