package com.syssosftintegra.app;

import android.Manifest;
import android.content.Context;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.util.Log;

import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;

import java.util.List;
import java.util.Set;

import java.io.OutputStream;
import java.io.IOException;
import java.util.UUID;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.getcapacitor.JSArray;


@CapacitorPlugin(name = "MathPlugin")
public class MathPlugin extends Plugin {

    // 🏭 ENUM para tipos de conexión
    public enum PrinterType {
        BLUETOOTH,
        USB,
        NETWORK
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
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            // 🚨 Pide permiso en runtime → abrirá modal del sistema
            ActivityCompat.requestPermissions(
                    getActivity(),
                    new String[]{ Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN },
                    1001
            );

            JSObject ret = new JSObject();
            ret.put("requested", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void sum(PluginCall call) {
        // Obtener los parámetros desde JavaScript
        int a = call.getInt("a", 0);
        int b = call.getInt("b", 0);

        Log.d("MathPlugin :D -", "Sum called with a=" + a + ", b=" + b);

        // ✅ Parte nueva: listar impresoras USB
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();

        Log.d("MathPlugin Usb:", "esperando lista...");

        for (UsbDevice device : deviceList.values()) {
            Log.d("MathPlugin", "USB Device: " + device.getDeviceName() +
                    " vendorId=" + device.getVendorId() +
                    " productId=" + device.getProductId());
        }

        Log.d("MathPlugin Bt:", "esperando lista...");

        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT)
                    != PackageManager.PERMISSION_GRANTED) {
                Log.e("MathPlugin", "❌ No tiene permiso BLUETOOTH_CONNECT");
                JSObject ret = new JSObject();
                ret.put("error", "No BLUETOOTH_CONNECT permission");
                call.resolve(ret);
                return;
            }

            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            if (pairedDevices.size() > 0) {
                for (BluetoothDevice device : pairedDevices) {
                    Log.d("MathPlugin", "BT Device: " + device.getName() + " [" + device.getAddress() + "]");
                    if (device.getAddress().equals("00:15:83:83:59:7F")){
                        printToBluetoothPrinter(call);
                    }
                }
            }
        }

        // Realizar la suma
        int result = a + b;

        // Devolver el resultado a JavaScript
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    // 🚀 MÉTODO PRINCIPAL UNIFICADO
    @PluginMethod
    public void printTicket(PluginCall call) {
        try {
            // 📝 Obtener configuración desde JavaScript
            PrinterConfig config = new PrinterConfig();
            config.type = PrinterType.valueOf(call.getString("type", "BLUETOOTH").toUpperCase());
            config.address = call.getString("address", "00:15:83:83:59:7F");
            config.vendorId = call.getInt("vendorId", 0);
            config.productId = call.getInt("productId", 0);
            config.port = call.getInt("port", 9100);
            config.widthMm = call.getInt("widthMm", 58);
            config.message = call.getString("message", "Ticket de prueba ESC/POS 🚀");
            config.imageUrl = call.getString("imageUrl", "");

            Log.d("MathPlugin", "🖨️ Imprimiendo: " + config.type + " - " + config.address);

            // 🔌 Obtener OutputStream según el tipo
            OutputStream outputStream = getOutputStream(config);
            if (outputStream == null) {
                JSObject ret = new JSObject();
                ret.put("error", "No se pudo conectar a la impresora");
                call.resolve(ret);
                return;
            }

            // 📄 Generar e imprimir contenido (LÓGICA UNIFICADA)
            generateAndPrintContent(outputStream, config);

            // 🎯 Cerrar conexión
            closeConnection(config.type);

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

    // 🔌 Variables para mantener conexiones abiertas
    private BluetoothSocket bluetoothSocket;
    private Socket networkSocket;
    private UsbDeviceConnection usbConnection;


    // 🔌 OBTENER OUTPUTSTREAM SEGÚN TIPO
    private OutputStream getOutputStream(PrinterConfig config) throws IOException {
        switch (config.type) {
            case BLUETOOTH:
                return getBluetoothOutputStream(config.address);
            case NETWORK:
                return getNetworkOutputStream(config.address, config.port);
            case USB:
                return getUsbOutputStream(config.vendorId, config.productId);
            default:
                throw new IOException("Tipo de impresora no soportado");
        }
    }


    // 📱 BLUETOOTH OUTPUT STREAM
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
        bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);

        bluetoothAdapter.cancelDiscovery();
        bluetoothSocket.connect();

        return bluetoothSocket.getOutputStream();
    }

    // 🌐 NETWORK OUTPUT STREAM
    private OutputStream getNetworkOutputStream(String ipAddress, int port) throws IOException {
        networkSocket = new Socket(ipAddress, port);
        return networkSocket.getOutputStream();
    }

    // 🔌 USB OUTPUT STREAM
    private OutputStream getUsbOutputStream(int vendorId, int productId) throws IOException {
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();

        UsbDevice usbDevice = null;
        for (UsbDevice device : deviceList.values()) {
            if (device.getVendorId() == vendorId && device.getProductId() == productId){
                usbDevice = device;
            }
        }

        if (usbDevice == null) {
            throw new IOException("Dispositivo USB no encontrado: " + vendorId + ":" + productId);
        }

        usbConnection = usbManager.openDevice(usbDevice);
        if (usbConnection == null) {
            throw new IOException("No se pudo abrir conexión USB");
        }

        UsbInterface usbInterface = usbDevice.getInterface(0);
        usbConnection.claimInterface(usbInterface, true);

        // Buscar endpoint de salida
        UsbEndpoint endpoint = null;
        for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
            UsbEndpoint ep = usbInterface.getEndpoint(i);
            if (ep.getDirection() == UsbConstants.USB_DIR_OUT) {
                endpoint = ep;
                break;
            }
        }

        if (endpoint == null) {
            throw new IOException("No se encontró endpoint USB de salida");
        }

        return new UsbOutputStream(usbConnection, endpoint);
    }

    // 📄 GENERAR E IMPRIMIR CONTENIDO (LÓGICA UNIFICADA)
    private void generateAndPrintContent(OutputStream outputStream, PrinterConfig config) throws IOException {
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
    }

    // 🔒 CERRAR CONEXIONES
    private void closeConnection(PrinterType type) {
        try {
            switch (type) {
                case BLUETOOTH:
                    if (bluetoothSocket != null) {
                        bluetoothSocket.close();
                        bluetoothSocket = null;
                    }
                    break;
                case NETWORK:
                    if (networkSocket != null) {
                        networkSocket.close();
                        networkSocket = null;
                    }
                    break;
                case USB:
                    if (usbConnection != null) {
                        usbConnection.close();
                        usbConnection = null;
                    }
                    break;
            }
        } catch (IOException e) {
            Log.w("MathPlugin", "Error al cerrar conexión: " + e.getMessage());
        }
    }

    // 🔌 CLASE PARA USB OUTPUT STREAM
    private static class UsbOutputStream extends OutputStream {
        private UsbDeviceConnection connection;
        private UsbEndpoint endpoint;

        public UsbOutputStream(UsbDeviceConnection connection, UsbEndpoint endpoint) {
            this.connection = connection;
            this.endpoint = endpoint;
        }

        @Override
        public void write(int b) throws IOException {
            write(new byte[]{(byte) b});
        }

        @Override
        public void write(byte[] bytes) throws IOException {
            int result = connection.bulkTransfer(endpoint, bytes, bytes.length, 5000);
            if (result < 0) {
                throw new IOException("Error en transferencia USB: " + result);
            }
        }
    }

    // 📏 FUNCIONES AUXILIARES (sin cambios)
    private int getPrinterWidthPixels(int widthMm) {
        switch (widthMm) {
            case 58: return 384;
            case 80: return 576;
            case 48: return 256;
            default: return 384;
        }
    }

    public void printToBluetoothPrinter(PluginCall call) {
        String macAddress = "00:15:83:83:59:7F"; // Tu impresora
        String message = call.getString("message", "Ticket de prueba ESC/POS 🚀");

        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            JSObject ret = new JSObject();
            ret.put("error", "Bluetooth no disponible o apagado");
            call.resolve(ret);
            return;
        }

        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT)
                != PackageManager.PERMISSION_GRANTED) {
            JSObject ret = new JSObject();
            ret.put("error", "No tiene permiso BLUETOOTH_CONNECT");
            call.resolve(ret);
            return;
        }

        int printerWidthMm = 58;
        String url = "https://firebasestorage.googleapis.com/v0/b/syssoftintegra-1215c.appspot.com/o/VENTA%20N002-004640%20-%20PUBLICO%20GENERAL_pages-to-jpg-0001.jpg?alt=media&token=66270de7-3eca-406f-a3c6-f03b2ff688f0";

        int printerWidthPx = getPrinterWidthPixels(printerWidthMm); // ancho ESC/POS
        printerWidthPx = (int)(printerWidthPx * 0.95); // factor de seguridad para asegurar que no corte


        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(macAddress);
            UUID uuid = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
            BluetoothSocket socket = device.createRfcommSocketToServiceRecord(uuid);

            bluetoothAdapter.cancelDiscovery();
            socket.connect();

            OutputStream outputStream = socket.getOutputStream();

            // --- ESC/POS básico ---
            byte[] init = new byte[]{0x1B, 0x40}; // Reset
            byte[] center = new byte[]{0x1B, 0x61, 0x01}; // Centrado
            byte[] boldOn = new byte[]{0x1B, 0x45, 0x01}; // Negrita ON
            byte[] boldOff = new byte[]{0x1B, 0x45, 0x00}; // Negrita OFF
            byte[] newLine = new byte[]{0x0A};
            byte[] cut = new byte[]{0x1D, 0x56, 0x01}; // Corte parcial

            outputStream.write(init);
            outputStream.write(center);
            outputStream.write(boldOn);
            outputStream.write((message + "\n").getBytes("UTF-8"));
            outputStream.write(boldOff);
            outputStream.write(newLine);
            outputStream.write("Gracias por su compra!\n".getBytes("UTF-8"));
            outputStream.write(newLine);

            // Después de abrir OutputStream
            printImage(outputStream, url, printerWidthPx); // <-- tu logo
            outputStream.write(cut);

            outputStream.write(cut);

            outputStream.flush();
            outputStream.close();
            socket.close();

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("printed", message);
            call.resolve(ret);

        } catch (IOException e) {
            Log.e("MathPlugin", "❌ Error al imprimir", e);
            JSObject ret = new JSObject();
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
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

        // Comando GSV0: GS v 0 m xL xH yL yH d1...dk
        byte[] header = new byte[] {
                0x1D, 0x76, 0x30, 0x00,  // GS v 0 (modo normal)
                (byte)(widthBytes & 0xFF), (byte)((widthBytes >> 8) & 0xFF),  // xL xH (ancho en bytes)
                (byte)(height & 0xFF), (byte)((height >> 8) & 0xFF)           // yL yH (alto en puntos)
        };

        outputStream.write(header);

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
                outputStream.write(b);
            }
        }

        outputStream.write(new byte[]{0x0A}); // Nueva línea al final
    }

    private void printImage(OutputStream outputStream, String imageUrl, int printerWidthPx) throws IOException {
        Bitmap bitmap = getBitmapFromURL(imageUrl);

        // Escalar a ancho de impresora
        bitmap = scaleBitmapToPrinterWidth(bitmap, printerWidthPx);

        // Convertir a monocromo
        Bitmap monochrome = convertToMonochrome(bitmap);

        printImageWithGSV0(outputStream, monochrome);
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
                JSObject deviceInfo = new JSObject();
                deviceInfo.put("name", device.getName());
                deviceInfo.put("address", device.getAddress());
                deviceInfo.put("type", "BLUETOOTH");
                devicesArray.put(deviceInfo);
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
            JSObject deviceInfo = new JSObject();
            deviceInfo.put("name", device.getDeviceName());
            deviceInfo.put("vendorId", device.getVendorId());
            deviceInfo.put("productId", device.getProductId());
            deviceInfo.put("type", "USB");
            devicesArray.put(deviceInfo);
        }

        result.put("devices", devicesArray);
        return result;
    }
}
