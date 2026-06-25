import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pndist.bioscend',
  appName: 'BioScend',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
