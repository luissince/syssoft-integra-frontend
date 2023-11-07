import React from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { signOut, selectProject } from "../../redux/actions";
import { spinnerLoading } from "../../helper/utils.helper";
import { images } from "../../helper";
import CustomComponent from "../../model/class/custom-component";
import { listSucursales } from "../../network/rest/principal.network";
import SuccessReponse from "../../model/class/response";
import ErrorResponse from "../../model/class/error-response";
import { CANCELED } from "../../model/types/types";

class Principal extends CustomComponent {
  constructor(props) {
    super(props);
    this.state = {
      sucursales: [],
      filter: [],
      loading: true,
      loadMessage: "Cargando sucursales...",
    };
    this.refTxtSearch = React.createRef();

    this.abortControllerTable = new AbortController();
  }

  async componentDidMount() {
    this.loadingData();
    window.addEventListener("focus", this.handleFocused);
  }

  componentWillUnmount() {
    this.abortControllerTable.abort();
    window.removeEventListener("focus", this.handleFocused);
  }

  async loadingData() {

    const [sucursales] = await Promise.all([
      await this.fetchSucursales()
    ]);

    this.setState({
      sucursales:sucursales,
      filter: sucursales,
      loading: false,
    });

  }

  async fetchSucursales() {
    const response = await listSucursales();

    if (response instanceof SuccessReponse) {
      return response.data;
    }

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      return [];
    }
  }

  handleFocused = (event) => {
    let userToken = window.localStorage.getItem("login");
    if (userToken === null) {
      this.props.restore();
    } else {
      let projectToken = window.localStorage.getItem("project");
      if (projectToken !== null) {
        this.props.project(JSON.parse(projectToken));
      }
    }
  }

  handleSearch = async (value) => {
    const sucursales = this.state.data.filter(
      (item) => item.nombre.toUpperCase().indexOf(value.toUpperCase()) > -1
    );
    await this.setStateAsync({ filter: sucursales });
  }

  handleSignIn = async (event) => {
    try {
      window.localStorage.removeItem("login");
      window.localStorage.removeItem("project");
      this.props.restore();
      this.props.history.push("login");
    } catch (e) {
      this.props.restore();
      this.props.history.push("login");
    }
  }

  handleIngresar(item) {
    const proyect = {
      idSucursal: item.idSucursal,
      nombre: item.nombre,
      ubicacion: item.ubicacion,
    };
    window.localStorage.setItem("project", JSON.stringify(proyect));
    this.props.project(JSON.parse(window.localStorage.getItem("project")));
  }

  render() {
    if (this.props.token.userToken == null) {
      return <Redirect to="/login" />;
    }

    if (this.props.token.project !== null) {
      return <Redirect to="/inicio" />;
    }

    const { documento, razonSocial, nombreEmpresa } =
      this.props.token.empresa;
    return (

      <div className="container pt-5">

        {
          this.state.loading && spinnerLoading(this.state.loadMessage)
        }

        <div className="row">
          <div className="col-md-3 col-12">
            <div className="d-flex h-100 justify-content-start align-items-center">
              <div className="form-group">
                <img
                  className="img-fluid"
                  // src={`${rutaImage !== "" ? "/" + rutaImage : noImage}`}
                  src={images.icono}
                  alt="logo"
                  width="140"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6 col-12">
            <div className="d-flex h-100 flex-column justify-content-center align-items-center">
              <div className="form-group text-center">
                <h4 className="text-dark">{razonSocial}</h4>
                <h5 className="text-dark">{nombreEmpresa}</h5>
                <h5 className="text-secondary">Ruc: {documento}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-12">
            <div className="d-flex h-100 justify-content-end align-items-center">
              <div className="form-group">
                <button
                  onClick={this.handleSignIn}
                  className="btn btn-danger"
                  type="button"
                >
                <i className="fa fa-power-off"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <div className="input-group">
                <input
                  className="form-control bg-transparent"
                  type="search"
                  placeholder="filtar por sucursal o nombre del sucursal"
                  aria-label="Search"
                  ref={this.refTxtSearch}
                  onKeyUp={(event) => this.handleSearch(event.target.value)}
                />

                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {this.state.filter.map((item, index) => (
            <div
              key={index}
              className="col-lg-4 col-md-4 col-sm-12 col-xs-12"
            >
              <div className="form-group">
                <div className="card">
                  <img
                    src={item.ruta === "" ? images.noImage : "/" + item.ruta}
                    alt=""
                    className="card-img-top"
                  />

                  <div className="card-body m-2">
                    <h6 className="text-primary font-weight-bold">
                      {item.nombre}
                    </h6>
                    <h6 className="text-secondary">{item.ubicacion}</h6>
                    <button
                      onClick={() => this.handleIngresar(item)}
                      type="button"
                      className="btn btn-block btn-outline-primary"
                    >
                      <i className="bi bi-arrow-right-circle-fill"></i>{" "}
                      Ingresar
                    </button>
                  </div>

                  <hr className="m-0" />

                  <div className="card-body m-2">
                    <ul className="list-group text-left pt-0">
                      <li className="list-group-item border-0 px-0 pt-0">
                        <i className="bi bi-geo-fill"></i> Moneda{" "}
                        {item.moneda}({item.simbolo})
                      </li>
                      {/* <li className="list-group-item border-0 px-0">
                        <i className="bi bi-geo-fill"></i> Total de productos{" "}
                        {item.productos.length}
                      </li> */}
                      {/* <li className="list-group-item border-0 px-0">
                        <i className="bi bi-geo-fill"></i> Productos
                        disponibles{" "}
                        {
                          item.productos.filter((producto) => producto.estado === 1)
                            .length
                        }
                      </li> */}
                      {/* <li className="list-group-item border-0 px-0">
                        <i className="fa fa-info"></i>
                        {item.estado === 1 ? (
                          <span className="text-success">
                            {" "}
                            Estado en Venta
                          </span>
                        ) : (
                          <span className="text-danger">
                            {" "}
                            Estado en Litigio
                          </span>
                        )}
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    restore: () => dispatch(signOut()),
    project: (idSucursal) => dispatch(selectProject(idSucursal)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Principal);
