import type { CapacitorConfig } from '@capacitor/cli';

// Application Android : ouvre directement le site en ligne (jesuiskcciste.com) dans une WebView,
// pour que l'application soit toujours à jour sans republier d'APK. android-hors-ligne/ est une petite
// page de secours (pas de connexion) : on n'embarque pas dist (audio et vidéos), trop lourd pour Google Play.
//
// KCC_APP=radio construit la deuxième application, « Radio Je suis KCCiste » (com.jesuiskcciste.radio),
// qui ouvre directement /radio (workflow .github/workflows/android-radio.yml, fichiers dans android/radio/).
const radio = process.env.KCC_APP === 'radio';

const config: CapacitorConfig = {
  appId: radio ? 'com.jesuiskcciste.radio' : 'com.jesuiskcciste.app',
  appName: radio ? 'Radio KCC' : 'JE SUIS KCCiste',
  webDir: radio ? 'android/radio/hors-ligne' : 'android-hors-ligne',
  server: {
    url: radio ? 'https://jesuiskcciste.com/radio' : 'https://jesuiskcciste.com',
    androidScheme: 'https',
    errorPath: 'index.html',
  },
  android: { backgroundColor: '#101B33', appendUserAgent: radio ? 'KCCisteApp KCCisteRadio' : 'KCCisteApp' },
  // Android 15+ affiche l'application bord à bord : Capacitor décale la page sous la barre d'état
  // (texte clair sur fond sombre) pour que l'en-tête du site ne soit jamais caché.
  plugins: { SystemBars: { insetsHandling: 'css', style: 'DARK' } },
};

export default config;
