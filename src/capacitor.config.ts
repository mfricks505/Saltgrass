import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saltgrass.app',
  appName: 'Saltgrass',
  webDir: 'out',           // ← This is the important line
  server: {
    url: 'http://localhost:3000',   // For development
    cleartext: true,
  },
};

export default config;