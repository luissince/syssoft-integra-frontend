package com.syssosftintegra.app;

import android.Manifest;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.util.Log;

import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.HashMap;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;

import java.util.Set;

import java.io.OutputStream;
import java.io.IOException;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

import com.getcapacitor.JSArray;


@CapacitorPlugin(name = "MathPlugin")
public class MathPlugin extends Plugin {

    // 🆕 CONSTANTES PARA PERMISOS USB
    private static final String ACTION_USB_PERMISSION = "com.syssosftintegra.app.USB_PERMISSION";
    private static final String TAG = "MathPlugin";

    // 🏭 ENUM para tipos de conexión
    public enum PrinterType {
        USB,
        BLUETOOTH,
    }

    // 📋 Clase para configuración de impresora
    public static class PrinterConfig {
        public PrinterType type;
        public String address; // MAC para BT, IP para Red, deviceName para USB
        public int vendorId; // Solo para USB
        public int productId; // Solo para USB
        public int port = 9100; // Solo para red
        public int widthMm = 58;
        public String message = "Ticket de prueba";
        public String imageUrl = "";
    }

    @PluginMethod
    public void requestBluetoothPermission(PluginCall call) {
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT)
                == PackageManager.PERMISSION_GRANTED) {
            // ✅ Ya tiene permiso
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Ya tiene permisos.");
            call.resolve(ret);
        } else {
            // 🚨 Pide permiso en runtime → abrirá modal del sistema
            ActivityCompat.requestPermissions(
                    getActivity(),
                    new String[]{ Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN },
                    1001
            );

            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Permiso Bluetooth otorgado");
            call.resolve(ret);
        }
    }


    // 🔐 MÉTODO PARA PEDIR PERMISOS USB
    @PluginMethod
    public void requestUsbPermission(PluginCall call) {
        try{
            int vendorId = call.getInt("vendorId", 0);
            int productId = call.getInt("productId", 0);

            Log.d(TAG, "VendorId: "+ vendorId);
            Log.d(TAG, "ProductId: "+ productId);

            if (vendorId == 0 || productId == 0) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "vendorId y productId son requeridos");
                call.resolve(ret);
                return;
            }

            Log.d(TAG, "vendorId y productId recibidos correctamente");

            UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
            UsbDevice usbDevice = findUsbDevice(usbManager, vendorId, productId);

            if (usbDevice == null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "Dispositivo USB no encontrado: " + vendorId + ":" + productId);
                call.resolve(ret);
                return;
            }

            Log.d(TAG, "Dispotivo encontrado: "+ usbDevice.getProductName());

            if (usbManager.hasPermission(usbDevice)) {
                // ✅ Ya tiene permiso
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("hasPermission", true);
                ret.put("message", "Permiso USB ya otorgado");
                call.resolve(ret);
            } else {
                // 🚨 Pedir permiso
                requestUsbDevicePermission(usbDevice, call);
            }
        }catch (Exception ex){
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", ex.getMessage());
            call.resolve(ret);
        }
    }

    private UsbDevice findUsbDevice(UsbManager usbManager, int vendorId, int productId) {
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
        for (UsbDevice device : deviceList.values()) {
            if (device.getVendorId() == vendorId && device.getProductId() == productId) {
                return device;
            }
        }
        return null;
    }

    private void requestUsbDevicePermission(UsbDevice device, PluginCall call) {
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);

        // 👇 Hacemos el Intent explícito con setPackage()
        Intent intent = new Intent(ACTION_USB_PERMISSION).setPackage(getContext().getPackageName());


        PendingIntent permissionIntent = PendingIntent.getBroadcast(
                getContext(),
                0,
                intent,
                PendingIntent.FLAG_MUTABLE
        );

        // 📋 Registrar el receiver para esta solicitud específica
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        ContextCompat.registerReceiver(
                getContext(),
                createUsbReceiver(call),
                filter,
                ContextCompat.RECEIVER_NOT_EXPORTED
        );

        usbManager.requestPermission(device, permissionIntent);
    }

    private BroadcastReceiver createUsbReceiver(PluginCall call) {
        return new BroadcastReceiver() {
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (ACTION_USB_PERMISSION.equals(action)) {
                    synchronized (this) {
                        boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("hasPermission", granted);
                        ret.put("message", granted ? "Permiso USB otorgado" : "Permiso USB denegado");

                        call.resolve(ret);

                        // 🧹 Desregistrar el receiver
                        try {
                            getContext().unregisterReceiver(this);
                        } catch (Exception e) {
                            Log.w(TAG, "Error al desregistrar receiver: " + e.getMessage());
                        }
                    }
                }
            }
        };
    }

    @PluginMethod
    public void printTicket(PluginCall call) {
        try {
            // 📝 Obtener configuración desde JavaScript
            PrinterConfig config = createConfigFromCall(call);

            Log.d(TAG, "🖨️ Imprimiendo: " + config.type + " - Vendor: " + config.vendorId + " Product: " + config.productId);

            // ✅ Verificar permisos antes de imprimir
            if (config.type == PrinterType.USB) {
                if (!hasUsbPermission(config.vendorId, config.productId)) {
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    ret.put("error", "Sin permisos USB. Ejecuta requestUsbPermission() primero");
                    ret.put("needsPermission", true);
                    call.resolve(ret);
                    return;
                }
            }

            Log.d(TAG, "Tod bien :D");

            // 🔌 Obtener OutputStream y imprimir
            OutputStream outputStream;
            if(config.type == PrinterType.USB){
                 outputStream = getUsbOutputStream(config.vendorId, config.productId);
            }else{
                 outputStream = getBluetoothOutputStream(config.address);
            }

            if (outputStream == null) {
                throw new IOException("No se pudo obtener conexión con la impresora");
            }

            // --- ESC/POS básico ---
            byte[] init = new byte[]{0x1B, 0x40}; // Reset
            byte[] center = new byte[]{0x1B, 0x61, 0x01}; // Centrado
            byte[] boldOn = new byte[]{0x1B, 0x45, 0x01}; // Negrita ON
            byte[] boldOff = new byte[]{0x1B, 0x45, 0x00}; // Negrita OFF
            byte[] newLine = new byte[]{0x0A};
            byte[] cut = new byte[]{0x1D, 0x56, 0x01}; // Corte parcial

            outputStream.write(init);
            outputStream.write(center);

            // 🖼️ Imprimir imagen si se proporciona URL
            if (!config.imageUrl.isEmpty()) {
                outputStream.write(newLine);
                int printerWidthPx = getPrinterWidthPixels(config.widthMm);
                printImage(outputStream, config.imageUrl, printerWidthPx);
            }else{
                outputStream.write(boldOn);
                outputStream.write((config.message + "\n").getBytes("UTF-8"));
                outputStream.write(boldOff);
                outputStream.write(newLine);
            }

            outputStream.write(cut);
            outputStream.flush();

            outputStream.close();

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("printed", config.message);
            ret.put("type", config.type.toString());
            call.resolve(ret);

        } catch (Exception e) {
            Log.e("MathPlugin", "❌ Error al imprimir", e);
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    private PrinterConfig createConfigFromCall(PluginCall call) {
        PrinterConfig config = new PrinterConfig();
        config.type = PrinterType.valueOf(call.getString("type", "USB").toUpperCase());
        config.address = call.getString("address", "");
        config.vendorId = call.getInt("vendorId", 0);
        config.productId = call.getInt("productId", 0);
        config.port = call.getInt("port", 9100);
        config.widthMm = call.getInt("widthMm", 58);
        config.message = call.getString("message", "Ticket de prueba ESC/POS 🚀");
        config.imageUrl = call.getString("imageUrl", "");
        return config;
    }

    private OutputStream getBluetoothOutputStream(String macAddress) throws IOException {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            throw new IOException("Bluetooth no disponible o apagado");
        }

        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT)
                != PackageManager.PERMISSION_GRANTED) {
            throw new IOException("No tiene permiso BLUETOOTH_CONNECT");
        }

        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(macAddress);
        UUID uuid = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
        BluetoothSocket bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);

        bluetoothAdapter.cancelDiscovery();
        bluetoothSocket.connect();

        return bluetoothSocket.getOutputStream();
    }

    private boolean hasUsbPermission(int vendorId, int productId) {
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        UsbDevice device = findUsbDevice(usbManager, vendorId, productId);
        return device != null && usbManager.hasPermission(device);
    }

    // 🔌 USB OUTPUT STREAM
    private OutputStream getUsbOutputStream(int vendorId, int productId) throws IOException {
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        UsbDevice usbDevice = findUsbDevice(usbManager, vendorId, productId);

        if (usbDevice == null) {
            throw new IOException("Dispositivo USB no encontrado: " + vendorId + ":" + productId);
        }

        if (!usbManager.hasPermission(usbDevice)) {
            throw new IOException("Sin permisos USB para el dispositivo: " + vendorId + ":" + productId);
        }

        UsbInterface usbInterface = UsbDeviceHelper.findPrinterInterface(usbDevice);
        if (usbInterface == null) {
            throw new IOException("Interface de impresora no encontrada en el dispositivo USB");
        }

        UsbDeviceConnection connection = usbManager.openDevice(usbDevice);
        if (connection == null) {
            throw new IOException("No se pudo abrir conexión USB");
        }

        if (!connection.claimInterface(usbInterface, true)) {
            connection.close();
            throw new IOException("No se pudo reclamar la interfaz USB");
        }

        UsbEndpoint endpoint = UsbDeviceHelper.findEndpointIn(usbInterface);
        if (endpoint == null) {
            connection.releaseInterface(usbInterface);
            connection.close();
            throw new IOException("Endpoint USB no encontrado");
        }

        return new UsbOutputStream(connection, endpoint, usbInterface);
    }

    // 🔌 CLASE PARA USB OUTPUT STREAM
    private static class UsbOutputStream extends OutputStream {
        private final UsbDeviceConnection connection;
        private final UsbEndpoint endpoint;
        private final UsbInterface usbInterface;

        public UsbOutputStream(UsbDeviceConnection connection, UsbEndpoint endpoint, UsbInterface usbInterface) {
            this.connection = connection;
            this.endpoint = endpoint;
            this.usbInterface = usbInterface;
        }

        @Override
        public void write(int b) throws IOException {
            write(new byte[]{(byte) b});
        }

        @Override
        public void write(byte[] bytes) throws IOException {
            int offset = 0;
            while (offset < bytes.length) {
                int chunk = Math.min(16384, bytes.length - offset); // 16KB por bloque
                int result = connection.bulkTransfer(endpoint,
                        Arrays.copyOfRange(bytes, offset, offset + chunk),
                        chunk,
                        5000);
                if (result < 0) {
                    throw new IOException("Error en transferencia USB: " + result);
                }
                offset += chunk;
            }
        }

        @Override
        public void close() throws IOException {
            try {
                connection.releaseInterface(usbInterface);
                connection.close();
            } catch (Exception e) {
                Log.w(TAG, "Error cerrando conexión USB: " + e.getMessage());
            }
            super.close();
        }
    }

    private int getPrinterWidthPixels(int widthMm) {
        switch (widthMm) {
            case 58: return 384;
            case 80: return 576;
            case 48: return 256;
            default: return 384;
        }
    }

    private void printImage(OutputStream outputStream, String imageUrl, int printerWidthPx) throws IOException {
        Bitmap bitmap = getBitmapFromURL(imageUrl);

        // Escalar a ancho de impresora
        bitmap = scaleBitmapToPrinterWidth(bitmap, printerWidthPx);

        // Convertir a monocromo
        Bitmap monochrome = convertToMonochrome(bitmap);

        printImageWithGSV0(outputStream, monochrome);
    }

    private Bitmap scaleBitmapToPrinterWidth(Bitmap bitmap, int printerWidthPx) {
        int targetWidth = (printerWidthPx / 8) * 8;
        int targetHeight = (int) (bitmap.getHeight() * ((float) targetWidth / bitmap.getWidth()));
        return Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true);
    }

    private Bitmap getBitmapFromURL(String src) throws IOException {
        URL url = new URL(src);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoInput(true);
        connection.connect();
        InputStream input = connection.getInputStream();
        Bitmap bitmap = BitmapFactory.decodeStream(input);
        input.close();
        return bitmap;
    }

    private Bitmap convertToMonochrome(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        Bitmap result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);

        // Buffer de errores (como en Floyd-Steinberg)
        float[][] error = new float[height][width];

        // 🔧 AJUSTE 1: Reducir gamma para hacer más claro (valor original: 1.1f)
        float gamma = 0.7f; // Prueba valores entre 0.7f - 1.0f

        // 🔧 AJUSTE 2: Cambiar umbral (valor original: 128)
        int threshold = 120; // Prueba valores entre 120-160

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = bitmap.getPixel(x, y);
                int r = Color.red(pixel);
                int g = Color.green(pixel);
                int b = Color.blue(pixel);

                // Calcular luminancia
                float gray = 0.299f * r + 0.587f * g + 0.114f * b;
                gray = gray / 255.0f;
                gray = (float) Math.pow(gray, gamma) * 255.0f;
                gray = Math.min(255, Math.max(0, gray));

                // Agregar error acumulado
                gray += error[y][x];

                // 🔧 AJUSTE 3: Usar umbral personalizado
                boolean isBlack = gray < threshold;
                int newColor = isBlack ? Color.BLACK : Color.WHITE;
                result.setPixel(x, y, newColor);

                // Calcular error
                float quantError = gray - (isBlack ? 0 : 255);

                // 🔧 AJUSTE 4: Reducir la propagación de error para menos "ruido"
                float errorReduction = 0.8f; // Factor de reducción (0.5f - 1.0f)

                // Propagar error (Floyd-Steinberg con reducción)
                if (x + 1 < width)
                    error[y][x + 1] += quantError * 7 / 16 * errorReduction;
                if (y + 1 < height) {
                    if (x > 0)
                        error[y + 1][x - 1] += quantError * 3 / 16 * errorReduction;
                    error[y + 1][x] += quantError * 5 / 16 * errorReduction;
                    if (x + 1 < width)
                        error[y + 1][x + 1] += quantError * 1 / 16 * errorReduction;
                }
            }
        }

        return result;
    }

    private void printImageWithGSV0(OutputStream outputStream, Bitmap monochrome) throws IOException {
        int width = monochrome.getWidth();
        int height = monochrome.getHeight();
        int widthBytes = width / 8;

        // Cabecera
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        buffer.write(new byte[] {
                0x1D, 0x76, 0x30, 0x00,
                (byte)(widthBytes & 0xFF), (byte)((widthBytes >> 8) & 0xFF),
                (byte)(height & 0xFF), (byte)((height >> 8) & 0xFF)
        });

        // Convertir bitmap a datos binarios
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x += 8) {
                byte b = 0;
                for (int bit = 0; bit < 8 && x + bit < width; bit++) {
                    int pixel = monochrome.getPixel(x + bit, y);
                    if (Color.red(pixel) == 0) { // Pixel negro
                        b |= (1 << (7 - bit));
                    }
                }
                buffer.write(b);
            }
        }

        buffer.write(0x0A); // salto de línea

        // ✅ Enviar TODO en un solo bulkTransfer
        byte[] data = buffer.toByteArray();
        outputStream.write(data);
    }

    // 🔧 MÉTODOS AUXILIARES PARA LISTAR DISPOSITIVOS
    @PluginMethod
    public void listPrinters(PluginCall call) {
        JSObject ret = new JSObject();

        // Bluetooth
        ret.put("bluetooth", listBluetoothPrinters());

        // USB
        ret.put("usb", listUsbPrinters());

        call.resolve(ret);
    }

    private JSObject listBluetoothPrinters() {
        JSObject result = new JSObject();
        JSArray devicesArray = new JSArray();

        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled() &&
                ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT)
                        == PackageManager.PERMISSION_GRANTED) {

            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();

            for (BluetoothDevice device : pairedDevices) {
                int majDeviceCl = device.getBluetoothClass().getMajorDeviceClass(),
                        deviceCl = device.getBluetoothClass().getDeviceClass();

                if (majDeviceCl == BluetoothClass.Device.Major.IMAGING && (deviceCl == 1664 || deviceCl == BluetoothClass.Device.Major.IMAGING)) {
                    JSObject deviceInfo = new JSObject();
                    deviceInfo.put("name", device.getName());
                    deviceInfo.put("address", device.getAddress());
                    deviceInfo.put("type", "BLUETOOTH");
                    devicesArray.put(deviceInfo);
                }
            }
        }

        result.put("devices", devicesArray);
        return result;
    }

    private JSObject listUsbPrinters() {
        JSObject result = new JSObject();
        JSArray devicesArray = new JSArray();

        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();

        for (UsbDevice device : deviceList.values()) {

            int usbClass = device.getDeviceClass();
            if((usbClass == UsbConstants.USB_CLASS_PER_INTERFACE || usbClass == UsbConstants.USB_CLASS_MISC ) && UsbDeviceHelper.findPrinterInterface(device) != null) {
                usbClass = UsbConstants.USB_CLASS_PRINTER;
            }
            if (usbClass == UsbConstants.USB_CLASS_PRINTER) {
                JSObject deviceInfo = new JSObject();
                deviceInfo.put("name", device.getDeviceName());
                deviceInfo.put("vendorId", device.getVendorId());
                deviceInfo.put("productId", device.getProductId());
                deviceInfo.put("productName", device.getProductName());
                deviceInfo.put("manufacturerName", device.getManufacturerName());
                deviceInfo.put("type", "USB");
                devicesArray.put(deviceInfo);
            }
        }

        result.put("devices", devicesArray);
        return result;
    }

}
