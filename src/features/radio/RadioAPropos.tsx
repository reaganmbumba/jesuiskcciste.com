import { Download, Headphones, Laptop, MessageCircle, Mic, Smartphone, Youtube } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { radioSettingsOf } from './radio';
import { joursLabel } from './programmePoster';

const RUBRIQUES = [
  ['Journal KCC', 'Les nouvelles de la communauté et de l’Église.'],
  ['Tosungana', 'L’émission des couples et des familles.'],
  ['Mabondeli ya ntongo', 'La prière du matin, en lingala.'],
  ['Prédications', 'Les enseignements, en direct ou en rediffusion.'],
  ['Chorales', 'Les chants et cantiques des chorales de l’EBNM.'],
  ['Émissions spéciales', 'Histoire de l’Église, découvertes de chorales, témoignages.'],
] as const;

/** Page radio : la grille de la semaine, la présentation de la radio, comment l'écouter, le kit média. */
export function RadioAPropos() {
  const { settings } = useSiteSettings();
  const semaine = radioSettingsOf(settings).semaine;
  const titre = (s: (typeof semaine)[number]) => s.titre || (s.source === 'predication' ? 'Prédication' : s.source === 'emission' ? 'Émission (rediffusion)' : 'Émission');
  const card = 'rounded-3xl border border-night/[0.06] bg-white p-5 shadow-soft';
  return (
    <section className="container-page grid gap-6 pb-12 lg:grid-cols-3">
      <div className={card + ' lg:col-span-2'}>
        <h2 className="font-display text-xl font-semibold text-night">À propos de la radio</h2>
        <p className="mt-2 text-ink/75">Radio Je suis KCCiste est la radio de la communauté Je suis KCCiste, au service des fidèles de l’Église Bon Nouveau Message (EBNM/KCC), au pays comme dans la diaspora. Jour et nuit : chants des chorales, prédications, émissions et directs. Paix à vous !</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {RUBRIQUES.map(([t, d]) => <li key={t} className="rounded-2xl bg-gold-50/70 p-3"><p className="font-semibold text-night">{t}</p><p className="text-sm text-ink/70">{d}</p></li>)}
        </ul>
        <h3 className="mt-6 font-semibold text-night">Participer</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/75">
          <li className="flex gap-2"><Mic className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />Appeler l’émission pendant les directs, ou envoyer un message vocal.</li>
          <li className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />Écrire une dédicace ou une intention de prière : l’animateur la lit à l’antenne.</li>
          <li className="flex gap-2"><Headphones className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />Réécouter les émissions passées sur la page des rediffusions.</li>
        </ul>
      </div>
      <div className="space-y-6">
        {semaine.length > 0 && (
          <div className={card}>
            <h2 className="font-display text-lg font-semibold text-night">La grille de la semaine</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {semaine.map((s) => <li key={s.id} className="flex gap-3"><span className="w-12 shrink-0 font-bold tabular-nums text-gold-700">{s.heure.replace(':', 'h')}</span><span><span className="font-semibold text-night">{titre(s)}</span><span className="block text-xs text-ink/55">{joursLabel(s.jours)}</span></span></li>)}
            </ul>
            <p className="mt-2 text-xs text-ink/55">Heure de Kinshasa.</p>
          </div>
        )}
        <div className={card}>
          <h2 className="font-display text-lg font-semibold text-night">Écouter partout</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/radio/android.apk" className="flex items-center gap-2 font-semibold text-night hover:text-gold-700"><Smartphone className="h-4 w-4 text-gold-700" />Application Android (Radio KCC)</a></li>
            <li><a href="/radio/windows.exe" className="flex items-center gap-2 font-semibold text-night hover:text-gold-700"><Laptop className="h-4 w-4 text-gold-700" />Application pour ordinateur Windows</a></li>
            <li><a href="https://www.youtube.com/@Jesuiskcciste" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold text-night hover:text-gold-700"><Youtube className="h-4 w-4 text-red-600" />Les directs sur YouTube</a></li>
          </ul>
          <a href="/radio/kit-media-radio-kcc.pdf" download className="mt-4 inline-flex items-center gap-2 rounded-xl bg-night px-4 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Kit média (PDF)</a>
          <p className="mt-2 text-xs text-ink/55">Pour présenter la radio dans votre paroisse ou à un partenaire.</p>
        </div>
      </div>
    </section>
  );
}
