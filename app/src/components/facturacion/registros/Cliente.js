import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getExtension, ModalAlertClear, ModalAlertInfo, ModalAlertSuccess, ModalAlertWarning, readDataURL, imageSizeData } from '../../tools/Tools';


export default function Cliente(props) {

    const [idCliente, setIdCliente] = useState('')

    //representante
    const [numDocumento, setNumDocumento] = useState('')
    const [cliente, setCliente] = useState('')
    const [genero, setGenero] = useState('MASCULINO')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [fechaNacimiento, setFechaNacimiento] = useState('')
    //ubicacion
    const [pais, setPais] = useState('')
    const [region, setRegion] = useState('')
    const [provincia, setProvincia] = useState('')
    const [distrito, setDistrito] = useState('')
    const [direccion, setDireccion] = useState('')
    //conyuge
    const [numDocConyuge, setNumDocConyuge] = useState('')
    const [conyuge, setConyuge] = useState('')
    const [generoConyuge, setGeneroConyuge] = useState('MASCULINO')
    const [telConyuge, setTelConyuge] = useState('')
    const [emailConyuge, setEmailConyuge] = useState('')
    const [fechaNacConyuge, setFechaNacConyuge] = useState('')
    //otros datos
    const [estadoCivil, setEstadoCivil] = useState('')
    const [tipoMonedaBanco, setTipoMonedaBanco] = useState('')
    const [numCuentaBanco, setNumCuentaBanco] = useState('')
    const [observacion, setObservacion] = useState('')
    //beneficiario
    const [numDocBeneficiario, setNumDocBeneficiario] = useState('')
    const [beneficiario, setBeneficiario] = useState('')
    const [generoBeneficiario, setGeneroBeneficiario] = useState('MASCULINO')
    const [telBeneficiario, setTelBeneficiario] = useState('')
    // const [emailBeneficiario, setEmailBeneficiario] = useState('')
    const [fechaNacBeneficiario, setFechaNacBeneficiario] = useState('')

    //Referencias
    const refNumDocumento = useRef('')
    const refCliente = useRef('')
    const refTelefono = useRef('')

    const refPais = useRef('')
    const refRegion = useRef('')
    const refProvincia = useRef('')
    const refDistrito = useRef('')
    const refDireccion = useRef('')

    return (
        <>
            <div className='row pb-3'>
                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                    <section className="content-header">
                        <h5 className="no-margin"> Registrar Cliente <small style={{ color: 'gray' }}> nuevo </small> </h5>
                    </section>
                </div>
            </div>

            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <a className="nav-link active" id="representante-tab" data-bs-toggle="tab" href="#representante" role="tab" aria-controls="representante" aria-selected="true"><i className="bi bi-person-circle"></i> Representante</a>
                </li>
                <li className="nav-item" role="presentation">
                    <a className="nav-link" id="ubicacion-tab" data-bs-toggle="tab" href="#ubicacion" role="tab" aria-controls="ubicacion" aria-selected="false"><i className="bi bi-geo-alt-fill"></i> Ubicación</a>
                </li>
                <li className="nav-item" role="presentation">
                    <a className="nav-link" id="conyuge-tab" data-bs-toggle="tab" href="#conyuge" role="tab" aria-controls="conyuge" aria-selected="false"><i className="bi bi-people-fill"></i> Conyuge</a>
                </li>
                <li className="nav-item" role="presentation">
                    <a className="nav-link" id="otrosDatos-tab" data-bs-toggle="tab" href="#otrosDatos" role="tab" aria-controls="otrosDatos" aria-selected="false"><i className="bi bi-person-badge"></i> Otros Datos</a>
                </li>
                <li className="nav-item" role="presentation">
                    <a className="nav-link" id="beneficiario-tab" data-bs-toggle="tab" href="#beneficiario" role="tab" aria-controls="beneficiario" aria-selected="false"><i className="bi bi-person-heart"></i> Beneficiario</a>
                </li>
            </ul>

            <div className="tab-content pt-2" id="myTabContent">
                <div className="tab-pane fade show active" id="representante" role="tabpanel" aria-labelledby="representante-tab">
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div>
                            <div className="form-group">
                                <label>DNI/RUC</label>
                                <input 
                                    type="number"
                                    className="form-control"
                                    value={numDocumento}
                                    ref={refNumDocumento}
                                    onChange={(event) => setNumDocumento(event.target.value)}
                                    placeholder='ingrese N° dni o ruc' />
                            </div>
                            <div className="form-group">
                                <label>Cliente (Nombre y Apellidos)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={cliente}
                                    ref={refCliente}
                                    onChange={(event) => setCliente(event.target.value)}
                                    placeholder='ingrese nombre y apellidos' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="genero">Genero</label>
                                <select className="form-control" id="genero" value={genero} onChange={(event) => setGenero(event.target.value)}>
                                    {/* <option>-- Seleccione --</option> */}
                                    <option value='MASCULINO'>Masculino</option>
                                    <option value='FEMENINO'>Femenino</option>
                                    <option value='NO BINARIO'>No Binario</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>N° de Telefono</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={telefono}
                                    ref={refTelefono}
                                    onChange={(event) => setTelefono(event.target.value)}
                                    placeholder='ingrese numero de telefono' />
                            </div>
                            <div className="form-group">
                                <label>E-Mail</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder='ej: email@server.com' />
                            </div>
                            <div className="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    value={fechaNacimiento}
                                    onChange={(event) => setFechaNacimiento(event.target.value)}
                                    placeholder='ej: 04 / 04 / 2024' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tab-pane fade" id="ubicacion" role="tabpanel" aria-labelledby="ubicacion-tab">
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div>
                            <div className="form-group">
                                <label htmlFor="pais">Pais</label>
                                {/* <select className="form-control" id="pais">
                                    <option>-- Seleccione --</option>
                                    <option>Perú</option>
                                    <option>otro pais</option>
                                </select> */}
                                <input 
                                    type="text"
                                    className="form-control"
                                    id="pais"
                                    value={pais}
                                    ref={refPais}
                                    onChange={(event) => setPais(event.target.value)}
                                    placeholder='ingrese el pais' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="region">Región</label>
                                {/* <select className="form-control" id="region">
                                    <option>-- Seleccione --</option>
                                    <option>region1</option>
                                    <option>otra región</option>
                                </select> */}
                                <input 
                                    type="text"
                                    className="form-control"
                                    id="region"
                                    value={region}
                                    ref={refRegion}
                                    onChange={(event) => setRegion(event.target.value)}
                                    placeholder='ingrese la region' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="provincia">Provincia</label>
                                {/* <select className="form-control" id="provincia">
                                    <option>-- Seleccione --</option>
                                    <option>provincia1</option>
                                    <option>otra provincia</option>
                                </select> */}
                                <input 
                                    type="text"
                                    className="form-control"
                                    id="provincia"
                                    value={provincia}
                                    ref={refProvincia}
                                    onChange={(event) => setProvincia(event.target.value)}
                                    placeholder='ingrese la provincia' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="distrito">Distrito</label>
                                {/* <select className="form-control" id="distrito">
                                    <option>-- Seleccione --</option>
                                    <option>Distrito1</option>
                                    <option>otro distrito</option>
                                </select> */}
                                <input 
                                    type="text"
                                    className="form-control"
                                    id="distrito"
                                    value={distrito}
                                    ref={refDistrito}
                                    onChange={(event) => setDistrito(event.target.value)}
                                    placeholder='ingrese el distrito' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="direccion">Dirección</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="direccion" 
                                    value={direccion}
                                    ref={refDireccion}
                                    onChange={(event) => setDireccion(event.target.value)}
                                    placeholder='ingrese una dirección valida' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tab-pane fade" id="conyuge" role="tabpanel" aria-labelledby="conyuge-tab">
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div>
                            <div className="form-group">
                                <label htmlFor="documentoConyuge">DNI/RUC</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="documentoConyuge"
                                    value={numDocConyuge}
                                    onChange={(event) => setNumDocConyuge(event.target.value)}
                                    placeholder='ingrese dni o ruc del conyuge' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nombreConyuge">Conyuge (Nombres y Apellidos)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="nombreConyuge" 
                                    value={conyuge}
                                    onChange={(event) => setConyuge(event.target.value)}
                                    placeholder='ingrese nombres y apellidos del conyuge' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="generoConyuge">Genero</label>
                                <select className="form-control" id="generoConyuge" value={generoConyuge} onChange={(event) => setGeneroConyuge(event.target.value)}>
                                    <option value='MASCULINO'>Masculino</option>
                                    <option value='FEMENINO'>Femenino</option>
                                    <option value='NO BINARIO'>No Binario</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="telConyuge">Telefono</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="telConyuge" 
                                    value={telConyuge}
                                    onChange={(event) => setTelConyuge(event.target.value)}
                                    placeholder='ingrese telefono o celular del conyuge' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="emailConyuge">E-Mail</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    id="emailConyuge" 
                                    value={emailConyuge}
                                    onChange={(event) => setEmailConyuge(event.target.value)}
                                    placeholder='ingrese email del conyuge' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fechaNacimientoConyuge">Fecha de Nacimiento</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    id="fechaNacimientoConyuge" 
                                    value={fechaNacConyuge}
                                    onChange={(event) => setFechaNacConyuge(event.target.value)}
                                    placeholder='ej: 04 / 04 / 2024' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tab-pane fade" id="otrosDatos" role="tabpanel" aria-labelledby="otrosDatos-tab">
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                            Agregar información adicional. Esta sección es Opcional.
                        </div>
                    </div>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div>
                            <div className="form-group">
                                <label htmlFor="estadoCivil">Estado Civil</label>
                                <select className="form-control" id="estadoCivil" values={estadoCivil} onChange={(event) => setEstadoCivil(event.target.value)}>
                                    <option value="SOLTERO(A)">soltero(a)</option>
                                    <option value="CASADO(A)">Casado(a)</option>
                                    <option value="CASADO(A)">Viudo(a)</option>
                                    <option value="DIVORCIADO(A)">Divorciado(a)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="tipoMonedaBanco">Tipo, Moneda, Banco</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="tipoMonedaBanco" 
                                    value={tipoMonedaBanco}
                                    onChange={(event) => setTipoMonedaBanco(event.target.value)}
                                    placeholder='ej: cuenta de ahorros en dolares del banco xxxx' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="numeroCuenta">Numero de Cuenta del Banco</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="numeroCuenta" 
                                    value={numCuentaBanco}
                                    onChange={(event) => setNumCuentaBanco(event.target.value)}
                                    placeholder='124567894568' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="observacion">Observación</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="observacion" 
                                    value={observacion}
                                    onChange={(event) => setObservacion(event.target.value)}
                                    placeholder='algún texto adicional' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tab-pane fade" id="beneficiario" role="tabpanel" aria-labelledby="beneficiario-tab">
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                            Añade un beneficiario a tu cliente. Esta sección es Opcional.
                        </div>
                    </div>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div>
                            <div className="form-group">
                                <label htmlFor="documentoBeneficiario">DNI/RUC</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="documentoBeneficiario" 
                                    value={numDocBeneficiario}
                                    onChange={(event) => setNumDocBeneficiario(event.target.value)}
                                    placeholder='documento del beneficiario' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="beneficiario">Beneficiario (Nombres y Apellidos)</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="beneficiario" 
                                    value={beneficiario}
                                    onChange={(event) => setBeneficiario(event.target.value)}
                                    placeholder='ingrese nombre y apellidos del beneficiario' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="generoBeneficiario">Genero</label>
                                <select className="form-control" id="generoBeneficiario" value={generoBeneficiario} onChange={(event) => setGeneroBeneficiario(event.target.value)}>
                                    <option value='MASCULINO'>Masculino</option>
                                    <option value='FEMENINO'>Femenino</option>
                                    <option value='NO BINARIO'>No Binario</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefonoBeneficiario">Numero de Telefono</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="telefonoBeneficiario" 
                                    value={telBeneficiario}
                                    onChange={(event) => setTelBeneficiario(event.target.value)}
                                    placeholder='ingrese numero de telefono o celular' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="FechaNacimientoBeneficiario">Fecha de Nacimiento</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    id="FechaNacimientoBeneficiario" 
                                    value={fechaNacBeneficiario} 
                                    onChange={(event) => setFechaNacBeneficiario(event.target.value)}/>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" className="btn btn-primary mr-2">Guardar</button>
                <button type="button" className="btn btn-secondary">Cancelar</button>
            </div>

        </>
    )
}


/*
class Cliente extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5 className="no-margin"> Registrar Cliente <small style={{ color: 'gray' }}> nuevo </small> </h5>
                        </section>
                    </div>
                </div>

                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="representante-tab" data-bs-toggle="tab" href="#representante" role="tab" aria-controls="representante" aria-selected="true"><i className="bi bi-person-circle"></i> Representante</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="ubicacion-tab" data-bs-toggle="tab" href="#ubicacion" role="tab" aria-controls="ubicacion" aria-selected="false"><i className="bi bi-geo-alt-fill"></i> Ubicación</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="conyuge-tab" data-bs-toggle="tab" href="#conyuge" role="tab" aria-controls="conyuge" aria-selected="false"><i className="bi bi-people-fill"></i> Conyuge</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="otrosDatos-tab" data-bs-toggle="tab" href="#otrosDatos" role="tab" aria-controls="otrosDatos" aria-selected="false"><i className="bi bi-person-badge"></i> Otros Datos</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="beneficiario-tab" data-bs-toggle="tab" href="#beneficiario" role="tab" aria-controls="beneficiario" aria-selected="false"><i className="bi bi-person-heart"></i> Beneficiario</a>
                    </li>
                </ul>
                <div className="tab-content pt-2" id="myTabContent">
                    <div className="tab-pane fade show active" id="representante" role="tabpanel" aria-labelledby="representante-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="dni">DNI/RUC</label>
                                    <input type="email" className="form-control" id="dni" placeholder='ingrese N° dni o ruc' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cliente">Cliente (Nombre y Apellidos)</label>
                                    <input type="" className="form-control" id="cliente" placeholder='ingrese nombre y apellidos' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="genero">Genero</label>
                                    <select className="form-control" id="genero">
                                        <option>-- Seleccione --</option>
                                        <option>Masculino</option>
                                        <option>Femenino</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">N° de Telefono</label>
                                    <input type="number" className="form-control" id="telefono" placeholder='ingrese numero de tlefono' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">E-Mail</label>
                                    <input type="email" className="form-control" id="email" placeholder='ej: email@server.com' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                                    <input type="date" className="form-control" id="fechaNacimiento" placeholder='ej: 04 / 04 / 2024' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="ubicacion" role="tabpanel" aria-labelledby="ubicacion-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="pais">Pais</label>
                                    <select className="form-control" id="pais">
                                        <option>-- Seleccione --</option>
                                        <option>Perú</option>
                                        <option>otro pais</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="region">Región</label>
                                    <select className="form-control" id="region">
                                        <option>-- Seleccione --</option>
                                        <option>region1</option>
                                        <option>otra región</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="provincia">Provincia</label>
                                    <select className="form-control" id="provincia">
                                        <option>-- Seleccione --</option>
                                        <option>provincia1</option>
                                        <option>otra provincia</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="distrito">Distrito</label>
                                    <select className="form-control" id="distrito">
                                        <option>-- Seleccione --</option>
                                        <option>Distrito1</option>
                                        <option>otro distrito</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input type="" className="form-control" id="direccion" placeholder='ingrese una direccion valida' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="conyuge" role="tabpanel" aria-labelledby="conyuge-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="documentoConyuge">DNI/RUC</label>
                                    <input type="" className="form-control" id="documentoConyuge" placeholder='ingrese dni o ruc del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nombreConyuge">Conyuge (Nombres y Apellidos)</label>
                                    <input type="" className="form-control" id="nombreConyuge" placeholder='ingrese nombres y apellidos del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoConyuge">Genero</label>
                                    <select className="form-control" id="generoConyuge">
                                        <option>-- Seleccione --</option>
                                        <option>Masculino</option>
                                        <option>Femenino</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">Telefono</label>
                                    <input type="number" className="form-control" id="telefono" placeholder='ingrese telefono o celular del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">E-Mail</label>
                                    <input type="number" className="form-control" id="email" placeholder='ingrese email del conyuge' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaNacimientoConyuge">Fecha de Nacimiento</label>
                                    <input type="date" className="form-control" id="fechaNacimientoConyuge" placeholder='ej: 04 / 04 / 2024' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="otrosDatos" role="tabpanel" aria-labelledby="otrosDatos-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                                Agregar información adicional. Esta sección es Opcional.
                            </form>
                        </div>
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="estadoCivil">Estado Civil</label>
                                    <select className="form-control" id="estadoCivil">
                                        <option>-- seleccione --</option>
                                        <option>soltero</option>
                                        <option>Casado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tipoMonedaBanco">Tipo, Moneda, Banco</label>
                                    <input type="number" className="form-control" id="tipoMonedaBanco" placeholder='ej: cuenta de ahorros en dolares del banco xxxx' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numeroCuenta">Numero de Cuenta del Banco</label>
                                    <input type="number" className="form-control" id="numeroCuenta" placeholder='124567894568' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="observacion">Observación</label>
                                    <input type="number" className="form-control" id="observacion" placeholder='algún texto adicional' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="beneficiario" role="tabpanel" aria-labelledby="beneficiario-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form className='m-2 p-3' style={{ border: '2px solid #FED765', background: '#FCF7D8', color: '#F8A827', borderRadius: '8px' }}>
                                Añade un beneficiario a tu cliente. Esta sección es Opcional.
                            </form>
                        </div>
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="documentoBeneficiario">DNI/RUC</label>
                                    <input type="number" className="form-control" id="documentoBeneficiario" placeholder='documento del beneficiario' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="beneficiario">Beneficiario (Nombres y Apellidos)</label>
                                    <input type="" className="form-control" id="beneficiario" placeholder='ingrese nombre y apellidos del beneficiario' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoBeneficiario">Genero</label>
                                    <select className="form-control" id="generoBeneficiario">
                                        <option>-- Seleccione --</option>
                                        <option>Masculino</option>
                                        <option>Femenino</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numeroCuenta">Numero de Telefono</label>
                                    <input type="number" className="form-control" id="numeroCuenta" placeholder='ingrese numero de telefono o celular' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="FechaNacimientoBeneficiario">Fecha de Nacimiento</label>
                                    <input type="date" className="form-control" id="FechaNacimientoBeneficiario" />
                                </div>
                            </form>
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary mr-2">Guardar</button>
                    <button type="button" className="btn btn-secondary">Cancelar</button>
                </div>
            </>
        );
    }
}
*/
