import React from 'react';
import { connect } from 'react-redux';
import CustomComponent from '../../../../model/class/custom-component';
import ContainerWrapper from '../../../../components/Container';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
} from '../../../../helper/utils.helper';
import { addConcepto } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Select from '../../../../components/Select';
import Title from '../../../../components/Title';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

class ConceptoAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      nombre: '',
      tipo: 0,
      codigo: '',

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTipo = React.createRef();
  }

  handleGuardar = async () => {
    if (!isText(this.state.nombre)) {
      alertWarning('Concepto', 'Ingrese el nombre del concepto.', () =>
        this.refNombre.current.focus(),
      );
      return;
    }

    if (this.state.tipo === 0) {
      alertWarning('Concepto', 'Seleccione el tipo de concepto.', () =>
        this.refTipo.current.focus(),
      );
      return;
    }

    alertDialog('Concepto', '¿Estás seguro de continuar?', async (event) => {
      if (event) {
        const data = {
          nombre: this.state.nombre,
          tipo: this.state.tipo,
          codigo: this.state.codigo,
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Concepto', 'Procesando información...');

        const response = await addConcepto(data);

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
        <Title
          title='Concepto'
          subTitle='AGREGAR'
          icon={<i className="bi bi-plus"></i>}
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
              className="btn-primary"
              onClick={this.handleGuardar}
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedConceptoAgregar = connect(mapStateToProps, null)(ConceptoAgregar);

export default ConnectedConceptoAgregar;