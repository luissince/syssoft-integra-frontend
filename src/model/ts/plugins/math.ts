// src/model/ts/plugins/math.ts
import { registerPlugin } from '@capacitor/core';

export interface MathPlugin {
  // sum(options: { a: number; b: number }): Promise<{ result: number }>;
  requestBluetoothPermission(): Promise<{ success?: boolean; message?: string }>;
  requestUsbPermission(options: { vendorId: number, productId: number }): Promise<{
    success: boolean;
    hasPermission: boolean;
    message: string;
  }>;
  listPrinters(): Promise<
    {
      bluetooth: {
        devices: {
          name: string; address: string
        }[]
      },
      usb: {
        devices:
        {
          name: string;
          vendorId: number;
          productId: number;
          productName: string;
          manufacturerName: string;
          type: string
        }[]
      }
    }>;
  printTicket({ type, address, vendorId, productId, widthMm, message, imageUrl }: { type: string; address: string; vendorId: number; productId: number; widthMm: number; message: string; imageUrl: string }): Promise<void>;
}

const Math = registerPlugin<MathPlugin>('MathPlugin');

export default Math;
