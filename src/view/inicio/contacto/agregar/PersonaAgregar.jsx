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
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import PropTypes from 'prop-types';
import {
  createPersona,
  getUbigeo,
  comboTipoDocumento,
} from '../../../../network/rest/principal.network';
import { getDni, getRuc } from '../../../../network/rest/apisperu.network';
import { CANCELED } from '../../../../model/types/types';
import CustomComponent from '../../../../model/class/custom-component';
import { CLIENTE_NATURAL, CLIENTE_JURIDICO } from '../../../../model/types/tipo-cliente';
import SearchInput from '../../../../components/SearchInput';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import Input from '../../../../components/Input';
import RadioButton from '../../../../components/RadioButton';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class PersonaAgregar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

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
      ubigeo: '',

      estadoCivil: '',
      predeterminado: false,
      estado: true,
      observacion: '',

      // otros datos
      idUsuario: this.props.token.userToken.idUsuario,

      tiposDocumentos: [],

      filter: false,
      filteredData: [],
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
    this.refFechaNacimiento = React.createRef();

    this.abortController = new AbortController();

    this.selectItem = false;
  }

  async componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadingData = async () => {
    const documentos = await this.fetchTipoDocumento();

    if (documentos.length !== 0) {
      this.setState({
        tiposDocumentos: documentos,
        loading: false,
      });
    } else {
      this.setState({
        msgLoading: 'Se produjo un error un interno, intente nuevamente.',
      });
    }
  }

  async fetchTipoDocumento() {
    const response = await comboTipoDocumento(
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleTipoCliente = (event) => {
    this.setState({ idTipoCliente: event.target.value, idTipoDocumento: '' })
  }

  handleSelectTipoDocumento = (event) => {
    this.setState({ idTipoDocumento: event.target.value });
  }

  handleInputNumeroDocumento = (event) => {
    this.setState({ documento: event.target.value });
  }

  handleInputInformacion = (event) => {
    this.setState({ informacion: event.target.value });
  }

  handleSelectGenero = (event) => {
    this.setState({ genero: event.target.value });
  }

  handleSelectEstadoCvil = (event) => {
    this.setState({ estadoCivil: event.target.value });
  }

  handleInputFechaNacimiento = (event) => {
    this.setState({ fechaNacimiento: event.target.value });
  }

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  }

  handleInputCelular = (event) => {
    this.setState({ celular: event.target.value });
  }

  handleInputTelefono = (event) => {
    this.setState({ telefono: event.target.value });
  }

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value });
  }

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value });
  }

  handleInputEstado = (value) => {
    this.setState({ estado: value.target.checked });
  }

  handleInputPredeterminado = (value) => {
    this.setState({ predeterminado: value.target.checked });
  }

  handleGetApiReniec = async () => {
    if (this.state.documento.length !== 8) {
      alertWarning("Persona", 'Para iniciar la busqueda en número dni debe tener 8 caracteres.', () => {
        this.refDocumento.current.focus();
      })
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
        informacion: convertNullText(response.data.apellidoPaterno) + ' ' + convertNullText(response.data.apellidoMaterno) + ' ' + convertNullText(response.data.nombres),
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
  }

  handleGetApiSunat = async () => {
    if (this.state.documento.length !== 11) {
      alertWarning("Persona", 'Para iniciar la busqueda en número ruc debe tener 11 caracteres.', () => {
        this.refDocumentoPj.current.focus();
      })
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
        informacionPj: convertNullText(response.data.razonSocial),
        direccionPj: convertNullText(response.data.direccion),
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
  }

  handleFilter = async (event) => {
    const searchWord = this.selectItem ? '' : event.target.value;
    await this.setStateAsync({ idUbigeo: '', ubigeo: searchWord });
    this.selectItem = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ filteredData: [] });
      return;
    }

    if (this.state.filter) return;

    await this.setStateAsync({ filter: true });

    const params = {
      filtrar: searchWord,
    };

    const response = await getUbigeo(params);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({ filter: false, filteredData: response.data });
    }

    if (response instanceof ErrorResponse) {
      await this.setStateAsync({ filter: false, filteredData: [] });
    }
  }

  handleSelectItem = async (value) => {
    await this.setStateAsync({
      ubigeo:
        value.departamento +
        '-' +
        value.provincia +
        '-' +
        value.distrito +
        ' (' +
        value.ubigeo +
        ')',
      filteredData: [],
      idUbigeo: value.idUbigeo,
    });
    this.selectItem = true;
  }

  handleClearInput = async () => {
    await this.setStateAsync({ filteredData: [], idUbigeo: '', ubigeo: '' });
    this.selectItem = false;
  }

  handleSave = () => {
    const tipoDocumento = this.state.tiposDocumentos.find(item => item.idTipoDocumento === this.state.idTipoDocumento);

    if (isEmpty(this.state.idTipoDocumento)) {
      alertWarning("Persona", 'Seleccione el tipo de documento.', () => {
        this.refTipoDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.documento)) {
      alertWarning("Persona", 'Ingrese el número de documento.', () => {
        this.refDocumento.current.focus();
      })
      return;
    }

    if (tipoDocumento && tipoDocumento.obligado === 1 && tipoDocumento.longitud !== this.state.documento.length) {
      alertWarning("Persona", `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`, () => {
        this.refDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertWarning("Persona", 'Ingrese los apellidos y nombres.', () => {
        this.refInformacion.current.focus();
      })
      return;
    }

    if (this.state.conductor && isEmpty(this.state.licenciaConductir)) {
      alertWarning("Persona", 'Ingrese el número de licencia.', () => {
        this.refLicenciaConducir.current.focus();
      })
      return;
    }

    alertDialog('Persona', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoCliente: this.state.idTipoCliente,
          idTipoDocumento: this.state.idTipoDocumento,
          documento: this.state.documento.toString().trim().toUpperCase(),
          informacion: this.state.informacion.trim().toUpperCase(),
          cliente: this.state.cliente,
          proveedor: this.state.proveedor,
          conductor: this.state.conductor,
          licenciaConducir: this.state.licenciaConductir,
          telefono: this.state.telefono.toString().trim().toUpperCase(),
          celular: this.state.celular.toString().trim().toUpperCase(),
          fechaNacimiento: this.state.fechaNacimiento,
          email: this.state.email.trim(),
          genero: this.state.genero,
          direccion: this.state.direccion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estadoCivil: this.state.estadoCivil,
          predeterminado: this.state.predeterminado,
          estado: this.state.estado,
          observacion: this.state.observacion.trim().toUpperCase(),
          idUsuario: this.state.idUsuario,
        };

        alertInfo('Persona', 'Procesando información...');

        const response = await createPersona(data);

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
  }

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
      ubigeo,
      estado,
      predeterminado,
    } = this.state;

    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title="Persona"
          subTitle="Registrar"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <label>
              Tipo de Persona: <i className="fa fa-asterisk text-danger small"></i>
            </label>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <RadioButton
              className='form-check-inline'
              id={CLIENTE_NATURAL}
              value={CLIENTE_NATURAL}
              checked={idTipoCliente === CLIENTE_NATURAL}
              onChange={this.handleTipoCliente}
            >
              <i className="bi bi-person"></i> Persona Natural
            </RadioButton>

            <RadioButton
              className='form-check-inline'
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
          <Column className='col-md-6 col-12' formGroup={true}>
            <label>
              Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <Select
              className={`${idTipoDocumento ? '' : 'is-invalid'}`}
              value={idTipoDocumento}
              refSelect={this.refTipoDocumento}
              onChange={this.handleSelectTipoDocumento}
            >
              <option value="">-- Seleccione --</option>
              {
                idTipoCliente === CLIENTE_NATURAL && (
                  this.state.tiposDocumentos.filter((item) => item.idTipoDocumento !== 'TD0003').map((item, index) => (
                    <option key={index} value={item.idTipoDocumento}>
                      {item.nombre}
                    </option>
                  ))
                )
              }
              {
                idTipoCliente === CLIENTE_JURIDICO && (
                  this.state.tiposDocumentos.filter((item) => item.idTipoDocumento === 'TD0003').map((item, index) => (
                    <option key={index} value={item.idTipoDocumento}>
                      {item.nombre}
                    </option>
                  ))
                )
              }
            </Select>
            {idTipoDocumento === '' && (
              <div className="invalid-feedback">
                Seleccione un valor.
              </div>
            )}
          </Column>

          <Column className='col-md-6 col-12' formGroup={true}>
            <label>
              N° de documento ({documento.length}):{' '}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>

            <div className="input-group is-invalid">
              <Input
                className={`${documento ? '' : 'is-invalid'}`}
                refInput={this.refDocumento}
                value={documento}
                onChange={this.handleInputNumeroDocumento}
                onKeyDown={keyNumberInteger}
                placeholder="00000000"
              />
              <div className="input-group-append">
                {
                  idTipoCliente === CLIENTE_NATURAL && (
                    <Button
                      className="btn-outline-secondary"
                      title="Reniec"
                      onClick={this.handleGetApiReniec}
                    >
                      <img src={images.reniec} alt="Reniec" width="12" />
                    </Button>
                  )
                }
                {
                  idTipoCliente === CLIENTE_JURIDICO && (
                    <Button
                      className="btn-outline-secondary"
                      title="Sunat"
                      onClick={this.handleGetApiSunat}
                    >
                      <img src={images.sunat} alt="Sunat" width="12" />
                    </Button>
                  )
                }
              </div>
            </div>
            {documento === '' && (
              <div className="invalid-feedback">
                Ingrese un valor.
              </div>
            )}
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>
              {idTipoCliente === CLIENTE_NATURAL && 'Apellidos y Nombres:'}
              {idTipoCliente === CLIENTE_JURIDICO && 'Razón Social:'}
              <i className="fa fa-asterisk text-danger small"></i>
            </label>

            <Input
              className={`${informacion ? '' : 'is-invalid'}`}
              refInput={this.refInformacion}
              value={informacion}
              onChange={this.handleInputInformacion}
              placeholder={
                idTipoCliente === CLIENTE_NATURAL
                  ? 'Ingrese sus Apellidos y Nombres'
                  : 'Ingrese su Razón Social'
              }
            />
            {informacion === '' && (
              <div className="invalid-feedback">Ingrese un valor.</div>
            )}
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>
              Tipo de Roles: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <div className="form-check form-check">
              <input className="form-check-input"
                type="checkbox"
                id="checkboxPnCliente"
                checked={this.state.cliente}
                onChange={(event) => {
                  this.setState({ cliente: event.target.checked })
                }} />
              <label className="form-check-label" htmlFor="checkboxPnCliente"> Cliente</label>
            </div>

            <div className="form-check form-check">
              <input className="form-check-input"
                type="checkbox"
                id="checkboxPnProveedor"
                checked={this.state.proveedor}
                onChange={(event) => {
                  this.setState({ proveedor: event.target.checked })
                }} />
              <label className="form-check-label" htmlFor="checkboxPnProveedor"> Proveedor</label>
            </div>

            <div className="form-check form-check">
              <input className="form-check-input"
                type="checkbox"
                id="checkboxPnConductor"
                checked={this.state.conductor}
                onChange={(event) => {
                  this.setState({ conductor: event.target.checked })
                }} />
              <label className="form-check-label" htmlFor="checkboxPnConductor"> Conductor</label>
            </div>
            {
              this.state.conductor && (
                <Row>
                  <Column>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Número de licencia de conducir'
                      ref={this.refLicenciaConducir}
                      value={this.state.licenciaConductir}
                      onChange={(event) => {
                        this.setState({ licenciaConductir: event.target.value })
                      }} />
                  </Column>
                </Row>
              )
            }
          </Column>
        </Row>

        {idTipoCliente === 'TC0001' &&
          <Row>
            <Column className='col-md-4' formGroup={true}>
              <label>Genero: </label>

              <Select
                refSelect={this.refGenero}
                value={genero}
                onChange={this.handleSelectGenero}
              >
                <option value="">-- Seleccione --</option>
                <option value="1">Masculino</option>
                <option value="2">Femenino</option>
              </Select>
            </Column>

            <Column className='col-md-4' formGroup={true}>
              <label>Estado Civil:</label>
              <Select
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

            <Column className='col-md-4' formGroup={true}>
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                className="form-control"
                ref={this.refFechaNacimiento}
                value={fechaNacimiento}
                onChange={this.handleInputFechaNacimiento}
              />
            </Column>
          </Row>
        }

        <Row>
          <Column formGroup={true}>
            <label>Observación:</label>

            <Input
              value={observacion}
              onChange={this.handleInputObservacion}
              placeholder="Ingrese alguna observación"
            />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-6 col-12' formGroup={true}>
            <label>N° de Celular:</label>

            <Input
              value={celular}
              refInput={this.refCelular}
              onChange={this.handleInputCelular}
              onKeyDown={keyNumberPhone}
              placeholder="Ingrese el número de celular."
            />
          </Column>

          <Column className='col-md-6 col-12' formGroup={true}>
            <label>N° de Telefono:</label>

            <Input
              value={telefono}
              refInput={this.refTelefono}
              onChange={this.handleInputTelefono}
              onKeyDown={keyNumberPhone}
              placeholder="Ingrese el número de telefono."
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>E-Mail:</label>

            <Input
              type="email"
              value={email}
              onChange={this.handleInputEmail}
              placeholder="Ingrese el email"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>Dirección:</label>

            <Input
              refInput={this.refDireccion}
              value={direccion}
              onChange={this.handleInputDireccion}
              placeholder="Ingrese la dirección"
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>Ubigeo:</label>
            <SearchInput
              placeholder="Escribe para iniciar a filtrar..."
              refValue={this.refUbigeo}
              value={ubigeo}
              data={this.state.filteredData}
              handleClearInput={this.handleClearInput}
              handleFilter={this.handleFilter}
              handleSelectItem={this.handleSelectItem}
              renderItem={(value) =>
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
              }
            />
          </Column>
        </Row>

        <Row>
          <Column className='col-md-6 col-12' formGroup={true}>
            <label>Estado:</label>

            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch1"
                checked={estado}
                onChange={this.handleInputEstado}
              />
              <label className="custom-control-label" htmlFor="switch1">
                {estado ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </Column>

          <Column className='col-md-6 col-12' formGroup={true}>
            <label>Predeterminado:</label>

            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="switch2"
                checked={predeterminado}
                onChange={this.handleInputPredeterminado}
              />
              <label className="custom-control-label" htmlFor="switch2">
                {predeterminado ? 'Si' : 'No'}
              </label>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button
              className='btn-primary mr-2'
              onClick={this.handleSave}
              icono={<i className='fa fa-plus'></i>}
              text={"Guardar"}
            />

            <Button
              className='btn-danger'
              onClick={() => this.props.history.goBack()}
              icono={<i className='fa fa-close'></i>}
              text={"Cancelar"}
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

PersonaAgregar.propTypes = {
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
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedPersonaAgregar = connect(mapStateToProps, null)(PersonaAgregar);

export default ConnectedPersonaAgregar;
