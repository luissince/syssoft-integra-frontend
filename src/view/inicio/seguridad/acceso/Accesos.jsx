import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Tree from '../../../../resource/js/treeone.js';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
} from '../../../../helper/utils.helper.jsx';
import ContainerWrapper from '../../../../components/Container.jsx';
import {
  comboPerfil,
  getAccesos,
  saveAcceso,
  updateAcceso,
} from '../../../../network/rest/principal.network.js';
import SuccessReponse from '../../../../model/class/response.js';
import ErrorResponse from '../../../../model/class/error-response.js';
import { CANCELED } from '../../../../model/types/types.js';
import CustomComponent from '../../../../model/class/custom-component.js';
import { SpinnerView } from '../../../../components/Spinner.jsx';
import Row from '../../../../components/Row.jsx';
import Column from '../../../../components/Column.jsx';
import Button from '../../../../components/Button.jsx';
import Select from '../../../../components/Select.jsx';
import Title from '../../../../components/Title.jsx';
import CheckBox from '../../../../components/Checks.jsx';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Accesos extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msgLoading: 'Cargando datos...',

      idEmpresa: '',
      idPerfil: '',
      perfiles: [],
      menus: [],
      sucursales: [],
      // save: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[2].privilegio[0].estado,
      // ),
      // update: statePrivilegio(
      //   this.props.token.userToken.menus[1].submenu[2].privilegio[1].estado,
      // ),

      messageWarning: '',
    };

    this.refIdPerfil = React.createRef();

    this.abortControllerView = new AbortController();
  }

  async componentDidMount() {
    await this.loadData();
  }

  componentWillUnmount() {
    this.abortControllerView.abort();
  }

  loadData = async () => {
    const [perfiles] = await Promise.all([
      this.fetchComboPerfil()
    ]);

    this.setState({
      perfiles,
      loading: false,
    });
  };

  async fetchComboPerfil() {
    const response = await comboPerfil(this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  loadDataAcceso = async (id) => {
    await this.setStateAsync({
      menus: [],
      sucursales: [],
      loading: true,
      msgLoading: 'Cargando accesos...',
    });

    const params = {
      idPerfil: id,
    };

    const response = await getAccesos(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      const menus = response.data.menu.map((item) => {
        let subMenu = [];
        for (const value of response.data.subMenu) {
          let privilegio = [];

          if (item.idMenu === value.idMenu) {
            for (const content of response.data.privilegio) {
              if (
                content.idSubMenu === value.idSubMenu &&
                item.idMenu === content.idMenu
              ) {
                privilegio.push({
                  estado: content.estado,
                  idMenu: content.idMenu,
                  idPrivilegio: content.idPrivilegio,
                  idSubMenu: content.idSubMenu,
                  nombre: content.nombre,
                  children: [],
                });
              }
            }

            subMenu.push({
              estado: value.estado,
              idMenu: value.idMenu,
              idSubMenu: value.idSubMenu,
              nombre: value.nombre,
              children: privilegio,
            });
          }
        }

        return {
          ...item,
          children: subMenu,
        };
      });

      await this.setStateAsync({
        menus: menus,
        sucursales: response.data.perfilSucursales,
        loading: false,
      });

      new Tree('#tree1');
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Acceso', response.getMessage());
    }
  };

  onChangePerfil = async (event) => {
    const { value } = event.target;
    if (value.length > 0) {
      await this.setStateAsync({
        idPerfil: value,
        messageWarning: '',
      });
      this.loadDataAcceso(value);
    } else {
      await this.setStateAsync({
        idPerfil: value,
        menus: [],
        messageWarning: 'Seleccione el perfil.',
      });
    }
  }

  handleCheckMenu = async (event) => {
    const { value } = event.target;
    let updatedList = [...this.state.menus];
    for (let menu of updatedList) {
      if (menu.idMenu === value) {
        menu.estado = event.target.checked ? 1 : 0;
        break;
      } else {
        if (menu.children.length !== 0) {
          for (let subMenu of menu.children) {
            if (menu.idMenu + subMenu.idSubMenu === value) {
              subMenu.estado = event.target.checked ? 1 : 0;
              break;
            } else {
              for (let privilegio of subMenu.children) {
                if (
                  menu.idMenu + subMenu.idSubMenu + privilegio.idPrivilegio ===
                  value
                ) {
                  privilegio.estado = event.target.checked ? 1 : 0;
                  break;
                }
              }
            }
          }
        }
      }
    }
    await this.setStateAsync({ menus: updatedList });
  };

  handleCheckSucursal = async (event) => {
    const { value } = event.target;
    this.setState(prevState => ({
      sucursales: prevState.sucursales.map((item) => {
        if (item.idSucursal === value) {
          return {
            ...item,
            estado: item.estado === 1 ? 0 : 1
          }
        }
        return item;
      })
    }));
  };

  async onEventGuardar() {
    if (isEmpty(this.state.idPerfil)) {
      alertWarning('Acceso', 'Seleccione el perfil.', () => {
        this.refIdPerfil.current.focus();
      });
      return;
    }

    alertDialog('Acceso', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idPerfil: this.state.idPerfil,
          menus: this.state.menus,
          sucursales: this.state.sucursales
        };

        alertInfo('Acceso', 'Procesando información...');

        const response = await saveAcceso(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Acceso', response.data, async () => {
            await this.setStateAsync({
              idPerfil: '',
              menus: [],
              sucursales: [],
            });
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Acceso', response.getMessage());
        }
      }
    });
  }

  async onEventUpdateData() {
    if (isEmpty(this.state.idPerfil)) {
      alertWarning('Acceso', 'Seleccione el perfil.', () => {
        this.refIdPerfil.current.focus();
      });
      return;
    }

    alertDialog('Acceso', '¿Está seguro de continuar?', async (accept) => {
      if (accept) {
        const data = {
          idPerfil: this.state.idPerfil,
          menus: this.state.menus,
        };

        alertInfo('Acceso', 'Procesando información...');

        const response = await updateAcceso(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Acceso', response.data, async () => {
            await this.setStateAsync({
              idPerfil: '',
              menus: [],
              sucursales: [],
            });
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning('Acceso', response.getMessage());
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
          title='Perfiles'
          subTitle='LISTA'
          handleGoBack={() => this.props.history.goBack()}
        />


        {this.state.messageWarning !== '' ? (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-diamond-fill"></i>{' '}
            {this.state.messageWarning}
          </div>
        ) : null}

        <Row>
          <Column className="col-lg-12 col-md-12 col-sm-12 col-xs-12" formGroup={true}>
            <Select
              group={true}
              label={"Perfil:"}
              refSelect={this.refIdPerfil}
              value={this.state.idPerfil}
              onChange={this.onChangePerfil}
            >
              <option value="">- Seleccione -</option>
              {
                this.state.perfiles.map((item, index) => (
                  <option key={index} value={item.idPerfil}>
                    {item.descripcion}
                  </option>
                ))
              }
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className="col-md-6" formGroup={true}>
            <h6>Menus</h6>
            {
              <OptionsList
                options={this.state.menus}
                handleCheck={this.handleCheckMenu}
              />
            }
          </Column>
          <Column className="col-md-6" formGroup={true}>
            <h6>Principal - Sucursal</h6>
            <ul className='list-unstyled'>
              {
                this.state.sucursales.map((item, index) => {
                  return (
                    <li key={index}>
                      <CheckBox
                        className='form-check-inline'
                        id={`id${item.idSucursal}`}
                        value={item.idSucursal}
                        checked={item.estado === 1 ? true : false}
                        onChange={this.handleCheckSucursal}
                      >
                        {item.nombre}
                      </CheckBox>
                    </li>
                  );
                })
              }
            </ul>
          </Column>
        </Row>

        <Row>
          <Column className="col-xl-12 col-lg-12 col-md-12 col-sm-4 col-12">
            <Button
              className="btn-primary"
              onClick={() => this.onEventGuardar()}
            // disabled={!this.state.save}
            >
              <i className="fa fa-save"></i> Guardar
            </Button>
            {' '}
            <Button
              className="btn-info"
              onClick={() => this.onEventUpdateData()}
            // disabled={!this.state.update}
            >
              <i className="fa fa-refresh"></i> Actualizar
            </Button>
            {' '}
            <Button
              className="btn-outline-danger">
              <i className="fa fa-close"></i> Cancelar
            </Button>
          </Column>
        </Row>
      </ContainerWrapper>
    );
  }
}

const OptionsList = ({ options, handleCheck, hasParentUl = false }) => {
  return (
    <ul id="tree1">
      {options.map((option, index) => {
        const value =
          option.idMenu +
          (option.idSubMenu === undefined ? '' : option.idSubMenu) +
          (option.idPrivilegio === undefined ? '' : option.idPrivilegio);

        // Verifica si hay un <ul> dentro del <li> (si tiene hijos)
        const hasChildren = option.children && option.children.length > 0;

        return (
          <li key={index}>
            {hasChildren && (
              <i className="cursor-pointer fa fa-plus-square text-2xl align-middle p-0 m-0"></i>
            )}

            <CheckBox
              className={`form-check-inline ${hasChildren ? 'ml-2' : ''} ${hasParentUl ? 'ml-2' : ''}`} // Agrega clases según el contexto
              id={`id${option.nombre}`}
              value={value}
              checked={option.estado === 1 ? true : false}
              onChange={handleCheck}
            >
              {option.nombre}
            </CheckBox>

            {hasChildren && (
              <OptionsList
                options={option.children}
                handleCheck={handleCheck}
                hasParentUl={true} // Indica que los hijos tienen un padre con <ul>
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};



OptionsList.propTypes = {
  options: PropTypes.array,
  handleCheck: PropTypes.func,
  hasParentUl: PropTypes.bool,
}

Accesos.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func,
  }),
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedAccesos = connect(mapStateToProps, null)(Accesos);

export default ConnectedAccesos;