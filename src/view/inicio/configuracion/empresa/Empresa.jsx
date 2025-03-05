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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from '../../../../components/Table';
import { SpinnerTable } from '../../../../components/Spinner';
import Image from '../../../../components/Image';
import Button from '../../../../components/Button';

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

  generateBody() {
    if (this.state.loading) {
      return (
        <SpinnerTable
          colSpan='7'
          message='Cargando información de la tabla...'
        />
      );
    }
    if (isEmpty(this.state.empresa)) {
      return (
        <TableRow className="text-center">
          <TableCell colSpan="7">¡No hay datos registrados!</TableCell>
        </TableRow>
      );
    }

    return this.state.empresa.map((item, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="text-center">{++index}</TableCell>
          <TableCell>{item.documento}</TableCell>
          <TableCell>{item.razonSocial}</TableCell>
          <TableCell>{item.nombreEmpresa}</TableCell>
          <TableCell>
            <Image
              src={item.rutaLogo}
              alt={"Logo"}
              width={96}
            />
          </TableCell>
          <TableCell>
            <Image
              src={item.rutaImage}
              alt={"Imagen"}
              width={96}
            />
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="btn-outline-warning btn-sm"
              onClick={() => this.handleEdit(item.idEmpresa)}
            // disabled={!this.state.edit}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </TableCell>
        </TableRow>
      );
    })
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Empresa'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <TableResponsive>
              <Table className={"table-bordered"}>
                <TableHeader className="thead-light">
                  <TableRow>
                    <TableHead width="5%" className="text-center">#</TableHead>
                    <TableHead width="10%">N° Documento</TableHead>
                    <TableHead width="15%">Razón Social</TableHead>
                    <TableHead width="15%">Nombre Comercial</TableHead>
                    <TableHead width="10%">Logo</TableHead>
                    <TableHead width="10%">Imagen</TableHead>
                    <TableHead width="5%" className="text-center">Editar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {this.generateBody()}
                </TableBody>
              </Table>
            </TableResponsive>
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

Empresa.propTypes = {
  history: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
}

const ConnectedEmpresa = connect(mapStateToProps, null)(Empresa);

export default ConnectedEmpresa;