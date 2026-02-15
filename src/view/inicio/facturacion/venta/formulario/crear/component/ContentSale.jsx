import { useScreenSize } from "@/hooks/use-mobile";
import InvoiceClient from "./InvoiceClient";
import InvoiceDetail from "./InvoiceDetail";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceTicket from "./InvoiceTicket";
import InvoiceView from "./InvoiceView";
import InvoiceVoucher from "./InvoiceVoucher";
import { cn } from "@/lib/utils";

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
    numeroDeItems,
    subTotal,
    impuestoDetalle,
    total,

    handleMinusProducto,
    handlePlusProducto,
    handleEditProducto,
    handleRemoveProducto,
    handleClearSale,
    handleOpenSale,
}) => {

    const isScreen = useScreenSize();


    return (
        <>
            <section className={`invoice-left ${isScreen && activeTab !== "productos" && "hidden"}`}>
                <div className="h-full flex flex-col items relative">
                    {/* Se activa en modo mobile */}
                    <div className="flex md:hidden border-b border-solid border-[#e1e7ee] bg-white">
                        <InvoiceTicket
                            nombreComporbante={nombreComporbante}
                            handleOpenPreImpresion={handleOpenPreImpresion}
                            handleOpenVenta={handleOpenVenta}
                            handleOpenCotizacion={handleOpenCotizacion}
                            handleOpenPedido={handleOpenPedido}
                            handleOpenOptions={handleOpenOptions}
                        />
                    </div>

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
                    />
                </div>
            </section>

            <section
                className={cn(
                    "invoice-right bg-white",
                    "flex flex-col md:flex-[0_0_40%]",
                    "w-full md:max-w-[500px]",
                    "border border-solid border-[#cbd5e1]",
                    isScreen && activeTab === "productos" && "hidden"
                )}
            >
                <InvoiceTicket
                    className="hidden md:flex"
                    nombreComporbante={nombreComporbante}
                    handleOpenPreImpresion={handleOpenPreImpresion}
                    handleOpenVenta={handleOpenVenta}
                    handleOpenCotizacion={handleOpenCotizacion}
                    handleOpenPedido={handleOpenPedido}
                    handleOpenOptions={handleOpenOptions}
                />

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
                numeroDeItems={numeroDeItems}
                codiso={codiso}
                subTotal={subTotal}
                impuestoDetalle={impuestoDetalle}
                total={total}
                handleOpenSale={handleOpenSale}
                handleClearSale={handleClearSale}
                />
            </section>
        </>
    );
}

export default ContentSale;