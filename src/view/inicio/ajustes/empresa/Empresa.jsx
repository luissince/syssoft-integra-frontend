import React from 'react';
import {
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { loadEmpresa } from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import PropTypes from 'prop-types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import { TableResponsive } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';
import Image from '../../../../components/Image';

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
            <SpinnerTable
              message='Cargando información de la tabla...'
            />
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
            <Image
              src={item.rutaLogo}
              alt={"Logo"}
              width={96}
            />
          </td>
          <td>
            <Image
              src={item.rutaImage}
              alt={"Imagen"}
              width={96}
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
        <Title
          title='Empresa'
          subTitle='Lista'
        />

        <Row>
          <Column>
            <TableResponsive
              tHead={
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
              }
              tBody={this.generarBody()}
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

Empresa.propTypes = {
  history: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
}

const ConnectedEmpresa = connect(mapStateToProps, null)(Empresa);

export default ConnectedEmpresa;