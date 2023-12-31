import React from 'react';
import {
  imageBase64,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  isText,
  isEmpty,
  keyNumberPhone,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import {
  getUbigeo,
  getIdSucursal,
  updateSucursal,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import SearchInput from '../../../../components/SearchInput';
import CustomComponent from '../../../../model/class/custom-component';

class ProcesoSucursal extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idSucursal: '',
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
      filteredData: [],

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

    this.abortController = new AbortController();

    this.selectItem = false;
  }

  componentDidMount() {
    this.refFileImagen.current.addEventListener('change', this.handleFileImage);

    const url = this.props.location.search;
    const idSucursal = new URLSearchParams(url).get('idSucursal');
    if (isText(idSucursal)) {
      this.loadingData(idSucursal);
    } else {
      this.props.history.goBack();
    }
  }

  async loadingData(idSucursal) {
    const [sucursal] = await Promise.all([
      await this.fetchIdSucursal(idSucursal),
    ]);

    console.log(sucursal)

    const ubigeo = {
      idUbigeo: sucursal.idUbigeo,
      departamento: sucursal.departamento,
      provincia: sucursal.provincia,
      distrito: sucursal.distrito,
      ubigeo: sucursal.ubigeo,
    };

    this.handleSelectItemUbigeo(ubigeo);

    this.setState({
      idSucursal: idSucursal,
      nombre: sucursal.nombre,
      telefono: sucursal.telefono,
      celular: sucursal.celular,
      email: sucursal.email,
      paginaWeb: sucursal.paginaWeb,
      direcion: sucursal.direccion,
      estado: sucursal.estado === 1 ? true : false,
      idUbigeo: sucursal.idUbigeo.toString(),
      imagen: sucursal.ruta ? '/' + sucursal.ruta : images.noImage,
      loading: false,
    });
  }

  componentWillUnmount() {
    this.refFileImagen.current.removeEventListener('change', this.handleFileImage);
    this.abortController.abort();
  }

  async fetchIdSucursal(id) {
    const params = {
      idSucursal: id,
    };

    const response = await getIdSucursal(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
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

    const imageSend = await imageBase64(this.refFileImagen.current.files);
    if (imageSend) {
      const { width, height } = imageSend;
      if (width !== 1024 && height !== 629) {
        alertWarning(
          'Sucursal',
          'La imagen a subir no tiene el tamaño establecido.',
        );
        return;
      }
    }

    alertDialog('Sucursal', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        alertInfo('Sucursal', 'Procesando información...');

        const data = {
          //datos
          nombre: this.state.nombre.trim(),
          telefono: this.state.telefono.trim(),
          celular: this.state.celular.trim(),
          email: this.state.email.trim(),
          paginaWeb: this.state.paginaWeb.trim(),
          direccion: this.state.direcion.trim(),
          idUbigeo: this.state.idUbigeo,
          estado: this.state.estado,
          //imagen
          imagen: !imageSend ? '' : imageSend.base64String,
          extension: !imageSend ? '' : imageSend.extension,
          idUsuario: this.state.idUsuario,
          idSucursal: this.state.idSucursal,
        };

        const response = await updateSucursal(data);

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
  };

  //------------------------------------------------------------------------------------------
  // Eventos de la imagen
  //------------------------------------------------------------------------------------------

  async handleClearImage() {
    this.setState({ imagen: images.noImage }, () => {
      this.refFileImagen.current.value = '';
    });
  }

  handleFileImage = async (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({ imagen: URL.createObjectURL(event.target.files[0]) });
    } else {
      this.setState({ imagen: images.noImage }, () => {
        this.refFileImagen.current.value = '';
      });
    }
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeo = async () => {
    await this.setStateAsync({ filteredData: [], idUbigeo: '', ubigeo: '' });
    this.selectItem = false;
  };

  handleFilterUbigeo = async (event) => {
    const searchWord = this.selectItem ? '' : event.target.value;
    await this.setStateAsync({ idUbigeo: '', ubigeo: searchWord });
    this.selectItem = false;
    if (searchWord.length === 0) {
      await this.setStateAsync({ filteredData: [] });
      return;
    }

    if (this.state.filter) return;

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
  };

  handleSelectItemUbigeo = async (value) => {
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
  };

  render() {
    return (
      <ContainerWrapper>
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span> Sucursal <small className="text-secondary"> Editar</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="form-group col">
            <label>
              Nombre: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <input
              type="text"
              className="form-control"
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={(event) =>
                this.setState({ nombre: event.target.value })
              }
              placeholder="Ingrese el nombre ..."
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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

          <div className="form-group col-md-6">
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
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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

          <div className="form-group col-md-6">
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
        </div>

        <div className="row">
          <div className="form-group col">
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
        </div>

        <div className="row">
          <div className="form-group col">
            <label>
              Ubigeo: <i className="fa fa-asterisk text-danger small"></i>
            </label>
            <SearchInput
              placeholder="Filtrar productos..."
              refValue={this.refIdUbigeo}
              value={this.state.ubigeo}
              data={this.state.filteredData}
              handleClearInput={this.handleClearInputaUbigeo}
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
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-6">
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
        </div>

        <div className="row">
          <div className='form-group col text-center'>
            <label>Logo</label>
            <br />
            <small>Usuado para los reportes</small>
            <div className="text-center mb-2 ">
              <img
                src={this.state.imagen}
                alt=""
                className="img-fluid border border-primary rounded"
                width={250}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group text-center">
              <input
                className="d-none"
                type="file"
                id="fileImage"
                accept="image/png, image/jpeg, image/gif, image/svg"
                ref={this.refFileImagen}
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
          </div>
        </div>

        <div className="row">
          <div className="col">
            <button
              type="button"
              className="btn btn-success"
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
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

export default connect(mapStateToProps, null)(ProcesoSucursal);
