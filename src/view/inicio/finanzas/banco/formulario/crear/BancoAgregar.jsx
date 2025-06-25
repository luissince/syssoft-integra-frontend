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
} from '../../../../../../helper/utils.helper';
import {
  addBanco,
  comboMoneda,
} from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import Title from '../../../../../../components/Title';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Button from '../../../../../../components/Button';
import { SpinnerView } from '../../../../../../components/Spinner';
import Select from '../../../../../../components/Select';
import Input from '../../../../../../components/Input';
import { Switches } from '../../../../../../components/Checks';

class BancoAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
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

      idSucursal: this.props.token.project.idSucursal,
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
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData() {
    const [monedas] = await Promise.all([this.fetchMonedaCombo()]);

    this.setState({
      monedas,
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

    alertDialog('Banco', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Banco', 'Procesando información...');

        const data = {
          nombre: this.state.nombre.trim().toUpperCase(),
          tipoCuenta: this.state.tipoCuenta,
          idMoneda: this.state.idMoneda.trim().toUpperCase(),
          numCuenta: this.state.numCuenta.trim().toUpperCase(),
          idSucursal: this.state.idSucursal,
          cci: this.state.cci.trim().toUpperCase(),
          preferido: this.state.preferido,
          vuelto: this.state.vuelto,
          reporte: this.state.reporte,
          estado: this.state.estado,

          idUsuario: this.state.idUsuario,
        };

        const response = await addBanco(data, this.abortController.signal);
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
          subTitle='AGREGAR'
          handleGoBack={() => this.props.history.goBack()}
        />


        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>Nombre Banco: <i className="fa fa-asterisk text-danger small"></i></>}
              ref={this.refTxtNombre}
              placeholder="BCP, BBVA, etc"
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Select
              group={true}
              label={<>Tipo de Cuenta: <i className="fa fa-asterisk text-danger small"></i></>}
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
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Select
              group={true}
              label={<>Moneda: <i className="fa fa-asterisk text-danger small"></i></>}
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
            </Select>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>Número de cuenta:</>}
              placeholder="##############"
              ref={this.refTxtNumCuenta}
              value={this.state.numCuenta}
              onChange={(event) =>
                this.setState({ numCuenta: event.target.value })
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Input
              group={true}
              label={<>CCI:</>}
              placeholder="##############"
              ref={this.refTxtCci}
              value={this.state.cci}
              onChange={(event) => this.setState({ cci: event.target.value })}
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={"Vuelto:"}
              id={"vueltoChecked"}
              checked={this.state.vuelto}
              onChange={(value) =>
                this.setState({ vuelto: value.target.checked })
              }
            >
              {this.state.vuelto ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={"Estado:"}
              id={"estadoChecked"}
              checked={this.state.estado}
              onChange={(value) =>
                this.setState({ estado: value.target.checked })
              }
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={"Preferido:"}
              id={"preferidoChecked"}
              checked={this.state.preferido}
              onChange={(value) =>
                this.setState({ preferido: value.target.checked })
              }
            >
              {this.state.preferido ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={"Mostrar en Reporte:"}
              id={"reporteChecked"}
              checked={this.state.reporte}
              onChange={(value) =>
                this.setState({ reporte: value.target.checked })
              }
            >
              {this.state.reporte ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>
        <Row>
          <Column>
            <Button
              className="btn-success"
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

const ConnectedBancoAgregar = connect(mapStateToProps, null)(BancoAgregar);

export default ConnectedBancoAgregar;