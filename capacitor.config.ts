import type { CapacitorConfig } from '@capacitor/cli';

// Application Android : ouvre directement le site en ligne (jesuiskcciste.com) dans une WebView,
// pour que l'application soit toujours à jour sans republier d'APK. dist sert de secours.
const config: CapacitorConfig = {
  appId: 'com.jesuiskcciste.connect',
  appName: 'JE SUIS KCCiste',
  webDir: 'dist',
  server: { url: 'https://jesuiskcciste.com', androidScheme: 'https' },
  android: { backgroundColor: '#101B33', appendUserAgent: 'KCCisteApp' },
};

export default config;
