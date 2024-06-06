import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Tree from '../../../../recursos/js/treeone.js';
import {
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  isEmpty,
  spinnerLoading,
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


/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class Accesos extends CustomComponent {

  constructor(props) {
    super(props);
    this.state = {
      idEmpresa: '',
      idPerfil: '',
      perfiles: [],
      menu: [],
      catalogo: [],
      loading: true,
      msgLoading: 'Cargando datos...',

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
      menu: [],
      loading: true,
      msgLoading: 'Cargando accesos...',
    });

    const params = {
      idPerfil: id,
    };

    const response = await getAccesos(params, this.abortControllerView.signal);

    if (response instanceof SuccessReponse) {
      const menus = response.data.menu.map((item) => {
        let submenu = [];
        for (const value of response.data.submenu) {
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

            submenu.push({
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
          children: submenu,
        };
      });

      await this.setStateAsync({
        menu: menus,
        loading: false,
      });

      new Tree('#tree1');
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertWarning('Acceso', response.getMessage());
    }
  };

  async onChangePerfil(event) {
    if (event.target.value.length > 0) {
      await this.setStateAsync({
        idPerfil: event.target.value,
        messageWarning: '',
      });
      this.loadDataAcceso(event.target.value);
    } else {
      await this.setStateAsync({
        idPerfil: event.target.value,
        menu: [],
        messageWarning: 'Seleccione el perfil.',
      });
    }
  }

  handleCheck = async (event) => {
    let updatedList = [...this.state.menu];
    for (let menu of updatedList) {
      if (menu.idMenu === event.target.value) {
        menu.estado = event.target.checked ? 1 : 0;
        break;
      } else {
        if (menu.children.length !== 0) {
          for (let submenu of menu.children) {
            if (menu.idMenu + submenu.idSubMenu === event.target.value) {
              submenu.estado = event.target.checked ? 1 : 0;
              break;
            } else {
              for (let privilegio of submenu.children) {
                if (
                  menu.idMenu + submenu.idSubMenu + privilegio.idPrivilegio ===
                  event.target.value
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
    await this.setStateAsync({ menu: updatedList });
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
          menu: this.state.menu,
        };

        alertInfo('Acceso', 'Procesando información...');

        const response = await saveAcceso(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Acceso', response.data, async () => {
            await this.setStateAsync({
              idPerfil: '',
              menu: [],
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
          menu: this.state.menu,
        };

        alertInfo('Acceso', 'Procesando información...');

        const response = await updateAcceso(data);

        if (response instanceof SuccessReponse) {
          alertSuccess('Acceso', response.data, async () => {
            await this.setStateAsync({
              idPerfil: '',
              menu: [],
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
        {this.state.loading && spinnerLoading(this.state.msgLoading)}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Accesos <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        {this.state.messageWarning !== '' ? (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-diamond-fill"></i>{' '}
            {this.state.messageWarning}
          </div>
        ) : null}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <label>Perfil: </label>
            <div className="form-group">
              <select
                className="form-control"
                ref={this.refIdPerfil}
                value={this.state.idPerfil}
                onChange={(event) => this.onChangePerfil(event)}
              >
                <option value="">- Seleccione -</option>
                {this.state.perfiles.map((item, index) => (
                  <option key={index} value={item.idPerfil}>
                    {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            {
              <OptionsList
                options={this.state.menu}
                handleCheck={this.handleCheck}
              />
            }
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-4 col-12">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.onEventGuardar()}
              // disabled={!this.state.save}
            >
              <i className="fa fa-save"></i> Guardar
            </button>{' '}
            <button
              type="button"
              className="btn btn-info"
              onClick={() => this.onEventUpdateData()}
              // disabled={!this.state.update}
            >
              <i className="fa fa-refresh"></i> Actualizar
            </button>{' '}
            <button type="button" className="btn btn-outline-danger">
              <i className="fa fa-close"></i> Cancelar
            </button>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

const OptionsList = ({ options, handleCheck }) => {
  return (
    <ul id="tree1">
      {options.map((option, index) => {
        if (isEmpty(option.children)) {
          const value =
            option.idMenu +
            (option.idSubMenu === undefined ? '' : option.idSubMenu) +
            (option.idPrivilegio === undefined ? '' : option.idPrivilegio);
          return (
            <li key={index}>
              <div className="form-check form-check-inline m-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`id${option.nombre}`}
                  value={value}
                  checked={option.estado === 1 ? true : false}
                  onChange={handleCheck}
                />
                <label
                  className="form-check-label"
                  htmlFor={`id${option.nombre}`}
                >
                  {option.nombre}
                </label>
              </div>
            </li>
          );
        } else {
          const value =
            option.idMenu +
            (option.idSubMenu === undefined ? '' : option.idSubMenu) +
            (option.idPrivilegio === undefined ? '' : option.idPrivilegio);
          return (
            <li key={index}>
              <i className="cursor-pointer mr-3 mt-1 mb-1 fa fa-plus-square text-lg align-middle"></i>
              <div className="form-check form-check-inline m-1 pl-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`id${option.nombre}`}
                  value={value}
                  checked={option.estado === 1 ? true : false}
                  onChange={handleCheck}
                />
                <label
                  className="form-check-label"
                  htmlFor={`id${option.nombre}`}
                >
                  {option.nombre}
                </label>
              </div>
              {option.children.length && (
                <OptionsList
                  options={option.children}
                  handleCheck={handleCheck}
                />
              )}
            </li>
          );
        }
      })}
    </ul>
  );
};

OptionsList.propTypes = {
  options: PropTypes.array,
  handleCheck: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedAccesos = connect(mapStateToProps, null)(Accesos);

export default ConnectedAccesos;
