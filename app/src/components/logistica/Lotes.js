import React from 'react';

class Lotes extends React.Component {
    // constructor(props) {
    //     super(props);

    // }

    render() {
        return (
            <>
                {/* Inicio modal nuevo cliente*/}
                <div className="modal fade" id="modalLote" tabIndex="-1" aria-labelledby="modalLoteLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalLoteLabel"><i className="bi bi-house-fill"></i> Registrar Lote</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className='row py-1'>
                                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                        <nav>
                                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                                <a class="nav-link active" id="nav-info-tab" data-toggle="tab" href="#nav-info" role="tab" aria-controls="nav-info" aria-selected="true"><i className="bi bi-info-circle"></i> Descripcion</a>
                                                <a class="nav-link" id="nav-medida-tab" data-toggle="tab" href="#nav-medida" role="tab" aria-controls="nav-medida" aria-selected="false"><i className="bi bi-aspect-ratio"></i> Medidas</a>
                                                <a class="nav-link" id="nav-limite-tab" data-toggle="tab" href="#nav-limite" role="tab" aria-controls="nav-limite" aria-selected="false"><i className="bi bi-pip"></i> Limite</a>
                                            </div>
                                        </nav>
                                        <div class="tab-content" id="nav-tabContent">
                                            <div class="tab-pane fade show active" id="nav-info" role="tabpanel" aria-labelledby="nav-info-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <form>
                                                        <div className="form-group">
                                                            <label htmlFor="manzana">Manzana</label>
                                                            <select className="form-control" id="manzana">
                                                                <option>-- Seleccione --</option>
                                                                <option>Manzana A</option>
                                                                <option>Manzana B</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="descripción">Descripción del Lote</label>
                                                            <input type="" className="form-control" id="descripcion" placeholder='ej. Lote 07' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="cAproximado">Costo Aproximado (S/)</label>
                                                            <input type="number" className="form-control" id="cAproximado" placeholder='0.00' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="pvContado">Precio Venta Contado (S/)</label>
                                                            <input type="number" className="form-control" id="pvContado" placeholder='0.00' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="estado">Estado</label>
                                                            <select className="form-control" id="estado">
                                                                <option>-- Seleccione --</option>
                                                                <option>Disponible</option>
                                                                <option>Reservado</option>
                                                                <option>Vendido</option>
                                                                <option>Inactivo</option>
                                                            </select>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="nav-medida" role="tabpanel" aria-labelledby="nav-medida-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <form>
                                                        <div className="form-group">
                                                            <label htmlFor="mFrontal">Medida Frontal (ML)</label>
                                                            <input type="number" className="form-control" id="mFrontal" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="coDerecho">Costado Derecho (ML)</label>
                                                            <input type="number" className="form-control" id="coDerecho" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="coIzquierdo">Costado Izquierdo (ML)</label>
                                                            <input type="number" className="form-control" id="coIzquierdo" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="mFondo">Medida Fondo (ML)</label>
                                                            <input type="number" className="form-control" id="mFondo" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="aLote">Area Lote (M2)</label>
                                                            <input type="number" className="form-control" id="aLote" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="nPartida">N° Partida</label>
                                                            <input type="number" className="form-control" id="nPartida" placeholder='0' />
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="nav-limite" role="tabpanel" aria-labelledby="nav-limite-tab">
                                                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                                    <form>
                                                        <div className="form-group">
                                                            <label htmlFor="lFrontal">Limite, Frontal / Norte / Noreste</label>
                                                            <input type="number" className="form-control" id="lFrontal" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="lDerecho">Limite, Derecho / Este / Sureste</label>
                                                            <input type="number" className="form-control" id="lDerecho" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="lIzquierdo">Limite, Izquierdo / Sur / Suroeste</label>
                                                            <input type="number" className="form-control" id="lIzquierdo" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="lPosterior">Limite, Posterior / Oeste / Noroeste</label>
                                                            <input type="number" className="form-control" id="lPosterior" placeholder='0' />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="ubicacionLote">Ubicación del Lote</label>
                                                            <input type="number" className="form-control" id="ubicacionLote" placeholder='ej. Frente al parque' />
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                                <button type="button" className="btn btn-primary">Aceptar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal nuevo cliente*/}

                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                            <h5 className="no-margin">Lotes de Terreno<small style={{ color: 'gray' }}> Lista </small> </h5>
                        </section>
                    </div>
                </div>

                <div className='row'>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Nuevo Registro</label>
                        <div className="form-group">
                            <button type="button" className="btn btn-success" data-toggle="modal" data-target="#modalLote">
                                <i className="bi bi-plus-lg"></i> Agregar Lote
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <label>Opción.</label>
                        <div className="form-group">
                            <button className="btn btn-light">
                                <i className="bi bi-arrow-repeat"></i> Recargar
                            </button>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <label>Filtrar por descripción o estado.</label>
                        <div className="form-group">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Ingrese para buscar" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-secondary" type="button">Button</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ borderWidth: '1px', borderStyle: 'inset', borderColor: '#CFA7C9' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="25%">Descripción</th>
                                        <th width="10%">P. Venta</th>
                                        <th width="10%">M.Costado</th>
                                        <th width="10%">M. Fondo</th>
                                        <th width="10%">Area</th>
                                        <th width="15%">Estado</th>
                                        <th width="15%" colSpan="2">Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>

                            </table>
                        </div>
                        <div className="col-md-12" style={{ textAlign: 'center' }}>
                            <nav aria-label="...">
                                <ul className="pagination justify-content-end">
                                    <li className="page-item disabled">
                                        <a className="page-link">Previous</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item active" aria-current="page">
                                        <a className="page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                    </div>
                </div>
            </>
        );
    }
}

export default Lotes;