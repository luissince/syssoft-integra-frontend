// src/model/ts/plugins/printer-escpos.ts
import { registerPlugin } from '@capacitor/core';

export enum Size {
  A4 = "A4",
  MM_80 = "80mm",
  MM_58 = "58mm",
}

export interface BluetoothDevice {
  name: string;
  address: string;
  type: string;
}

export interface UsbDevice {
  name: string;
  vendorId: number;
  productId: number;
  productName: string;
  manufacturerName: string;
  type: string;
}

export interface Usb {
  devices: UsbDevice[];
}

export interface Bluetooth {
  devices: BluetoothDevice[];
}

export interface PrinterConfig {
  id: number;
  type: string;
  address: string;
  vendorId: number;
  productId: number;
  widthMm: number;
  message: string;
  imageUrl: string;
}

export interface PrintResult {
  id: number;
  success: boolean;
  message?: string;
  needsPermission?: boolean;
}

export interface PrinterPlugin {
  requestBluetoothPermission(): Promise<{ success?: boolean; message?: string }>;
  requestUsbPermission(options: { vendorId: number, productId: number }): Promise<{
    success: boolean;
    hasPermission: boolean;
    message: string;
  }>;
  listPrinters(): Promise<{
    bluetooth: Bluetooth,
    usb: Usb
  }>;
  printTicket(options: PrinterConfig): Promise<PrintResult>;
  addListener(
    eventName: 'onPrintJobUpdate',
    listenerFunc: (event: { id: number, status: string; message: string, needsPermission: boolean }) => void
  ): Promise<{ remove: () => void }>;
  removeListener(
    eventName: string,
    listenerFunc: (event: { id: number, status: string; message: string, needsPermission: boolean }) => void
  ): Promise<void>;
}

const PrinterPlugin = registerPlugin<PrinterPlugin>('PrinterPlugin');

export default PrinterPlugin;
