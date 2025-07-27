import React from 'react';
import { isText, isEmpty, imageBase64 } from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import { CANCELED } from '../../../../model/types/types';
import ContainerWrapper from '../../../../components/Container';
import {
  getIdCategoria,
  updateCategoria,
} from '../../../../network/rest/principal.network';
import CustomComponent from '../../../../model/class/custom-component';
import Title from '../../../../components/Title';
import { SpinnerView } from '../../../../components/Spinner';
import PropTypes from 'prop-types';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Button from '../../../../components/Button';
import { Switches } from '../../../../components/Checks';
import Input from '../../../../components/Input';
import { alertKit } from 'alert-kit';
import { images } from '../../../../helper';
import { ImageUpload } from '../../../../components/Image';

class CategoriaEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingMessage: 'Cargando datos...',

      idCategoria: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      imagen: {
        url: images.noImage,
      },
      estado: false,
      publicar: false,

      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();

    this.abortController = new AbortController();
  }

  async componentDidMount() {
    const url = this.props.location.search;
    const idCategoria = new URLSearchParams(url).get('idCategoria');

    if (isText(idCategoria)) {
      this.loadingData(idCategoria);
    } else {
      this.props.history.goBack();
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async loadingData(id) {
    const [categoria] = await Promise.all([this.fetchObtenerCategoria(id)]);

    this.setState({
      idCategoria: categoria.idCategoria,
      codigo: categoria.codigo,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado === 1 ? true : false,
      imagen: categoria.imagen ?? {
        url: images.noImage,
      },
      loading: false,
    });
  }

  async fetchObtenerCategoria(id) {
    const params = {
      idCategoria: id,
    };

    const response = await getIdCategoria(params, this.abortController.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return null;
    }
  }

  handleInputCodigo = (event) => {
    this.setState({ codigo: event.target.value });
  };

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value });
  };

  handleInputDescripcion = (event) => {
    this.setState({ descripcion: event.target.value });
  };

  handleSelectEstado = (event) => {
    this.setState({ estado: event.target.checked });
  };

  handleSelectPublicar = (event) => {
    this.setState({ publicar: event.target.checked });
  };

  handleFileImage = async (event) => {
    const files = event.currentTarget.files;

    if (!isEmpty(files)) {
      const file = files[0];
      let url = URL.createObjectURL(file);
      const { size, base64String, extension, width, height } =
        await imageBase64(file);

      if (width !== 300 || height !== 200) {
        alertKit.warning({
          title: 'Categoría',
          message:
            'La imagen ' +
            file.name +
            ' tiene que tener un aspecto de 300 x 200 pixeles',
        });
        return;
      }

      if (size > 500) {
        alertKit.warning({
          title: 'Categoría',
          message:
            'La imagen ' +
            file.name +
            ' tiene que tener un tamaño de menos de 500 KB',
        });
        return;
      }

      this.setState({
        imagen: {
          base64: base64String,
          extension: extension,
          width: width,
          height: height,
          size: size,
          url: url,
        },
      });
    } else {
      this.setState({
        imagen: {
          url: images.noImage,
        },
      });
    }

    event.target.value = null;
  };

  handleClearImage = () => {
    this.setState({
      imagen: {
        url: images.noImage,
      },
    });
  };

  handleGuardar = async () => {
    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: 'Categoría',
        message: '!Ingrese el nombre de la categoría!',
        onClose: () => {
          this.refNombre.current.focus();
        },
      });
      return;
    }

    alertKit.question(
      {
        title: 'Categoría',
        message: '¿Estás seguro de continuar?',
        acceptButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
        cancelButton: {
          html: "<i class='fa fa-close'></i> Cancelar",
        },
      },
      async (confirm) => {
        if (confirm) {
          await this.handleGuardarProcess();
        }
      },
    );
  };

  handleGuardarProcess = async () => {
    const data = {
      idCategoria: this.state.idCategoria,
      codigo: this.state.codigo,
      nombre: this.state.nombre,
      descripcion: this.state.descripcion,
      estado: this.state.estado,
      imagen: this.state.imagen,
      idUsuario: this.state.idUsuario,
    };

    alertKit.loading({
      message: 'Procesando información...',
    });

    const response = await updateCategoria(data);

    if (response instanceof SuccessReponse) {
      alertKit.success({
        title: 'Categoría',
        message: response.data,
        onClose: () => {
          this.props.history.goBack();
        },
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.error({
        title: 'Categoría',
        message: response.getMessage(),
      });
    }
  };

  render() {
    return (
      <ContainerWrapper>
        <SpinnerView
          loading={this.state.loading}
          message={this.state.loadingMessage}
        />

        <Title
          title="Categoría"
          subTitle="EDITAR"
          icon={<i className="fa fa-edit"></i>}
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column formGroup={true}>
            <Input
              autoFocus
              label={'Código:'}
              placeholder="Ingrese el código"
              value={this.state.codigo}
              onChange={this.handleInputCodigo}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={
                <>
                  Nombre:<i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              placeholder="Ingrese el nombre"
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={this.handleInputNombre}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Input
              label={'Descripción'}
              placeholder="Ingrese la descripción"
              value={this.state.descripcion}
              onChange={this.handleInputDescripcion}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Switches
              id="customSwitchEstado"
              checked={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              {this.state.estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </Column>

          <Column formGroup={true}>
            <Switches
              id="customSwitchPublicar"
              checked={this.state.publicar}
              onChange={this.handleSelectPublicar}
            >
              Mostrar el tienda virtual
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column className="col-12" formGroup={true}>
            <label>
              Agregar las imagenes para el icono.{' '}
              <b className="text-danger">
                La imagen no deben superar los 500KB(Kilobytes).
              </b>
            </label>
            <label>
              Las imágenes deben tener un tamaño de <b>300 x 200 píxeles</b>{' '}
              para que se visualicen correctamente en la página web (formato
              recomendado *.webp).
            </label>
          </Column>

          <Column className={'col-md-4 col-12'} formGroup={true}>
            <ImageUpload
              imageUrl={this.state.imagen.url}
              defaultImage={images.noImage}
              alt="Icono de la categoría"
              inputId="fileImagen"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={this.handleFileImage}
              onClear={this.handleClearImage}
              onDownload={() => this.handleDownload(this.state.imagen.url)}
            />
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-warning"
              onClick={() => this.handleGuardar()}
            >
              <i className="fa fa-save"></i> Guardar
            </Button>{' '}
            <Button
              className="btn-outline-danger"
              onClick={() => this.props.history.goBack()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

CategoriaEditar.propTypes = {
  token: PropTypes.shape({
    userToken: PropTypes.shape({
      idUsuario: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedCategoriaEditar = connect(
  mapStateToProps,
  null,
)(CategoriaEditar);

export default ConnectedCategoriaEditar;
