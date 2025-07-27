import React from 'react';
import { alertDialog, isEmpty } from '../../../../helper/utils.helper';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import {
  addAlmacen,
  comboTipoAlmacen,
  getUbigeo,
} from '../../../../network/rest/principal.network';
import { CANCELED } from '../../../../model/types/types';
import SearchInput from '../../../../components/SearchInput';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import TextArea from '../../../../components/TextArea';
import Button from '../../../../components/Button';
import { alertKit } from 'alert-kit';
import Select from '../../../../components/Select';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class AlmacenAgregar extends CustomComponent {
  /**
   *
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      nombre: '',
      idTipoAlmacen: '',
      direccion: '',
      idUbigeo: '',
      codigoSunat: '',
      observacion: '',
      predefinido: false,

      tipoAlmacenes: [],
      ubigeos: [],

      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,
    };

    this.refNombre = React.createRef();
    this.refTipoAlmacen = React.createRef();
    this.refDireccion = React.createRef();
    this.refUbigeo = React.createRef();
    this.refValueUbigeo = React.createRef();

    this.abortController = new AbortController();
  }

  /*
  |--------------------------------------------------------------------------
  | Método de cliclo de vida
  |--------------------------------------------------------------------------
  |
  | El ciclo de vida de un componente en React consta de varios métodos que se ejecutan en diferentes momentos durante la vida útil
  | del componente. Estos métodos proporcionan puntos de entrada para realizar acciones específicas en cada etapa del ciclo de vida,
  | como inicializar el estado, montar el componente, actualizar el estado y desmontar el componente. Estos métodos permiten a los
  | desarrolladores controlar y realizar acciones específicas en respuesta a eventos de ciclo de vida, como la creación, actualización
  | o eliminación del componente. Entender y utilizar el ciclo de vida de React es fundamental para implementar correctamente la lógica
  | de la aplicación y optimizar el rendimiento del componente.
  |
  */

  async componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  /*
  |--------------------------------------------------------------------------
  | Métodos de acción
  |--------------------------------------------------------------------------
  |
  | Carga los datos iniciales necesarios para inicializar el componente. Este método se utiliza típicamente
  | para obtener datos desde un servicio externo, como una API o una base de datos, y actualizar el estado del
  | componente en consecuencia. El método loadingData puede ser responsable de realizar peticiones asíncronas
  | para obtener los datos iniciales y luego actualizar el estado del componente una vez que los datos han sido
  | recuperados. La función loadingData puede ser invocada en el montaje inicial del componente para asegurarse
  | de que los datos requeridos estén disponibles antes de renderizar el componente en la interfaz de usuario.
  |
  */

  async loadingData() {
    const [tipoAlmacenes] = await Promise.all([this.fetchComboTipoAlmacen()]);

    this.setState({
      tipoAlmacenes,
      loading: false,
    });
  }

  //------------------------------------------------------------------------------------------
  // Peticiones HTTP
  //------------------------------------------------------------------------------------------

  async fetchComboTipoAlmacen() {
    const result = await comboTipoAlmacen(this.abortController.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Método de eventos
  |--------------------------------------------------------------------------
  |
  | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
  | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
  | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
  | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
  | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
  | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
  | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
  | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
  |
  */

  handleInputNombre = (event) => {
    this.setState({ nombre: event.target.value });
  };

  handleSelectTipoAlmacen = (event) => {
    this.setState({ idTipoAlmacen: event.target.value });
  };

  handleInputDescripcion = (event) => {
    this.setState({ direccion: event.target.value });
  };

  //------------------------------------------------------------------------------------------
  // Filtrar ubigeo
  //------------------------------------------------------------------------------------------

  handleClearInputaUbigeo = () => {
    this.setState({ ubigeos: [], idUbigeo: '' });
  };

  handleFilterUbigeo = async (value) => {
    const searchWord = value;
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
  };

  handleSelectItemUbigeo = (value) => {
    this.refUbigeo.current.initialize(
      value.departamento +
        ' - ' +
        value.provincia +
        ' - ' +
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

  handleInputCodigoSunat = (event) => {
    this.setState({ codigoSunat: event.target.value });
  };

  handleSelectPredefinido = (event) => {
    this.setState({ predefinido: event.target.value });
  };

  handleInputObservacion = (event) => {
    this.setState({ observacion: event.target.value });
  };

  handleSave() {
    if (isEmpty(this.state.nombre)) {
      alertKit.warning({
        title: 'Almacén',
        message: '!Ingrese el nombre del almacén!',
        onClose: () => {
          this.refNombre.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.idTipoAlmacen)) {
      alertKit.warning({
        title: 'Almacén',
        message: '!Selecciona el tipo almacén!',
        onClose: () => {
          this.refTipoAlmacen.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.direccion)) {
      alertKit.warning({
        title: 'Almacén',
        message: '!Ingrese la dirección del almacén!',
        onClose: () => {
          this.refDireccion.current.focus();
        },
      });
      return;
    }

    if (isEmpty(this.state.idUbigeo)) {
      alertKit.warning({
        title: 'Almacén',
        message: '!Ingrese su ubigeo!',
        onClose: () => {
          this.refValueUbigeo.current.focus();
        },
      });
      return;
    }

    alertKit.question(
      {
        title: 'Almacén',
        message: '¿Estás seguro de continuar?',
        acceptButton: {
          html: "<i class='fa fa-check'></i> Aceptar",
        },
        cancelButton: {
          html: "<i class='fa fa-close'></i> Cancelar",
        },
      },
      async (accept) => {
        if (accept) {
          alertKit.loading({
            message: 'Procesando información...',
          });

          const data = {
            nombre: this.state.nombre.trim(),
            idTipoAlmacen: this.state.idTipoAlmacen,
            direccion: this.state.direccion.trim(),
            idUbigeo: this.state.idUbigeo,
            codigoSunat: this.state.codigoSunat.toString().trim(),
            observacion: this.state.observacion,
            predefinido: this.state.predefinido,
            idSucursal: this.state.idSucursal,
            idUsuario: this.state.idUsuario,
          };

          const response = await addAlmacen(data);

          if (response instanceof SuccessReponse) {
            alertKit.success({
              title: 'Almacén',
              message: response.data,
              onClose: () => {
                this.props.history.goBack();
              },
            });
          }

          if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            alertKit.warning({
              title: 'Almacén',
              message: response.getMessage(),
              onClose: () => {
                this.refNombre.current.focus();
              },
            });
          }
        }
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

  render() {
    return (
      <ContainerWrapper>
        <Title
          title="Almacen"
          subTitle="AGREGAR"
          handleGoBack={() => this.props.history.goBack()}
        />

        <Row>
          <Column className="col-md-6 col-12" formGroup={true}>
            <Input
              label={
                <>
                  Nombre del Almacén:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refNombre}
              value={this.state.nombre}
              onChange={this.handleInputNombre}
              placeholder="Ingrese el nombre del almacen"
            />
          </Column>

          <Column className="col-md-6 col-12" formGroup={true}>
            <Select
              label={
                <>
                  Tipo Almacen:
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refTipoAlmacen}
              value={this.state.idTipoAlmacen}
              onChange={this.handleSelectTipoAlmacen}
            >
              <option value="">-- Seleccione un tipo de almacen --</option>
              {this.state.tipoAlmacenes.map((item, index) => (
                <option key={index} value={item.idTipoAlmacen}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <Input
              label={
                <>
                  Dirección:{' '}
                  <i className="fa fa-asterisk text-danger small"></i>
                </>
              }
              ref={this.refDireccion}
              value={this.state.direccion}
              onChange={this.handleInputDescripcion}
              placeholder="Ingrese una dirección"
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
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
                  {value.departamento +
                    ' - ' +
                    value.provincia +
                    ' - ' +
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
          <Column className="col-md-6" formGroup={true}>
            <Input
              label={'Código SUNAT:'}
              value={this.state.codigoSunat}
              onChange={this.handleInputCodigoSunat}
            />
          </Column>

          <Column className="col-md-6" formGroup={true}>
            <Switches
              label={'Preferido:'}
              id={'cbPreferido'}
              checked={this.state.predefinido}
              onChange={this.handleSelectPredefinido}
            >
              {this.state.predefinido ? 'Si' : 'No'}
            </Switches>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <TextArea
              label={'Observaciones:'}
              rows={3}
              value={this.state.observacion}
              onChange={this.handleInputObservacion}
            />
          </Column>
        </Row>

        <Row>
          <Column className="col-md-12" formGroup={true}>
            <label>
              Los campos marcados con{' '}
              <i className="fa fa-asterisk text-danger small"></i> son
              obligatorios
            </label>
          </Column>
        </Row>

        <Row>
          <Column formGroup={true}>
            <Button className="btn-success" onClick={() => this.handleSave()}>
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

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedAlmacenAgregar = connect(mapStateToProps, null)(AlmacenAgregar);

export default ConnectedAlmacenAgregar;
