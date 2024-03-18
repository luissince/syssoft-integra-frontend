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
      estado: true,

      imagen: images.noImage,

      filter: false,
      ubigeo: '',
      ubigeos: [],

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTelefono = React.createRef();
    this.refCelular = React.createRef();
    this.refEmail = React.createRef();
    this.refPaginWeb = React.createRef();
    this.refDireccion = React.createRef();
    this.refIdUbigeo = React.createRef();

    this.refFileImagen = React.createRef();

    this.selectItem = false;
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
  handleFileImage = (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ imagen: URL.createObjectURL(event.target.files[0]) });
    } else {
      this.setState({ imagen: images.noImage });
      this.refFileImagen.current.value = ''
    }
  }

  handleClearImage = () => {
    this.setState({ imagen: images.noImage });
    this.refFileImagen.current.value = ''
  }

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeo = async () => {
    await this.setStateAsync({ ubigeos: [], idUbigeo: '', ubigeo: '' });
    this.selectItem = false;
  }

  handleFilterUbigeo = async (event) => {
    const searchWord = this.selectItem ? '' : event.target.value;
    await this.setStateAsync({ idUbigeo: '', ubigeo: searchWord });
    this.selectItem = false;

    if (searchWord.length === 0) {
      await this.setStateAsync({ ubigeos: [] });
      return;
    }

    if (this.state.filter) return;

    const params = {
      filtrar: searchWord,
    };

    const ubigeos = await this.fetchFiltrarUbigeo(params);

    this.setState({
      ubigeos: ubigeos,
      filter: false,
    });
  }

  handleSelectItemUbigeo = async (value) => {
    await this.setStateAsync({
      ubigeo:
        value.departamento +
        ' - ' +
        value.provincia +
        ' - ' +
        value.distrito +
        ' (' +
        value.ubigeo +
        ')',
      ubigeos: [],
      idUbigeo: value.idUbigeo,
    });
    this.selectItem = true;
  }

  handleSave = async () => {
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
        this.refIdUbigeo.current.focus();
      });
      return;
    }

    alertDialog('Sucursal', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Sucursal', 'Procesando información...');

        const logoSend = await imageBase64(this.refFileImagen.current.files);

        const data = {
          //datos
          nombre: this.state.nombre.trim().toUpperCase(),
          direccion: this.state.direcion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estado: this.state.estado,
          //imagen
          imagen: logoSend.base64String ?? "",
          extension: logoSend.extension ?? "",

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
          subTitle='Agregar'
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column>
            <div className="form-group">
              <label>
                Nombre: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                autoFocus
                ref={this.refNombre}
                value={this.state.nombre}
                onChange={(event) =>
                  this.setState({ nombre: event.target.value })
                }
                placeholder="Ingrese el nombre ..."
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
              <label>
                N° de Teléfono:
              </label>
              <input
                type="text"
                className="form-control"
                ref={this.refTelefono}
                value={this.state.telefono}
                onChange={(event) =>
                  this.setState({ telefono: event.target.value })
                }
                onKeyDown={keyNumberPhone}
                placeholder="Ingrese su n° de teléfono ..."
              />
            </div>
          </Column>

          <Column className={"col-md-6"}>
            <div className="form-group">
              <label>
                N° de Celular:
              </label>
              <input
                type="text"
                className="form-control"
                ref={this.refCelular}
                value={this.state.celular}
                onChange={(event) =>
                  this.setState({ celular: event.target.value })
                }
                onKeyDown={keyNumberPhone}
                placeholder="Ingrese su n° de celular ..."
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
              <label>
                Correo Electrónico:
              </label>
              <input
                type="text"
                className="form-control"
                ref={this.refEmail}
                value={this.state.email}
                onChange={(event) =>
                  this.setState({ email: event.target.value })
                }
                placeholder="Ingrese su correo electrónico ..."
              />
            </div>
          </Column>

          <Column className={"col-md-6"}>
            <div className="form-group">
              <label>
                Página Web:
              </label>
              <input
                type="text"
                className="form-control"
                ref={this.refPaginWeb}
                value={this.state.paginaWeb}
                onChange={(event) =>
                  this.setState({ paginaWeb: event.target.value })
                }
                placeholder="Ingrese su página web ..."
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="form-group">
              <label>
                Dirección: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <input
                type="text"
                className="form-control"
                ref={this.refDireccion}
                value={this.state.direcion}
                onChange={(event) =>
                  this.setState({ direcion: event.target.value })
                }
                placeholder="Ingrese su dirección ..."
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="form-group">
              <label>
                Ubigeo: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <SearchInput
                placeholder="Filtrar productos..."
                refValue={this.refIdUbigeo}
                value={this.state.ubigeo}
                data={this.state.ubigeos}
                handleClearInput={this.handleClearInputaUbigeo}
                handleFilter={this.handleFilterUbigeo}
                handleSelectItem={this.handleSelectItemUbigeo}
                renderItem={(value) =>
                  <>
                    {value.departamento} -
                    {value.provincia} -
                    {value.distrito}
                    ({value.ubigeo})
                  </>
                }
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column className={"col-md-6"}>
            <div className="form-group">
              <label>
                Estado: <i className="fa fa-asterisk text-danger small"></i>
              </label>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="switch1"
                  checked={this.state.estado}
                  onChange={(value) =>
                    this.setState({ estado: value.target.checked })
                  }
                />
                <label className="custom-control-label" htmlFor="switch1">
                  {this.state.estado ? 'Habilitado' : 'Inactivo'}
                </label>
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className='form-group text-center'>
              <label className='p-0 m-0'>Logo</label>
              <p className='p-0 m-0'>Imagen de portada 1024 x 629 pixeles </p>
              <br />
              <small>Usuado como portada para cada sucursal</small>
              <div className="text-center mb-2 ">
                <img
                  src={this.state.imagen}
                  alt=""
                  className="img-fluid border border-primary rounded"
                  width={450}
                />
              </div>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className="form-group text-center">
              <input
                className="d-none"
                type="file"
                id="fileImage"
                accept="image/png, image/jpeg, image/gif, image/svg"
                ref={this.refFileImagen}
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
              <button
                className="btn btn-outline-secondary"
                onClick={this.handleClearImage}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleSave}
            >
              <i className="fa fa-save"></i> Guardar
            </button>
            <button
              type="button"
              className="btn btn-danger ml-2"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cerrar
            </button>
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

const ConnectedSucursalAgregar = connect(mapStateToProps, null)(SucursalAgregar);

export default ConnectedSucursalAgregar;

