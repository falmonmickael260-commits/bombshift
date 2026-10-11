import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bombshift.game',
  appName: 'BOMBSHIFT',
  webDir: 'dist',
  android: { backgroundColor: '#07060c' },
  ios: { contentInset: 'always', backgroundColor: '#07060c' },
  server: { androidScheme: 'https' },
};

export default config;
