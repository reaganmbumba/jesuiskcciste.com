import type { CapacitorConfig } from '@capacitor/cli';

// Application Android : ouvre directement le site en ligne (jesuiskcciste.com) dans une WebView,
// pour que l'application soit toujours à jour sans republier d'APK. android-hors-ligne/ est une petite
// page de secours (pas de connexion) : on n'embarque pas dist (audio et vidéos), trop lourd pour Google Play.
const config: CapacitorConfig = {
  appId: 'com.jesuiskcciste.app',
  appName: 'JE SUIS KCCiste',
  webDir: 'android-hors-ligne',
  server: { url: 'https://jesuiskcciste.com', androidScheme: 'https', errorPath: 'index.html' },
  android: { backgroundColor: '#101B33', appendUserAgent: 'KCCisteApp' },
  // Android 15+ affiche l'application bord à bord : Capacitor décale la page sous la barre d'état
  // (texte clair sur fond sombre) pour que l'en-tête du site ne soit jamais caché.
  plugins: { SystemBars: { insetsHandling: 'css', style: 'DARK' } },
};

export default config;
