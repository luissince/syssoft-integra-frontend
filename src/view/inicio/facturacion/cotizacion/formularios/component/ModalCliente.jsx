import React from 'react';
import PropTypes from 'prop-types';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Button from '../../../../../../components/Button';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Select from '../../../../../../components/Select';
import { comboTipoDocumento, createPersona, getUbigeo } from '../../../../../../network/rest/principal.network';
import SuccessReponse from '../../../../../../model/class/response';
import ErrorResponse from '../../../../../../model/class/error-response';
import { CANCELED } from '../../../../../../model/types/types';
import { SpinnerView } from '../../../../../../components/Spinner';
import { CLIENTE_JURIDICO, CLIENTE_NATURAL } from '../../../../../../model/types/tipo-cliente';
import { alertDialog, alertInfo, alertSuccess, alertWarning, convertNullText, currentDate, isEmpty } from '../../../../../../helper/utils.helper';
import Input from '../../../../../../components/Input';
import { images } from '../../../../../../helper';
import { getDni, getRuc } from '../../../../../../network/rest/apisperu.network';
import SearchInput from '../../../../../../components/SearchInput';
import CustomComponent from '../../../../../../model/class/custom-component';
import RadioButton from '../../../../../../components/RadioButton';

/**
 * CustomComponent que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalCliente extends CustomComponent {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      documento: '',
      informacion: '',
      celular: '',
      email: '',
      direccion: '',
      idUbigeo: '',

      tiposDocumentos: [],

      ubigeos: [],
    }

    this.refModal = React.createRef();
    this.peticion = false;
    this.abortController = null;

    this.refTipoDocumento = React.createRef();
    this.refDocumento = React.createRef();
    this.refInformacion = React.createRef();
    this.refCelular = React.createRef();

    this.refDireccion = React.createRef();

    this.refUbigeo = React.createRef();
    this.refValueUbigeo = React.createRef();
  }

  handleOnOpen = async () => {
    this.abortController = new AbortController();

    const response = await comboTipoDocumento(
      this.abortController.signal,
    );

    if (response instanceof SuccessReponse) {
      this.peticion = true;
      this.abortController = null;

      this.setState({
        tiposDocumentos: response.data,
        loading: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      this.peticion = false;
      this.abortController = null;

      this.setState({
        msgLoading: 'Se produjo un error un interno, intente nuevamente.',
      });
    }
  }

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState({
      loading: true,
      msgLoading: 'Cargando datos...',

      idTipoCliente: CLIENTE_NATURAL,
      idTipoDocumento: '',
      documento: '',
      informacion: '',
      celular: '',
      email: '',
      direccion: '',
      idUbigeo: '',

      tiposDocumentos: [],

      ubigeos: [],
    });

    this.peticion = false;
    this.abortController = null;
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

  handleInputCelular = (event) => {
    this.setState({ celular: event.target.value });
  }

  handleInputEmail = (event) => {
    this.setState({ email: event.target.value });
  }

  handleInputDireccion = (event) => {
    this.setState({ direccion: event.target.value });
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
      this.setState({ ubigeos: [] });
    }
  }

  handleSelectItemUbigeo = (value) => {
    this.refUbigeo.current.initialize(value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')');
    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  }

  handleClearInputUbigeo = () => {
    this.setState({ ubigeos: [], idUbigeo: '' });
  }

  handleOnSubmit = async () => {
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

    alertDialog('Persona', '¿Estás seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idTipoCliente: this.state.idTipoCliente,
          idTipoDocumento: this.state.idTipoDocumento,
          documento: this.state.documento.toString().trim().toUpperCase(),
          informacion: this.state.informacion.trim().toUpperCase(),
          cliente: true,
          proveedor: false,
          conductor: false,
          licenciaConducir: '',
          telefono: '',
          celular: this.state.celular.toString().trim().toUpperCase(),
          fechaNacimiento: currentDate(),
          email: this.state.email.trim(),
          genero: '',
          direccion: this.state.direccion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estadoCivil: '',
          predeterminado: false,
          estado: true,
          observacion: '',
          idUsuario: this.props.idUsuario,
        };

        alertInfo('Persona', 'Procesando información...');

        const response = await createPersona(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Persona', response.data, async () => {
            await this.refModal.current.handleOnClose()
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
      celular,
      email,
      direccion,
    } = this.state;

    const {
      isOpen,
      onClose,
    } = this.props;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Cliente"
        titleHeader="Agregar Cliente"
        onSubmit={this.handleOnSubmit}
        body={
          <>
            <SpinnerView
              loading={this.state.loading}
              message={this.state.msgLoading}
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
                  name='rbTipoCliente'
                  id={CLIENTE_NATURAL}
                  value={CLIENTE_NATURAL}
                  checked={idTipoCliente === CLIENTE_NATURAL}
                  onChange={this.handleTipoCliente}
                >
                  <i className="bi bi-person"></i> Persona Natural
                </RadioButton>

                <RadioButton
                  className='form-check-inline'
                  name='rbTipoCliente'
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
                <Select
                  label={<>Tipo Documento: <i className='fa fa-asterisk text-danger small'></i></>}
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
              </Column>

              <Column className='col-md-6 col-12' formGroup={true}>
                <Input
                  group={true}
                  label={<>N° de documento ({documento.length}): <i className="fa fa-asterisk text-danger small"></i></>}
                  role={"integer"}
                  refInput={this.refDocumento}
                  value={documento}
                  onChange={this.handleInputNumeroDocumento}
                  placeholder="00000000"
                  buttonRight={<>
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
                  </>}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={<>
                    {idTipoCliente === CLIENTE_NATURAL && 'Apellidos y Nombres:'}
                    {idTipoCliente === CLIENTE_JURIDICO && 'Razón Social:'}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </>}
                  refInput={this.refInformacion}
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
              <Column className='col-md-6 col-12' formGroup={true}>
                <Input
                  label={"N° de Celular:"}
                  role={"phone"}
                  value={celular}
                  refInput={this.refCelular}
                  onChange={this.handleInputCelular}
                  placeholder="Ingrese el número de celular."
                />
              </Column>

              <Column formGroup={true}>
                <Input
                  label={"E-Mail:"}
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
                  label={"Dirección:"}
                  refInput={this.refDireccion}
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
                  label={"Ubigeo:"}
                  placeholder="Escribe para iniciar a filtrar..."
                  refValue={this.refValueUbigeo}
                  data={this.state.ubigeos}
                  handleClearInput={this.handleClearInputUbigeo}
                  handleFilter={this.handleFilterUbigeo}
                  handleSelectItem={this.handleSelectItemUbigeo}
                  renderItem={(value) =>
                    <>
                      {value.departamento + ' - ' + value.provincia + ' - ' + value.distrito + ' (' + value.ubigeo + ')'}
                    </>
                  }
                />
              </Column>
            </Row>
          </>
        }
        footer={
          <>
            <Button
              type="submit"
              className="btn-primary">
              <i className="fa fa-save"></i> Registrar
            </Button>
            <Button
              type="button"
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}>
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </>
        }
      />
    );
  }
}

ModalCliente.propTypes = {
  refModal: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,

  idUsuario: PropTypes.string.isRequired
};

export default ModalCliente;
