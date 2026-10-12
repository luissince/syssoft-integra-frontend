import React from 'react';
import {
  isText,
  isEmpty,
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
import CustomComponent from '@/components/CustomComponent';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import PropTypes from 'prop-types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';
import Select from '../../../../components/Select';
import {
  TIPO_ATRIBUTO_COLOR,
  TIPO_ATRIBUTO_TALLA,
} from '../../../../model/types/tipo-atributo';
import { alertKit } from 'alert-kit';

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
      alertKit.warning({
        title: 'Atributo',
        message: 'Selecciona el tipo de atributo.',
      }, () => {
        this.refTipoAtributo.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: 'Atributo',
        message: 'Ingrese el nombre de la color',
      }, () => {
        this.refNombre.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoAtributo === TIPO_ATRIBUTO_COLOR &&
      isEmpty(this.state.hexadecimal)
    ) {
      alertKit.warning({
        title: 'Atributo',
        message: 'Ingrese su color',
      }, () => {
        this.refHexadecimal.current.focus();
      });
      return;
    }

    if (
      this.state.idTipoAtributo === TIPO_ATRIBUTO_TALLA &&
      isEmpty(this.state.valor)
    ) {
      alertKit.warning({
        title: 'Atributo',
        message: 'Ingrese su valor',
      }, () => {
        this.refValor.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: 'Atributo',
      message: '¿Está seguro de continuar?',
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

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

      alertKit.loading({
        message: 'Procesando información...',
      });

      const response = await updateAtributo(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: 'Atributo',
          message: response.data,
        }, () => {
          this.props.history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {

        alertKit.warning({
          title: 'Atributo',
          message: response.getMessage(),
        });
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          title="Atributo"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="flex flex-col mb-3">
          <Select
            label={
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm">Tipo Atributo:</span> <i className="fa fa-asterisk text-danger small"></i>
              </div>
            }
            ref={this.refTipoAtributo}
            value={this.state.idTipoAtributo}
            onChange={this.handleSelectTipoAtributo}
          >
            <option value="">-- Seleccione un tipo de atributo --</option>
            {this.state.tipoAtributos.map((item, index) => (
              <option key={index} value={item.idTipoAtributo}>
                {item.nombre}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col mb-3">
          <Input
            label={
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm">Nombre:</span> <i className="fa fa-asterisk text-danger small"></i>
              </div>
            }
            placeholder="Ingrese el nombre"
            ref={this.refNombre}
            value={this.state.nombre}
            onChange={this.handleInputNombre}
          />
        </div>

        {this.state.idTipoAtributo === TIPO_ATRIBUTO_COLOR && (
          <div className="flex flex-col mb-3">
            <Input
              label={
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-sm">Color:</span> <i className="fa fa-asterisk text-danger small"></i>
                </div>
              }
              type="color"
              placeholder="Ingrese su color"
              ref={this.refHexadecimal}
              value={this.state.hexadecimal}
              onChange={this.handleInputHexacimal}
            />
          </div>
        )}

        {this.state.idTipoAtributo === TIPO_ATRIBUTO_TALLA && (
          <div className="flex flex-col mb-3">
            <Input
              label={
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-sm">Valor:</span> <i className="fa fa-asterisk text-danger small"></i>
                </div>
              }
              placeholder="Ingrese su valor"
              ref={this.refValor}
              value={this.state.valor}
              onChange={this.handleInputValor}
            />
          </div>
        )}

        <div className="flex flex-col">
          <Switches
            id="customSwitchEstado"
            checked={this.state.estado}
            onChange={this.handleSelectEstado}
          >
            {this.state.estado ? 'Activo' : 'Inactivo'}
          </Switches>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Button
            className="btn-warning"
            onClick={() => this.handleGuardar()}
          >
            <i className="fa fa-save"></i> Guardar
          </Button>
          <Button
            className="btn-outline-danger"
            onClick={() => this.props.history.goBack()}
          >
            <i className="fa fa-close"></i> Cerrar
          </Button>
        </div>
      </ContainerWrapper>
    );
  }
}

AtributosEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedAtributosEditar = connect(
  mapStateToProps,
  null,
)(AtributosEditar);

export default ConnectedAtributosEditar;
