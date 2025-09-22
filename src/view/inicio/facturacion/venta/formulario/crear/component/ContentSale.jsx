import { useIsMobile } from "@/hooks/use-mobile";
import InvoiceClient from "./InvoiceClient";
import InvoiceDetail from "./InvoiceDetail";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceTicket from "./InvoiceTicket";
import InvoiceView from "./InvoiceView";
import InvoiceVoucher from "./InvoiceVoucher";

const ContentSale = ({
    activeTab,
    refInvoiceView,
    idSucursal,
    idAlmacen,
    codiso,
    productos,
    cotizacion,
    pedido,
    handleUpdateProductos,
    handleAddItem,
    handleStarProduct,

    nombreComporbante,
    handleOpenPreImpresion,
    handleOpenVenta,
    handleOpenCotizacion,
    handleOpenPedido,
    handleOpenOptions,

    refComprobante,
    idComprobante,
    comprobantes,
    handleSelectComprobante,

    handleOpenCliente,
    refCliente,
    refValueCliente,
    clientes,
    handleClearInputCliente,
    handleFilterCliente,
    handleSelectItemCliente,

    detalleVenta,
    impuestos,
    handleMinusProducto,
    handlePlusProducto,
    handleEditProducto,
    handleRemoveProducto,
    handleClearSale,
    handleOpenSale,
}) => {

    const isMobile = useIsMobile();

    return (
        <>
            <section className={`invoice-left ${isMobile && activeTab !== "productos" && "hidden"}`}>
                <InvoiceView
                    ref={refInvoiceView}
                    idSucursal={idSucursal}
                    idAlmacen={idAlmacen}
                    codiso={codiso}
                    productos={productos}
                    cotizacion={cotizacion}
                    pedido={pedido}
                    handleUpdateProductos={handleUpdateProductos}
                    handleAddItem={handleAddItem}
                    handleStarProduct={handleStarProduct}

                    nombreComporbante={nombreComporbante}
                    handleOpenPreImpresion={handleOpenPreImpresion}
                    handleOpenVenta={handleOpenVenta}
                    handleOpenCotizacion={handleOpenCotizacion}
                    handleOpenPedido={handleOpenPedido}
                    handleOpenOptions={handleOpenOptions}
                />
            </section>

            <section className={`invoice-right flex w-full md:flex-[0_0_40%] md:max-w-[500px] ${isMobile && activeTab === "productos" && "hidden" }`}>
                <div className="hidden md:flex">
                    <InvoiceTicket
                        nombreComporbante={nombreComporbante}
                        handleOpenPreImpresion={handleOpenPreImpresion}
                        handleOpenVenta={handleOpenVenta}
                        handleOpenCotizacion={handleOpenCotizacion}
                        handleOpenPedido={handleOpenPedido}
                        handleOpenOptions={handleOpenOptions}
                    />
                </div>

                <InvoiceVoucher
                    refComprobante={refComprobante}
                    idComprobante={idComprobante}
                    comprobantes={comprobantes}
                    handleSelectComprobante={handleSelectComprobante}
                />

                <InvoiceClient
                    handleOpenCliente={handleOpenCliente}
                    placeholder="Filtrar clientes..."
                    refCliente={refCliente}
                    refValueCliente={refValueCliente}
                    clientes={clientes}
                    handleClearInput={handleClearInputCliente}
                    handleFilter={handleFilterCliente}
                    handleSelectItem={handleSelectItemCliente}
                />

                <InvoiceDetail
                    codiso={codiso}
                    detalleVenta={detalleVenta}
                    handleMinus={handleMinusProducto}
                    handlePlus={handlePlusProducto}
                    handleEdit={handleEditProducto}
                    handleRemove={handleRemoveProducto}
                />

                <InvoiceFooter
                    codiso={codiso}
                    impuestos={impuestos}
                    detalleVenta={detalleVenta}
                    handleOpenSale={handleOpenSale}
                    handleClearSale={handleClearSale}
                />
            </section>
        </>
    );
}

export default ContentSale;