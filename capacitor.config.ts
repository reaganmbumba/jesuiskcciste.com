import type { CapacitorConfig } from '@capacitor/cli';

// Application Android : embarque le site construit (dist) dans une WebView.
const config: CapacitorConfig = {
  appId: 'com.jesuiskcciste.connect',
  appName: 'JE SUIS KCCiste',
  webDir: 'dist',
  android: { backgroundColor: '#101B33' },
};

export default config;
