import React from 'react';
import { connect } from 'react-redux';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import {
  editConcepto,
  getIdConcepto,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Select from '../../../../components/Select';
import { SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

class ConceptoEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      idConcepto: '',
      nombre: '',
      tipo: 0,
      codigo: '',

      loading: true,
      msgLoading: 'Cargando datos...',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTipo = React.createRef();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idConcepto = new URLSearchParams(url).get('idConcepto');

    if (isText(idConcepto)) {
      this.loadingData(idConcepto);
    } else {
      this.props.history.goBack();
    }
  }

  async loadingData(idConcepto) {
    const [concepto] = await Promise.all([
      this.fetchGetIdConcepto(idConcepto),
    ]);

    this.setState({
      idConcepto: concepto.idConcepto,
      nombre: concepto.nombre,
      tipo: concepto.tipo,
      codigo: concepto.codigo,
      loading: false,
    });
  }

  async fetchGetIdConcepto(id) {
    const params = {
      idConcepto: id,
    };

    const result = await getIdConcepto(params);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  handleEditar = async () => {
    if (!isText(this.state.nombre)) {
      alertWarning('Concepto', 'Ingrese el nombre del concepto.', () =>
        this.refNombre.current.focus(),
      );
      return;
    }

    if (this.state.tipo === 0) {
      alertWarning('Concepto', 'Seleccione el tipo de <concepto.', () =>
        this.refTipo.current.focus(),
      );
      return;
    }

    alertDialog('Concepto', '¿Estás seguro de continuar?', async (event) => {
      if (event) {
        const data = {
          idConcepto: this.state.idConcepto,
          nombre: this.state.nombre,
          tipo: this.state.tipo,
          codigo: this.state.codigo,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Concepto', 'Procesando información...');

        const response = await editConcepto(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Concepto', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Concepto', response.getMessage());
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
          title='Concepto'
          subTitle='EDITAR'
          icon={<i className="bi bi-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Input
              group={true}
              label={<>Nombre: <i className="fa fa-asterisk text-danger small"></i></>}
              value={this.state.nombre}
              refInput={this.refNombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="Ingrese el nombre del concepto" />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Select
              group={true}
              label={<>Tipo de Concepto: <i className="fa fa-asterisk text-danger small"></i></>}
              value={this.state.tipo}
              refSelect={this.refTipo}
              onChange={(event) =>
                this.setState({ tipo: event.target.value })
              }>
              <option value={0}>-- Seleccione --</option>
              <option value={1}>INGRESO</option>
              <option value={2}>EGRESO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Input
              group={true}
              label={"Código"}
              value={this.state.codigo}
              onChange={(event) =>
                this.setState({ codigo: event.target.value })
              }
              placeholder="Código" />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Button
              className="btn-warning"
              onClick={this.handleEditar}
            >
              <i className='fa fa-pencil'></i> Guardar
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedConceptoEditar = connect(mapStateToProps, null)(ConceptoEditar);

export default ConnectedConceptoEditar;