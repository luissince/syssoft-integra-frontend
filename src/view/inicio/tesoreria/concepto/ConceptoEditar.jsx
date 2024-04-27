import React from 'react';
import { connect } from 'react-redux';
import CustomComponent from '../../../../model/class/custom-component';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  spinnerLoading,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import {
  editConcepto,
  getIdConcepto,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';

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
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <section className="content-header">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Editar Concepto
              </h5>
            </section>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label>
                Nombre <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                value={this.state.nombre}
                ref={this.refNombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
                placeholder="Ingrese el nombre del concepto"
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label>
                Tipo de Concepto{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  ref={this.refTipo}
                  value={this.state.tipo}
                  onChange={(event) =>
                    this.setState({ tipo: event.target.value })
                  }
                >
                  <option value={0}>-- Seleccione --</option>
                  <option value={1}>CONCEPTO DE GASTO</option>
                  <option value={2}>CONCEPTO DE COBRO</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label>Código</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={this.state.codigo}
                  onChange={(event) =>
                    this.setState({ codigo: event.target.value })
                  }
                  placeholder="Código"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleEditar}
              >
                Guardar
              </button>{' '}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.props.history.goBack()}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const ConnectedConceptoEditar = connect(mapStateToProps, null)(ConceptoEditar);

export default ConnectedConceptoEditar;