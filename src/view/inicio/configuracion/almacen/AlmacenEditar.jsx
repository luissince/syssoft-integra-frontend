import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  isText,
} from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  getIdAlmacen,
  getUbigeo,
  updateAlmacen,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import SearchInput from '../../../../components/SearchInput';
import { SpinnerView } from '../../../../components/Spinner';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import TextArea from '../../../../components/TextArea';
import Button from '../../../../components/Button';

class AlmacenEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idAlmacen: '',
      nombre: '',
      direccion: '',
      idUbigeo: '',
      codigoSunat: '',
      observacion: '',
      predefinido: false,

      ubigeos: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refDireccion = React.createRef();
    this.refUbigeo = React.createRef();
    this.refValueUbigeo = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idAlmacen = new URLSearchParams(url).get('idAlmacen');
    if (isText(idAlmacen)) {
      this.loadingData(idAlmacen);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [almacen] = await Promise.all([
      this.fetchGetIdAlmacen(id)
    ]);

    const ubigeo = {
      idUbigeo: almacen.idUbigeo,
      departamento: almacen.departamento,
      provincia: almacen.provincia,
      distrito: almacen.distrito,
      ubigeo: almacen.ubigeo,
    };

    this.handleSelectItemUbigeo(ubigeo);

    this.setState({
      idAlmacen: id,
      nombre: almacen.nombre,
      direccion: almacen.direccion,
      codigoSunat: almacen.codigoSunat,
      observacion: almacen.observacion,
      predefinido: almacen.predefinido === 1 ? true : false,
      loading: false,
    });
  }

  async fetchGetIdAlmacen(id) {
    const params = {
      idAlmacen: id,
    };

    const response = await getIdAlmacen(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------
  handleClearInputaUbigeo = () => {
    this.setState({ ubigeos: [], idUbigeo: '' });
  };

  handleFilterUbigeo = async (value) => {
    const searchWord = value;
    this.setState({ idUbigeo: '' });

    if (isEmpty(searchWord)) {
      this.setState({ ubigeos: [] });
      return;
    }

    const params = {
      filtrar: searchWord,
    };

    const response = await getUbigeo(params);

    if (response instanceof SuccessReponse) {
      this.setState({ ubigeos: response.data });
    }

    if (response instanceof ErrorResponse) {
      this.setState({ ubigeos: [] });
    }
  };

  handleSelectItemUbigeo = (value) => {
    this.refUbigeo.current.initialize(
      value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')'
    );
    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  };


  handleSave() {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Almacén', 'Ingrese un nombre para el almacén', () =>
        this.refNombre.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.direccion)) {
      alertWarning('Almacén', 'Ingrese una dirección para el almacén.', () =>
        this.refDireccion.current.focus(),
      );
      return;
    }

    if (isEmpty(this.state.idUbigeo)) {
      alertWarning('Almacén', 'Ingrese el ubigeo.', () =>
        this.refValueUbigeo.current.focus(),
      );
      return;
    }

    alertDialog('Almacén', '¿Esta seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Almacen', 'Procesando información...');

        const data = {
          nombre: this.state.nombre.trim(),
          direccion: this.state.direccion.trim(),
          idUbigeo: this.state.idUbigeo,
          codigoSunat: this.state.codigoSunat.toString().trim(),
          observacion: this.state.observacion,
          predefinido: this.state.predefinido,
          idSucursal: this.state.idSucursal,
          idUsuario: this.state.idUsuario,
          idAlmacen: this.state.idAlmacen,
        };

        const response = await updateAlmacen(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Almacen', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Almacen', response.getMessage(), () => {
            this.refNombre.current.focus();
          });
        }
      }
    });
  }

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Almacen'
          subTitle='EDITAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Input
              label={<>Nombre del Almacén:{' '}<i className="fa fa-asterisk text-danger small"></i></>}
              refInput={this.refNombre}
              value={this.state.nombre}
              onChange={(event) => {
                this.setState({
                  nombre: event.target.value,
                });
              }}
              placeholder="Ingrese el nombre del almacen"
            />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-12' formGroup={true}>
            <Input
              label={<>Dirección: <i className="fa fa-asterisk text-danger small"></i></>}
              refInput={this.refDireccion}
              value={this.state.direccion}
              onChange={(event) => {
                this.setState({ direccion: event.target.value });
              }}
              placeholder="Ingrese una dirección"
            />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-12' formGroup={true}>
            <SearchInput
              ref={this.refUbigeo}
              label={<>Ubigeo: <i className="fa fa-asterisk text-danger small"></i></>}
              placeholder="Filtrar productos..."
              refValue={this.refValueUbigeo}
              data={this.state.ubigeos}
              handleClearInput={this.handleClearInputaUbigeo}
              handleFilter={this.handleFilterUbigeo}
              handleSelectItem={this.handleSelectItemUbigeo}
              renderItem={(value) => (
                <>
                  {value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')'}
                </>
              )}
            />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-6' formGroup={true}>
            <Input
              label={"Código SUNAT:"}
              value={this.state.codigoSunat}
              onChange={(event) => {
                this.setState({ codigoSunat: event.target.value });
              }}
            />
          </Column>

          <Column className='col-md-6' formGroup={true}>
            <Switches
              label={"Preferido:"}
              id={"cbPreferido"}
              checked={this.state.predefinido}
              onChange={(value) =>
                this.setState({ predefinido: value.target.checked })
              }
            >
              {this.state.predefinido ? "Si" : "No"}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TextArea
              label={"Observaciones:"}
              rows={3}
              value={this.state.observacion}
              onChange={(event) =>
                this.setState({
                  observacion: event.target.value,
                })
              } />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-12' formGroup={true}>
            <label>
              Los campos marcados con{' '}<i className="fa fa-asterisk text-danger small"></i> son obligatorios
            </label>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-warning"
              onClick={() => this.handleSave()}
            >
              <i className='fa fa-save'></i>  Guardar
            </Button>
            {" "}
            <Button
              className="btn-danger"
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

const ConnectedAlmacenEditar = connect(mapStateToProps, null)(AlmacenEditar);

export default ConnectedAlmacenEditar;