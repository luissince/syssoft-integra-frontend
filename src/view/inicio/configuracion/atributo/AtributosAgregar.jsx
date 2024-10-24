import React from 'react';
import {
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  alertDialog,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import ContainerWrapper from '../../../../components/Container';
import { addAtributo, comboTipoAtributo } from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import PropTypes from 'prop-types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import { CANCELED } from '../../../../model/types/types';
import { TIPO_ATRIBUTO_COLOR, TIPO_ATRIBUTO_TALLA } from '../../../../model/types/tipo-atributo';

class AtributosAgregar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idTipoAtributo: '',
      nombre: '',
      hexadecimal: '#000000',
      valor: '',
      estado: true,

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
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData() {
    const [tipoAtributos] = await Promise.all([
      this.fetchComboTipoAtributo(),
    ]);

    this.setState({
      tipoAtributos,
      loading: false,
    });
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
      alertWarning('Atributo', 'Ingrese el nombre de la marca.', () => {
        this.refNombre.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.hexadecimal)) {
      alertWarning('Atributo', 'Ingrese su color.', () => {
        this.refHexadecimal.current.focus();
      });
      return;
    }

    alertDialog('Atributo', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoAtributo: this.state.idTipoAtributo,
          nombre: this.state.nombre,
          hexadecimal: this.state.hexadecimal,
          valor: this.state.valor,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Atributo', 'Procesando información...');

        const response = await addAtributo(data);

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
        <Title
          title='Atributo'
          subTitle='AGREGAR'
          icon={<i className="fa fa-plus"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Select
              label={<>Tipo Atributo:<i className="fa fa-asterisk text-danger small"></i></>}
              refInput={this.refTipoAtributo}
              value={this.state.idTipoAtributo}
              onChange={this.handleSelectTipoAtributo}
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
              refInput={this.refNombre}
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
                  refInput={this.refHexadecimal}
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
                  refInput={this.refValor}
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
              className="btn-primary"
              onClick={() => this.handleGuardar()}
            >
              <i className='fa fa-save'></i> Guardar
            </Button>
            {' '}
            <Button
              className="btn-danger"
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

AtributosAgregar.propTypes = {
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

const ConnectedAtributosAgregar = connect(mapStateToProps, null)(AtributosAgregar);

export default ConnectedAtributosAgregar;