import React from 'react';
import axios from 'axios';
import loading from '../../recursos/images/loading.gif'
import noImage from '../../recursos/images/noimage.jpg'
import { showModal, hideModal } from '../tools/Tools'


class Proyectos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idProyecto: '',
            //datos
            txtNombre: '',
            txtSede: '',
            txtNumPartidaElectronica: '',
            txtArea: '',
            CbxEstado: 'VENTA',
            //ubicacion
            txtUbicacion: '',
            txtPais: '',
            txtRegion: '',
            txtProvincia: '',
            txtDistrito: '',
            //limite
            txtLnorte: '',
            txtLeste: '',
            txtLsur: '',
            txtLoeste: '',
            //ajustes
            txtMoneda: '',
            txtTea: '',
            txtPrecioMetro: '',
            txtCostoXlote: '',
            txtNumContratoCorrelativo: '',
            txtNumReciboCorrelativo: '',
            txtInflacionAnual: '',
            //imagen
            txtImagen: noImage,

            loading: true,
            lista: [],
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messagePaginacion: ''

        }

        this.refTxtNombre = React.createRef()
        this.refTxtSede = React.createRef()
        this.refTxtArea = React.createRef()

        this.refTxtUbicacion = React.createRef()
        this.refTxtPais = React.createRef()
        this.refTxtRegion = React.createRef()
        this.refTxtProvincia = React.createRef()
        this.refTxtDistrito = React.createRef()

        this.refTxtMoneda = React.createRef()
        this.refTxtTea = React.createRef()

        this.refFileImagen = React.createRef()


    }

    async componentDidMount() {
        this.fillTable(0, 1, "");
        // this.refFileImagen.addEventListener("change", (event)=>{
        //     console.log(event)
        // });
    }

    componentWillUnmount(){
        // this.refFileImagen.removeEventListener("change", (event)=>{})
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    fillTable = async (option, paginacion, buscar) => {
        // console.log(buscar.trim().toUpperCase())
        try {
            await this.setStateAsync({ loading: true, paginacion: paginacion, lista: [] });
            const result = await axios.get('/api/proyecto/list', {
                params: {
                    "option": option,
                    "buscar": buscar.trim().toUpperCase(),
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            this.setState({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
            // console.log(result);
        } catch (err) {
            console.log(err.response)
            console.log(err)
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/proyecto/id", {
                params: {
                    idproyecto: id
                }
            });
            // console.log(result)
            this.setState({
                //datos
                txtNombre: result.data.nombre,
                txtSede: result.data.sede,
                txtNumPartidaElectronica: result.data.numpartidaelectronica,
                txtArea: result.data.area,
                CbxEstado: result.data.estado,
                //ubicacion
                txtUbicacion: result.data.ubicacion,
                txtPais: result.data.pais,
                txtRegion: result.data.region,
                txtProvincia: result.data.provincia,
                txtDistrito: result.data.distrito,
                //limite
                txtLnorte: result.data.lnorte,
                txtLeste: result.data.leste,
                txtLsur: result.data.lsur,
                txtLoeste: result.data.loeste,
                //ajustes
                txtMoneda: result.data.moneda,
                txtTea: result.data.tea,
                txtPrecioMetro: result.data.preciometro,
                txtCostoXlote: result.data.costoxlote,
                txtNumContratoCorrelativo: result.data.numcontratocorrelativo,
                txtNumReciboCorrelativo: result.data.numrecibocorrelativo,
                txtInflacionAnual: result.data.inflacionanual,
                //imagen
                txtImagen: result.data.imagen,

                idProyecto: result.data.idproyecto

            });

        } catch (error) {
            console.log(error.response)
        }
    }

    async save() {
        if (this.state.txtNombre === "") {
            this.refTxtNombre.current.focus();
        }
        // else if (this.state.txtMoneda === "") {
        //     this.refTxtMoneda.current.focus();
        // } else if (this.state.txtNumCuenta === "") {
        //     this.refTxtNumCuenta.current.focus();
        // } else if (this.state.txtRepresentante === "") {
        //     this.refTxtRepresentante.current.focus();
        // } 

        else {
            try {

                let result = null
                if (this.state.idBanco !== '') {
                    result = await axios.post('/api/proyecto/update', {
                        //datos
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "sede": this.state.txtSede.trim().toUpperCase(),
                        "numpartidaelectronica": this.state.txtNumPartidaElectronica.trim().toUpperCase(),
                        "area": this.state.txtArea.toString().trim().toUpperCase(),
                        "estado": this.state.CbxEstado,
                        //ubicacion
                        "ubicacion": this.state.txtUbicacion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
                        //limite
                        "lnorte": this.state.txtLnorte.trim().toUpperCase(),
                        "leste": this.state.txtLeste.trim().toUpperCase(),
                        "lsur": this.state.txtLsur.trim().toUpperCase(),
                        "loeste": this.state.txtLoeste.trim().toUpperCase(),
                        //ajustes
                        "moneda": this.state.txtMoneda.trim().toUpperCase(),
                        "tea": this.state.txtTea.toString().trim().toUpperCase(),
                        "preciometro": this.state.txtPrecioMetro.toString().trim().toUpperCase(),
                        "costoxlote": this.state.txtCostoXlote.toString().trim().toUpperCase(),
                        "numcontratocorrelativo": this.state.txtNumContratoCorrelativo.trim().toUpperCase(),
                        "numrecibocorrelativo": this.state.txtNumReciboCorrelativo.trim().toUpperCase(),
                        "inflacionanual": this.state.txtInflacionAnual.toString().trim().toUpperCase(),
                        //imagen
                        "imagen": "",

                        "idproyecto": this.state.idProyecto
                    })
                    // console.log(result);

                } else {
                    result = await axios.post('/api/proyecto/add', {
                        //datos
                        "nombre": this.state.txtNombre.trim().toUpperCase(),
                        "sede": this.state.txtSede.trim().toUpperCase(),
                        "numpartidaelectronica": this.state.txtNumPartidaElectronica.trim().toUpperCase(),
                        "area": this.state.txtArea.toString().trim().toUpperCase(),
                        "estado": this.state.CbxEstado,
                        //ubicacion
                        "ubicacion": this.state.txtUbicacion.trim().toUpperCase(),
                        "pais": this.state.txtPais.trim().toUpperCase(),
                        "region": this.state.txtRegion.trim().toUpperCase(),
                        "provincia": this.state.txtProvincia.trim().toUpperCase(),
                        "distrito": this.state.txtDistrito.trim().toUpperCase(),
                        //limite
                        "lnorte": this.state.txtLnorte.trim().toUpperCase(),
                        "leste": this.state.txtLeste.trim().toUpperCase(),
                        "lsur": this.state.txtLsur.trim().toUpperCase(),
                        "loeste": this.state.txtLoeste.trim().toUpperCase(),
                        //ajustes
                        "moneda": this.state.txtMoneda.trim().toUpperCase(),
                        "tea": this.state.txtTea.toString().trim().toUpperCase(),
                        "preciometro": this.state.txtPrecioMetro.toString().trim().toUpperCase(),
                        "costoxlote": this.state.txtCostoXlote.toString().trim().toUpperCase(),
                        "numcontratocorrelativo": this.state.txtNumContratoCorrelativo.trim().toUpperCase(),
                        "numrecibocorrelativo": this.state.txtNumReciboCorrelativo.trim().toUpperCase(),
                        "inflacionanual": this.state.txtInflacionAnual.toString().trim().toUpperCase(),
                        //imagen
                        "imagen": "",
                    });
                    // console.log(result);
                }

                // console.log(result);
                this.closeModal()

            } catch (error) {
                console.log(error)
                console.log(error.response)
            }
        }
    }

    openModal(id) {
        if (id === '') {
            showModal('modalProyecto')
            this.refTxtNombre.current.focus();

        }
        else {
            this.setState({ idProyecto: id });
            showModal('modalProyecto')
            this.loadDataId(id)

        }
    }

    closeModal() {
        hideModal('modalProyecto')
        this.setState({
            //datos
            txtNombre: '',
            txtSede: '',
            txtNumPartidaElectronica: '',
            txtArea: '',
            CbxEstado: 'VENTA',
            //ubicacion
            txtUbicacion: '',
            txtPais: '',
            txtRegion: '',
            txtProvincia: '',
            txtDistrito: '',
            //limite
            txtLnorte: '',
            txtLeste: '',
            txtLsur: '',
            txtLoeste: '',
            //ajustes
            txtMoneda: '',
            txtTea: '',
            txtPrecioMetro: '',
            txtCostoXlote: '',
            txtNumContratoCorrelativo: '',
            txtNumReciboCorrelativo: '',
            txtInflacionAnual: '',
            //imagen
            txtImagen: noImage,

            idProyecto: '',
        })
    }



    
    render() {
        return (
            <>

                {/* Inicio modal */}
                <div className="modal fade" id="modalProyecto" data-backdrop="static">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-currency-exchange"></i>{this.state.idProyecto === '' ? " Registrar Proyecto" : " Editar Proyecto"}</h5>
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link active" id="datos-tab" data-bs-toggle="tab" href="#datos" role="tab" aria-controls="datos" aria-selected="true"><i className="bi bi-info-circle"></i> Datos</a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="ubicacion-tab" data-bs-toggle="tab" href="#ubicacion" role="tab" aria-controls="ubicacion" aria-selected="false"><i className="bi bi-geo-alt-fill"></i> Ubicación</a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="limite-tab" data-bs-toggle="tab" href="#limite" role="tab" aria-controls="limite" aria-selected="false"><i className="bi bi-border-all"></i> Limite</a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="ajustes-tab" data-bs-toggle="tab" href="#ajustes" role="tab" aria-controls="ajustes" aria-selected="false"><i className="bi bi-gear"></i> Ajustes</a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a className="nav-link" id="imagen-tab" data-bs-toggle="tab" href="#imagen" role="tab" aria-controls="imagen" aria-selected="false"><i className="bi bi-image"></i> Imagen</a>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2" id="myTabContent">
                                    <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Nombre de Proyecto:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtNombre}
                                                    value={this.state.txtNombre}
                                                    onChange={(event) => this.setState({ txtNombre: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Sede:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtSede}
                                                    value={this.state.txtSede}
                                                    onChange={(event) => this.setState({ txtSede: event.target.value })}
                                                    placeholder="Dijite ..." />

                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>N° Partida Electrónica:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtNumPartidaElectronica}
                                                    onChange={(event) => this.setState({ txtNumPartidaElectronica: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Area Total(Has):</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtArea}
                                                    value={this.state.txtArea}
                                                    onChange={(event) => this.setState({ txtArea: event.target.value })}
                                                    placeholder="Dijite ..." />

                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Estado:</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-control"
                                                        value={this.state.CbxEstado}
                                                        onChange={(event) => this.setState({ CbxEstado: event.target.value })} >
                                                        <option value="VENTA">Venta</option>
                                                        <option value="LITIGIO">Litigio</option>
                                                        <option value="COMPLETADA">Completada</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="tab-pane fade" id="ubicacion" role="tabpanel" aria-labelledby="ubicacion-tab">
                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Ubicacion del Proyecto:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtUbicacion}
                                                    value={this.state.txtUbicacion}
                                                    onChange={(event) => this.setState({ txtUbicacion: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Pais:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtPais}
                                                    value={this.state.txtPais}
                                                    onChange={(event) => this.setState({ txtPais: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Region:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtRegion}
                                                    value={this.state.txtRegion}
                                                    onChange={(event) => this.setState({ txtRegion: event.target.value })}
                                                    placeholder="Dijite ..." />

                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Provincia:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtProvincia}
                                                    value={this.state.txtProvincia}
                                                    onChange={(event) => this.setState({ txtProvincia: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Distrito:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtDistrito}
                                                    value={this.state.txtDistrito}
                                                    onChange={(event) => this.setState({ txtDistrito: event.target.value })}
                                                    placeholder="Dijite ..." />

                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="limite" role="tabpanel" aria-labelledby="limite-tab">
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Limite, Norte/Noreste:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtLnorte}
                                                    onChange={(event) => this.setState({ txtLnorte: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Limite, Este/Sureste:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtLeste}
                                                    onChange={(event) => this.setState({ txtLeste: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Limite, Sur/Suroeste:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtLsur}
                                                    onChange={(event) => this.setState({ txtLsur: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Limite, Oeste/Noroeste:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtLoeste}
                                                    onChange={(event) => this.setState({ txtLoeste: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="ajustes" role="tabpanel" aria-labelledby="ajustes-tab">

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Moneda:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtMoneda}
                                                    value={this.state.txtMoneda}
                                                    onChange={(event) => this.setState({ txtMoneda: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>TEA %:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    ref={this.refTxtTea}
                                                    value={this.state.txtTea}
                                                    onChange={(event) => this.setState({ txtTea: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Precio Metro Cuadrado:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtPrecioMetro}
                                                    onChange={(event) => this.setState({ txtPrecioMetro: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Coste Aproximado x Lote:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtCostoXlote}
                                                    onChange={(event) => this.setState({ txtCostoXlote: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Número Contrato Correlativo:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtNumContratoCorrelativo}
                                                    onChange={(event) => this.setState({ txtNumContratoCorrelativo: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Número Recibo Correlativo:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtNumReciboCorrelativo}
                                                    onChange={(event) => this.setState({ txtNumReciboCorrelativo: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group col-md-12">
                                                <label>Inflacion Anual:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.txtInflacionAnual}
                                                    onChange={(event) => this.setState({ txtInflacionAnual: event.target.value })}
                                                    placeholder="Dijite ..." />
                                            </div>
                                        </div>

                                    </div>

                                    <div className="tab-pane fade" id="imagen" role="tabpanel" aria-labelledby="imagen-tab">
                                        <div className="form-row">

                                            <div className="form-group col-md-12">
                                                <div className="text-center">
                                                    {/* <label>Imagen de portada:</label> */}
                                                    <p>Imagen de portada:</p>
                                                    <img src={this.state.txtImagen} style={{ objectFit: "cover" }} width="160" height="160"></img>
                                                </div>
                                            </div>
                                            <div className="form-group col-md-12">
                                                <div className="text-center">
                                                    <input type="file" id="fileImage" accept="image/png, image/jpeg, image/gif, image/svg" style={{ display: "none" }} ref={this.refFileImagen}/>
                                                    <label htmlFor="fileImage" className="btn btn-outline-secondary m-0">
                                                        <div className="content-button">
                                                            <i className="bi bi-image"></i>
                                                            <span></span>
                                                        </div>
                                                    </label>
                                                    {" "}
                                                    <button className="btn btn-outline-secondary" id="btnRemove">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.save()}>Guardar</button>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => this.closeModal()}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}


                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Proyectos <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input type="search" className="form-control" placeholder="Buscar..." onKeyUp={(event) => console.log(event.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.props.history.push(`${this.props.location.pathname}/proceso`)}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.fillTable(0, 1, "")}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="20%"><small><strong>Nombre del Proyecto</strong></small></th>
                                        <th width="20%">Área Total(Has)</th>
                                        <th width="20%">N° Partida Electrónica</th>
                                        <th width="15%">Moneda</th>
                                        <th width="10%">TEA</th>
                                        <th width="10%">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="7">
                                                    <img
                                                        src={loading}
                                                        id="imgLoad"
                                                        width="34"
                                                        height="34"
                                                    />
                                                    <p>Cargando información...</p>
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="7">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.area}</td>
                                                        <td>{item.numpartidaelectronica}</td>
                                                        <td>{item.moneda}</td>
                                                        <td>{item.tea}</td>
                                                        <td>
                                                            <button className="btn btn-outline-dark btn-sm" title="Editar" onClick={() => this.openModal(item.idproyecto)}><i className="bi bi-pencil"></i></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12 text-center">
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <button className="page-link">Previous</button>
                                    </li>
                                    <li className="page-item"><button className="page-link">1</button></li>
                                    <li className="page-item active" aria-current="page">
                                        <button className="page-link" href="#">2</button>
                                    </li>
                                    <li className="page-item"><button className="page-link" >3</button></li>
                                    <li className="page-item">
                                        <button className="page-link">Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                    </div>
                </div>
            </>
        )
    }
}

export default Proyectos