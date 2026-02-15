import { cn } from "@/lib/utils";
import { ShoppingBag, ShoppingCart } from "lucide-react";

interface Props {
    activeTab: string;
    detalleVenta: Array<any>;
    handleTabChange: (tab: string) => void;
}

const FloatingCartButton: React.FC<Props> = ({ activeTab, detalleVenta, handleTabChange }) => {
    return (
        <div className="fixed bottom-[15%] right-6 z-50 md:hidden" >
            <button
                aria-label="Ver carrito de compras"
                className={
                    cn(
                        "relative p-3 rounded-full bg-red-500 shadow-lg",
                        "transform transition-all duration-200 ",
                        "hover:bg-red-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    )
                }
                onClick={() => handleTabChange(activeTab === "productos" ? "detalle" : "productos")}
            >
                {
                    activeTab === "productos" ? <ShoppingCart className="w-6 h-6 text-white" /> : <ShoppingBag className="w-6 h-6 text-white" />
                }
                {
                    detalleVenta.length > 0 && (
                        <div className={
                            cn(
                                "absolute -top-2 -right-2",
                                "h-5 w-5",
                                "flex items-center justify-center",
                                "bg-red-600 text-white text-xs font-bold",
                                "rounded-full shadow-md"
                            )
                        }>
                            {detalleVenta.length}
                        </div>
                    )
                }
            </button>
        </div >
    );
}

export default FloatingCartButton;