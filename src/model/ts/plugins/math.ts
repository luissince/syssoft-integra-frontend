// src/model/ts/plugins/math.ts
import { registerPlugin } from '@capacitor/core';

export interface MathPlugin {
  sum(options: { a: number; b: number }): Promise<{ result: number }>;
  requestBluetoothPermission(): Promise<{ granted?: boolean; requested?: boolean }>;
  listPrinters(): Promise<{ bluetooth: { devices: { name: string; address: string }[] }, usb: { devices: { name: string; vendorId: number; productId: number }[] } }>;
  printTicket({ type, address, vendorId, productId, widthMm, message, imageUrl }: { type: string; address: string; vendorId: number; productId: number; widthMm: number; message: string; imageUrl: string }): Promise<void>;
}

const Math = registerPlugin<MathPlugin>('MathPlugin');

export default Math;
