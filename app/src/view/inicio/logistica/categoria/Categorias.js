import React from "react";
import {
  showModal,
  hideModal,
  viewModal,
  clearModal,
  alertDialog,
  alertInfo,
  alertSuccess,
  alertWarning,
  spinnerLoading,
  statePrivilegio,
  keyUpSearch,
} from "../../../../helper/utils.helper";
import { connect } from "react-redux";
import Paginacion from "../../../../components/Paginacion";
import {
  comboProyectos,
  listarCategoria,
  trasladarCategoria,
} from "../../../../network/rest/principal.network";
import SuccessReponse from "../../../../model/class/response";
import ErrorResponse from "../../../../model/class/error-response";
import { CANCELED } from "../../../../model/types/types";
import ContainerWrapper from "../../../../components/Container";
import { addCategoria, getIdCategoria, removeCategoria, updateCategoria } from "../../../../network/rest/principal.network";

class Categorias extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idCategoria: "",
      nombre: "",
      idProyecto: this.props.token.project.idProyecto,
      idUsuario: this.props.token.userToken.idUsuario,

      add: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[0].estado
      ),
      edit: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[1].estado
      ),
      remove: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[2].estado
      ),
      move: statePrivilegio(
        this.props.token.userToken.menus[3].submenu[0].privilegio[3].estado
      ),

      loadModal: false,
      nameModal: "Nuevo Categoria",
      msgModal: "Cargando datos...",

      loadModalTraslado: false,
      nameModalTraslado: "Nuevo Categoria",
      msgModalTraslado: "Cargando datos...",

      idProyectoTrasladar: "",
      proyectos: [],
      messageWarning: "",

      loading: false,
      lista: [],
      restart: false,

      opcion: 0,
      paginacion: 0,
      totalPaginacion: 0,
      filasPorPagina: 10,
      messageTable: "Cargando información...",
      messagePaginacion: "Mostranto 0 de 0 Páginas",
    };

    this.refNombre = React.createRef();

    this.refTxtSearch = React.createRef();

    this.idCodigo = "";
    this.abortControllerTable = new AbortController();
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  async componentDidMount() {
    this.loadInit();

    viewModal("modalCategoria", () => {
      this.abortControllerModal = new AbortController();

      if (this.idCodigo !== "") this.loadDataId(this.idCodigo);
    });

    clearModal("modalCategoria", async () => {
      this.abortControllerModal.abort();
      await this.setStateAsync({
        idCategoria: "",
        nombre: "",

        loadModal: false,
        nameModal: "Nueva Categoria",
        msgModal: "Cargando datos...",
      });
      this.idCodigo = "";
    });

    viewModal("modalCategoriaTraslado", () => {
      this.abortControllerModalTraslado = new AbortController();
      this.loadComboProyecto();
    });

    clearModal("modalCategoriaTraslado", async () => {
      this.abortControllerModalTraslado.abort();
      await this.setStateAsync({
        idCategoria: "",
        idProyectoTrasladar: "",
        messageWarning: "",
        proyectos: [],

        loadModalTraslado: false,
        nameModalTraslado: "Trasladar",
        msgModalTraslado: "Cargando datos...",
      });
      this.idCodigo = "";
    });
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
  }

  loadInit = async () => {
    if (this.state.loading) return;

    await this.setStateAsync({ paginacion: 1, restart: true });
    this.fillTable(0, "");
    await this.setStateAsync({ opcion: 0 });
  };

  async searchText(text) {
    if (this.state.loading) return;

    if (text.trim().length === 0) return;

    await this.setStateAsync({ paginacion: 1, restart: false });
    this.fillTable(1, text.trim());
    await this.setStateAsync({ opcion: 1 });
  }

  paginacionContext = async (listid) => {
    await this.setStateAsync({ paginacion: listid, restart: false });
    this.onEventPaginacion();
  };

  onEventPaginacion = () => {
    switch (this.state.opcion) {
      case 0:
        this.fillTable(0, "");
        break;
      case 1:
        this.fillTable(1, this.refTxtSearch.current.value);
        break;
      default:
        this.fillTable(0, "");
    }
  };

  fillTable = async (opcion, buscar) => {
    /**
     * Restablecer las variables para la busqueda
     */
    await this.setStateAsync({
      loading: true,
      lista: [],
      messageTable: "Cargando información...",
      messagePaginacion: "Mostranto 0 de 0 Páginas",
    });

    /**
     * Parametros para iniciar la consulta
     */
    const params = {
      idProyecto: this.state.idProyecto,
      opcion: opcion,
      buscar: buscar.trim().toUpperCase(),
      posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
      filasPorPagina: this.state.filasPorPagina,
    };

    /**
     * Peticion http
     */
    const response = await listarCategoria(
      params,
      this.abortControllerTable.signal
    );

    /**
     * Si la respuesta fue existosa
     */
    if (response instanceof SuccessReponse) {
      const data = response.data;

      const totalPaginacion = parseInt(
        Math.ceil(parseFloat(data.total) / this.state.filasPorPagina)
      );
      const messagePaginacion = `Mostrando ${data.result.length} de ${totalPaginacion} Páginas`;

      await this.setStateAsync({
        loading: false,
        lista: data.result,
        totalPaginacion: totalPaginacion,
        messagePaginacion: messagePaginacion,
      });
    }

    /**
     * Si la respuesta fallo o fue cancelada
     */
    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        loading: false,
        lista: [],
        totalPaginacion: 0,
        messageTable: response.getMessage(),
        messagePaginacion: "Mostranto 0 de 0 Páginas",
      });
    }
  };

  async openModal(id) {
    if (id === "") {
      showModal("modalCategoria");
      await this.setStateAsync({ nameModal: "Nueva Categoria" });
    } else {
      showModal("modalCategoria");
      this.idCodigo = id;
      await this.setStateAsync({
        idCategoria: id,
        nameModal: "Editar Categoria",
        loadModal: true,
      });
    }
  }

  async loadDataId(id) {
    const params = {
      idCategoria: id,
    }

    const response = await getIdCategoria(params, this.abortControllerModal.signal);

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({
        idCategoria: response.data.idCategoria,
        nombre: response.data.nombre,
        loadModal: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        msgModal: response.getMessage(),
      });
    }
  }

  async openModalTraslado(id) {
    showModal("modalCategoriaTraslado");
    await this.setStateAsync({
      idCategoria: id,
      nameModalTraslado: "Trasladar",
      loadModalTraslado: true,
    });
  }

  async loadComboProyecto() {
    const response = await comboProyectos(
      this.abortControllerModalTraslado.signal
    );

    if (response instanceof SuccessReponse) {
      await this.setStateAsync({
        proyectos: response.data.filter(
          (item) => item.idProyecto !== this.state.idProyecto
        ),
        loadModalTraslado: false,
      });
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      await this.setStateAsync({
        msgModalTraslado: response.getMessage(),
      });
    }
  }

  async handleAgregarCategoria() {
    const data = {
      nombre: this.state.nombre,
      idProyecto: this.state.idProyecto,
      idUsuario: this.state.idUsuario,
    }

    const response = await addCategoria(data);
    if (response instanceof SuccessReponse) {
      alertSuccess("Categoria", response.data, () => {
        this.loadInit();
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning("Categoria", response.getMessage());
    }
  }

  async handleEditarCategoria() {
    const data = {
      idCategoria: this.state.idCategoria,
      nombre: this.state.nombre,
      idProyecto: this.state.idProyecto,
      idUsuario: this.state.idUsuario,
    }

    const response = await updateCategoria(data);
    if (response instanceof SuccessReponse) {
      alertSuccess("Categoria", response.data, () => {
        this.onEventPaginacion();
      });
    }

    if (response instanceof ErrorResponse) {
      alertWarning("Categoria", response.getMessage());
    }
  }

  onEventGuardar = async () => {
    if (this.state.nombre === "") {
      this.refNombre.current.focus();
      return;
    }


    alertInfo("Categoria", "Procesando información...");
    hideModal("modalCategoria");

    if (this.state.idCategoria === "") {
      this.handleAgregarCategoria();
    } else {
      this.handleEditarCategoria();
    }
  };

  onEventDelete = (idCategoria) => {
    alertDialog("Categoria", "¿Estás seguro de eliminar la Categoria?", async (event) => {
      if (event) {

        const params = {
          idCategoria: idCategoria,
        }

        const response = await removeCategoria(params);

        if (response instanceof SuccessReponse) {
          alertSuccess("Categoria", response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Categoria", response.getMessage());
        }
      }
    }
    );
  };

  onEventTrasladar = async () => {
    if (this.state.idProyectoTrasladar === "") {
      this.setState({
        messageWarning: "Seleccione el proyecto a donde trasladar.",
      });
      return;
    }

    alertDialog("Categoria", "¿Está seguro de continuar?", async (value) => {
      if (value) {
        const params = {
          idCategoria: this.state.idCategoria,
          idProyecto: this.state.idProyecto,
          idProyectoTrasladar: this.state.idProyectoTrasladar,
          idUsuario: this.state.idUsuario,
        };

        alertInfo("Moneda", "Procesando información...");
        hideModal("modalCategoriaTraslado");

        const response = await trasladarCategoria(params);

        if (response instanceof SuccessReponse) {
          console.log(response.data);

          alertSuccess("Categoria", response.data, () => {
            this.loadInit();
          });
        }

        if (response instanceof ErrorResponse) {
          alertWarning("Categoria", response.getMessage());
        }
      }
    });
  };

  render() {
    return (
      <ContainerWrapper>
        {/* Inicio modal nuevo cliente*/}
        <div
          className="modal fade"
          id="modalCategoria"
          tabIndex="-1"
          aria-labelledby="modalCategoriaLabel"
          aria-hidden={true}
          data-bs-backdrop="static"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.nameModal}</h5>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden={true}>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {
                  this.state.loadModal &&
                  <div className="clearfix absolute-all bg-white">
                    {spinnerLoading(this.state.msgModal)}
                  </div>
                }

                <div className="form-group">
                  <label htmlFor="categoria">
                    Nombre Categoria{" "}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingrese el nombre de la categoria"
                    ref={this.refNombre}
                    value={this.state.nombre}
                    onChange={(event) =>
                      this.setState({ nombre: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => this.onEventGuardar()}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* fin modal nuevo cliente*/}

        {/* Inicio modal nuevo cliente*/}
        <div
          className="modal fade"
          id="modalCategoriaTraslado"
          tabIndex="-1"
          aria-labelledby="modalCategoriaLabel"
          aria-hidden={true}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.nameModalTraslado}</h5>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden={true}>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {this.state.loadModalTraslado ? (
                  <div className="clearfix absolute-all bg-white">
                    {spinnerLoading(this.state.msgModalTraslado)}
                  </div>
                ) : null}

                {this.state.messageWarning === "" ? null : (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-diamond-fill"></i>{" "}
                    {this.state.messageWarning}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="proyecto">
                    Proyectos{" "}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <select
                    className="form-control"
                    id="proyecto"
                    value={this.state.idProyectoTrasladar}
                    onChange={(event) => {
                      const message = event.target.value || "Seleccione el proyecto a donde trasladar.";

                      // const message = event.target.value === ""
                      //   ? "Seleccione el proyecto a donde trasladar."
                      //   : "";

                      this.setState({
                        idProyectoTrasladar: event.target.value,
                        messageWarning: message
                      });
                    }}
                  >
                    <option value="">- Seleccione -</option>
                    {this.state.proyectos.map((item, index) => (
                      <option key={index} value={item.idProyecto}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Seleccione un proyecto para que puedas continuar.
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => this.onEventTrasladar()}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* fin modal nuevo cliente*/}

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                Categorias <small className="text-secondary">LISTA</small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchText(event.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <button
                className="btn btn-outline-info"
                onClick={() => this.openModal("")}
                disabled={!this.state.add}
              >
                <i className="bi bi-file-plus"></i> Nuevo Registro
              </button>{" "}
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.loadInit()}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered rounded">
                <thead>
                  <tr>
                    <th width="5%" className="text-center">
                      #
                    </th>
                    <th width="15%">Categoria</th>
                    <th width="25%">Proyecto</th>
                    <th width="5%" className="text-center">
                      Trasladar
                    </th>
                    <th width="5%" className="text-center">
                      Editar
                    </th>
                    <th width="5%" className="text-center">
                      Eliminar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.loading ? (
                    <tr>
                      <td className="text-center" colSpan="6">
                        {spinnerLoading()}
                      </td>
                    </tr>
                  ) : this.state.lista.length === 0 ? (
                    <tr className="text-center">
                      <td colSpan="6">¡No hay datos registrados!</td>
                    </tr>
                  ) : (
                    this.state.lista.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="text-center">{item.id}</td>
                          <td>{item.nombre}</td>
                          <td>{item.proyecto}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-outline-info btn-sm"
                              title="Editar"
                              onClick={() =>
                                this.openModalTraslado(item.idCategoria)
                              }
                              disabled={!this.state.move}
                            >
                              <i className="bi bi-arrow-left-right"></i>
                            </button>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-outline-warning btn-sm"
                              title="Editar"
                              onClick={() => this.openModal(item.idCategoria)}
                              disabled={!this.state.edit}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              title="Anular"
                              onClick={() => this.onEventDelete(item.idCategoria)}
                              disabled={!this.state.remove}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-5">
            <div
              className="dataTables_info mt-2"
              role="status"
              aria-live="polite"
            >
              {this.state.messagePaginacion}
            </div>
          </div>
          <div className="col-sm-12 col-md-7">
            <div className="dataTables_paginate paging_simple_numbers">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end">
                  <Paginacion
                    loading={this.state.loading}
                    totalPaginacion={this.state.totalPaginacion}
                    paginacion={this.state.paginacion}
                    fillTable={this.paginacionContext}
                    restart={this.state.restart}
                  />
                </ul>
              </nav>
            </div>
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

export default connect(mapStateToProps, null)(Categorias);
