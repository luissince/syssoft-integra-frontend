import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';
import {
  keyUpSearch,
  currentDate,
  validateDate,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';

class CotizacionEditar extends CustomComponent {
  constructor(props) {
    super(props);

    this.state = {
      idSucursal: this.props.token.project.idSucursal,
      idUsuario: this.props.token.userToken.idUsuario,

      fechaInicio: currentDate(),
      fechaFinal: currentDate(),
    };
  }

  async componentDidMount() {
    this.loadInit();
  }

  componentWillUnmount() {}

  loadInit = async () => {
    // if (this.state.loading) return;
    // await this.setStateAsync({ paginacion: 1, restart: true });
    // this.fillTable(0, "");
    // await this.setStateAsync({ opcion: 0 });
  };

  async searchCliente(text) {
    // if (this.state.loading) return;
    // if (text.trim().length === 0) return;
    // await this.setStateAsync({ paginacion: 1, restart: false });
    // this.fillTable(1, text.trim());
    // await this.setStateAsync({ opcion: 1 });
  }

  async searchFecha() {
    if (this.state.loading) return;

    if (!validateDate(this.state.fechaInicio)) return;
    if (!validateDate(this.state.fechaFinal)) return;

    // await this.setStateAsync({ paginacion: 1, restart: true });
    // this.fillTable(1, "", this.state.fechaInicio, this.state.fechaFinal, this.state.idConcepto);
    // await this.setStateAsync({ opcion: 1 });
  }

  handleSave() {
    // if (this.state.nombreAlmacen === "") {
    //     this.setState({ messageWarning: "ingrese un nombre para el almacén." });
    //     this.refNombreAlmacen.current.focus();
    //     return;
    // }
    // if (this.state.direccion === "") {
    //     this.setState({ messageWarning: "ingrese una dirección para el almacén." });
    //     this.refDireccion.current.focus();
    //     return;
    // }
    // if (this.state.distrito === "") {
    //     this.setState({ messageWarning: "ingrese un distrito para el almacén." });
    //     this.refDistrito.current.focus();
    //     return;
    // }
    // if (this.state.codigoSunat === "") {
    //     this.setState({ messageWarning: "ingrese un codigoSunat para el almacén." });
    //     this.refCodigoSunat.current.focus();
    //     return;
    // }
    // alertInfo("Almacen", "Procesando información...");
    // this.handleAdd();
  }

  handleEliminar = (idAlmacen) => {
    // this.props.history.push({
    //     pathname: `${this.props.location.pathname}/editar`,
    //     search: "?idAlmacen=" + idAlmacen
    // })
  };

  render() {
    return (
      <ContainerWrapper>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="form-group">
              <h5>
                <span role="button" onClick={() => this.props.history.goBack()}>
                  <i className="bi bi-arrow-left-short"></i>
                </span>{' '}
                Cotización
                <small className="text-secondary"> Editar </small>
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div className="form-group">
              <label>Cliente:</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <i className="bi bi-search"></i>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese cliente..."
                  ref={this.refTxtSearch}
                  onKeyUp={(event) =>
                    keyUpSearch(event, () =>
                      this.searchCliente(event.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <label>Moneda:</label>
            <div className="input-group">
              <select className="form-control" ref="" value="" onChange="">
                <option value="0">-- Seleccione Moneda --</option>
                <option value="1">Soles</option>
                <option value="2">Dolares</option>
                <option value="3">Euros</option>
                <option value="4">Yenes</option>
              </select>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
            <div className="form-group">
              <label>Fecha de Vencimimento:</label>
              <input
                className="form-control"
                type="date"
                value={this.state.fechaInicio}
                onChange={async (event) => {
                  await this.setStateAsync({ fechaInicio: event.target.value });
                  this.searchFecha();
                }}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div class="form-group">
              <label for="notas">Observación</label>
              <textarea class="form-control" id="notas" rows="2"></textarea>
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
                    <th width="10%">Usado</th>
                    <th width="50%">Producto</th>
                    <th width="10%">Cantidad</th>
                    <th width="10%">Medida</th>
                    <th width="10%">Precio</th>
                    <th width="10%">Impuesto</th>
                    <th width="5%" className="text-center">
                      Eliminar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="7">
                                                    {spinnerLoading("Cargando información de la tabla...", true)}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="7">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return ( */}
                  <tr /*  key={index}*/>
                    <td className="text-center">1</td>
                    <td>10 UND</td>
                    <td>PROD0001/Pollo desmenuzado</td>
                    <td>S/. 25</td>
                    <td>S/. 1.8</td>
                    <td className="text-center">18 %</td>
                    <td className="text-center">S/. 2000</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Anular"
                        onClick={() => this.handleEliminar('')}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  {/* )
                                            })
                                        )
                                    } */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
            <button
              type="button"
              className="btn btn-primary mr-2"
              onClick={() => this.handleSave()}
            >
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => this.props.history.goBack()}
            >
              Cancelar
            </button>
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

/**
 *
 * Método encargado de traer la información de redux
 */
const mapStateToProps = (state) => {
  return {
    token: state.reducer,
  };
};

/**
 *
 * Método encargado de conectar con redux y exportar la clase
 */
export default connect(mapStateToProps, null)(CotizacionEditar);
