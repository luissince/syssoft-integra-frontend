
const InvoiceListPrices = (props) => {

    const { refComprobante, idComprobante, comprobantes, handleSelectComprobante } = props;

    return (
        <div className='invoice-list-prices'>
            <div className='pt-1 pb-1 d-flex align-items-center'>                
                <div className='col-12'>
                    <p className=''>Numeración</p>
                    <select
                        title="Comprobantes de venta"
                        className='form-control'
                        ref={refComprobante}
                        value={idComprobante}
                        onChange={handleSelectComprobante}
                    >
                        <option>-- Comprobantes --</option>
                        {
                            comprobantes.map((item, index) => (
                                <option key={index} value={item.idComprobante}>{item.nombre}</option>
                            ))
                        }
                    </select>
                </div>
            </div>          
            {/* <div className='py-1 pb-3 w-100 d-flex align-items-center'>
                            <p className='m-auto pl-2 pr-2'></p>
                            <select className='form-control pl-2'>
                                <option>- Buscar Item -</option>
                            </select>

                            <SearchBarProducto
                                        placeholder="Filtrar productos..."
                                        refProducto={this.refProducto}
                                        producto={this.state.pProducto}
                                        productos={this.state.productos}
                                        onEventClearInput={this.onEventClearInputProducto}
                                        handleFilter={this.handleFilterProducto}
                                        onEventSelectItem={this.onEventSelectItemProducto}
                                    /> 

                            <button className='btn btn-success d-flex ml-3 mr-3' style={{ width: "150px" }}>
                                <div className='w-100 text-center'>Nuevo Item</div>
                            </button>
                        </div> */}
        </div>
    );
}

export default InvoiceListPrices;