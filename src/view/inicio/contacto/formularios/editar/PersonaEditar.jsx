import React from 'react';
import {
  alertDialog,
  currentDate,
  keyNumberPhone,
  keyNumberInteger,
  convertNullText,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  isEmpty,
  text,
} from '../../../../../helper/utils.helper';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ContainerWrapper from '../../../../../components/Container';
import { images } from '../../../../../helper';
import SuccessReponse from '../../../../../model/class/response';
import ErrorResponse from '../../../../../model/class/error-response';
import {
  editPersona,
  getIdPersona,
  getUbigeo,
  comboTipoDocumento,
} from '../../../../../network/rest/principal.network';
import { getDni, getRuc } from '../../../../../network/rest/apisperu.network';
import { CANCELED } from '../../../../../model/types/types';
import CustomComponent from '../../../../../model/class/custom-component';
import {
  CLIENTE_NATURAL,
  CLIENTE_JURIDICO,
} from '../../../../../model/types/tipo-cliente';
import SearchInput from '../../../../../components/SearchInput';
import { SpinnerView } from '../../../../../components/Spinner';
import Title from '../../../../../components/Title';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Button from '../../../../../components/Button';
import Select from '../../../../../components/Select';
import Input from '../../../../../components/Input';
import RadioButton from '../../../../../components/RadioButton';
import CheckBox, { Switches } from '../../../../../components/Checks';
import { RUC } from '../../../../../model/types/tipo-documento';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class PersonaEditar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idPersona: '',
      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      documento: '',
      informacion: '',
      cliente: true,
      proveedor: false,
      conductor: false,
      licenciaConductir: '',
      telefono: '',
      celular: '',
      fechaNacimiento: currentDate(),
      email: '',
      genero: '',
      direccion: '',
      idUbigeo: '',

      estadoCivil: '',
      estado: true,
      observacion: '',

      // otros datos
      idUsuario: this.props.token.userToken.idUsuario,

      tiposDocumentos: [],

      ubigeos: [],
    };

    this.refTipoDocumento = React.createRef();
    this.refDocumento = React.createRef();
    this.refInformacion = React.createRef();
    this.refCelular = React.createRef();
    this.refTelefono = React.createRef();
    this.refGenero = React.createRef();
    this.refLicenciaConducir = React.createRef();

    this.refDireccion = React.createRef();
    this.refUbigeo = React.createRef();
    this.refValueUbigeo = React.createRef();
    this.refFechaNacimiento = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idPersona = new URLSearchParams(url).get('idPersona');
    if (isText(idPersona)) {
      this.loadingDataId(idPersona);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadingDataId = async (id) => {
    const params = {
      idPersona: id,
    };

    const [documentos, cliente] = await Promise.all([
      this.fetchTipoDocumento(),
      this.fetchIdPersona(params),
    ]);

    if (cliente === null) {
      this.setState({
        msgLoading: 'Se produjo un error un interno, intente nuevamente.',
      });
      return;
    }

    if (cliente && cliente.ubigeo) {
      this.handleSelectItemUbigeo(cliente);
    }

    this.setState({
      idTipoCliente: cliente.idTipoCliente,
      idPersona: cliente.idPersona,
      idTipoDocumento: cliente.idTipoDocumento,
      documento: text(cliente.documento),
      informacion: text(cliente.informacion),
      cliente: cliente.cliente === 1 ? true : false,
      proveedor: cliente.proveedor === 1 ? true : false,
      conductor: cliente.conductor === 1 ? true : false,
      licenciaConductir: text(cliente.licenciaConducir),
      telefono: text(cliente.telefono),
      celular: text(cliente.celular),
      fechaNacimiento: text(cliente.fechaNacimiento),
      email: text(cliente.email),
      genero: text(cliente.genero),
      direccion: text(cliente.direccion),

      idUbigeo: cliente.idUbigeo === 0 ? '' : cliente.idUbigeo.toString(),

      estadoCivil: text(cliente.estadoCivil),
      estado: cliente.estado === 1 ? true : false,
      observacion: text(cliente.observacion),

      tiposDocumentos: documentos,

      loading: false,
    });
  };

  async fetchTipoDocumento() {
    const response = await comboTipoDocumento(this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  async fetchIdPersona(params) {
    const response = await getIdPersona(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  handleTipoCliente = (event) => {
    this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' });
  };

  handleSelectTipoDocumento = (event) => {
    this.setState({ idTipoDocumento: event.target.value });
  };

  handleInputNumeroDocumento = (event) => {
    this.setState({ documento: event.target.value });
  };

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value });
  };

  handleSelectGenero = (event) => {
    this.setState({ genero: event.target.value });
  };

  handleSelectEstadoCvil = (event) => {
    this.setState({ estadoCivil: event.target.value });
  };

  handleInputFechaNacimiento = (event) => {
    this.setState({ fechaNacimiento: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleInputCelular = (event) => {
    this.setState({
      celular: event.target.value,
    });
  };

  handleInputTelefono = (event) => {
    this.setState({ telefono: event.target.value });
  };

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value });
  };

  handleInputEstado = (value) => {
    this.setState({ estado: value.target.checked });
  };

  handleGetApiReniec = async () => {
    if (this.state.documento.length !== 8) {
      alertWarning(
        'Persona',
        'Para iniciar la busqueda en número dni debe tener 8 caracteres.',
      );
      return;
    }

    this.setState({
      loading: true,
      msgLoading: 'Consultando número de DNI...',
    });

    const response = await getDni(this.state.documento);

    if (response instanceof SuccessReponse) {
      this.setState({
        documento: convertNullText(response.data.dni),
        informacion:
          convertNullText(response.data.apellidoPaterno) +
          ' ' +
          convertNullText(response.data.apellidoMaterno) +
          ' ' +
          convertNullText(response.data.nombres),
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning('Persona', response.getMessage(), () => {
        this.setState({
          loading: false,
        });
      });
    }
  };

  handleGetApiSunat = async () => {
    if (this.state.documento.length !== 11) {
      alertWarning(
        'Persona',
        'Para iniciar la busqueda en número ruc debe tener 11 caracteres.',
      );
      return;
    }

    this.setState({
      loading: true,
      msgLoading: 'Consultando número de RUC...',
    });

    const response = await getRuc(this.state.documento);

    if (response instanceof SuccessReponse) {
      this.setState({
        documento: convertNullText(response.data.ruc),
        informacion: convertNullText(response.data.razonSocial),
        direccion: convertNullText(response.data.direccion),
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning('Persona', response.getMessage(), () => {
        this.setState({
          loading: false,
        });
      });
    }
  };

  handleFilterUbigeo = async (text) => {
    const searchWord = text;
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
      if (response.getType() === CANCELED) return;

      this.setState({ ubigeos: [] });
    }
  };

  handleSelectItemUbigeo = (value) => {
    this.refUbigeo.current.initialize(
      value.departamento +
        '-' +
        value.provincia +
        '-' +
        value.distrito +
        ' (' +
        value.ubigeo +
        ')',
    );
    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  };

  handleClearInputUbigeo = () => {
    this.setState({ ubigeos: [], idUbigeo: '' });
  };

  handleGuardar = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(
      (item) => item.idTipoDocumento === this.state.idTipoDocumento,
    );

    if (isEmpty(this.state.idTipoDocumento)) {
      alertWarning('Persona', 'Seleccione el tipo de documento.', () => {
        this.refTipoDocumento.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.documento)) {
      alertWarning('Persona', 'Ingrese el número de documento.', () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    if (
      tipoDocumento &&
      tipoDocumento.obligado === 1 &&
      tipoDocumento.longitud !== this.state.documento.length
    ) {
      alertWarning(
        'Persona',
        `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`,
        () => {
          this.refDocumento.current.focus();
        },
      );
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertWarning('Persona', 'Ingrese los apellidos y nombres.', () => {
        this.refInformacion.current.focus();
      });
      return;
    }

    if (this.state.conductor && isEmpty(this.state.licenciaConductir)) {
      alertWarning('Persona', 'Ingrese el número de licencia.', () => {
        this.refLicenciaConducir.current.focus();
      });
      return;
    }

    alertDialog('Persona', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoCliente: this.state.idTipoCliente,
          idPersona: this.state.idPersona,
          idTipoDocumento: this.state.idTipoDocumento,
          documento: this.state.documento.toString().trim(),
          informacion: this.state.informacion.trim().toUpperCase(),
          cliente: this.state.cliente,
          proveedor: this.state.proveedor,
          conductor: this.state.conductor,
          licenciaConducir: this.state.licenciaConductir,
          telefono: this.state.telefono.toString().trim().toUpperCase(),
          celular: this.state.celular.toString().trim().toUpperCase(),
          fechaNacimiento:
            this.state.fechaNacimiento == '' ? null : this.state.fechaNacimient,
          email: this.state.email.trim(),
          genero: this.state.genero,
          direccion: this.state.direccion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estadoCivil: this.state.estadoCivil,
          estado: this.state.estado,
          observacion: this.state.observacion.trim().toUpperCase(),
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Persona', 'Procesando información...');

        const response = await editPersona(data);
        if (response instanceof SuccessReponse) {
          alertSuccess('Persona', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Persona', response.getMessage());
        }
      }
    });
  };

  render() {
    const {
      idTipoCliente,
      idTipoDocumento,
      documento,
      informacion,
      genero,
      estadoCivil,
      fechaNacimiento,
      observacion,
      celular,
      telefono,
      email,
      direccion,
      estado,
    } = this.state;

    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Persona"
          subTitle="EDITAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <label>
              Tipo de Persona:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <RadioButton
              className="form-check-inline"
              name="rbTipoCliente"
              id={CLIENTE_NATURAL}
              value={CLIENTE_NATURAL}
              checked={idTipoCliente === CLIENTE_NATURAL}
              onChange={this.handleTipoCliente}
            >
              <i className="bi bi-person"></i> Persona Natural
            </RadioButton>

            <RadioButton
              className="form-check-inline"
              name="rbTipoCliente"
              id={CLIENTE_JURIDICO}
              value={CLIENTE_JURIDICO}
              checked={idTipoCliente === CLIENTE_JURIDICO}
              onChange={this.handleTipoCliente}
            >
              <i className="bi bi-building"></i> Persona Juridica
            </RadioButton>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Select
              label={
                <>
                  Tipo Documento:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className={`${idTipoDocumento ? '' : 'is-invalid'}`}
              value={idTipoDocumento}
              ref={this.refTipoDocumento}
              onChange={this.handleSelectTipoDocumento}
            >
              <option value="">-- Seleccione --</option>
              {idTipoCliente === CLIENTE_NATURAL &&
                this.state.tiposDocumentos
                  .filter((item) => item.idTipoDocumento !== RUC)
                  .map((item, index) => (
                    <option key={index} value={item.idTipoDocumento}>
                      {item.nombre}
                    </option>
                  ))}
              {idTipoCliente === CLIENTE_JURIDICO &&
                this.state.tiposDocumentos
                  .filter((item) => item.idTipoDocumento === RUC)
                  .map((item, index) => (
                    <option key={index} value={item.idTipoDocumento}>
                      {item.nombre}
                    </option>
                  ))}
            </Select>
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  {' '}
                  N° de documento ({documento.length}):{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className={`${documento ? '' : 'is-invalid'}`}
              ref={this.refDocumento}
              value={documento}
              onChange={this.handleInputNumeroDocumento}
              onKeyDown={keyNumberInteger}
              placeholder="00000000"
              buttonRight={
                <>
                  {idTipoCliente === CLIENTE_NATURAL && (
                    <Button
                      className="btn-outline-secondary"
                      onClick={this.handleGetApiReniec}
                    >
                      <img src={images.reniec} alt="Reniec" width="12" />
                    </Button>
                  )}
                  {idTipoCliente === CLIENTE_JURIDICO && (
                    <Button
                      className="btn-outline-secondary"
                      onClick={this.handleGetApiSunat}
                    >
                      <img src={images.sunat} alt="Sunat" width="12" />
                    </Button>
                  )}
                </>
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={
                <>
                  {idTipoCliente === CLIENTE_NATURAL && 'Apellidos y Nombres:'}
                  {idTipoCliente === CLIENTE_JURIDICO && 'Razón Social:'}{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className={`${informacion ? '' : 'is-invalid'}`}
              ref={this.refInformacion}
              value={informacion}
              onChange={this.handleInputInformacion}
              placeholder={
                idTipoCliente === CLIENTE_NATURAL
                  ? 'Ingrese sus Apellidos y Nombres'
                  : 'Ingrese su Razón Social'
              }
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>
              Tipo de Roles:{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>

            <CheckBox
              id="checkboxPnCliente"
              checked={this.state.cliente}
              onChange={(event) => {
                this.setState({ cliente: event.target.checked });
              }}
            >
              Cliente
            </CheckBox>

            <CheckBox
              id="checkboxPnProveedor"
              checked={this.state.proveedor}
              onChange={(event) => {
                this.setState({ proveedor: event.target.checked });
              }}
            >
              Proveedor
            </CheckBox>

            <CheckBox
              id="checkboxPnConductor"
              checked={this.state.conductor}
              onChange={(event) => {
                this.setState({ conductor: event.target.checked });
              }}
            >
              Conductor
            </CheckBox>
            {this.state.conductor && (
              <Row>
                <Column>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Número de licencia de conducir"
                    ref={this.refLicenciaConducir}
                    value={this.state.licenciaConductir}
                    onChange={(event) => {
                      this.setState({ licenciaConductir: event.target.value });
                    }}
                  />
                </Column>
              </Row>
            )}
          </Column>
        </Row>

        {idTipoCliente === 'TC0001' && (
          <Row>
            <Column className="col-md-4" formGroup={true}>
              <Select
                label={'Genero:'}
                className="form-control"
                ref={this.refGenero}
                value={genero}
                onChange={this.handleSelectGenero}
              >
                <option value="">-- Seleccione --</option>
                <option value="1">Masculino</option>
                <option value="2">Femenino</option>
              </Select>
            </Column>

            <Column className="col-md-4" formGroup={true}>
              <Select
                label={'Estado Civil:'}
                value={estadoCivil}
                onChange={this.handleSelectEstadoCvil}
              >
                <option value="">-- seleccione --</option>
                <option value="1">Soltero(a)</option>
                <option value="2">Casado(a)</option>
                <option value="3">Viudo(a)</option>
                <option value="4">Divorciado(a)</option>
              </Select>
            </Column>

            <Column className="col-md-4" formGroup={true}>
              <Input
                label={'Fecha de Nacimiento:'}
                type="date"
                ref={this.refFechaNacimiento}
                value={fechaNacimiento}
                onChange={this.handleInputFechaNacimiento}
              />
            </Column>
          </Row>
        )}

        <Row>
          <Column formGroup={true}>
            <Input
              label={'Observación:'}
              value={observacion}
              onChange={this.handleInputObservacion}
              placeholder="Ingrese alguna observación"
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={'N° de Celular:'}
              value={celular}
              ref={this.refCelular}
              onChange={this.handleInputCelular}
              onKeyDown={keyNumberPhone}
              placeholder="Ingrese el número de celular."
            />
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={'N° de Telefono:'}
              value={telefono}
              ref={this.refTelefono}
              onChange={this.handleInputTelefono}
              onKeyDown={keyNumberPhone}
              placeholder="Ingrese el número de telefono."
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={'E-Mail:'}
              type="email"
              value={email}
              onChange={this.handleInputEmail}
              placeholder="Ingrese el email"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={'Dirección:'}
              ref={this.refDireccion}
              value={direccion}
              onChange={this.handleInputDireccion}
              placeholder="Ingrese la dirección"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <SearchInput
              ref={this.refUbigeo}
              label={'Ubigeo:'}
              placeholder="Escribe para iniciar a filtrar..."
              refValue={this.refValueUbigeo}
              data={this.state.ubigeos}
              handleClearInput={this.handleClearInputUbigeo}
              handleFilter={this.handleFilterUbigeo}
              handleSelectItem={this.handleSelectItemUbigeo}
              renderItem={(value) => (
                <>
                  {value.departamento +
                    '-' +
                    value.provincia +
                    '-' +
                    value.distrito +
                    ' (' +
                    value.ubigeo +
                    ')'}
                </>
              )}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Switches
              label={'Estado:'}
              id={'stEstado'}
              checked={estado}
              onChange={this.handleInputEstado}
            >
              {estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button className="btn-warning" onClick={this.handleGuardar}>
              <i className="fa fa-save"></i> Guardar
            </Button>{' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cancelar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

PersonaEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
    }).isRequired,
    project: PropTypes.shape({
      idSucursal: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedPersonaEditar = connect(mapStateToProps, null)(PersonaEditar);

export default ConnectedPersonaEditar;
