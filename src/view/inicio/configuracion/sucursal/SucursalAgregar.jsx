import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  imageBase64,
  isEmpty,
  keyNumberPhone,
} from '../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import {
  addSucursal, getUbigeo
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import CustomComponent from '../../../../model/class/custom-component';
import SearchInput from '../../../../components/SearchInput';
import { CANCELED } from '../../../../model/types/types';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import Image from '../../../../components/Image';
import TextArea from '../../../../components/TextArea';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class SucursalAgregar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      nombre: '',
      telefono: '',
      celular: '',
      email: '',
      paginaWeb: '',
      direcion: '',
      idUbigeo: '',
      googleMaps: '',
      principal: false,
      estado: true,

      imagen: {
        url: images.noImage,
      },

      ubigeos: [],

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTelefono = React.createRef();
    this.refCelular = React.createRef();
    this.refEmail = React.createRef();
    this.refPaginWeb = React.createRef();
    this.refDireccion = React.createRef();
    this.refUbigeo = React.createRef();
    this.refValueUbigeo = React.createRef();
  }

  async fetchFiltrarUbigeo(params) {
    const response = await getUbigeo(params);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      return [];
    }
  }

  //------------------------------------------------------------------------------------------
  // Eventos de la imagen
  //------------------------------------------------------------------------------------------
  handleFileImage = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const logoSend = await imageBase64(file);
      if (logoSend.size > 500) {
        alertWarning("Producto", "La imagen a subir tiene que ser menor a 500 KB.")
        return;
      }
      this.setState({
        imagen: {
          // name: file.name,
          base64: logoSend.base64String,
          extension: logoSend.extension,
          width: logoSend.width,
          height: logoSend.height,
          size: logoSend.size,
          url: url
        }
      })
    } else {
      this.setState({
        imagen: {
          url: images.noImage
        }
      });
    }

    event.target.value = null;
  }

  handleClearImage = () => {
    this.setState({
      imagen: {
        url: images.noImage
      }
    });
  }

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeo = () => {
    this.setState({
      ubigeos: [],
      idUbigeo: '',
    });
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

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeos: ubigeos,
    });
  }

  handleSelectItemUbigeo = (value) => {
    this.refUbigeo.current.initialize(
      value.departamento +
      ' - ' +
      value.provincia +
      ' - ' +
      value.distrito +
      ' (' +
      value.ubigeo +
      ')');

    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  }

  handleGuardar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Sucursal', 'Ingrese el nombre del sucursal.', () => {
        this.refNombre.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.direcion)) {
      alertWarning('Sucursal', 'Ingrese la dirección del sucursal.', () => {
        this.refDireccion.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idUbigeo)) {
      alertWarning('Sucursal', 'Ingrese su ubigeo.', () => {
        this.refValueUbigeo.current.focus();
      });
      return;
    }

    alertDialog('Sucursal', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Sucursal', 'Procesando información...');

        const data = {
          //datos
          nombre: this.state.nombre.trim().toUpperCase(),
          telefono: this.state.telefono.trim(),
          celular: this.state.celular.trim(),
          email: this.state.email.trim(),
          paginaWeb: this.state.paginaWeb.trim(),
          direccion: this.state.direcion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          googleMaps: this.state.googleMaps,
          principal: this.state.principal,
          estado: this.state.estado,
          imagen: this.state.imagen,
          idUsuario: this.state.idUsuario,
        };

        const response = await addSucursal(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Sucursal', response.data, () => {
            this.props.history.goBack();
          });
        }

        if (response instanceof ErrorResponse) {
          if (response.getType() === CANCELED) return;

          alertWarning('Sucursal', response.getMessage());
        }
      }
    });
  }

  render() {
    return (
      <ContainerWrapper>
        <Title
          title='Sucursal'
          subTitle='AGREGAR'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-lg-8 col-md-6 col-12" formGroup={true}>
            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={<>Nombre: <i className="fa fa-asterisk text-danger small"></i></>}
                  refInput={this.refNombre}
                  value={this.state.nombre}
                  onChange={(event) =>
                    this.setState({ nombre: event.target.value })
                  }
                  placeholder="Ingrese el nombre ..."
                />
              </Column>
            </Row>

            <Row>
              <Column className={"col-md-6"} formGroup={true}>
                <Input
                  label={"N° de Teléfono:"}
                  refInput={this.refTelefono}
                  value={this.state.telefono}
                  onChange={(event) =>
                    this.setState({ telefono: event.target.value })
                  }
                  onKeyDown={keyNumberPhone}
                  placeholder="Ingrese su n° de teléfono ..."
                />
              </Column>

              <Column className={"col-md-6"} formGroup={true}>
                <Input
                  label={"N° de Celular:"}
                  refInput={this.refCelular}
                  value={this.state.celular}
                  onChange={(event) =>
                    this.setState({ celular: event.target.value })
                  }
                  onKeyDown={keyNumberPhone}
                  placeholder="Ingrese su n° de celular ..."
                />
              </Column>
            </Row>

            <Row>
              <Column className={"col-md-6"} formGroup={true}>
                <Input
                  label={"Correo Electrónico:"}
                  refInput={this.refEmail}
                  value={this.state.email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                  placeholder="Ingrese su correo electrónico ..."
                />
              </Column>

              <Column className={"col-md-6"} formGroup={true}>
                <Input
                  label={"Página Web:"}
                  refInput={this.refPaginWeb}
                  value={this.state.paginaWeb}
                  onChange={(event) =>
                    this.setState({ paginaWeb: event.target.value })
                  }
                  placeholder="Ingrese su página web ..."
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={<>Dirección: <i className="fa fa-asterisk text-danger small"></i></>}
                  refInput={this.refDireccion}
                  value={this.state.direcion}
                  onChange={(event) =>
                    this.setState({ direcion: event.target.value })
                  }
                  placeholder="Ingrese su dirección ..."
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <SearchInput
                  ref={this.refUbigeo}
                  label={<>Ubigeo: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="Filtrar productos..."
                  refValue={this.refValueUbigeo}
                  data={this.state.ubigeos}
                  handleClearInput={this.handleClearInputaUbigeo}
                  handleFilter={this.handleFilterUbigeo}
                  handleSelectItem={this.handleSelectItemUbigeo}
                  renderItem={(value) =>
                    <>
                      {value.departamento} - {value.provincia} - {value.distrito} ({value.ubigeo})
                    </>
                  }
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <TextArea
                  label={<>Url de Google Maps<a href='https://embed-googlemap.com/' target='blank' className='btn btn-link'>Puedes obtenerla en esta web</a>: <i className="fa fa-asterisk text-danger small"></i></>}
                  value={this.state.googleMaps}
                  onChange={(event) =>
                    this.setState({ googleMaps: event.target.value })
                  }
                  placeholder="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=Alisios 221-197, Lima 15034..."
                  rows={6}
                >
                </TextArea>
              </Column>
            </Row>

            <Row>
              <Column className={"col-md-6 col-12"} formGroup={true}>
                <Switches
                  label={<>Principal: <i className="fa fa-asterisk text-danger small"></i></>}
                  id={"stPrincipal"}
                  checked={this.state.principal}
                  onChange={(value) =>
                    this.setState({ principal: value.target.checked })
                  }
                >
                  {this.state.principal ? 'Si' : 'No'}
                </Switches>
              </Column>

              <Column className={"col-md-6 col-12"} formGroup={true}>
                <Switches
                  label={<>Estado: <i className="fa fa-asterisk text-danger small"></i></>}
                  id={"stEstado"}
                  checked={this.state.estado}
                  onChange={(value) =>
                    this.setState({ estado: value.target.checked })
                  }
                >
                  {this.state.estado ? 'Habilitado' : 'Inactivo'}
                </Switches>
              </Column>
            </Row>
          </Column>

          <Column className="col-lg-4 col-md-6 col-12" formGroup={true}>
            <Row>
              <Column className='col-12 text-center' formGroup={true}>
                <p className='p-0 m-0'>Imagen de portada 1024 x 629 pixeles </p>
                <small>Usuado como portada para cada sucursal</small>

                <Image
                  default={images.noImage}
                  src={this.state.imagen.url}
                  alt="Portada de la sucursal"
                  className="img-fluid border border-primary rounded"
                />
              </Column>
            </Row>

            <Row>
              <Column className='col-12 text-center' formGroup={true}>
                <input
                  className="d-none"
                  type="file"
                  id="fileImage"
                  accept="image/png, image/jpeg, image/gif, image/svg"
                  onChange={this.handleFileImage}
                />
                <label
                  htmlFor="fileImage"
                  className="btn btn-outline-secondary m-0"
                >
                  <div className="content-button">
                    <i className="bi bi-image"></i>
                    <span></span>
                  </div>
                </label>{' '}
                <Button
                  className='btn-outline-secondary'
                  onClick={this.handleClearImage}
                  icono={<i className="bi bi-trash"></i>}
                />
              </Column>
            </Row>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button
              className='btn-success'
              onClick={this.handleGuardar}
            >
              <i className="fa fa-save"></i> Guardar
            </Button>
            {' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className='fa fa-close'></i> Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

SucursalAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string.isRequired,
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

const ConnectedSucursalAgregar = connect(mapStateToProps, null)(SucursalAgregar);

export default ConnectedSucursalAgregar;
