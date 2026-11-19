/**
 * L'antenne est ouverte dans l'application Windows « Radio Je suis KCCiste » :
 * elle s'affiche alors en plein écran, sans le menu de l'administration du site.
 * (L'application ajoute « KCCRadioDesktop » à son identité, ou ouvre la page avec ?app=1.)
 */
export function isRadioDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('app') === '1') sessionStorage.setItem('kcc-radio-app', '1');
    return navigator.userAgent.includes('KCCRadioDesktop') || sessionStorage.getItem('kcc-radio-app') === '1';
  } catch {
    return navigator.userAgent.includes('KCCRadioDesktop');
  }
}

type StudioBridge = { onAir?: (title: string) => void; offAir?: () => void };
/** Application Android « Studio Radio KCC » : on la prévient du début et de la fin du direct (écran allumé, micro gardé actif). */
export function studioBridge(): StudioBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { KCCStudio?: StudioBridge }).KCCStudio;
}
