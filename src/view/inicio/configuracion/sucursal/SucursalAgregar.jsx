import React from 'react';
import {
  getNumber,
  imageBase64,
  isEmpty,
  keyNumberFloat,
  keyNumberPhone,
} from '@/helper/utils.helper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import { images } from '@/helper';
import {
  addSucursal,
  getUbigeo,
} from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import CustomComponent from '@/components/CustomComponent';
import SearchInput from '@/components/SearchInput';
import { CANCELED } from '@/constants/requestStatus';
import Title from '@/components/Title';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Switches } from '@/components/Checks';
import { ImageUpload } from '@/components/Image';
import TextArea from '@/components/TextArea';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class SucursalAgregar extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      nombre: "",
      telefono: "",
      celular: "",
      email: "",
      paginaWeb: "",
      direcion: "",
      idUbigeo: "",
      googleMaps: "",
      horarioAtencion: "",
      principal: false,
      estado: true,

      imagen: {
        url: images.noImage,
      },

      ubigeos: [],
      gastoFijo: "",

      idUsuario: this.props.token.userToken.usuario.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTelefono = React.createRef();
    this.refCelular = React.createRef();
    this.refGastoFijo = React.createRef();
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

    if (isEmpty(files)) {
      this.setState({
        imagen: {
          url: images.noImage,
        },
      });
      return;
    }

    const file = files[0];
    let url = URL.createObjectURL(file);

    const getImageBase64 = await imageBase64(file);

    if (!getImageBase64) {
      alertKit.warning({
        title: "Sucursal",
        message: `La imagen ${file.name} no es válida.`
      });
      return;
    }

    const { size, base64String, extension, width, height } = getImageBase64;

    if (size > 500) {
      alertKit.warning({
        title: "Sucursal",
        message: "La imagen a subir tiene que ser menor a 500 KB.",
      });
      return;
    }

    this.setState({
      imagen: {
        // name: file.name,
        base64: base64String,
        extension: extension,
        width: width,
        height: height,
        size: size,
        url: url,
      },
    });

    event.target.value = null;
  };

  handleClearImage = () => {
    this.setState({
      imagen: {
        url: images.noImage,
      },
    });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeo = () => {
    this.setState({
      ubigeos: [],
      idUbigeo: "",
    });
  };

  handleFilterUbigeo = async (text) => {
    const searchWord = text;
    this.setState({ idUbigeo: "" });

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
  };

  handleSelectItemUbigeo = (value) => {
    const ubigeo = `${value.departamento} - ${value.provincia} - ${value.distrito} (${value.ubigeo})`;

    this.refUbigeo.current.initialize(ubigeo);

    this.setState({
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
  };

  handleGuardar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: "Sucursal",
        message: "Ingrese el nombre del sucursal.",
        onClose: () => {
          this.refNombre.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.direcion)) {
      alertKit.warning({
        title: "Sucursal",
        message: "Ingrese la dirección del sucursal.",
        onClose: () => {
          this.refDireccion.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.idUbigeo)) {
      alertKit.warning({
        title: "Sucursal",
        message: "Ingrese su ubigeo.",
        onClose: () => {
          this.refValueUbigeo.current.focus();
        },
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Sucursal",
      message: "¿Está seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      alertKit.loading({
        message: "Procesando información...",
      });

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
        horarioAtencion: this.state.horarioAtencion.trim(),
        gastoFijo: getNumber(this.state.gastoFijo),
        principal: this.state.principal,
        estado: this.state.estado,
        imagen: this.state.imagen,
        idUsuario: this.state.idUsuario,
      };

      const response = await addSucursal(data);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Sucursal",
          message: response.data,
          onClose: () => {
            this.props.history.goBack();
          },
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Sucursal",
          message: response.getMessage(),
        });
      }
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Sucursal"
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <div className="flex flex-row gap-3 mb-3">
          <div className="w-3/5 flex flex-col gap-3">
            <div>
              <Input
                autoFocus={true}
                label={
                  <>
                    Nombre: <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
                placeholder="Ingrese el nombre ..."
              />
            </div>

            <div className="flex flex-row gap-3">
              <div className="w-full">
                <Input
                  label={'N° de Teléfono:'}
                  ref={this.refTelefono}
                  value={this.state.telefono}
                  onChange={(event) =>
                    this.setState({ telefono: event.target.value })
                  }
                  onKeyDown={keyNumberPhone}
                  placeholder="Ingrese su n° de teléfono ..."
                />
              </div>

              <div className="w-full">
                <Input
                  label={'N° de Celular:'}
                  ref={this.refCelular}
                  value={this.state.celular}
                  onChange={(event) =>
                    this.setState({ celular: event.target.value })
                  }
                  onKeyDown={keyNumberPhone}
                  placeholder="Ingrese su n° de celular ..."
                />
              </div>
            </div>

            <div className="flex flex-row gap-3">
              <div className="w-full">
                <Input
                  label={'Correo Electrónico:'}
                  ref={this.refEmail}
                  value={this.state.email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                  placeholder="Ingrese su correo electrónico ..."
                />
              </div>

              <div className="w-full">
                <Input
                  label={'Página Web:'}
                  ref={this.refPaginWeb}
                  value={this.state.paginaWeb}
                  onChange={(event) =>
                    this.setState({ paginaWeb: event.target.value })
                  }
                  placeholder="Ingrese su página web ..."
                />
              </div>
            </div>

            <div>
              <Input
                label={
                  <>
                    Dirección: <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                ref={this.refDireccion}
                value={this.state.direcion}
                onChange={(event) =>
                  this.setState({ direcion: event.target.value })
                }
                placeholder="Ingrese su dirección ..."
              />
            </div>

            <div>
              <SearchInput
                ref={this.refUbigeo}
                label={
                  <>
                    Ubigeo: <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                placeholder="Filtrar productos..."
                refValue={this.refValueUbigeo}
                data={this.state.ubigeos}
                handleClearInput={this.handleClearInputaUbigeo}
                handleFilter={this.handleFilterUbigeo}
                handleSelectItem={this.handleSelectItemUbigeo}
                renderItem={(value) => (
                  <>
                    {value.departamento} - {value.provincia} -{' '}
                    {value.distrito} ({value.ubigeo})
                  </>
                )}
              />
            </div>

            <div>
              <TextArea
                label={
                  <>
                    Url de Google Maps
                    <a
                      href="https://embed-googlemap.com/"
                      target="blank"
                      className="btn btn-link !p-0 ml-1"
                    >
                      Puedes obtenerla en esta web
                    </a>
                    : <i className="fa fa-asterisk text-danger small"></i>
                  </>
                }
                value={this.state.googleMaps}
                onChange={(event) =>
                  this.setState({ googleMaps: event.target.value })
                }
                placeholder="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=Alisios 221-197, Lima 15034..."
                rows={6}
              />
            </div>

            <div>
              <TextArea
                label={"Horario de Atención:"}
                value={this.state.horarioAtencion}
                onChange={(event) =>
                  this.setState({ horarioAtencion: event.target.value })
                }
                placeholder="Ingrese su horario de atención ..."
                rows={4}
              />
            </div>

            <div>
              <Input
                label={<>Gasto Fijo <small>Para calculo de metas diarias:</small> </>}
                ref={this.refGastoFijo}
                value={this.state.gastoFijo}
                onChange={(event) =>
                  this.setState({ gastoFijo: event.target.value })
                }
                onKeyDown={keyNumberFloat}
                placeholder="Ingrese su gasto fijo para calculo de metas diarias ..."
              />
            </div>

            <div className="flex flex-row gap-3">
              <div className="w-full">
                <Switches
                  label={
                    <>
                      Principal: <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  id={'stPrincipal'}
                  checked={this.state.principal}
                  onChange={(value) =>
                    this.setState({ principal: value.target.checked })
                  }
                >
                  {this.state.principal ? 'Si' : 'No'}
                </Switches>
              </div>

              <div className="w-full">
                <Switches
                  label={
                    <>
                      Estado: <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  id={'stEstado'}
                  checked={this.state.estado}
                  onChange={(value) =>
                    this.setState({ estado: value.target.checked })
                  }
                >
                  {this.state.estado ? "Habilitado" : "Inactivo"}
                </Switches>
              </div>
            </div>
          </div>

          <div className="w-2/5">
            <ImageUpload
              className="w-full flex flex-col items-center text-center gap-2"
              label="Imagen de portada"
              subtitle="La imagen no debe superar los 1MB(Megabytes) y debe tener un tamaño de 1024 x 629 píxeles"
              imageUrl={this.state.imagen.url}
              defaultImage={images.noImage}
              alt="Icono de la categoría"
              inputId="fileImagen"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileImage}
              onClear={this.handleClearImage}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="btn-success" onClick={this.handleGuardar}>
            <i className="fa fa-save"></i> Guardar
          </Button>{' '}
          <Button
            className="btn-outline-danger"
            onClick={() => this.props.history.goBack()}
          >
            <i className="fa fa-close"></i> Cerrar
          </Button>
        </div>
      </ContainerWrapper>
    );
  }
}

SucursalAgregar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      usuario: PropTypes.shape({
        idUsuario: PropTypes.string.isRequired,
      }),
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

const ConnectedSucursalAgregar = connect(
  mapStateToProps,
  null,
)(SucursalAgregar);

export default ConnectedSucursalAgregar;
