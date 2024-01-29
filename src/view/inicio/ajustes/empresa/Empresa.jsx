import React from 'react';
import {
  isEmpty,
  spinnerLoading,
  statePrivilegio,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import { loadEmpresa } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';

class Empresa extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      empresa: [],

      // edit: statePrivilegio(
      //   this.props.token.userToken.menus[5].submenu[3].privilegio[0].estado,
      // ),

      loading: false,
    };

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    await this.loadInit();
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    this.fillTable();
  };

  fillTable = async () => {
    this.setState({ loading: true });

    const response = await loadEmpresa(this.abortControllerTable.signal);

    if (response instanceof SuccessReponse) {

      this.setState({
        loading: false,
        empresa: [...this.state.empresa, response.data],
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.setState({ loading: false });
    }
  };

  handleEdit(idEmpresa) {
    this.props.history.push({
      pathname: `${this.props.location.pathname}/proceso`,
      search: '?idEmpresa=' + idEmpresa,
    });
  }

  generarBody() {
    if (this.state.loading) {
      return (
        <tr>
          <td className="text-center" colSpan="7">
            {spinnerLoading(
              'Cargando información de la tabla...',
              true,
            )}
          </td>
        </tr>
      );
    }
    if (isEmpty(this.state.empresa)) {
      return (
        <tr className="text-center">
          <td colSpan="7">¡No hay datos registrados!</td>
        </tr>
      );
    }

    return this.state.empresa.map((item, index) => {
      return (
        <tr key={index}>
          <td className="text-center">{++index}</td>
          <td>{item.documento}</td>
          <td>{item.razonSocial}</td>
          <td>{item.nombreEmpresa}</td>
          <td>
            <img
              src={item.rutaLogo ? item.rutaLogo : images.noImage}
              alt="Logo"
              width="100"
            />
          </td>
          <td>
            <img
              src={item.rutaImage ? item.rutaImage : images.noImage}
              alt="Imagen"
              width="100"
            />
          </td>
          <td className="text-center">
            <button
              className="btn btn-outline-warning btn-sm"
              title="Editar"
              onClick={() =>
                this.handleEdit(item.idEmpresa)
              }
              // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </td>
        </tr>
      );
    })
  }

  render() {
    return (
      <ContainerWrapper>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Empresa <small className="text-secondary"></small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="10%">N° Documento</th>
                    <th width="15%">Razón Social</th>
                    <th width="15%">Nombre Comercial</th>
                    <th width="10%">Logo</th>
                    <th width="10%">Imagen</th>
                    <th width="5%" className="text-center">
                      Editar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.generarBody()}
                </tbody>
              </table>
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

export default connect(mapStateToProps, null)(Empresa);
