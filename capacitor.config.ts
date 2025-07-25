import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.syssosftintegra.app',
  appName: 'syssoft-integra',
  webDir: 'dist',
  server: {
    cleartext: true,
    url: 'http://172.20.10.10:3000/',
  }
};

export default config;
