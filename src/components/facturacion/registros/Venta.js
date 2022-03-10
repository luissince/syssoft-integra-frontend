import React from 'react';

class Venta extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5 className="no-margin"> Registrar Venta <small style={{ color: 'gray' }}> nuevo </small> </h5>
                        </section>
                    </div>
                </div>

                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <a className="nav-link active" id="datos-tab" data-toggle="tab" href="#datos" role="tab" aria-controls="datos" aria-selected="true"><i className="bi bi-info-circle"></i> Datos</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="detalle-tab" data-toggle="tab" href="#detalle" role="tab" aria-controls="detalle" aria-selected="false"><i className="bi bi-ticket-detailed-fill"></i> Detalle</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="convenio-tab" data-toggle="tab" href="#convenio" role="tab" aria-controls="convenio" aria-selected="false"><i className="bi bi-file-earmark-person-fill"></i> Convenio</a>
                    </li>
                    <li className="nav-item" role="presentation">
                        <a className="nav-link" id="comprobante-tab" data-toggle="tab" href="#comprobante" role="tab" aria-controls="comprobante" aria-selected="false"><i className="bi bi-file-text-fill"></i> Comprobante</a>
                    </li>
                </ul>
                <div className="tab-content pt-2" id="myTabContent">
                    <div className="tab-pane fade show active" id="datos" role="tabpanel" aria-labelledby="datos-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="cliente">Cliente</label>
                                    <input type="email" className="form-control" id="cliente" placeholder='ingrese nombre cliente' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaVenta">Fecha Venta</label>
                                    <input type="date" className="form-control" id="fechaVenta" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tipoVenta">Tipo de Venta</label>
                                    <select className="form-control" id="tipoVenta">
                                        <option>Contado</option>
                                        <option>Credito</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inicial">Incial (S/)</label>
                                    <input type="number" className="form-control" id="inicial" placeholder='0.00' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cuotas">N° de Cuotas</label>
                                    <input type="number" className="form-control" id="cuotas" placeholder='0' />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="detalle" role="tabpanel" aria-labelledby="detalle-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="lote">Lote</label>
                                    <input className="form-control" id="lote" placeholder='buscar lote de terreno.. (E) Lote 01 - manzana 02' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="precioVenta">Precio Venta Contado</label>
                                    <input type="number" className="form-control" id="precioVenta" placeholder='0.00' />
                                </div>
                                <div className='form-group'>
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th scope="col">Descripción (Lote - Manzana) </th>
                                                <th scope="col">Precio </th>
                                                <th scope="col">Quitar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr></tr>
                                        </tbody>
                                        <tfoot className='nav justify-content-center'>
                                            <tr>
                                                
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="convenio" role="tabpanel" aria-labelledby="convenio-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="cliente">Vendedor</label>
                                    <input type="" className="form-control" id="cliente" placeholder='ingrese nombre cliente' />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaVenta">Deposito en Banco</label>
                                    <select className="form-control" id="depositoBanco">
                                        <option>-- seleccione --</option>
                                        <option>seleccion primera</option>
                                        <option>seleccion segunda</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tipoVenta">Fecha Pago Primera Cuota</label>
                                    <input type="date" className="form-control" id="fechaPagoPrimeraCuota" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inicial">N° Contrato</label>
                                    <input type="number" className="form-control" id="inicial" placeholder='Por Generar..' readOnly />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="comprobante" role="tabpanel" aria-labelledby="comprobante-tab">
                        <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                            <div className='row'>
                                <div className='col-lg-6 col-md-6 col-sm-12 col-xs-12'>
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="cliente">Comprobante</label>
                                            <select className="form-control" id="comprobante">
                                                <option>-- seleccione --</option>
                                                <option>seleccion primera</option>
                                                <option>seleccion segunda</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="fechaVenta">N° de Comprobante</label>
                                            <input type="number" className="form-control" id="fechaVenta" placeholder="Ingrese un numero" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="tipoVenta">Forma de Pago</label>
                                            <select className="form-control" id="formaPago">
                                                <option> -- seleccione -- </option>
                                                <option>seleccion primera</option>
                                                <option>seleccion segunda</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="inicial">Código de Operación</label>
                                            <input type="number" className="form-control" id="inicial" placeholder='ej: 12345 - 09/03-2022' />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="inicial">Voucher Imagen</label>
                                            {/* <div className="input-group mb-3">
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input" id="inputGroupFile02"/>
                                                <label className="custom-file-label" for="inputGroupFile02" aria-describedby="inputGroupFileAddon02">Subir Imagen</label>
                                        </div>
                                    </div> */}
                                            <input type="file" className="form-control-file" id="exampleFormControlFile1"></input>
                                        </div>
                                    </form>
                                </div>
                                <div className='col-lg-6 col-md-6 col-sm-12 col-xs-12 bg-light'>

                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary mr-2">Guardar</button>
                    <button type="button" className="btn btn-secondary">Cancelar</button>
                </div>
            </>
        );
    }
}

export default Venta;