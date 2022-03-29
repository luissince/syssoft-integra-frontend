import React,{useEffect,useState, useRef} from 'react';
import axios from 'axios';
// import loading from '../../../recursos/images/loading.gif'
import noImage from '../../../recursos/images/noimage.jpg'

 export default function ProcesoProyecto(props) {

    const [idProyecto, setIdProyecto] = useState('')
    //datos
    const [txtNombre, setTxtNombre] = useState('')
    const [txtSede, setTxtSede] = useState('')
    const [txtNumPartidaElectronica, setTxtNumPartidaElectronica] = useState('')
    const [txtArea, setTxtArea] = useState('')
    const [CbxEstado, setCbxEstado] = useState('VENTA')
    //ubicacion
    const [txtUbicacion, setTxtUbicacion] = useState('')
    const [txtPais, setTxtPais] = useState('')
    const [txtRegion, setTxtRegion] = useState('')
    const [txtProvincia, setTxtProvincia] = useState('')
    const [txtDistrito, setTxtDistrito] = useState('')
    //limite
    const [txtLnorte, setTxtLnorte] = useState('')
    const [txtLeste, setTxtLeste] = useState('')
    const [txtLsur, setTxtLsur] = useState('')
    const [txtLoeste, setTxtLoeste] = useState('')
    //ajustes
    const [txtMoneda, setTxtMoneda] = useState('')
    const [txtTea, setTxtTea] = useState('')
    const [txtPrecioMetro, setTxtPrecioMetro] = useState('')
    const [txtCostoXlote, setTxtCostoXLote] = useState('' )
    const [txtNumContratoCorrelativo, setTxtNumContratoCorrelativo] = useState('')
    const [txtNumReciboCorrelativo, setTxtNumReciboCorrelativo] = useState('')
    const [txtInflacionAnual, setTxtInflacionAnual] = useState('')
    const [txtImagen, setTxtImagen] = useState(noImage)

    const [inputImg, setInputImg] = useState(null)



    const refTxtNombre = useRef()
    const refTxtSede = useRef()
    const refTxtArea = useRef()
    const refTxtUbicacion = useRef()
    const refTxtPais = useRef()
    const refTxtRegion = useRef()
    const refTxtProvincia = useRef()
    const refTxtDistrito = useRef()
    const refTxtMoneda = useRef()
    const refTxtTea = useRef()
    const refFileImagen = useRef()

    let img = null

    useEffect(()=>{

       console.log(refFileImagen)
       refFileImagen.current.addEventListener("change", (event)=>{
            if(event.target.files.length != 0){
                setTxtImagen( URL.createObjectURL(event.target.files[0]))
                img = event.target.files[0]
            } else{
                setTxtImagen(noImage)
                img = null
            }
            
       })

        return ()=>{
            refFileImagen.current.removeEventListener("change", ()=>{ 
            })
        }
    }, []);

    const save = ()=>{
        // console.log(refFileImagen.current.files)
        console.log(typeof txtImagen === "string")
    }

    const cambio = ()=>{

    }

    // useEffect(()=>{
    //     console.log("render")
    // });

    // useEffect(()=>{
    //     console.log("nombre")
    // },[txtNombre]);

    return (

        <>
            <div className='row'>
                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                    <div className="form-group">
                        <h5>Proyectos <small className="text-secondary">LISTA</small></h5>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
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
                                        ref={refTxtNombre}
                                        value={txtNombre}
                                        onChange={(event) => setTxtNombre(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Sede:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtSede}
                                        value={txtSede}
                                        onChange={(event) => setTxtSede(event.target.value)}
                                        placeholder="Dijite ..." />

                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>N° Partida Electrónica:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtNumPartidaElectronica}
                                        onChange={(event) => setTxtNumPartidaElectronica(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Area Total(Has):</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtArea}
                                        value={txtArea}
                                        onChange={(event) => setTxtArea(event.target.value)}
                                        placeholder="Dijite ..." />

                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-12">
                                    <label>Estado:</label>
                                    <div className="input-group">
                                        <select
                                            className="form-control"
                                            value={CbxEstado}
                                            onChange={(event) => setCbxEstado(event.target.value)} 
                                            >
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
                                        ref={refTxtUbicacion}
                                        value={txtUbicacion}
                                        onChange={(event) => setTxtUbicacion( event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Pais:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtPais}
                                        value={txtPais}
                                        onChange={(event) => setTxtPais(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Region:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtRegion}
                                        value={txtRegion}
                                        onChange={(event) => setTxtRegion(event.target.value)}
                                        placeholder="Dijite ..." />

                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Provincia:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtProvincia}
                                        value={txtProvincia}
                                        onChange={(event) => setTxtProvincia(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Distrito:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtDistrito}
                                        value={txtDistrito}
                                        onChange={(event) => setTxtDistrito(event.target.value)}
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
                                        value={txtLnorte}
                                        onChange={(event) => setTxtLnorte(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Limite, Este/Sureste:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtLeste}
                                        onChange={(event) => setTxtLeste(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Limite, Sur/Suroeste:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtLsur}
                                        onChange={(event) => setTxtLsur(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Limite, Oeste/Noroeste:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtLoeste}
                                        onChange={(event) => setTxtLoeste(event.target.value)}
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
                                        ref={refTxtMoneda}
                                        value={txtMoneda}
                                        onChange={(event) => setTxtMoneda(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>TEA %:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={refTxtTea}
                                        value={txtTea}
                                        onChange={(event) => setTxtTea(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Precio Metro Cuadrado:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtPrecioMetro}
                                        onChange={(event) => setTxtPrecioMetro(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Coste Aproximado x Lote:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtCostoXlote}
                                        onChange={(event) => setTxtCostoXLote(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Número Contrato Correlativo:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtNumContratoCorrelativo}
                                        onChange={(event) => setTxtNumContratoCorrelativo(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Número Recibo Correlativo:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtNumReciboCorrelativo}
                                        onChange={(event) => setTxtNumReciboCorrelativo(event.target.value)}
                                        placeholder="Dijite ..." />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-12">
                                    <label>Inflacion Anual:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={txtInflacionAnual}
                                        onChange={(event) => setTxtInflacionAnual(event.target.value)}
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
                                        <img src={txtImagen} style={{ objectFit: "cover" }} width="160" height="160"/>
                                    </div>
                                </div>
                                <div className="form-group col-md-12">
                                    <div className="text-center">
                                        <input type="file" id="fileImage" accept="image/png, image/jpeg, image/gif, image/svg" style={{ display: "none" }} ref={refFileImagen}/>
                                        <label htmlFor="fileImage" className="btn btn-outline-secondary m-0">
                                            <div className="content-button">
                                                <i className="bi bi-image"></i>
                                                <span></span>
                                            </div>
                                        </label>
                                        {" "}
                                        <button className="btn btn-outline-secondary" onClick={ () => setTxtImagen(noImage) }>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>

                </div>
            </div>

            <div className='row'>
                <button type="button" className="btn btn-primary" onClick={ save }>Guardar</button>
                <button type="button" className="btn btn-secondary ml-2" onClick={() => console.log('C')}>Cerrar</button>
            </div>

        </>
    )
}