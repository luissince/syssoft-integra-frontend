import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getExtension, ModalAlertClear, ModalAlertInfo, ModalAlertSuccess, ModalAlertWarning, readDataURL, imageSizeData } from '../../tools/Tools';
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
    const [txtCostoXlote, setTxtCostoXLote] = useState('')
    const [txtNumContratoCorrelativo, setTxtNumContratoCorrelativo] = useState('')
    const [txtNumReciboCorrelativo, setTxtNumReciboCorrelativo] = useState('')
    const [txtInflacionAnual, setTxtInflacionAnual] = useState('')
    const [txtImagen, setTxtImagen] = useState(noImage)
    const [imageBase64, setImageBase64] = useState(null);
    const [extenBase64, setExtenBase64] = useState(null);

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

    useEffect(() => {
        const url = props.location.search;
        const idResult = new URLSearchParams(url).get("idProyecto");
        if (idResult !== null) setIdProyecto(idResult)

        refFileImagen.current.addEventListener("change", (event) => {
            if (event.target.files.length !== 0) {
                setTxtImagen(URL.createObjectURL(event.target.files[0]))
                console.log(event.target.files)
            } else {
                setTxtImagen(noImage)
                refFileImagen.current.value = "";
            }
        });
    }, [props.location.search]);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        const loadDataId = async (id) => {
            try {
                const result = await axios.get("/api/proyecto/id", {
                    signal: signal,
                    params: {
                        idProyecto: id
                    }
                });

                const data = result.data;

                setTxtNombre(data.nombre);
                setTxtSede(data.sede);
                setTxtNumPartidaElectronica(data.numPartidaElectronica);
                setTxtArea(data.area);
                setCbxEstado(data.estado);
                //
                setTxtUbicacion(data.ubicacion);
                setTxtPais(data.pais);
                setTxtRegion(data.region);
                setTxtProvincia(data.provincia);
                setTxtDistrito(data.distrito);
                //
                setTxtLnorte(data.lnorte);
                setTxtLeste(data.leste);
                setTxtLsur(data.lsur);
                setTxtLoeste(data.loeste);
                //
                setTxtMoneda(data.moneda);
                setTxtTea(data.tea);
                setTxtPrecioMetro(data.preciometro);
                setTxtCostoXLote(data.costoxlote);
                setTxtNumContratoCorrelativo(data.numContratoCorrelativo);
                setTxtNumReciboCorrelativo(data.numRecibocCorrelativo);
                setTxtInflacionAnual(data.inflacionAnual);
                //
                if (data.imagen !== "") {
                    setTxtImagen(`data:image/${data.extensionimagen};base64,${data.imagen}`);
                    setImageBase64(data.imagen);
                    setExtenBase64(data.extensionimagen);
                }
                ModalAlertClear()
            } catch (error) {
                if (error.message === "canceled") return;

                ModalAlertWarning("Proyecto", "Se produjo un error un interno, intente nuevamente.", function () {
                    props.history.goBack();
                });
            }
        }

        if (idProyecto !== "" && idProyecto !== null) {
            ModalAlertInfo("Proyecto", "Cargando información...");
            loadDataId(idProyecto)
        }

        return () => {
            if (idProyecto !== "" && idProyecto !== null) {
                ModalAlertClear()
                abortController.abort();
            }
        }
    }, [idProyecto, props.history]);

    const saveProyect = async () => {
        try {
            ModalAlertInfo("Proyecto", "Procesando información...");
            let files = refFileImagen.current.files;
            if (files.length !== 0) {
                let read = await readDataURL(files);
                let base64String = read.replace(/^data:.+;base64,/, '');
                let ext = getExtension(files[0].name);
                let { width, height } = await imageSizeData(read);
                if (width === 1024 && height === 629) {
                    let result = await saveProject(base64String, ext);
                    ModalAlertSuccess("Proyecto", result.data, function () {
                        props.history.goBack();
                    });
                } else {
                    ModalAlertWarning("Proyecto", "La imagen subida no tiene el tamaño establecido.");
                }
            } else {
                let result = await saveProject("", "");
                ModalAlertSuccess("Proyecto", result.data, function () {
                    props.history.goBack();
                });
            }
        } catch (error) {
            console.log(error)
            if (error.response != null) {
                ModalAlertWarning("Proyecto", error.response.data, function () {
                    props.history.goBack();
                });
            } else {
                ModalAlertWarning("Proyecto", "Se produjo un error un interno, intente nuevamente.", function () {
                    props.history.goBack();
                });
            }
        }
    }

    const saveProject = async (image, extension) => {
        if (idProyecto === "") {
            return await axios.post('/api/proyecto/add', {
                //datos
                "nombre": txtNombre.trim().toUpperCase(),
                "sede": txtSede.trim().toUpperCase(),
                "numPartidaElectronica": txtNumPartidaElectronica.trim().toUpperCase(),
                "area": txtArea.toString().trim().toUpperCase(),
                "estado": CbxEstado,
                //ubicacion
                "ubicacion": txtUbicacion.trim().toUpperCase(),
                "pais": txtPais.trim().toUpperCase(),
                "region": txtRegion.trim().toUpperCase(),
                "provincia": txtProvincia.trim().toUpperCase(),
                "distrito": txtDistrito.trim().toUpperCase(),
                //limite
                "lnorte": txtLnorte.trim().toUpperCase(),
                "leste": txtLeste.trim().toUpperCase(),
                "lsur": txtLsur.trim().toUpperCase(),
                "loeste": txtLoeste.trim().toUpperCase(),
                //ajustes
                "moneda": txtMoneda.trim().toUpperCase(),
                "tea": txtTea.toString().trim().toUpperCase(),
                "preciometro": txtPrecioMetro.toString().trim().toUpperCase(),
                "costoxlote": txtCostoXlote.toString().trim().toUpperCase(),
                "numContratoCorrelativo": txtNumContratoCorrelativo.trim().toUpperCase(),
                "numRecibocCorrelativo": txtNumReciboCorrelativo.trim().toUpperCase(),
                "inflacionAnual": txtInflacionAnual.toString().trim().toUpperCase(),
                //imagen
                "imagen": image === "" ? imageBase64 == null ? "" : imageBase64 : image,
                "extension": extension === "" ? extenBase64 == null ? "" : extenBase64 : extension,
            });
        } else {
            return await axios.post('/api/proyecto/update', {
                "idProyecto ": idProyecto,
                //datos
                "nombre": txtNombre.trim().toUpperCase(),
                "sede": txtSede.trim().toUpperCase(),
                "numPartidaElectronica": txtNumPartidaElectronica.trim().toUpperCase(),
                "area": txtArea.toString().trim().toUpperCase(),
                "estado": CbxEstado,
                //ubicacion
                "ubicacion": txtUbicacion.trim().toUpperCase(),
                "pais": txtPais.trim().toUpperCase(),
                "region": txtRegion.trim().toUpperCase(),
                "provincia": txtProvincia.trim().toUpperCase(),
                "distrito": txtDistrito.trim().toUpperCase(),
                //limite
                "lnorte": txtLnorte.trim().toUpperCase(),
                "leste": txtLeste.trim().toUpperCase(),
                "lsur": txtLsur.trim().toUpperCase(),
                "loeste": txtLoeste.trim().toUpperCase(),
                //ajustes
                "moneda": txtMoneda.trim().toUpperCase(),
                "tea": txtTea.toString().trim().toUpperCase(),
                "preciometro": txtPrecioMetro.toString().trim().toUpperCase(),
                "costoxlote": txtCostoXlote.toString().trim().toUpperCase(),
                "numContratoCorrelativo": txtNumContratoCorrelativo.trim().toUpperCase(),
                "numRecibocCorrelativo": txtNumReciboCorrelativo.trim().toUpperCase(),
                "inflacionAnual": txtInflacionAnual.toString().trim().toUpperCase(),
                //imagen
                "imagen": image === "" ? imageBase64 == null ? "" : imageBase64 : image,
                "extension": extension === "" ? extenBase64 == null ? "" : extenBase64 : extension,
            });
        }
    }

    const clearImage = () => {
        setTxtImagen(noImage)
        refFileImagen.current.value = "";
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
                                        onChange={(event) => setTxtUbicacion(event.target.value)}
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
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="row">
                                            <div className="col-lg-8 col-md-10 col-sm-12 col-xs-12">
                                                <img src={txtImagen} alt="" className="card-img-top" />
                                                <p>Imagen de portada 1024 x 629 pixeles </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group text-center">

                                        <input type="file" id="fileImage" accept="image/png, image/jpeg, image/gif, image/svg" style={{ display: "none" }} ref={refFileImagen} />
                                        <label htmlFor="fileImage" className="btn btn-outline-secondary m-0">
                                            <div className="content-button">
                                                <i className="bi bi-image"></i>
                                                <span></span>
                                            </div>
                                        </label>
                                        {" "}
                                        <button className="btn btn-outline-secondary" onClick={clearImage}>
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
                <button type="button" className="btn btn-primary" onClick={saveProyect}>Guardar</button>
                <button type="button" className="btn btn-secondary ml-2" onClick={() => props.history.goBack()}>Cerrar</button>
            </div>

        </>
    )
}