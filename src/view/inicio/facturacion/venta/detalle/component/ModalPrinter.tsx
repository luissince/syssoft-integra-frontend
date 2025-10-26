import React, { useState, useRef } from "react";
import CustomModal, {
    CustomModalContentBody,
    CustomModalContentFooter,
    CustomModalContentHeader
} from "@/components/CustomModal";
import PrinterPlugin, { BluetoothDevice, Size, UsbDevice } from "@/model/ts/plugins/printer-escpos";
import { documentsPdfInvoicesVenta } from "@/network/rest/principal.network";
import { alertKit } from "alert-kit";
import { addJob, printAsync } from "@/redux/printerSlice";
import { useDispatch } from "react-redux";

interface Props {
    isOpen: boolean;
    handleClose: () => void; // Función de cierre tipada correctamente
    idVenta: string;
}

interface SelectedPrinter {
    type: "BLUETOOTH" | "USB";
    address?: string;
    vendorId?: number;
    productId?: number;
    name: string;
}

const ModalPrinter: React.FC<Props> = ({ isOpen, handleClose, idVenta }) => {
    const refModal = useRef(null);

    const dispatch = useDispatch();

    // Estados locales
    const [selectedSize, setSelectedSize] = useState<Size>(Size.MM_80);
    const [bluetooth, setBluetooth] = useState<BluetoothDevice[]>([]);
    const [usb, setUsb] = useState<UsbDevice[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<SelectedPrinter>();

    /**
     * Evento al abrir modal → Cargar lista de impresoras
     */
    const onOpen = async () => {
        try {
            alertKit.loading({ title: "Cargando impresoras..." });

            const result = await PrinterPlugin.listPrinters();
            setBluetooth(result.bluetooth.devices ?? []);
            setUsb(result.usb.devices ?? []);

            alertKit.close();
        } catch (error) {
            alertKit.warning({
                title: "Impresión",
                message: "No se pudieron cargar las impresoras. Asegúrese de que estén encendidas y emparejadas.",
            });
        }
    };

    /**
     * Evento al cerrar modal → Resetear estados
     */
    const onHidden = () => {
        setBluetooth([]);
        setUsb([]);
        setSelectedPrinter(undefined);
    };

    /**
     * Selección de tamaño de papel
     */
    const handleSelectSize = (size: Size) => setSelectedSize(size);

    /**
     * Selección de impresora con validación de permisos
     */
    const handleSelectPrinter = async (
        type: "BLUETOOTH" | "USB",
        device: BluetoothDevice | UsbDevice
    ) => {
        try {
            const resultPermission = type === "BLUETOOTH"
                ? await PrinterPlugin.requestBluetoothPermission()
                : await PrinterPlugin.requestUsbPermission({
                    vendorId: (device as UsbDevice).vendorId,
                    productId: (device as UsbDevice).productId,
                });

            if (!resultPermission.success) {
                return alertKit.warning({
                    title: "Impresión",
                    message: resultPermission.message,
                });
            }

            // Guardamos impresora seleccionada
            setSelectedPrinter({
                type,
                address: type === "BLUETOOTH" ? (device as BluetoothDevice).address : "",
                vendorId: type === "USB" ? (device as UsbDevice).vendorId : undefined,
                productId: type === "USB" ? (device as UsbDevice).productId : undefined,
                name: device.name || (device as UsbDevice).productName,
            });
        } catch (error) {
            alertKit.warning({
                title: "Impresión",
                message: (error as Error).message,
            });
        }
    };

    /**
     * Confirmar impresión
     */
    const handleConfirmPrint = async () => {
        if (!selectedPrinter) {
            return alertKit.warning({
                title: "Impresión",
                message: "Por favor seleccione una impresora.",
            });
        }

        const url = documentsPdfInvoicesVenta(idVenta, selectedSize, "png");

        // Mapeo de tamaños a mm
        const widthMap: Record<Size, number> = {
            [Size.MM_58]: 58,
            [Size.MM_80]: 80,
            [Size.A4]: 210,
        };

        const jobId = Date.now();
        dispatch(addJob({ id: jobId, message: `Impresión de ${idVenta}` }));
        dispatch(printAsync({
            id: jobId,
            type: selectedPrinter.type,
            address: selectedPrinter.address ?? "",
            vendorId: selectedPrinter.vendorId ?? 0,
            productId: selectedPrinter.productId ?? 0,
            widthMm: widthMap[selectedSize],
            message: `Comprobante de Venta ${idVenta}`,
            imageUrl: url,
        }));
        handleClose();
    };

    return (
        <CustomModal
            ref={refModal}
            isOpen={isOpen}
            onOpen={onOpen}
            onHidden={onHidden}
            onClose={handleClose}
            contentLabel="Impresoras"
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
            className="flex flex-col"
        >
            <CustomModalContentHeader contentRef={refModal} showClose isMoveable>
                Seleccionar impresora
            </CustomModalContentHeader>

            <CustomModalContentBody>
                {/* Selector de tamaño */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tamaño de papel
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(Size).map((size) => (
                            <button
                                key={size}
                                type="button"
                                className={`px-3 py-2 text-sm rounded-lg border ${selectedSize === size
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                onClick={() => handleSelectSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Impresoras Bluetooth */}
                <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bluetooth</h4>
                    {bluetooth.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay dispositivos emparejados.</p>
                    ) : (
                        <div className="space-y-2">
                            {bluetooth.map((dev, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`w-full text-left p-3 rounded-lg border ${selectedPrinter?.address === dev.address
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleSelectPrinter("BLUETOOTH", dev)}
                                >
                                    <div className="font-medium text-gray-800">{dev.name}</div>
                                    <div className="text-xs text-gray-500">{dev.address}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Impresoras USB */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">USB</h4>
                    {usb.length === 0 ? (
                        <p className="text-sm text-gray-500">No se detectaron impresoras USB.</p>
                    ) : (
                        <div className="space-y-2">
                            {usb.map((dev, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`w-full text-left p-3 rounded-lg border ${selectedPrinter?.vendorId === dev.vendorId &&
                                        selectedPrinter?.productId === dev.productId
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleSelectPrinter("USB", dev)}
                                >
                                    <div className="font-medium text-gray-800">
                                        {dev.productName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        VID: {dev.vendorId} / PID: {dev.productId}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CustomModalContentBody>

            <CustomModalContentFooter>
                <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={handleClose}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleConfirmPrint}
                    disabled={!selectedPrinter}
                >
                    Imprimir
                </button>
            </CustomModalContentFooter>
        </CustomModal>
    );
};

export default ModalPrinter;
