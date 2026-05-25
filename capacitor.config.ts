import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'com.saltgrass.app',
  appName: 'Saltgrass',
  webDir:  'out',
  server: {
    url:       'https://saltgrass-3scu.vercel.app',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath:  'saltgrass-release.keystore',
      keystoreAlias: 'saltgrass',
    },
  },
}

export default config
