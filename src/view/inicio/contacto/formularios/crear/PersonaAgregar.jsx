import React from 'react';
import {
  currentDate,
  keyNumberPhone,
  keyNumberInteger,
  convertNullText,
  isEmpty,
} from '@/helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import { images } from '@/helper';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import PropTypes from 'prop-types';
import {
  createPersona,
  getUbigeo,
  comboTipoDocumento,
} from '@/network/rest/principal.network';
import { getDni, getRuc } from '@/network/rest/apisperu.network';
import { CANCELED } from '@/constants/requestStatus';
import CustomComponent from '@/components/CustomComponent';
import SearchInput from '@/components/SearchInput';
import { SpinnerView } from '@/components/Spinner';
import Row from '@/components/Row';
import Column from '@/components/Column';
import Title from '@/components/Title';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';
import CheckBox, { Switches } from '@/components/Checks';
import { alertKit } from 'alert-kit';
import { JURIDICA } from '@/model/types/tipo-entidad';
import { comboArea, comboCargo } from '@/network/rest/api-client';
import { FaAsterisk } from 'react-icons/fa';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class PersonaAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: "Cargando datos...",

      idTipoDocumento: "",
      idArea: "",
      idCargo: "",
      documento: "",
      informacion: "",
      cliente: true,
      proveedor: false,
      conductor: false,
      licenciaConductir: "",
      personal: false,
      telefono: "",
      celular: "",
      fechaNacimiento: currentDate(),
      email: "",
      clave: "",
      genero: "",
      direccion: "",
      idUbigeo: "",

      estadoCivil: "",
      estado: true,
      observacion: "",

      tiposDocumentos: [],
      areas: [],
      cargos: [],

      ubigeos: [],

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refTipoDocumento = React.createRef();
    this.refAreas = React.createRef();
    this.refCargos = React.createRef();
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
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  loadingData = async () => {
    const [responseListaTipoDocumento, responseAreas, responseCargos] = await Promise.all([
      this.fetchComboTipoDocumento(),
      this.fetchComboArea(),
      this.fetchComboCargo(),
    ]);

    if (responseListaTipoDocumento instanceof ErrorResponse) {
      if (responseListaTipoDocumento.getType() === CANCELED) return;

      this.setState({
        msgLoading: responseListaTipoDocumento.getMessage(),
      });
      return;
    }

    this.setState({
      tiposDocumentos: responseListaTipoDocumento,
      areas: responseAreas,
      cargos: responseCargos,
      loading: false,
    });
  };

  async fetchComboTipoDocumento() {
    const result = await comboTipoDocumento(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      this.setState({
        msgLoading: result.getMessage(),
      });

      return [];
    }
  }

  async fetchComboArea() {
    const result = await comboArea(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      this.setState({
        msgLoading: result.getMessage(),
      });

      return [];
    }
  }

  async fetchComboCargo() {
    const result = await comboCargo(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      this.setState({
        msgLoading: result.getMessage(),
      });

      return [];
    }
  }

  handleSelectTipoDocumento = (event) => {
    this.setState({ idTipoDocumento: event.target.value });
  };

  handleSelectAreas = (event) => {
    this.setState({ idArea: event.target.value });
  };

  handleSelectCargos = (event) => {
    this.setState({ idCargo: event.target.value });
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
    this.setState({ celular: event.target.value });
  };

  handleInputTelefono = (event) => {
    this.setState({ telefono: event.target.value });
  };

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  handleInputClave = (event) => {
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
        this.refDocumento.current.focus();
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

  handleGuardar = async () => {
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

    if (this.state.personal && isEmpty(this.state.idArea)) {
      alertKit.warning({
        title: "Persona",
        message: "Seleccione el área.",
      }, () => {
        this.refAreas.current.focus();
      });
      return;
    }

    if (this.state.personal && isEmpty(this.state.idCargo)) {
      alertKit.warning({
        title: "Persona",
        message: "Seleccione el cargo.",
      }, () => {
        this.refCargos.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Persona",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      const data = {
        idTipoDocumento: this.state.idTipoDocumento,
        idArea: this.state.idArea,
        idCargo: this.state.idCargo,
        documento: this.state.documento.toString().trim(),
        informacion: this.state.informacion.trim().toUpperCase(),
        cliente: this.state.cliente,
        proveedor: this.state.proveedor,
        conductor: this.state.conductor,
        licenciaConducir: this.state.licenciaConductir,
        personal: this.state.personal,
        telefono: this.state.telefono.toString().trim().toUpperCase(),
        celular: this.state.celular.toString().trim().toUpperCase(),
        fechaNacimiento: this.state.fechaNacimiento,
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

      const response = await createPersona(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Persona",
          message: "Se ha creado la persona exitosamente",
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
  };

  render() {
    const {
      loading,
      msgLoading,

      idTipoDocumento,
      idArea,
      idCargo,
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

      tiposDocumentos,
      areas,
      cargos,
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
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Select
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Tipo Documento:</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
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
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">N° de documento ({documento.length}):</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
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
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">{tipoEntidad === JURIDICA ? "Razón Social:" : "Apellidos y Nombres:"}</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
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
            <div className="flex items-center gap-1">
              <p className="text-gray-700 font-medium">Tipo de Roles:</p> <FaAsterisk className="text-red-500" size={8} />
            </div>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-3 col-12" formGroup={true}>
            <CheckBox
              id="checkboxPnCliente"
              checked={this.state.cliente}
              onChange={(event) => {
                this.setState({ cliente: event.target.checked });
              }}
            >
              Cliente
            </CheckBox>
          </Column>

          <Column className="col-md-3 col-12" formGroup={true}>
            <CheckBox
              id="checkboxPnProveedor"
              checked={this.state.proveedor}
              onChange={(event) => {
                this.setState({ proveedor: event.target.checked });
              }}
            >
              Proveedor
            </CheckBox>
          </Column>

          <Column className="col-md-3 col-12" formGroup={true}>
            <CheckBox
              id="checkboxPnConductor"
              checked={this.state.conductor}
              onChange={(event) => {
                this.setState({ conductor: event.target.checked });
              }}
            >
              Conductor
            </CheckBox>
            {
              this.state.conductor && (
                <Row>
                  <Column>
                    <Input
                      placeholder="Número de licencia de conducir"
                      ref={this.refLicenciaConducir}
                      value={this.state.licenciaConductir}
                      onChange={(event) => {
                        this.setState({ licenciaConductir: event.target.value });
                      }}
                    />
                  </Column>
                </Row>
              )
            }
          </Column>

          <Column className="col-md-3 col-12" formGroup={true}>
            <CheckBox
              id="checkboxPnPersonal"
              checked={this.state.personal}
              onChange={(event) => {
                this.setState({ personal: event.target.checked });
              }}
            >
              Personal
            </CheckBox>
          </Column>
        </Row>

        {this.state.personal && (
          <Row>
            <Column className="col-md-6 col-12" formGroup={true}>
              <Select
                label={
                  <div className="flex items-center gap-1">
                    <p className="text-gray-700 font-medium">Area:</p>
                  </div>
                }
                className={`${idArea ? '' : 'is-invalid'}`}
                value={idArea}
                ref={this.refAreas}
                onChange={this.handleSelectAreas}
              >
                <option value="">-- Seleccione --</option>
                {
                  areas.map((item, index) => (
                    <option key={index} value={item.idArea}>
                      {item.nombre}
                    </option>
                  ))
                }
              </Select>
            </Column>

            <Column className="col-md-6 col-12" formGroup={true}>
              <Select
                label={
                  <div className="flex items-center gap-1">
                    <p className="text-gray-700 font-medium">Cargo:</p>
                  </div>
                }
                className={`${idCargo ? '' : 'is-invalid'}`}
                value={idCargo}
                ref={this.refCargos}
                onChange={this.handleSelectCargos}
              >
                <option value="">-- Seleccione --</option>
                {
                  cargos.map((item, index) => (
                    <option key={index} value={item.idCargo}>
                      {item.nombre}
                    </option>
                  ))
                }
              </Select>
            </Column>
          </Row>
        )}

        {tipoEntidad !== JURIDICA && (
          <Row>
            <Column className="col-md-4" formGroup={true}>
              <Select
                label={
                  <div className="flex items-center gap-1">
                    <p className="text-gray-700 font-medium">Genero:</p>
                  </div>
                }
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
                label={
                  <div className="flex items-center gap-1">
                    <p className="text-gray-700 font-medium">Estado Civl:</p>
                  </div>
                }
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
                label={
                  <div className="flex items-center gap-1">
                    <p className="text-gray-700 font-medium">Fecha de Nacimiento:</p>
                  </div>
                }
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
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Observación:</p>
                </div>
              }
              value={observacion}
              onChange={this.handleInputObservacion}
              placeholder="Ingrese alguna observación"
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">N° de Celular:</p>
                </div>
              }
              value={celular}
              ref={this.refCelular}
              onChange={this.handleInputCelular}
              onKeyDown={keyNumberPhone}
              placeholder="Ingrese el número de celular."
            />
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">N° de Telefono:</p>
                </div>
              }
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
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Email:</p>
                </div>
              }
              type="email"
              value={email}
              onChange={this.handleInputEmail}
              placeholder="Ingrese el email"
            />
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Contraseña:</p>
                </div>
              }
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
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Dirección:</p>
                </div>
              }
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
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Ubigeo:</p>
                </div>
              }
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
              label={
                <div className="flex items-center gap-1">
                  <p className="text-gray-700 font-medium">Estado:</p>
                </div>
              }
              id={'stEstado'}
              checked={estado}
              onChange={this.handleInputEstado}
            >
              {estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>
        </Row>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="btn-success" onClick={this.handleGuardar}>
            <i className="fa fa-save"></i> Guardar
          </Button>
          <Button
            className="btn-outline-danger"
            onClick={() => this.props.history.goBack()}
          >
            <i className="fa fa-close"></i> Cancelar
          </Button>
        </div>
      </ContainerWrapper>
    );
  }
}

PersonaAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string.isRequired,
      }),
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
