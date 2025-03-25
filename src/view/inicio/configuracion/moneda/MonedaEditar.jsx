import React from 'react';
import PropTypes from 'prop-types';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import { CANCELED } from '../../../../model/types/types';
import ErrorResponse from '../../../../model/class/error-response';
import SuccessReponse from '../../../../model/class/response';
import {
  editMoneda,
  getIdMoneda,
} from '../../../../network/rest/principal.network';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { SpinnerView } from '../../../../components/Spinner';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class MonedaEditar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idMoneda: '',
      nombre: '',
      codIso: '',
      simbolo: '',
      estado: true,

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refTxtNombre = React.createRef();
    this.refTxtCodIso = React.createRef();
    this.refTxtSimbolo = React.createRef();
    this.refTxtSearch = React.createRef();
    this.refEstado = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idMoneda = new URLSearchParams(url).get('idMoneda');

    if (isText(idMoneda)) {
      this.loadingData(idMoneda);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(idMoneda) {
    const [moneda] = await Promise.all([
      this.fetchGetIdMoneda(idMoneda)
    ]);

    this.setState({
      nombre: moneda.nombre,
      codIso: moneda.codiso,
      simbolo: moneda.simbolo,
      estado: moneda.estado === 1 ? true : false,
      idMoneda: moneda.idMoneda,
      loading: false,
    });
  }

  async fetchGetIdMoneda(idMoneda) {
    const params = {
      idMoneda: idMoneda,
    };

    const result = await getIdMoneda(params, this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleGuardar = () => {
    if (!isText(this.state.nombre)) {
      alertWarning('Moneda', 'Ingres el nombre.', () =>
        this.refTxtNombre.current.focus(),
      );
      return;
    }

    if (!isText(this.state.codIso)) {
      alertWarning('Moneda', 'Ingres el código.', () =>
        this.refTxtCodIso.current.focus(),
      );
      return;
    }

    alertDialog('Moneda', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          nombre: this.state.nombre,
          codiso: this.state.codIso,
          simbolo: this.state.simbolo,
          estado: this.state.estado,
          idUsuario: this.state.idUsuario,
          idMoneda: this.state.idMoneda,
        };

        alertInfo('Moneda', 'Procesando información...');

        const response = await editMoneda(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Moneda', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Moneda', response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Moneda'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>Nombre: <i className="fa fa-asterisk text-danger small"></i></>}
              refInput={this.refTxtNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="Soles, dolares, etc"
            />
          </Column>

          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>Código ISO: <i className="fa fa-asterisk text-danger small"></i></>}
              refInput={this.refTxtCodIso}
              value={this.state.codIso}
              onChange={(event) =>
                this.setState({ codIso: event.target.value })
              }
              placeholder="PEN, USD, etc"
            />
          </Column>
        </Row>

        <Row>
          <Column className="form-group col-md-6" formGroup={true}>
            <Input
              group={true}
              label={"Simbolo"}
              refInput={this.refTxtSimbolo}
              value={this.state.simbolo}
              onChange={(event) =>
                this.setState({ simbolo: event.target.value })
              }
              placeholder="S/, $, etc"
            />
          </Column>

          <Column className="form-group col-md-6" formGroup={true}>
            <Switches
              label={"Estado:"}
              id={"cbEstado"}
              checked={this.state.estado}
              onChange={(value) =>
                this.setState({ estado: value.target.checked })
              }
            >
              {this.state.estado ? "Activo" : "Inactivo"}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-warning"
              onClick={this.handleGuardar}
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

MonedaEditar.propTypes = {
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string
    })
  })
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedMonedaEditar = connect(mapStateToProps, null)(MonedaEditar);

export default ConnectedMonedaEditar;