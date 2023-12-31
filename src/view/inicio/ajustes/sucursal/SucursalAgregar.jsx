import React from 'react';
import {
  imageBase64,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import ContainerWrapper from '../../../../components/Container';
import { images } from '../../../../helper';
import {
  addSucursal,
  getUbigeo,
} from '../../../../network/rest/principal.network';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import CustomComponent from '../../../../model/class/custom-component';
import SearchInput from '../../../../components/SearchInput';
import { CANCELED } from '../../../../model/types/types';

class ProcesoAgregar extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      nombre: '',
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
    this.refDireccion = React.createRef();
    this.refIdUbigeo = React.createRef();

    this.refFileImagen = React.createRef();

    this.selectItem = false;
  }

  componentDidMount() {
    this.refFileImagen.current.addEventListener('change', this.handleFileImage);
  }

  componentWillUnmount() {
    this.refFileImagen.current.removeEventListener(
      'change',
      this.handleFileImage,
    );
  }

  onEventFileImage = async (event) => {
    if (!isEmpty(event.target.files)) {
      this.setState({
        imagen: URL.createObjectURL(event.target.files[0]),
      });
    } else {
      this.setState(
        {
          imagen: images.noImage,
        },
        () => {
          this.refFileImagen.current.value = '';
        },
      );
    }
  };

  handleSave = async () => {
    if (isEmpty(this.state.nombre)) {
      alertWarning('Sucursal', 'Ingrese el nombre del sucursal.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refNombre.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.direcion)) {
      alertWarning('Sucursal', 'Ingrese la dirección del sucursal.', () => {
        this.onFocusTab('datos-tab', 'datos');
        this.refDireccion.current.focus();
      });
      return;
    }

    if (isEmpty(this.state.idUbigeo)) {
      alertWarning('Sucursal', 'Ingrese su ubigeo.', () => {
        this.onFocusTab('datos-tab', 'datos');
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
          nombre: this.state.nombre.trim().toUpperCase(),
          direccion: this.state.direcion.trim().toUpperCase(),
          idUbigeo: this.state.idUbigeo,
          estado: this.state.estado,
          //imagen
          imagen: !imageSend ? '' : imageSend.base64String,
          extension: !imageSend ? '' : imageSend.extension,
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

  //------------------------------------------------------------------------------------------
  // Funciones para el focus del tab
  //------------------------------------------------------------------------------------------

  onFocusTab(idTab, idContent) {
    if (!document.getElementById(idTab).classList.contains('active')) {
      for (let child of document.getElementById('myTab').childNodes) {
        child.childNodes[0].classList.remove('active');
      }
      for (let child of document.getElementById('myTabContent').childNodes) {
        child.classList.remove('show', 'active');
      }
      document.getElementById(idTab).classList.add('active');
      document.getElementById(idContent).classList.add('show', 'active');
    }
  }

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
                </span>{' '}
                Sucursal
                <small className="text-secondary"> Agregar</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="datos-tab"
                  data-bs-toggle="tab"
                  href="#datos"
                  role="tab"
                  aria-controls="datos"
                  aria-selected={true}
                >
                  <i className="bi bi-info-circle"></i> Datos
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="imagen-tab"
                  data-bs-toggle="tab"
                  href="#imagen"
                  role="tab"
                  aria-controls="imagen"
                  aria-selected={false}
                >
                  <i className="bi bi-image"></i> Imagen
                </a>
              </li>
            </ul>

            <div className="tab-content pt-2" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="datos"
                role="tabpanel"
                aria-labelledby="datos-tab"
              >
                <div className="row">
                  <div className="form-group col">
                    <label>
                      Nombre:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
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
                  <div className="form-group col">
                    <label>
                      Dirección:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      ref={this.refDireccion}
                      value={this.state.direcion}
                      onChange={(event) =>
                        this.setState({ direcion: event.target.value })
                      }
                      placeholder="Ingrese la dirección ..."
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col">
                    <label>
                      Ubigeo:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
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
                      Estado:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
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
              </div>

              <div
                className="tab-pane fade"
                id="imagen"
                role="tabpanel"
                aria-labelledby="imagen-tab"
              >
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <div className="row">
                        <div className="col-lg-8 col-md-10 col-sm-12 col-xs-12">
                          <img
                            src={this.state.imagen}
                            alt=""
                            className="card-img-top"
                          />
                          <p>Imagen de portada 1024 x 629 pixeles </p>
                        </div>
                      </div>
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
              </div>
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

export default connect(mapStateToProps, null)(ProcesoAgregar);
