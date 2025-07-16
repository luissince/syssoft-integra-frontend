import React from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isNumeric,
  isText,
  keyNumberInteger,
} from '../../../../helper/utils.helper';
import {
  editImpuesto,
  geIdImpuesto,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { SpinnerView } from '../../../../components/Spinner';

class ImpuestoEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idImpuesto: '',
      nombre: '',
      porcentaje: '',
      codigo: '',
      preferido: false,
      estado: true,

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refPorcentaje = React.createRef();
    this.refCodigo = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idImpuesto = new URLSearchParams(url).get('idImpuesto');

    if (isText(idImpuesto)) {
      this.loadingData(idImpuesto);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadingData = async (id) => {
    const [impuesto] = await Promise.all([
      this.fetchGetIdImpuesto(id)
    ]);

    this.setState({
      idImpuesto: impuesto.idImpuesto,
      nombre: impuesto.nombre,
      porcentaje: impuesto.porcentaje.toString(),
      codigo: impuesto.codigo,
      preferido: impuesto.preferido,
      estado: impuesto.estado,
      loading: false,
    });
  };

  async fetchGetIdImpuesto(id) {
    const params = {
      idImpuesto: id,
    };
    const response = await geIdImpuesto(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleGuardar = () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Impuesto', 'Ingrese el nombre.', () =>
        this.refNombre.current.focus(),
      );
      return;
    }

    if (!isNumeric(this.state.porcentaje)) {
      alertWarning('Impuesto', 'Ingrese el porcentaje.', () =>
        this.refPorcentaje.current.focus(),
      );
      return;
    }

    alertDialog('Impuesto', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Impuesto', 'Procesando información...');

        const data = {
          idImpuesto: this.state.idImpuesto,
          nombre: this.state.nombre,
          porcentaje: this.state.porcentaje,
          codigo: this.state.codigo,
          estado: this.state.estado,
          preferido: this.state.preferido,
          idUsuario: this.state.idUsuario,
        };

        const response = await editImpuesto(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Impuesto', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Impuesto', response.getMessage());
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
          title='Impuesto'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label htmlFor="nombre" className="col-form-label">
                Nombre: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                placeholder="Digite..."
                className="form-control"
                id="nombre"
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="serie">
              Porcentaje: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              placeholder="Digite..."
              className="form-control"
              id="serie"
              ref={this.refPorcentaje}
              value={this.state.porcentaje}
              onChange={(event) =>
                this.setState({ porcentaje: event.target.value })
              }
              onKeyDown={keyNumberInteger}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="numeracion">Código:</label>
            <input
              type="text"
              placeholder="Digite..."
              className="form-control"
              id="numeracion"
              ref={this.refCodigo}
              value={this.state.codigo}
              onChange={(event) =>
                this.setState({ codigo: event.target.value })
              }
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="numeracion">Estado:</label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch1"
                checked={this.state.estado}
                onChange={(value) =>
                  this.setState({ estado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="switch1">
                {this.state.estado ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="numeracion">Preferido:</label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch2"
                checked={this.state.preferido}
                onChange={(value) =>
                  this.setState({ preferido: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="switch2">
                {this.state.preferido ? 'Si' : 'No'}
              </label>
            </div>
          </div>
        </div>

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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedImpuestoEditar = connect(mapStateToProps, null)(ImpuestoEditar);

export default ConnectedImpuestoEditar;