import React from 'react';
import {
  currentDate,
  keyNumberPhone,
  keyNumberInteger,
  convertNullText,
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
import { alertKit } from 'alert-kit';
import { JURIDICA } from '@/model/types/tipo-entidad';

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
      clave: '',
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

    const [responseListaTipoDocumento, responsePersona] = await Promise.all([
      comboTipoDocumento(this.abortController.signal),
      getIdPersona(params, this.abortController.signal),
    ]);

    if (responseListaTipoDocumento instanceof ErrorResponse) {
      if (responseListaTipoDocumento.getType() === CANCELED) return;

      this.setState({
        msgLoading: responseListaTipoDocumento.getMessage(),
      });
      return;
    }

    if (responsePersona instanceof ErrorResponse) {
      if (responsePersona.getType() === CANCELED) return;

      this.setState({
        msgLoading: responsePersona.getMessage(),
      });
      return;
    }

    const documentos = responseListaTipoDocumento.data;
    const cliente = responsePersona.data

    this.setState({
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
      clave: text(cliente.clave),
      genero: text(cliente.genero),
      direccion: text(cliente.direccion),

      idUbigeo: cliente.idUbigeo === 0 ? '' : cliente.idUbigeo.toString(),

      estadoCivil: text(cliente.estadoCivil),
      estado: cliente.estado === 1 ? true : false,
      observacion: text(cliente.observacion),

      tiposDocumentos: documentos,

      loading: false,
    }, () => {
      if (cliente && cliente.ubigeo) {
        this.handleSelectItemUbigeo(cliente);
      }
    });
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

  handleInputClave = () => {
    this.setState({ clave: event.target.value });
  };

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value });
  };

  handleInputEstado = (value) => {
    this.setState({ estado: value.target.checked });
  };

  handleGetApiReniec = async () => {
    if (this.state.documento.length !== 8) {
      alertKit.warning({
        title: "Persona",
        message: "Para iniciar la busqueda en número dni debe tener 8 caracteres.",
      }, () => {
        this.refNumeroDocumento.current.focus();
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
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Persona",
        message: response.getMessage(),
      }, () => {
        this.setState({
          loading: false,
        });
      });
    }
  };

  handleGetApiSunat = async () => {
    if (this.state.documento.length !== 11) {
      alertKit.warning({
        title: "Persona",
        message: "Para iniciar la busqueda en número ruc debe tener 11 caracteres.",
      }, () => {
        this.refNumeroDocumento.current.focus();
      });
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
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Persona",
        message: response.getMessage(),
      }, () => {
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
      alertKit.warning({
        title: "Persona",
        message: "Seleccione el tipo de documento.",
      }, () => {
        this.refTipoDocumento.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.documento)) {
      alertKit.warning({
        title: "Persona",
        message: "Ingrese el número de documento.",
      }, () => {
        this.refDocumento.current.focus();
      });
      return;
    }

    if (
      tipoDocumento &&
      tipoDocumento.obligado === 1 &&
      tipoDocumento.longitud !== this.state.documento.length
    ) {
      alertKit.warning({
        title: "Persona",
        message: `El número de documento por ser ${tipoDocumento.nombre} tiene que tener una longitud de ${tipoDocumento.longitud} carácteres.`,
      }, () => {
        this.refDocumento.current.focus();
      })
      return;
    }

    if (isEmpty(this.state.informacion)) {
      alertKit.warning({
        title: "Persona",
        message: "Ingrese los apellidos y nombres.",
      }, () => {
        this.refInformacion.current.focus();
      });
      return;
    }

    if (this.state.conductor && isEmpty(this.state.licenciaConductir)) {
      alertKit.warning({
        title: "Persona",
        message: "Ingrese el número de licencia.",
      }, () => {
        this.refLicenciaConducir.current.focus();
      });
      return;
    }

    alertKit.question({
      title: "Persona",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    }, async (accept) => {
      if (accept) {
        const data = {
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
          clave: this.state.clave.trim(),
          genero: this.state.genero,
          direccion: this.state.direccion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estadoCivil: this.state.estadoCivil,
          estado: this.state.estado,
          observacion: this.state.observacion.trim().toUpperCase(),
          idUsuario: this.state.idUsuario,
        };

        alertKit.loading({
          message: 'Procesando información...',
        });

        const response = await editPersona(data);
        if (response instanceof SuccessReponse) {
          alertKit.success({
            title: "Persona",
            message: "Se ha editado la persona exitosamente",
          }, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {

          alertKit.warning({
            title: "Persona",
            message: response.getMessage(),
          })
        }
      }
    });
  };

  render() {
    const {
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
      clave,
      direccion,
      estado,

      loading,
      msgLoading,

      tiposDocumentos
    } = this.state;

    const tipoEntidad = tiposDocumentos.find((item) => item.idTipoDocumento === idTipoDocumento)?.tipoEntidad;

    if (loading) {
      return (
        <ContainerWrapper>
          <SpinnerView
            loading={loading}
            message={msgLoading}
          />
        </ContainerWrapper>
      );
    }

    return (
      <ContainerWrapper>
        <Title
          title="Persona"
          subTitle="EDITAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Select
              label={
                <>
                  Tipo Documento: <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className={`${idTipoDocumento ? '' : 'is-invalid'}`}
              value={idTipoDocumento}
              ref={this.refTipoDocumento}
              onChange={this.handleSelectTipoDocumento}
            >
              <option value="">-- Seleccione --</option>
              {
                tiposDocumentos.map((item, index) => (
                  <option key={index} value={item.idTipoDocumento}>
                    {item.nombre}
                  </option>
                ))
              }
            </Select>
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              group={true}
              label={
                <>
                  N° de documento ({documento.length}):  <i className="fa fa-asterisk text-danger small"></i>
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
                  {tipoEntidad === JURIDICA ? (
                    <Button
                      className="btn-outline-secondary"
                      title="Sunat"
                      onClick={this.handleGetApiSunat}
                    >
                      <img src={images.sunat} alt="Sunat" width="12" />
                    </Button>
                  ) :
                    (
                      <Button
                        className="btn-outline-secondary"
                        title="Reniec"
                        onClick={this.handleGetApiReniec}
                      >
                        <img src={images.reniec} alt="Reniec" width="12" />
                      </Button>
                    )
                  }
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
                  {tipoEntidad === JURIDICA ? 'Razón Social: ' : 'Apellidos y Nombres: '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              className={`${informacion ? '' : 'is-invalid'}`}
              ref={this.refInformacion}
              value={informacion}
              onChange={this.handleInputInformacion}
              placeholder={tipoEntidad === JURIDICA ? 'Ingrese Razón Social' : 'Ingrese Apellidos y Nombres'}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <label>
              Tipo de Roles: <i className="fa fa-asterisk text-danger small"></i>
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

        {tipoEntidad !== JURIDICA && (
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
          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={'E-Mail:'}
              type="email"
              value={email}
              onChange={this.handleInputEmail}
              placeholder="Ingrese el email"
            />
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={'Contraseña:'}
              type="password"
              value={clave}
              onChange={this.handleInputClave}
              placeholder="* * * * * *"
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
