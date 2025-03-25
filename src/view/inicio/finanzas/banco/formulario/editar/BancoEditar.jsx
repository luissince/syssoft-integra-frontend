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
  spinnerLoading,
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

class BancoEditar extends CustomComponent {
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
      preferido: banco.preferido,
      vuelto: banco.vuelto,
      reporte: banco.reporte,
      estado: banco.estado,
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

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Banco'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Nombre Banco <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="BCP, BBVA, etc"
            />
          </div>

          <div className="form-group col-md-6">
            <label>
              Tipo de Cuenta:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <select
              className="form-control"
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
            </select>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Moneda: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <select
              className="form-control"
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
            </select>
          </div>

          <div className="form-group col-md-6">
            <label>Número de cuenta:</label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtNumCuenta}
              value={this.state.numCuenta}
              onChange={(event) =>
                this.setState({ numCuenta: event.target.value })
              }
              placeholder="##############"
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label>CCI:</label>
            <input
              type="text"
              className="form-control"
              ref={this.refTxtCci}
              value={this.state.cci}
              onChange={(event) => this.setState({ cci: event.target.value })}
              placeholder="####################"
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Vuelto:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="vueltoChecked"
                checked={this.state.vuelto}
                onChange={(value) =>
                  this.setState({ vuelto: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="vueltoChecked">
                {this.state.vuelto ? 'Si' : 'No'}
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Estado:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="estadoChecked"
                checked={this.state.estado}
                onChange={(value) =>
                  this.setState({ estado: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="estadoChecked">
                {this.state.estado ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Preferido:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="preferidoChecked"
                checked={this.state.preferido}
                onChange={(value) =>
                  this.setState({ preferido: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="preferidoChecked">
                {this.state.preferido ? 'Si' : 'No'}
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
            <label htmlFor="nombre" className="col-form-label">
              Mostrar en Reporte:
            </label>
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="reporteChecked"
                checked={this.state.reporte}
                onChange={(value) =>
                  this.setState({ reporte: value.target.checked })
                }
              />
              <label className="custom-control-label" htmlFor="reporteChecked">
                {this.state.reporte ? 'Si' : 'No'}
              </label>
            </div>
          </div>
        </div>

        <Row>
          <Column>
            <Button
              className="btn-warning"
              onClick={this.handleGuardar}
            >
              <i className='fa fa-save'></i>  Guardar
            </Button>{' '}
            <Button
              className="btn-outline-danger"
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedBancoAgregar = connect(mapStateToProps, null)(BancoEditar);

export default ConnectedBancoAgregar;