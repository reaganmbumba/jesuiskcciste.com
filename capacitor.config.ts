import type { CapacitorConfig } from '@capacitor/cli';

// Application Android : ouvre directement le site en ligne (jesuiskcciste.com) dans une WebView,
// pour que l'application soit toujours à jour sans republier d'APK. dist sert de secours.
const config: CapacitorConfig = {
  appId: 'com.jesuiskcciste.app',
  appName: 'JE SUIS KCCiste',
  webDir: 'dist',
  server: { url: 'https://jesuiskcciste.com', androidScheme: 'https' },
  android: { backgroundColor: '#101B33', appendUserAgent: 'KCCisteApp' },
  // Android 15+ affiche l'application bord à bord : Capacitor décale la page sous la barre d'état
  // (texte clair sur fond sombre) pour que l'en-tête du site ne soit jamais caché.
  plugins: { SystemBars: { insetsHandling: 'css', style: 'DARK' } },
};

export default config;
