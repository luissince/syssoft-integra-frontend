import React from 'react';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isText,
  isEmpty,
  keyNumberPhone,
  imageBase64,
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
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Image from '../../../../components/Image';
import Button from '../../../../components/Button';

class SucursalEditar extends CustomComponent {
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

    this.abortController = new AbortController();

    this.selectItem = false;
  }

  componentDidMount() {
    const url = this.props.location.search;
    const idSucursal = new URLSearchParams(url).get('idSucursal');
    if (isText(idSucursal)) {
      this.loadingData(idSucursal);
    } else {
      this.props.history.goBack();
    }
  }

  async loadingData(id) {
    const [sucursal] = await Promise.all([
      this.fetchIdSucursal(id),
    ]);

    const ubigeo = {
      idUbigeo: sucursal.idUbigeo,
      departamento: sucursal.departamento,
      provincia: sucursal.provincia,
      distrito: sucursal.distrito,
      ubigeo: sucursal.ubigeo,
    };

    this.handleSelectItemUbigeo(ubigeo);

    this.setState({
      idSucursal: id,
      nombre: sucursal.nombre,
      telefono: sucursal.telefono,
      celular: sucursal.celular,
      email: sucursal.email,
      paginaWeb: sucursal.paginaWeb,
      direcion: sucursal.direccion,
      estado: sucursal.estado === 1 ? true : false,
      idUbigeo: sucursal.idUbigeo.toString(),
      imagen: sucursal.ruta,
      loading: false,
    });
  }

  componentWillUnmount() {
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
          nombre: this.state.nombre.trim(),
          telefono: this.state.telefono.trim(),
          celular: this.state.celular.trim(),
          email: this.state.email.trim(),
          paginaWeb: this.state.paginaWeb.trim(),
          direccion: this.state.direcion.trim(),
          idUbigeo: this.state.idUbigeo,
          estado: this.state.estado,
          //imagen
          imagen: logoSend.base64String ?? "",
          extension: logoSend.extension ?? "",

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
  }

  render() {
    return (
      <ContainerWrapper>

        <SpinnerView
          loading={this.state.loading}
          message={this.state.msgLoading}
        />

        <Title
          title='Sucursal'
          subTitle='Editar'
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
                <Image
                  src={this.state.imagen}
                  alt={"Imagen sucursal"}
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

              <Button
                className='btn-outline-secondary'
                onClick={this.handleClearImage}
                icono={<i className="bi bi-trash"></i>}
              />
            </div>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button
              className='btn-warning'
              onClick={this.handleSave}
              icono={<i className="fa fa-save"></i>}
              text={"Actualizar"}
            />

            <Button
              className='btn-danger ml-2'
              onClick={() => this.props.history.goBack()}
              icono={<i className="fa fa-close"></i>}
              text={"Cerrar"}
            />
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedSucursalEditar = connect(mapStateToProps, null)(SucursalEditar);

export default ConnectedSucursalEditar;
